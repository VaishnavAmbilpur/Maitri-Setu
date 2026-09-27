const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');
const approvalRules = require('../mockData/approvalRules.json');

const router = express.Router();

// POST /api/applications — create new application with auto-generated approvals
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { sector, location, investmentSize, stage } = req.body;

    if (!sector || !location || !investmentSize) {
      return res.status(400).json({ error: 'Sector, location, and investmentSize are required.' });
    }

    // Find matching rules
    const matchingRule = approvalRules.find(
      r => r.sector.toLowerCase() === sector.toLowerCase()
    );

    if (!matchingRule) {
      return res.status(404).json({ error: 'No rules found for this sector.' });
    }

    // Create application with related approvals
    const application = await prisma.application.create({
      data: {
        userId: req.user.userId,
        sector,
        location,
        investmentSize: String(investmentSize),
        stage: stage || 'New Setup',
        status: 'draft',
        approvals: {
          create: matchingRule.approvals.map(approval => ({
            departmentName: approval.departmentName,
            approvalType: approval.approvalType,
            status: 'pending',
            isParallel: approval.isParallel,
            slaDeadline: new Date(Date.now() + approval.defaultSlaDays * 24 * 60 * 60 * 1000)
          }))
        }
      },
      include: {
        approvals: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json(application);
  } catch (err) {
    console.error('Create application error:', err);
    res.status(500).json({ error: 'Failed to create application.' });
  }
});

// GET /api/applications — list all applications for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const where = req.user.role === 'officer' ? {} : { userId: req.user.userId };

    const applications = await prisma.application.findMany({
      where,
      include: {
        approvals: { include: { documents: true } },
        user: { select: { id: true, name: true, email: true } },
        incentives: { include: { incentive: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add SLA info to each approval
    const enriched = applications.map(app => ({
      ...app,
      approvals: app.approvals.map(addSlaInfo)
    }));

    res.json(enriched);
  } catch (err) {
    console.error('List applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications.' });
  }
});

// GET /api/applications/:id — get single application with full details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        approvals: { include: { documents: true } },
        user: { select: { id: true, name: true, email: true } },
        incentives: { include: { incentive: true } },
        inspections: true
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Check access: owner or officer
    if (req.user.role !== 'officer' && application.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Add SLA countdown info
    const enriched = {
      ...application,
      approvals: application.approvals.map(addSlaInfo)
    };

    res.json(enriched);
  } catch (err) {
    console.error('Get application error:', err);
    res.status(500).json({ error: 'Failed to fetch application.' });
  }
});

// POST /api/applications/:id/submit — submit the application
router.post('/:id/submit', authMiddleware, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { approvals: true }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (application.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (application.status !== 'draft') {
      return res.status(400).json({ error: 'Application is already submitted.' });
    }

    // Update application status and all approval statuses
    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status: 'submitted',
        approvals: {
          updateMany: {
            where: { status: 'pending' },
            data: { status: 'in_progress' }
          }
        }
      },
      include: {
        approvals: { include: { documents: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.json({
      message: 'Application submitted successfully. SLA timers started.',
      application: {
        ...updated,
        approvals: updated.approvals.map(addSlaInfo)
      }
    });
  } catch (err) {
    console.error('Submit application error:', err);
    res.status(500).json({ error: 'Failed to submit application.' });
  }
});

// GET /api/applications/:id/sla — SLA countdown info
router.get('/:id/sla', authMiddleware, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { approvals: true }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const slaData = application.approvals.map(addSlaInfo);

    res.json({
      applicationId: application.id,
      applicationStatus: application.status,
      slaBreakdown: slaData
    });
  } catch (err) {
    console.error('SLA error:', err);
    res.status(500).json({ error: 'Failed to fetch SLA data.' });
  }
});

// Helper: add SLA countdown info to an approval
function addSlaInfo(approval) {
  const now = new Date();
  const deadline = new Date(approval.slaDeadline);
  const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  let slaStatus = 'on-track';
  if (daysRemaining <= 0) slaStatus = 'breached';
  else if (daysRemaining <= 2) slaStatus = 'critical';
  else if (daysRemaining <= 7) slaStatus = 'warning';

  return {
    ...approval,
    slaInfo: {
      daysRemaining: Math.max(0, daysRemaining),
      slaStatus,
      deadlineDate: deadline.toISOString().split('T')[0],
      isOverdue: daysRemaining <= 0
    }
  };
}

module.exports = router;

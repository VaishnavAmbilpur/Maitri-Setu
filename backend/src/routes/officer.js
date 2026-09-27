const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware, officerOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/officer/queue — list all submitted applications for officer review
router.get('/queue', authMiddleware, officerOnly, async (req, res) => {
  try {
    const { status, department } = req.query;

    const where = {};
    if (status) where.status = status;
    else where.status = { in: ['submitted', 'in_review'] };

    const applications = await prisma.application.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        approvals: {
          include: { documents: true },
          ...(department ? { where: { departmentName: department } } : {})
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add SLA info
    const enriched = applications.map(app => ({
      ...app,
      approvals: app.approvals.map(approval => {
        const now = new Date();
        const deadline = new Date(approval.slaDeadline);
        const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        let slaStatus = 'on-track';
        if (daysRemaining <= 0) slaStatus = 'breached';
        else if (daysRemaining <= 2) slaStatus = 'critical';
        else if (daysRemaining <= 7) slaStatus = 'warning';

        return {
          ...approval,
          slaInfo: { daysRemaining: Math.max(0, daysRemaining), slaStatus }
        };
      })
    }));

    res.json({
      total: enriched.length,
      applications: enriched
    });
  } catch (err) {
    console.error('Officer queue error:', err);
    res.status(500).json({ error: 'Failed to fetch officer queue.' });
  }
});

// GET /api/officer/analytics — aggregated analytics data
router.get('/analytics', authMiddleware, officerOnly, async (req, res) => {
  try {
    // Count by status
    const statusCounts = await prisma.application.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    // Count by department
    const departmentCounts = await prisma.approval.groupBy({
      by: ['departmentName'],
      _count: { id: true }
    });

    // Approval status distribution
    const approvalStatusCounts = await prisma.approval.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    // SLA breach count
    const now = new Date();
    const breachedCount = await prisma.approval.count({
      where: {
        status: 'in_progress',
        slaDeadline: { lte: now }
      }
    });

    const warningCount = await prisma.approval.count({
      where: {
        status: 'in_progress',
        slaDeadline: {
          lte: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
          gt: now
        }
      }
    });

    // Total applications
    const totalApplications = await prisma.application.count();

    // Average processing time (for completed ones)
    const completedApprovals = await prisma.approval.findMany({
      where: { status: 'approved' },
      select: { createdAt: true, updatedAt: true }
    });

    let avgProcessingDays = 0;
    if (completedApprovals.length > 0) {
      const totalDays = completedApprovals.reduce((sum, a) => {
        const days = (new Date(a.updatedAt) - new Date(a.createdAt)) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      avgProcessingDays = Math.round(totalDays / completedApprovals.length);
    }

    res.json({
      totalApplications,
      avgProcessingDays,
      breachedCount,
      warningCount,
      statusDistribution: statusCounts.map(s => ({ status: s.status, count: s._count.id })),
      departmentDistribution: departmentCounts.map(d => ({ department: d.departmentName, count: d._count.id })),
      approvalStatusDistribution: approvalStatusCounts.map(a => ({ status: a.status, count: a._count.id }))
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// PATCH /api/officer/approve/:approvalId — officer approves/rejects an approval
router.patch('/approve/:approvalId', authMiddleware, officerOnly, async (req, res) => {
  try {
    const { status } = req.body; // "approved" or "rejected"

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "approved" or "rejected".' });
    }

    const approval = await prisma.approval.update({
      where: { id: req.params.approvalId },
      data: { status, alertStatus: null },
      include: { application: { include: { approvals: true } } }
    });

    // Check if all approvals for this application are completed
    const allApprovals = approval.application.approvals;
    const allDone = allApprovals.every(a => a.status === 'approved' || a.status === 'rejected');

    if (allDone) {
      const allApproved = allApprovals.every(a => a.status === 'approved');
      await prisma.application.update({
        where: { id: approval.applicationId },
        data: { status: allApproved ? 'approved' : 'rejected' }
      });
    }

    res.json({
      message: `Approval ${status} successfully.`,
      approval
    });
  } catch (err) {
    console.error('Officer approve error:', err);
    res.status(500).json({ error: 'Failed to update approval.' });
  }
});

module.exports = router;

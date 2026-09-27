const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/inspections/:applicationId — get inspection schedule
router.get('/:applicationId', authMiddleware, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.applicationId },
      include: {
        approvals: true,
        inspections: true
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // If no inspection exists, suggest one
    if (application.inspections.length === 0) {
      const departments = application.approvals
        .filter(a => a.status === 'in_progress')
        .map(a => a.departmentName);

      if (departments.length >= 2) {
        // Auto-create a joint inspection suggestion
        const suggestedDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

        const inspection = await prisma.inspection.create({
          data: {
            applicationId: application.id,
            departmentsInvolved: JSON.stringify(departments),
            scheduledDate: suggestedDate,
            status: 'suggested'
          }
        });

        return res.json({
          message: 'Joint inspection suggested to reduce separate site visits.',
          inspections: [inspection]
        });
      }
    }

    res.json({
      applicationId: application.id,
      inspections: application.inspections
    });
  } catch (err) {
    console.error('Inspection error:', err);
    res.status(500).json({ error: 'Failed to fetch inspections.' });
  }
});

module.exports = router;

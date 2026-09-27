const express = require('express');
const prisma = require('../lib/prisma');
const { authMiddleware } = require('../middleware/auth');
const incentiveSchemes = require('../mockData/incentiveSchemes.json');

const router = express.Router();

// GET /api/incentives/match/:applicationId — match incentives to an application
router.get('/match/:applicationId', authMiddleware, async (req, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.applicationId },
      include: { incentives: { include: { incentive: true } } }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const investmentAmount = parseFloat(application.investmentSize) || 0;

    // Match incentives based on eligibility criteria
    const matchedIncentives = [];

    // Get all incentives from DB
    const allIncentives = await prisma.incentive.findMany();

    for (const incentive of allIncentives) {
      const criteria = typeof incentive.eligibilityCriteria === 'string'
        ? JSON.parse(incentive.eligibilityCriteria)
        : incentive.eligibilityCriteria;
      let isEligible = true;

      // Check sector match
      if (criteria.sector && criteria.sector.toLowerCase() !== application.sector.toLowerCase()) {
        isEligible = false;
      }

      // Check sector contains
      if (criteria.sectorContains && !application.sector.toLowerCase().includes(criteria.sectorContains.toLowerCase())) {
        isEligible = false;
      }

      // Check minimum investment
      if (criteria.minInvestment && investmentAmount < criteria.minInvestment) {
        isEligible = false;
      }

      if (isEligible) {
        matchedIncentives.push({
          id: incentive.id,
          schemeName: incentive.schemeName,
          description: incentive.description,
          eligibilityCriteria: criteria,
          alreadyMatched: application.incentives.some(ai => ai.incentiveId === incentive.id)
        });
      }
    }

    // Auto-create matches that don't exist yet
    const newMatches = matchedIncentives.filter(m => !m.alreadyMatched);
    if (newMatches.length > 0) {
      await prisma.applicationIncentive.createMany({
        data: newMatches.map(m => ({
          applicationId: application.id,
          incentiveId: m.id
        })),
        skipDuplicates: true
      });
    }

    res.json({
      applicationId: application.id,
      sector: application.sector,
      investmentSize: application.investmentSize,
      totalMatched: matchedIncentives.length,
      incentives: matchedIncentives
    });
  } catch (err) {
    console.error('Incentive matching error:', err);
    res.status(500).json({ error: 'Failed to match incentives.' });
  }
});

// GET /api/incentives — list all available incentive schemes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const incentives = await prisma.incentive.findMany();
    res.json(incentives);
  } catch (err) {
    console.error('List incentives error:', err);
    res.status(500).json({ error: 'Failed to fetch incentives.' });
  }
});

module.exports = router;

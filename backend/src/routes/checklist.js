const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const approvalRules = require('../mockData/approvalRules.json');

const router = express.Router();

// POST /api/checklist — generate personalized checklist
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { sector, location, investmentSize, stage } = req.body;

    if (!sector) {
      return res.status(400).json({ error: 'Sector is required.' });
    }

    // Find matching rules for the sector
    const matchingRule = approvalRules.find(
      r => r.sector.toLowerCase() === sector.toLowerCase()
    );

    if (!matchingRule) {
      return res.status(404).json({
        error: 'No approval rules found for this sector.',
        availableSectors: approvalRules.map(r => r.sector)
      });
    }

    // Build checklist with additional context
    const checklist = matchingRule.approvals.map((approval, index) => ({
      id: index + 1,
      departmentName: approval.departmentName,
      approvalType: approval.approvalType,
      defaultSlaDays: approval.defaultSlaDays,
      isParallel: approval.isParallel,
      documentsRequired: getRequiredDocuments(approval.approvalType),
      description: getApprovalDescription(approval.approvalType)
    }));

    res.json({
      sector,
      location: location || 'Not specified',
      investmentSize: investmentSize || 'Not specified',
      stage: stage || 'Not specified',
      totalApprovals: checklist.length,
      parallelApprovals: checklist.filter(c => c.isParallel).length,
      sequentialApprovals: checklist.filter(c => !c.isParallel).length,
      estimatedTotalDays: Math.max(...checklist.map(c => c.defaultSlaDays)),
      checklist
    });
  } catch (err) {
    console.error('Checklist error:', err);
    res.status(500).json({ error: 'Failed to generate checklist.' });
  }
});

// GET /api/checklist/sectors — list available sectors
router.get('/sectors', (req, res) => {
  res.json({
    sectors: approvalRules.map(r => r.sector)
  });
});

function getRequiredDocuments(approvalType) {
  const docMap = {
    'Factory Licence': ['Company Registration Certificate', 'Layout Plan', 'Identity Proof of Applicant'],
    'Fire NOC': ['Building Plan', 'Fire Safety Equipment Details', 'Emergency Evacuation Plan'],
    'Electricity Connection': ['Load Calculation Sheet', 'Site Plan', 'Property Ownership Proof'],
    'Pollution NOC': ['Environmental Impact Assessment', 'Waste Management Plan', 'Process Flow Diagram'],
    'Food Safety Licence': ['Product Details', 'Hygiene Certificate', 'Water Quality Report']
  };
  return docMap[approvalType] || ['Application Form', 'Identity Proof'];
}

function getApprovalDescription(approvalType) {
  const descMap = {
    'Factory Licence': 'Mandatory licence under the Factories Act for operating an industrial unit.',
    'Fire NOC': 'No Objection Certificate from the Fire Department confirming fire safety compliance.',
    'Electricity Connection': 'Approval for industrial-grade power connection from the State Electricity Board.',
    'Pollution NOC': 'Environmental clearance from Maharashtra Pollution Control Board (MPCB).',
    'Food Safety Licence': 'FSSAI licence for food processing and handling operations.'
  };
  return descMap[approvalType] || 'Standard government approval required for industrial operations.';
}

module.exports = router;

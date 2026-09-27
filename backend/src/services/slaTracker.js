const cron = require('node-cron');
const prisma = require('../lib/prisma');

// Run SLA check every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    // Mark warnings (deadline within 2 days, not yet flagged)
    const warnings = await prisma.approval.updateMany({
      where: {
        status: 'in_progress',
        alertStatus: null,
        slaDeadline: { lte: twoDaysFromNow, gt: now }
      },
      data: { alertStatus: 'warning' }
    });

    // Mark breached (deadline passed)
    const breached = await prisma.approval.updateMany({
      where: {
        status: 'in_progress',
        alertStatus: { not: 'breached' },
        slaDeadline: { lte: now }
      },
      data: { alertStatus: 'breached' }
    });

    if (warnings.count > 0 || breached.count > 0) {
      console.log(`[SLA Tracker] ${now.toISOString()} — Warnings: ${warnings.count}, Breached: ${breached.count}`);
    }
  } catch (err) {
    console.error('[SLA Tracker] Error:', err);
  }
});

console.log('⏱️  SLA Tracker cron job started (checks every 5 minutes)');

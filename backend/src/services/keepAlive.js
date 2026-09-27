const cron = require('node-cron');
const https = require('https');
const http = require('http');

// Keep-Alive self-ping cron job every 10 minutes (prevents Render/Koyeb free-tier sleep)
cron.schedule('*/10 * * * *', () => {
  const backendUrl = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL;
  if (!backendUrl) return;

  const targetUrl = `${backendUrl.replace(/\/$/, '')}/api/health`;
  const client = targetUrl.startsWith('https') ? https : http;

  client.get(targetUrl, (res) => {
    console.log(`[Keep-Alive Cron] ${new Date().toISOString()} - Pinged ${targetUrl} (Status: ${res.statusCode})`);
  }).on('error', (err) => {
    console.error(`[Keep-Alive Cron] Ping failed:`, err.message);
  });
});

console.log('🔄 Keep-Alive self-ping cron job initialized (runs every 10 mins when BACKEND_URL is set)');

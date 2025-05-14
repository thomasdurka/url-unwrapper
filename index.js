import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;
const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;

app.get('/unshorten', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  const browserlessUrl = `https://chrome.browserless.io/playwright/function?token=${BROWSERLESS_TOKEN}`;

  const payload = {
    code: "module.exports = async ({ playwright, url }) => { const browser = await playwright.chromium.launch(); const page = await browser.newPage(); await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }); const finalUrl = page.url(); await browser.close(); return { finalUrl }; };",
    context: { url }
  };

  try {
    const response = await fetch(browserlessUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.finalUrl) {
      res.json({ finalUrl: data.finalUrl });
    } else {
      res.status(500).json({ error: 'Browserless returned error', details: data });
    }
  } catch (err) {
    res.status(500).json({ error: 'Request failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});

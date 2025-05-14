import express from 'express';
import { chromium } from 'playwright';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/unshorten', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { timeout: 15000 });
    const finalUrl = page.url();
    await browser.close();
    return res.json({ finalUrl });
  } catch (err) {
    if (browser) await browser.close();
    return res.status(500).json({ error: 'Failed to resolve URL', details: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

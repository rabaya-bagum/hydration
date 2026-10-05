/**
 * Renders the original Plink brand assets (icon, adaptive icon, splash, notification icon, favicon)
 * from inline SVG using the preinstalled Chromium. Run: node scripts/generate-assets.js
 */
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets');
const AQUA = '#1B6AD6';
const SKY = '#62C0FF';

const droplet = (fill, face) => `
  <path d="M512 140 C512 140 262 440 262 622 a250 250 0 0 0 500 0 C762 440 512 140 512 140Z" fill="${fill}"/>
  ${face ? `<ellipse cx="420" cy="500" rx="26" ry="52" transform="rotate(24 420 500)" fill="${face}" opacity="0.28"/>
  <circle cx="445" cy="600" r="22" fill="${face}"/><circle cx="579" cy="600" r="22" fill="${face}"/>
  <path d="M438 655 q74 70 148 0" stroke="${face}" stroke-width="30" stroke-linecap="round" fill="none"/>` : ''}`;

const svgs = {
  // iOS app icon: full-bleed, no transparency, no pre-rounded corners (the OS masks it)
  'icon.png': { size: 1024, bg: true, svg: `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY}"/><stop offset="1" stop-color="${AQUA}"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#g)"/>${droplet('#fff', AQUA)}` },
  // Android adaptive foreground: artwork inside the central safe zone, transparent elsewhere
  'adaptive-icon.png': { size: 1024, svg: `<g transform="translate(512 512) scale(0.72) translate(-512 -540)">${droplet('#fff', AQUA)}</g>` },
  // Android 13 themed icon: single-colour silhouette
  'monochrome-icon.png': { size: 1024, svg: `<g transform="translate(512 512) scale(0.72) translate(-512 -540)">${droplet('#000')}</g>` },
  'splash-icon.png': { size: 1024, svg: `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY}"/><stop offset="1" stop-color="${AQUA}"/></linearGradient></defs>${droplet('url(#g)', '#fff')}` },
  // Android status-bar notification icon: white silhouette on transparent
  'notification-icon.png': { size: 96, svg: `<g transform="scale(0.09375)">${droplet('#fff')}</g>`, viewBox: '0 0 96 96', raw: true },
  'favicon.png': { size: 48, svg: `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY}"/><stop offset="1" stop-color="${AQUA}"/></linearGradient></defs><g transform="scale(0.046875)">${droplet('url(#g)', '#fff')}</g>`, viewBox: '0 0 48 48', raw: true },
};

function chromePath() {
  if (process.env.CHROME) return process.env.CHROME;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  const dir = fs.existsSync(base) ? fs.readdirSync(base).find((d) => d.startsWith('chromium-')) : undefined;
  return dir ? path.join(base, dir, 'chrome-linux', 'chrome') : undefined;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: chromePath() });
  for (const [file, a] of Object.entries(svgs)) {
    const page = await browser.newPage({ viewport: { width: a.size, height: a.size } });
    const vb = a.viewBox ?? '0 0 1024 1024';
    await page.setContent(`<html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${a.size}" height="${a.size}" viewBox="${vb}">${a.svg}</svg></body></html>`);
    await page.screenshot({ path: path.join(OUT, file), omitBackground: !a.bg });
    await page.close();
    console.log('wrote', file);
  }
  await browser.close();
})();

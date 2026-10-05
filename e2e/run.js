/**
 * Browser e2e (React Native Web build). Covers: onboarding, 1-tap logging, instant progress,
 * duplicate / delete + undo, custom amount, goal-reached celebration, persistence across reload,
 * history tabs, unit switching. Usage: `npm run e2e` (builds web export first).
 */
const { chromium } = require('playwright-core');
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.join(__dirname, '..', 'dist');
const SHOTS = process.env.E2E_SHOTS;
const PORT = 8099;
const types = { '.js': 'text/javascript', '.html': 'text/html', '.png': 'image/png', '.json': 'application/json' };

function serve() {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(ROOT, 'index.html');
      res.setHeader('Content-Type', types[path.extname(p)] || 'application/octet-stream');
      fs.createReadStream(p).pipe(res);
    }).listen(PORT, () => resolve(s));
  });
}

function chromePath() {
  if (process.env.CHROME) return process.env.CHROME;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  const dir = fs.existsSync(base) ? fs.readdirSync(base).find((d) => d.startsWith('chromium-')) : undefined;
  return dir ? path.join(base, dir, 'chrome-linux', 'chrome') : undefined;
}

(async () => {
  const server = await serve();
  const browser = await chromium.launch({ executablePath: chromePath() });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: `http://localhost:${PORT}` });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
  const shot = (n) => SHOTS && page.screenshot({ path: path.join(SHOTS, `${n}.png`) });
  const hero = () => page.getByTestId('hero-summary').getAttribute('aria-label');
  const heroHas = async (re, msg) => { await page.waitForTimeout(150); const actual = await hero(); assert.match(actual, re, `${msg} (got: ${actual})`); };
  const next = () => page.getByTestId('onboarding-next').click();

  try {
    await page.goto(`http://localhost:${PORT}/`);
    await page.waitForSelector('text=Get started', { timeout: 30000 });
    await page.getByTestId('get-started').click();
    await page.waitForSelector('text=About you'); await shot('profile');
    await next();
    await page.getByTestId('option-high').click(); await next();
    await page.getByTestId('option-warm').click(); await next();
    await next();
    await page.waitForSelector('text=Your suggested daily goal');
    assert.ok(await page.getByText('3.15 L').first().isVisible(), 'goal = 70kg*33 + high 500 + warm 250 + exercise 80 -> 3.15 L');
    await shot('goal');
    for (let i = 0; i < 4; i++) await next();
    await page.waitForSelector('text=Start hydrating');
    await page.getByTestId('onboarding-next').click();
    await page.waitForSelector('[data-testid="hero-summary"]', { timeout: 10000 });
    await heroHas(/^0 millilitres of 3\.15 litres, 0 percent/, 'starts empty');
    await shot('today-empty');

    // <= 2 taps to log water (here: 1)
    await page.getByTestId('quick-add-250').click();
    await heroHas(/^250 millilitres of 3\.15 litres, 8 percent/, 'instant progress');
    await page.getByTestId('quick-add-350').click();
    await page.getByTestId('quick-add-500').click();
    await heroHas(/^1\.1 litres/, 'totals add up');
    await shot('today-3logs');

    // other beverage
    await page.getByTestId('drink-coffee').click();
    await page.getByTestId('quick-add-250').click();
    await heroHas(/^1\.35 litres/, 'coffee counts at full volume by default');
    await page.getByTestId('drink-water').click();

    // duplicate, delete, undo
    await page.getByTestId('log-0').click();
    await page.getByTestId('entry-duplicate').click();
    await heroHas(/^1\.6 litres/, 'duplicate');
    await page.getByTestId('log-0').click();
    await page.getByTestId('entry-delete').click();
    await heroHas(/^1\.35 litres/, 'delete');
    await page.getByRole('button', { name: 'Undo' }).click();
    await heroHas(/^1\.6 litres/, 'undo');

    // edit amount
    await page.getByTestId('log-0').click();
    await page.getByTestId('entry-edit').click();
    await page.getByTestId('amount-input').fill('1000');
    await page.getByTestId('drink-submit').click();
    await heroHas(/^2\.35 litres/, 'edit 250 -> 1000');

    // reach the goal -> celebration
    await page.getByTestId('quick-add-custom').click();
    await page.getByTestId('amount-input').fill('1200');
    await page.getByTestId('drink-submit').click();
    await page.waitForSelector('text=Goal reached!', { timeout: 5000 });
    await page.waitForTimeout(600); await shot('celebration');
    await heroHas(/3\.55 litres of 3\.15 litres, 113 percent/, 'goal reached, continues past 100% neutrally');

    // rewards: badges earned from the logs above
    await page.getByTestId('tab-challenges').click();
    await shot('challenges-empty');
    assert.ok(await page.getByText('Pick a challenge to start building momentum.').first().isVisible(), 'empty challenge state');
    await page.getByTestId('open-achievements').click();
    await page.waitForSelector('text=Current ');
    assert.ok(await page.getByText('✓ Earned · +10 XP').first().isVisible(), 'first sip badge earned');
    assert.ok(await page.getByText('✓ Earned · +25 XP').first().isVisible(), 'first goal badge earned');
    await shot('achievements');
    await page.goBack();

    // start a challenge, see it on Today
    await page.getByTestId('challenge-steady-sipper').click();
    await page.getByTestId('start-challenge').click(); // premium challenge on the free plan -> paywall
    await page.waitForSelector('text=Unlock everything Plink can do');
    await page.goBack(); await page.goBack();
    await page.getByTestId('challenge-bottle-buddy').click();
    await page.getByTestId('start-challenge').click();
    await page.waitForSelector('[aria-label="1 of 5 days completed"]', { timeout: 5000 }); // today already has 4+ drinks -> 1 of 5 days
    await shot('challenge-progress');
    await page.goBack();

    // Learn: open article, bookmark, filter saved
    await page.getByTestId('tab-learn').click();
    await page.getByTestId('article-morning-glass').click();
    await page.getByRole('heading', { name: 'The one-glass morning start' }).waitFor();
    await page.getByTestId('bookmark').click();
    await shot('article');
    await page.goBack();
    await page.getByTestId('filter-saved').click();
    assert.ok(await page.getByTestId('article-morning-glass').isVisible(), 'saved filter shows bookmarked article');
    await shot('learn-saved');

    // companions screen: locked ones are labelled
    await page.getByTestId('tab-profile').click();
    await page.getByTestId('row-characters').click();
    await page.getByRole('heading', { name: 'Companions' }).waitFor();
    assert.ok(await page.getByText('🔒 Reach level 5').first().isVisible(), 'locked companion shows requirement');
    await shot('characters');
    await page.goBack();
    await page.getByTestId('tab-today').click();
    assert.ok(await page.getByTestId('challenge-bottle-buddy').first().isVisible(), 'active challenge card on Today');
    await shot('today-with-challenge');

    // persistence
    await page.reload();
    await page.waitForSelector('[data-testid="hero-summary"]', { timeout: 15000 });
    await heroHas(/^3\.55 litres/, 'persisted after reload');

    // history
    await page.getByTestId('tab-history').click();
    await page.waitForSelector('text=Goal completion'); await shot('history-week');
    assert.ok(await page.getByText(/You hit your goal 1 of (the last )?\d+ days?/).first().isVisible());
    await page.getByText('Monthly', { exact: true }).click(); await page.waitForTimeout(300); await shot('history-month');
    await page.getByText('Daily', { exact: true }).click(); await page.waitForTimeout(300); await shot('history-day');

    // units
    await page.getByTestId('tab-profile').click();
    await page.getByText('fl oz', { exact: true }).first().click();
    await page.getByTestId('tab-today').click();
    await heroHas(/fluid ounces of 107 fluid ounces/, 'imperial display'); await shot('today-imperial');

    // account/data screens render
    await page.getByTestId('tab-profile').click();
    await page.getByTestId('row-reminders').click();
    await page.waitForSelector('text=Enable reminders'); await shot('reminders');

    // ---- Phase 3 ----
    await page.goBack();
    // free tier: advanced analytics is a teaser, never a blocker for core features
    await page.getByTestId('tab-history').click();
    await page.getByText('Weekly', { exact: true }).click();
    await page.waitForSelector('text=Patterns & trends'); await shot('history-locked-insights');

    // paywall: restore finds nothing, then purchase annual (sandbox)
    await page.getByTestId('tab-profile').click();
    await page.getByTestId('row-subscription').click();
    await page.getByTestId('restore').click();
    await page.waitForSelector('text=No previous subscription found for this account.');
    await shot('paywall');
    await page.getByTestId('plan-annual').click();
    await page.getByTestId('subscribe').click();
    await page.waitForSelector("text=You're Premium");
    await shot('premium-active');
    await page.goBack();

    // premium unlocks insights
    await page.getByTestId('tab-history').click();
    await page.getByRole('heading', { name: 'Patterns' }).waitFor();

    // premium theme
    await page.getByTestId('tab-profile').click();
    await page.getByTestId('row-appearance').click();
    await page.getByTestId('theme-sunset').click();
    await page.waitForSelector('text=✓ Selected >> nth=0');
    await shot('theme-sunset');
    await page.goBack();

    // share card: image downloads, copy works, privacy defaults hold
    await page.getByTestId('tab-today').click();
    await page.getByTestId('share-today').click();
    await page.waitForSelector('text=Daily goal reached!');
    assert.ok(!(await page.getByText('3.55', { exact: false }).count()), 'amounts hidden by default');
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('save-card').click()]);
    assert.strictEqual(download.suggestedFilename(), 'plink-share.png');
    const dlPath = await download.path();
    assert.ok(fs.statSync(dlPath).size > 5000, 'downloaded image is non-trivial');
    if (SHOTS) fs.copyFileSync(dlPath, path.join(SHOTS, 'share-card-export.png'));
    await page.getByTestId('copy-card').click();
    await page.waitForSelector('text=Image copied.');
    await shot('share');
    await page.goBack();

    // widget previews (large unlocked for premium)
    await page.getByTestId('tab-profile').click();
    await page.getByTestId('row-widgets').click();
    for (const size of ['small', 'medium', 'large']) assert.ok(await page.getByTestId(`widget-${size}`).first().isVisible(), `${size} widget preview`);
    await shot('widgets');
    await page.goBack();

    // health: honest unavailable state
    await page.getByTestId('row-health').click();
    await page.waitForSelector('text=Not available in this build'); await shot('health');

    // widget deep link logs one vessel-sized glass of water
    await page.goto(`http://localhost:${PORT}/`);
    await page.waitForSelector('[data-testid="hero-summary"]', { timeout: 15000 });
    const before = await hero();
    await page.goto(`http://localhost:${PORT}/log?ml=250`);
    await page.waitForSelector('[data-testid="hero-summary"]', { timeout: 15000 });
    await page.waitForTimeout(500);
    const after = await hero();
    assert.notStrictEqual(before, after, 'deep link logged a drink');
    await page.goto(`http://localhost:${PORT}/log?ml=301`);
    await page.waitForSelector('[data-testid="hero-summary"]', { timeout: 15000 });
    await page.waitForTimeout(500);
    assert.strictEqual(await hero(), after, 'non-vessel size is ignored');
    assert.deepStrictEqual(errors, [], `browser errors: ${errors.join(' | ')}`);
    console.log('e2e: all checks passed');
  } catch (e) {
    await shot('FAILURE');
    console.error('e2e FAILED:', e.message, errors.length ? '\nbrowser errors: ' + errors.join(' | ') : '');
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})();

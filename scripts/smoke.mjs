// Browser smoke test: node scripts/smoke.mjs
// Loads every route at desktop and phone width and fails on console errors (this includes CSP violations),
// horizontal overflow, empty pages, "undefined"/"NaN" text and broken in-page links; then exercises search,
// the calculators and the theme toggle. Needs Playwright:  npm i --no-save playwright && npx playwright install chromium
// Env: CHROME_PATH (use an installed Chrome), PLAYWRIGHT_DIR (node_modules folder that contains playwright).
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';

let chromium;
try { ({ chromium } = createRequire(import.meta.url)('playwright')); }
catch (e) {
  if (!process.env.PLAYWRIGHT_DIR) { console.error('Playwright is not installed. Run: npm i --no-save playwright && npx playwright install chromium'); process.exit(2); }
  ({ chromium } = createRequire(process.env.PLAYWRIGHT_DIR.replace(/\/?$/, '/'))('playwright'));
}

const server = await serve(0);
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });
const failures = [];
const fail = (where, what) => failures.push(`${where}: ${what}`);
const BAD = /\bNaN\b|\bundefined\b|\bInfinity\b|\[object /;

async function newPage(width) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`console.${m.type()}: ${m.text()}`); });
  page.on('requestfailed', r => errors.push('requestfailed: ' + r.url()));
  page.on('request', r => { if (!r.url().startsWith(base) && !r.url().startsWith('data:')) errors.push('external request: ' + r.url()); });
  return { ctx, page, errors };
}

// ---- 1. every route, two widths
const probe = await newPage(1280);
await probe.page.goto(base + '/index.html');
const ids = await probe.page.evaluate(() => {
  const A = window.ATLAS;
  return { s: A.services.map(x => x.id), a: A.architectures.map(x => x.id), d: A.decisions.map(x => x.id), p: A.engineeringPlaybooks.map(x => x.id), c: A.categories.map(x => x.id) };
});
await probe.ctx.close();
const fixed = ['', 'advisor', 'foundation', 'services-matrix', 'foundry', 'rag-lab', 'agents', 'traditional-ml', 'a', 'security-center', 'evaluation', 'ops', 'finops', 'freshness', 'em-workspace', 'troubleshooting', 'advanced-ai', 'labs', 'toolkit', 'gov', 'p', 'd', 'd/em', 'd/pe', 'd/shaper', 'd/checklists', 'd/calculator'];
const routes = [...fixed, ...ids.c.map(x => 'c/' + x), ...ids.s.map(x => 's/' + x), ...ids.a.map(x => 'a/' + x), ...ids.d.map(x => 'd/' + x), ...ids.p.map(x => 'p/' + x)];
const known = new Set(routes);
const linkTargets = new Set();

for (const width of [1280, 375]) {
  const { ctx, page, errors } = await newPage(width);
  await page.goto(base + '/index.html');
  for (const r of routes) {
    const before = errors.length;
    await page.evaluate(h => { location.hash = h; }, '#/' + r);
    await page.waitForFunction(() => document.querySelector('#main h1'), null, { timeout: 5000 }).catch(() => fail(`${width} #/${r}`, 'no h1 rendered'));
    const info = await page.evaluate(() => ({
      text: document.querySelector('#main').innerText,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      links: [...document.querySelectorAll('#main a[href^="#/"]')].map(a => a.getAttribute('href'))
    }));
    if (info.text.length < 200) fail(`${width} #/${r}`, 'page is nearly empty');
    if (BAD.test(info.text)) fail(`${width} #/${r}`, 'text contains ' + info.text.match(BAD)[0]);
    if (info.overflow > 1) fail(`${width} #/${r}`, `horizontal overflow ${info.overflow}px`);
    info.links.forEach(l => linkTargets.add(l));
    errors.slice(before).forEach(e => fail(`${width} #/${r}`, e));
  }
  await page.evaluate(() => { location.hash = '#/does-not-exist'; });
  await page.waitForTimeout(100);
  if (!/not found|isn.t here|couldn.t find/i.test(await page.evaluate(() => document.querySelector('#main').innerText))) fail(`${width} 404`, 'unknown route should show a not-found page');
  await ctx.close();
}
for (const l of linkTargets) {
  const parts = l.replace(/^#\/?/, '').split('/');
  const route = parts.join('/');
  const [kind, id] = parts;
  const ok = known.has(route) || (kind === 'a' && !id) || known.has(kind) && !id;
  if (!ok) fail('links', `${l} does not match any known route`);
}

// ---- 2. search
{
  const { ctx, page, errors } = await newPage(1280);
  await page.goto(base + '/index.html');
  await page.keyboard.press('/');
  if (!(await page.isVisible('#q'))) fail('search', '"/" did not open search');
  await page.fill('#q', '429');
  let first = await page.textContent('#results li:first-child');
  if (!/429|throttl/i.test(first)) fail('search', `"429" top result was "${first.slice(0, 60)}"`);
  await page.fill('#q', 'PTU');
  if (!/Provisioned|PTU/i.test(await page.textContent('#results'))) fail('search', '"PTU" found nothing relevant');
  if (BAD.test(await page.textContent('#results'))) fail('search', 'results contain undefined/NaN');
  await page.fill('#q', 'amp');
  if (/&amp;|&lt;|&gt;/.test(await page.innerText('#results'))) fail('search', 'highlighting broke an HTML entity');
  await page.fill('#q', 'zzzqqq');
  if (!/No matches/.test(await page.textContent('#results'))) fail('search', 'no empty-state message');
  await page.fill('#q', 'search');
  await page.click('#searchFilters [data-kind="service"]');
  const kinds = await page.$$eval('#results li small', els => els.map(e => e.textContent));
  if (!kinds.length || kinds.some(k => !/Service/.test(k))) fail('search', 'service filter leaked other types');
  await page.fill('#q', 'ai search');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  if (!/#\/s\//.test(await page.evaluate(() => location.hash))) fail('search', 'Enter did not navigate to the top result');
  if (await page.isVisible('#q')) fail('search', 'overlay stayed open after Enter');
  await page.keyboard.press('Control+k'); await page.keyboard.press('Escape');
  if (await page.isVisible('#q')) fail('search', 'Escape did not close');
  errors.forEach(e => fail('search', e));
  await ctx.close();
}

// ---- 2b. search on a phone-width screen
{
  const { ctx, page, errors } = await newPage(375);
  await page.goto(base + '/index.html');
  await page.click('#searchBtn');
  await page.fill('#q', 'throttling');
  if (!/429|throttl/i.test(await page.textContent('#results'))) fail('search 375', 'no relevant result for "throttling"');
  const over = await page.evaluate(() => { const d = document.querySelector('.dialog').getBoundingClientRect(); return d.right - document.documentElement.clientWidth; });
  if (over > 1) fail('search 375', `dialog overflows the screen by ${Math.round(over)}px`);
  await page.click('#results li:first-child a');
  await page.waitForTimeout(150);
  if (await page.isVisible('#q')) fail('search 375', 'overlay stayed open after choosing a result');
  errors.forEach(e => fail('search 375', e));
  await ctx.close();
}

// ---- 3. FinOps calculators
{
  const { ctx, page, errors } = await newPage(1280);
  await page.goto(base + '/index.html#/finops');
  await page.waitForSelector('#tcoOut .kpi');
  const t = () => page.innerText('#tcoOut'), r = () => page.innerText('#roiOut');
  const t0 = await t();
  await page.fill('#tcoUsers', '5000');
  if (t0 === await t()) fail('finops', 'users input did not change the result');
  await page.fill('#tcoCacheHit', '0');
  if (!/0% cached/i.test(await t())) fail('finops', 'cache hit 0 was ignored');
  await page.fill('#tcoUsers', '0');
  if (!/n\/a/i.test(await t())) fail('finops', 'users=0 should show n/a per user');
  await page.fill('#tcoUsers', '');
  if (!/Fix these inputs/i.test(await t())) fail('finops', 'empty input should show a validation message');
  await page.fill('#tcoUsers', '-5');
  if (!/at least/i.test(await page.innerText('#tcoUsersErr'))) fail('finops', 'negative input has no inline error');
  await page.click('#tcoReset');
  if ((await page.inputValue('#tcoUsers')) !== '2500') fail('finops', 'reset did not restore defaults');
  const r0 = await r();
  await page.fill('#roiHours', '10'); await page.fill('#roiCloud', '500000');
  if (r0 === await r()) fail('finops', 'ROI ignored hours/cloud inputs');
  await page.fill('#roiHours', '0'); await page.fill('#roiDirect', '0');
  if (!/No payback/i.test(await r())) fail('finops', 'zero benefit should show "No payback"');
  if (!/Estimate|not an Azure quote/i.test(await page.innerText('#main'))) fail('finops', 'missing "not a quote" disclaimer');
  if (BAD.test(await page.innerText('#main'))) fail('finops', 'page text contains undefined/NaN');
  errors.forEach(e => fail('finops', e));
  await ctx.close();
}

// ---- 4. theme toggle, mobile nav, verification page
{
  const { ctx, page, errors } = await newPage(375);
  await page.goto(base + '/index.html');
  const theme = () => page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const t0 = await theme();
  await page.click('#themeBtn');
  if (t0 === await theme()) fail('theme', 'toggle did nothing');
  await page.goto(base + '/index.html#/freshness');
  await page.waitForSelector('#main h1');
  const txt = await page.innerText('#main');
  for (const need of ['Verified service records', 'model lifecycle', 'Module coverage', 'Sources used']) if (!new RegExp(need, 'i').test(txt)) fail('freshness', `missing section "${need}"`);
  await page.goto(base + '/index.html#/s/key-vault');
  if (!/Unverified/i.test(await page.innerText('#main'))) fail('service page', 'unchecked service should say it is unverified');
  await page.goto(base + '/index.html#/s/ai-search');
  if (!/Verified 20\d\d-\d\d-\d\d/i.test(await page.innerText('#main'))) fail('service page', 'verified service should show its date');
  errors.forEach(e => fail('misc', e));
  await ctx.close();
}

await browser.close();
server.close();
console.log(`smoke: ${routes.length} routes x 2 widths, search, finops, theme, freshness`);
if (failures.length) { console.error(`\n${failures.length} failure(s):`); failures.slice(0, 60).forEach(f => console.error(' - ' + f)); process.exit(1); }
console.log('smoke OK');

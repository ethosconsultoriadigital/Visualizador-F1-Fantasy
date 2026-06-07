const path = require('path');
const puppeteer = require('puppeteer');

const HERE = __dirname;
const URL = 'file://' + path.join(HERE, 'preview.html');

const SHOTS = [
  { view: 'home',      file: '01-home.png' },
  { view: 'standings', file: '02-standings.png' },
  { view: 'calendar',  file: '03-calendar.png' },
  { view: 'status',    file: '04-status.png' },
  { view: 'pick',      file: '05-pick.png' }
];

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    defaultViewport: { width: 412, height: 915, deviceScaleFactor: 2 }
  });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1400)); // carga inicial + animaciones

  for (const s of SHOTS) {
    await page.evaluate((v) => { window.F1 && window.F1.go(v); }, s.view);
    await new Promise(r => setTimeout(r, 900));
    await page.screenshot({ path: path.join(HERE, s.file), fullPage: true });
    console.log('shot:', s.file);
  }
  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

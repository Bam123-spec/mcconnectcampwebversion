const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

(async () => {
  const base = 'http://localhost:3001';
  const routes = ['/', '/clubs', '/events', '/login', '/activity', '/manage', '/docs'];
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const results = [];

  for (const route of routes) {
    const url = base + route;
    const errors = [];
    const listener = (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    };
    page.on('console', listener);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const axe = await new AxeBuilder({ page }).analyze();
      const title = await page.title();
      const h1s = await page.locator('h1').allInnerTexts();
      const skipLinkExists = await page.locator('a.skip-link').count();
      const mainExists = await page.locator('main#main-content').count();
      const landmarks = await page.evaluate(() => ({
        header: document.querySelectorAll('header').length,
        nav: document.querySelectorAll('nav').length,
        main: document.querySelectorAll('main').length,
        footer: document.querySelectorAll('footer').length,
        search: document.querySelectorAll('[role="search"]').length,
      }));
      results.push({
        route,
        title,
        h1s,
        skipLinkExists,
        mainExists,
        landmarks,
        violations: axe.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })),
        incomplete: axe.incomplete.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })),
        consoleErrors: errors,
      });
    } catch (error) {
      results.push({ route, error: String(error) });
    } finally {
      page.off('console', listener);
    }
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();

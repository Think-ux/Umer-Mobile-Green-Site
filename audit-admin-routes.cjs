const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  const routes = [
    "/admin",
    "/admin/accounts",
    "/admin/banners",
    "/admin/brands",
    "/admin/categories",
    "/admin/content",
    "/admin/orders",
    "/admin/products",
    "/admin/retailers",
    "/admin/reviews",
    "/admin/settings"
  ];

  for (const route of routes) {
    try {
      const response = await page.goto(`http://localhost:3000${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 15000
      });

      await page.waitForTimeout(1000);

      const result = await page.evaluate(() => ({
        title: document.title,
        heading: document.querySelector("h1")?.innerText?.trim() || "",
        text: document.body.innerText.slice(0, 250).replace(/\s+/g, " ")
      }));

      console.log(JSON.stringify({
        route,
        status: response?.status() ?? "no response",
        url: page.url(),
        ...result
      }));
    } catch (error) {
      console.log(JSON.stringify({ route, error: error.message }));
    }
  }

  await browser.close();
})();

const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: "playwright/.auth/admin.json"
  });
  const page = await context.newPage();

  const routes = [
    "/admin", "/admin/accounts", "/admin/banners",
    "/admin/brands", "/admin/categories", "/admin/content",
    "/admin/orders", "/admin/products", "/admin/retailers",
    "/admin/reviews", "/admin/settings"
  ];

  for (const route of routes) {
    try {
      const response = await page.goto(
        `http://localhost:3000${route}`,
        { waitUntil: "networkidle", timeout: 20000 }
      );

      const result = await page.evaluate(() => ({
        heading: document.querySelector("h1")?.innerText?.trim() || "",
        text: document.body.innerText.slice(0, 350).replace(/\s+/g, " ")
      }));

      console.log(JSON.stringify({
        route,
        status: response?.status(),
        finalUrl: page.url(),
        ...result
      }));
    } catch (error) {
      console.log(JSON.stringify({ route, error: error.message }));
    }
  }

  await browser.close();
})();

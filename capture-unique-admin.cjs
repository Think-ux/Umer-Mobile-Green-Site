const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

(async () => {
  const authFile = "playwright/.auth/admin.json";
  if (!fs.existsSync(authFile)) {
    console.log("Admin session nahi mila. Pehle save-admin-session.cjs run karein.");
    process.exit(1);
  }

  const outDir = path.resolve("screenshots/verified");
  fs.mkdirSync(outDir, { recursive: true });

  const routes = [
    ["/admin", "admin"],
    ["/admin/accounts", "admin-accounts"],
    ["/admin/banners", "admin-banners"],
    ["/admin/brands", "admin-brands"],
    ["/admin/categories", "admin-categories"],
    ["/admin/content", "admin-content"],
    ["/admin/orders", "admin-orders"],
    ["/admin/products", "admin-products"],
    ["/admin/retailers", "admin-retailers"],
    ["/admin/reviews", "admin-reviews"],
    ["/admin/settings", "admin-settings"]
  ];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: authFile,
    viewport: { width: 1440, height: 1000 }
  });
  const page = await context.newPage();
  const seen = new Set();

  for (const [route, name] of routes) {
    try {
      await page.goto(`http://localhost:3000${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 20000
      });
      await page.waitForTimeout(1200);

      const info = await page.evaluate(() => {
        const main = document.querySelector("main") || document.body;
        return {
          heading: main.querySelector("h1")?.innerText?.trim() || "",
          text: main.innerText.replace(/\s+/g, " ").trim()
        };
      });

      if (page.url().includes("/admin/login")) {
        console.log(`SKIP ${route}: admin login required`);
        continue;
      }

      const fingerprint = crypto
        .createHash("sha256")
        .update((info.heading + "|" + info.text).toLowerCase())
        .digest("hex");

      if (seen.has(fingerprint)) {
        console.log(`DUPLICATE SKIPPED ${route}: ${info.heading}`);
        continue;
      }
      seen.add(fingerprint);

      const file = path.join(outDir, `${name}.png`);
      if (fs.existsSync(file)) {
        console.log(`EXISTS, NOT OVERWRITTEN: ${file}`);
        continue;
      }

      await page.screenshot({ path: file, fullPage: true });
      console.log(`SAVED ${route} | ${info.heading} | ${file}`);
    } catch (error) {
      console.log(`ERROR ${route}: ${error.message}`);
    }
  }

  await browser.close();
  console.log("Done. Existing screenshots were preserved.");
})();

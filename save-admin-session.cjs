const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  fs.mkdirSync("playwright/.auth", { recursive: true });

  await page.goto("http://localhost:3000/admin/login");

  console.log("Browser mein admin login karein...");
  await page.waitForURL("**/admin", { timeout: 120000 });

  await context.storageState({
    path: "playwright/.auth/admin.json"
  });

  console.log("Admin session save ho gaya.");
  console.log("Ab browser band kar sakte hain.");
  await browser.close();
})();

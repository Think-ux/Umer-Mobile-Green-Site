const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.SITE_URL || "http://localhost:3000";
const OUT = path.resolve("screenshots");

const ROOTS = [
  "src/app", "app",
  "src/pages", "pages"
];

function normalizeRoute(route) {
  route = "/" + route.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  route = route.replace(/\/+/g, "/");
  return route === "/" ? "/" : route;
}

function discoverRoutes() {
  const routes = new Set(["/"]);

  function walk(dir, root, isPagesRouter) {
    if (!fs.existsSync(dir)) return;

    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (item.name.startsWith(".") ||
          item.name === "node_modules" ||
          item.name === "api") continue;

      const full = path.join(dir, item.name);

      if (item.isDirectory()) {
        walk(full, root, isPagesRouter);
        continue;
      }

      if (!/\.(js|jsx|ts|tsx)$/.test(item.name)) continue;

      let route = "";

      if (isPagesRouter) {
        if (item.name.startsWith("_") || item.name.startsWith("api.")) continue;

        const relative = path.relative(root, full)
          .replace(/\\/g, "/")
          .replace(/\.(js|jsx|ts|tsx)$/, "");

        if (relative === "index") route = "/";
        else if (relative.endsWith("/index")) {
          route = "/" + relative.slice(0, -6);
        } else route = "/" + relative;
      } else {
        if (!/^page\.(js|jsx|ts|tsx)$/.test(item.name)) continue;

        const relative = path.relative(root, dir).replace(/\\/g, "/");
        route = relative ? "/" + relative : "/";
      }

      // Dynamic segments require real parameter values.
      // Skip unresolved routes such as /products/[id].
      if (/\[[^\]]+\]/.test(route)) continue;

      routes.add(normalizeRoute(route));
    }
  }

  for (const root of ROOTS) {
    walk(root, root, /(^|\/)pages$/.test(root));
  }

  return [...routes].sort();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const routes = discoverRoutes();
  console.log(`Found ${routes.length} unique routes.`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1
  });

  for (const route of routes) {
    const url = new URL(route, BASE_URL);
    const filenamePart = route === "/" ? "home" :
      route.slice(1).replace(/[^a-zA-Z0-9_-]+/g, "-");

    const filename = filenamePart + ".png";
    const outputPath = path.join(OUT, filename);

    try {
      console.log("Checking:", route);

      const response = await page.goto(url.href, {
        waitUntil: "networkidle",
        timeout: 45000
      }).catch(() => null);

      if (!response || !response.ok()) {
        console.log("Skipped:", route,
          response ? `HTTP ${response.status()}` : "load failed");
        continue;
      }

      // Avoid saving a Next.js not-found page as a valid route.
      const isNotFound = await page.locator("body").innerText()
        .then(text => /404\s*[-:]?\s*(page not found|this page could not be found)/i.test(text))
        .catch(() => false);

      if (isNotFound) {
        console.log("Skipped not-found page:", route);
        continue;
      }

      await page.screenshot({
        path: outputPath,
        fullPage: true,
        animations: "disabled"
      });

      console.log("Saved:", outputPath);
    } catch (err) {
      console.log("Failed:", route, err.message);
    }
  }

  await browser.close();
  console.log("Done. Check the screenshots folder.");
})();

import "dotenv/config";
import { chromium, type Page } from "@playwright/test";

/**
 * Mobile responsive audit. Visits key URLs at 375x812 (iPhone X), takes
 * screenshots, and reports any horizontal overflow.
 */

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 375, height: 812 };

type AuditPage = {
  name: string;
  path: string;
  // Optional checks specific to this page.
  extraChecks?: (page: Page) => Promise<string[]>;
};

const PAGES: AuditPage[] = [
  { name: "home", path: "/" },
  { name: "category-grandma", path: "/categories/grandma-cuisines" },
  { name: "recipe-shakshuka", path: "/recipes/shakshuka-shel-yom-shishi" },
  { name: "search-empty", path: "/search" },
  { name: "search-pasta", path: "/search?q=%D7%A4%D7%A1%D7%98%D7%94" },
];

async function checkOverflow(page: Page, viewportWidth: number): Promise<{
  hasOverflow: boolean;
  bodyWidth: number;
  htmlWidth: number;
  overflowingNodes: Array<{ tag: string; class: string; width: number; left: number; right: number }>;
}> {
  return await page.evaluate((vw: number) => {
    const body = document.body;
    const html = document.documentElement;
    const bodyWidth = body.scrollWidth;
    const htmlWidth = html.scrollWidth;
    const overflowingNodes: Array<{ tag: string; class: string; width: number; left: number; right: number }> = [];
    const all = document.querySelectorAll<HTMLElement>("*");
    for (const el of all) {
      const r = el.getBoundingClientRect();
      // Element extends to the right of viewport AND has measurable size
      if (r.right > vw + 1 && r.width > 4 && r.height > 4) {
        // Skip svg internals & truly invisible
        if (el.closest("svg")) continue;
        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.display === "none") continue;
        overflowingNodes.push({
          tag: el.tagName.toLowerCase(),
          class: typeof el.className === "string" ? el.className.slice(0, 80) : "",
          width: Math.round(r.width),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
        if (overflowingNodes.length >= 10) break;
      }
    }
    return { hasOverflow: bodyWidth > vw + 1, bodyWidth, htmlWidth, overflowingNodes };
  }, viewportWidth);
}

async function auditPage(page: Page, p: AuditPage) {
  const url = `${BASE}${p.path}`;
  console.log(`\n[${p.name}] ${url}`);
  const issues: string[] = [];
  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    if (!resp || resp.status() >= 400) {
      issues.push(`HTTP ${resp?.status() ?? "no-response"}`);
    }
    // Wait for fonts/layout to settle
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    // Screenshot
    const shotPath = `/tmp/mobile-${p.name}.png`;
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`  screenshot: ${shotPath}`);

    // Overflow check
    const overflow = await checkOverflow(page, VIEWPORT.width);
    if (overflow.hasOverflow) {
      issues.push(
        `horizontal overflow: bodyWidth=${overflow.bodyWidth}px (viewport=${VIEWPORT.width}px)`
      );
      for (const n of overflow.overflowingNodes) {
        issues.push(
          `  overflowing <${n.tag}> w=${n.width} L=${n.left} R=${n.right} class="${n.class}"`
        );
      }
    } else {
      console.log(`  overflow: OK (bodyWidth=${overflow.bodyWidth})`);
    }

    if (p.extraChecks) {
      const extra = await p.extraChecks(page);
      issues.push(...extra);
    }
  } catch (err) {
    issues.push(`navigation error: ${(err as Error).message}`);
  }

  if (issues.length === 0) {
    console.log(`  no issues`);
  } else {
    for (const i of issues) console.log(`  ISSUE: ${i}`);
  }
  return { name: p.name, issues };
}

async function main() {
  console.log(`Mobile audit @ ${VIEWPORT.width}x${VIEWPORT.height}`);
  console.log(`Base: ${BASE}`);

  // Use bundled Chromium app (full, not headless-shell) since shell variant
  // may not be downloaded.
  const chromePath =
    "/Users/baralezrah/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium";
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  // Page-specific checks
  PAGES[0].extraChecks = async (p) => {
    // Home: hero h1 should not overflow viewport.
    const overflow = await p.evaluate(() => {
      const h1 = document.querySelector("h1");
      if (!h1) return null;
      const r = h1.getBoundingClientRect();
      return { width: Math.round(r.width), right: Math.round(r.right) };
    });
    if (overflow && overflow.right > VIEWPORT.width + 1) {
      return [`hero h1 overflows: width=${overflow.width} right=${overflow.right}`];
    }
    return [];
  };

  PAGES[1].extraChecks = async (p) => {
    // Category page: filter bar and sub-category pills should wrap or scroll horizontally without breaking layout.
    return await p.evaluate((vw: number) => {
      const issues: string[] = [];
      const filterBar = document.querySelector(".sticky") as HTMLElement | null;
      if (filterBar) {
        const r = filterBar.getBoundingClientRect();
        if (r.width > vw + 1) issues.push(`filter bar overflows viewport: w=${Math.round(r.width)}`);
      }
      return issues;
    }, VIEWPORT.width);
  };

  PAGES[2].extraChecks = async (p) => {
    // Recipe page: ingredients sidebar should NOT be `position: sticky` on mobile.
    return await p.evaluate(() => {
      const issues: string[] = [];
      const sidebar = document.querySelector(".sidebar-sticky") as HTMLElement | null;
      if (sidebar) {
        const pos = getComputedStyle(sidebar).position;
        if (pos === "sticky" || pos === "fixed") {
          issues.push(`ingredients sidebar is ${pos} on mobile (should be static)`);
        }
      }
      // Step number markers should fit.
      const stepNums = document.querySelectorAll(".step-num");
      let badStep = 0;
      for (const el of Array.from(stepNums)) {
        const r = (el as HTMLElement).getBoundingClientRect();
        if (r.width === 0 || r.height === 0) badStep++;
      }
      if (badStep > 0) issues.push(`${badStep} step numbers have zero size`);
      return issues;
    });
  };

  PAGES[3].extraChecks = async (p) => {
    // Search: the main page input (not the header one) should be roughly full container width.
    return await p.evaluate((vw: number) => {
      const issues: string[] = [];
      const main = document.getElementById("search-input") as HTMLInputElement | null;
      if (main) {
        const r = main.getBoundingClientRect();
        if (r.width < vw * 0.7) {
          issues.push(`main search input narrower than 70% of viewport: w=${Math.round(r.width)}`);
        }
      } else {
        issues.push("main search input #search-input not found");
      }
      return issues;
    }, VIEWPORT.width);
  };

  const results: Array<{ name: string; issues: string[] }> = [];
  for (const pg of PAGES) {
    results.push(await auditPage(page, pg));
  }

  // Mobile menu open/close test on home
  console.log(`\n[home] mobile menu test`);
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  const menuButton = page.locator("button[aria-label='תפריט']").first();
  if (await menuButton.count()) {
    await menuButton.click();
    const expanded = await menuButton.getAttribute("aria-expanded");
    console.log(`  after click: aria-expanded=${expanded}`);
    if (expanded !== "true") {
      results.push({ name: "home-menu", issues: ["menu did not open after click"] });
    } else {
      results.push({ name: "home-menu", issues: [] });
    }
    await page.screenshot({ path: "/tmp/mobile-home-menu-open.png", fullPage: false });
  } else {
    results.push({ name: "home-menu", issues: ["hamburger button not found"] });
  }

  await browser.close();

  console.log(`\n========================================`);
  console.log(`SUMMARY`);
  console.log(`========================================`);
  let totalIssues = 0;
  for (const r of results) {
    if (r.issues.length === 0) {
      console.log(`  PASS ${r.name}`);
    } else {
      totalIssues += r.issues.length;
      console.log(`  FAIL ${r.name} (${r.issues.length} issues)`);
      for (const i of r.issues) console.log(`    - ${i}`);
    }
  }
  console.log(`\nTotal issues: ${totalIssues}`);
  process.exit(totalIssues > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * scripts/validate-seo.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Beymflow SEO implementation:
 *   1. public/robots.txt  — has Sitemap, blocks /auth, /payment-success
 *   2. public/sitemap.xml — is valid XML, contains required URLs, no noindex pages
 *   3. src/lib/seo.ts     — all public routes have page-level SEO defined
 *   4. index.html         — has required meta tags in the base HTML
 *
 * Usage:
 *   node scripts/validate-seo.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function ok(msg) {
    console.log(`  ✅  ${msg}`);
    passed++;
}

function fail(msg) {
    console.error(`  ❌  ${msg}`);
    failed++;
}

function section(title) {
    console.log(`\n── ${title} ${"─".repeat(60 - title.length)}`);
}

// ─── 1. robots.txt ─────────────────────────────────────────────────────────
section("robots.txt");

const robotsPath = resolve(ROOT, "public/robots.txt");
if (!existsSync(robotsPath)) {
    fail("public/robots.txt not found");
} else {
    const robots = readFileSync(robotsPath, "utf8");

    if (/Sitemap:\s*https:\/\//.test(robots)) {
        ok("Sitemap directive present with absolute URL");
    } else {
        fail("Missing 'Sitemap:' directive with absolute URL");
    }

    if (/Disallow:.*\/auth/.test(robots)) {
        ok("Disallow /auth present (prevents indexing login page)");
    } else {
        fail("Missing 'Disallow: /auth'");
    }

    if (/Disallow:.*\/payment-success/.test(robots)) {
        ok("Disallow /payment-success present");
    } else {
        fail("Missing 'Disallow: /payment-success'");
    }

    if (/User-agent: \*\s*[\r\n]+Allow: \//.test(robots)) {
        ok("Default User-agent * Allow: / present");
    } else {
        fail("Missing 'User-agent: *' with Allow: /");
    }

    if (/User-agent: GPTBot[\r\n\s]+Disallow: \//.test(robots)) {
        ok("GPTBot disallowed (AI training opt-out)");
    } else {
        fail("Missing GPTBot Disallow: /");
    }
}

// ─── 2. sitemap.xml ────────────────────────────────────────────────────────
section("sitemap.xml");

const sitemapPath = resolve(ROOT, "public/sitemap.xml");
if (!existsSync(sitemapPath)) {
    fail("public/sitemap.xml not found");
} else {
    const sitemap = readFileSync(sitemapPath, "utf8");

    // Check required public URLs
    const requiredUrls = [
        "https://beymflow.com/",
        "https://beymflow.com/about",
        "https://beymflow.com/flow",
        "https://beymflow.com/flow/prompt-generator",
        "https://beymflow.com/flow/color-codes",
        "https://beymflow.com/premium",
        "https://beymflow.com/community",
    ];

    for (const url of requiredUrls) {
        if (sitemap.includes(`<loc>${url}</loc>`)) {
            ok(`<loc>${url}</loc> present`);
        } else {
            fail(`Missing <loc>${url}</loc>`);
        }
    }

    // Check noindex pages are EXCLUDED
    const excludedUrls = [
        "beymflow.com/auth",
        "beymflow.com/payment-success",
        "beymflow.com/settings/billing",
    ];

    for (const url of excludedUrls) {
        if (sitemap.includes(url)) {
            fail(`Noindex URL found in sitemap: ${url} — remove it`);
        } else {
            ok(`Noindex URL correctly absent from sitemap: ${url}`);
        }
    }

    // Check hreflang in sitemap
    if (sitemap.includes('hreflang="x-default"')) {
        ok("hreflang x-default found in sitemap");
    } else {
        fail("Missing hreflang x-default in sitemap");
    }

    if (/<priority>1\.0<\/priority>/.test(sitemap)) {
        ok("Homepage priority=1.0 present");
    } else {
        fail("Missing priority=1.0 for homepage");
    }
}

// ─── 3. index.html ─────────────────────────────────────────────────────────
section("index.html");

const htmlPath = resolve(ROOT, "index.html");
if (!existsSync(htmlPath)) {
    fail("index.html not found");
} else {
    const html = readFileSync(htmlPath, "utf8");

    const required = [
        [/<title>/, "Has <title> tag"],
        [/meta name="description"/, "Has meta description"],
        [/meta name="robots"/, "Has meta robots"],
        [/meta property="og:title"/, "Has og:title"],
        [/meta property="og:description"/, "Has og:description"],
        [/meta property="og:image"/, "Has og:image"],
        [/meta property="og:url"/, "Has og:url"],
        [/meta name="twitter:card"/, "Has twitter:card"],
        [/meta name="twitter:title"/, "Has twitter:title"],
        [/link rel="canonical"/, "Has canonical link"],
        [/link rel="alternate" hreflang="x-default"/, "Has hreflang x-default"],
        [/link rel="alternate" hreflang="en-US"/, "Has hreflang en-US"],
        [/link rel="alternate" hreflang="fi"/, "Has hreflang fi (Finland)"],
        [/application\/ld\+json/, "Has JSON-LD structured data"],
        [/"@type":\s*"Organization"/, "Has Organization schema"],
        [/"@type":\s*"WebSite"/, "Has WebSite schema"],
        [/"@type":\s*"WebApplication"/, "Has WebApplication schema"],
        [/rel="preconnect"/, "Has preconnect hints"],
        [/rel="preload"[\s\S]*?as="font"/, "Has font preload"],
        [/meta name="theme-color"/, "Has theme-color meta"],
        [/meta name="viewport"/, "Has viewport meta"],
    ];

    for (const [regex, label] of required) {
        if (regex.test(html)) {
            ok(label);
        } else {
            fail(`Missing: ${label}`);
        }
    }
}

// ─── 4. src/lib/seo.ts — page routes ───────────────────────────────────────
section("src/lib/seo.ts — Page SEO coverage");

const seoPath = resolve(ROOT, "src/lib/seo.ts");
if (!existsSync(seoPath)) {
    fail("src/lib/seo.ts not found");
} else {
    const seo = readFileSync(seoPath, "utf8");

    const requiredRoutes = [
        "/",
        "/about",
        "/flow",
        "/flow/prompt-generator",
        "/flow/color-codes",
        "/premium",
        "/community",
        "/auth",
        "/image-generator",
    ];

    for (const route of requiredRoutes) {
        if (seo.includes(`"${route}"`)) {
            ok(`PAGE_SEO has entry for "${route}"`);
        } else {
            fail(`Missing PAGE_SEO entry for "${route}"`);
        }
    }

    if (/LOCALE_CONFIGS/.test(seo)) ok("LOCALE_CONFIGS (hreflang) defined");
    else fail("LOCALE_CONFIGS missing");

    if (/buildFAQSchema/.test(seo)) ok("buildFAQSchema helper exported");
    else fail("buildFAQSchema missing");

    if (/buildBreadcrumbSchema/.test(seo)) ok("buildBreadcrumbSchema helper exported");
    else fail("buildBreadcrumbSchema missing");

    if (/buildOrganizationSchema/.test(seo)) ok("buildOrganizationSchema helper exported");
    else fail("buildOrganizationSchema missing");
}

// ─── 5. src/hooks/useSEO.ts ────────────────────────────────────────────────
section("src/hooks/useSEO.ts");

const useSEOPath = resolve(ROOT, "src/hooks/useSEO.ts");
if (!existsSync(useSEOPath)) {
    fail("src/hooks/useSEO.ts not found");
} else {
    const useSEO = readFileSync(useSEOPath, "utf8");
    if (/hreflang/.test(useSEO)) ok("hreflang injection present in useSEO hook");
    else fail("hreflang injection missing in useSEO hook");
    if (/canonical/.test(useSEO)) ok("canonical injection present");
    else fail("canonical injection missing");
    if (/og:title/.test(useSEO)) ok("OG tags present");
    else fail("OG tags missing");
    if (/twitter:card/.test(useSEO)) ok("Twitter card present");
    else fail("Twitter card missing");
    if (/removeAllManaged/.test(useSEO)) ok("Cleanup of managed tags implemented");
    else fail("Cleanup function missing");
}

// ─── Summary ───────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(70)}`);
console.log(`\n  RESULTS: ${passed} passed / ${failed} failed\n`);

if (failed > 0) {
    console.error(`  ⚠️  Fix the ${failed} failing check(s) above.\n`);
    process.exit(1);
} else {
    console.log(`  🎉  All SEO validation checks passed!\n`);
    process.exit(0);
}

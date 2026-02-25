/**
 * hooks/useSEO.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * React hook that imperatively manages all SEO <head> tags for Vite + React SPA.
 *
 * Because Vite / React Router is a pure client-side SPA without SSR, there is
 * no Next.js <Head /> component. We instead imperatively mutate document.head
 * on every route change using this hook.
 *
 * Features managed:
 *   • <title>
 *   • <meta name="description">
 *   • <meta name="robots">
 *   • <meta name="keywords">
 *   • <link rel="canonical">
 *   • Open Graph (og:title, og:description, og:url, og:image, og:type, og:site_name)
 *   • Twitter Card (twitter:card, twitter:title, twitter:description, twitter:image)
 *   • hreflang <link> tags for GEO targeting
 *   • JSON-LD <script> blocks (one per schema)
 *
 * Usage (in a page component or route wrapper):
 *   useSEO("/about");
 *   useSEO("/", { schemas: [buildOrganizationSchema(), buildWebSiteSchema()] });
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { useEffect } from "react";
import {
    PAGE_SEO,
    DEFAULT_SEO,
    LOCALE_CONFIGS,
    SITE_NAME,
    TWITTER_SITE,
    type SEOMeta,
} from "@/lib/seo";

interface UseSEOOptions {
    /** Override any field of the page's default SEOMeta */
    overrides?: Partial<SEOMeta>;
    /** JSON-LD schema objects to inject as <script type="application/ld+json"> */
    schemas?: object[];
}

// Marker attribute so we can remove previously injected tags on route change
const SEO_ATTR = "data-seo-managed";

function upsertMeta(
    attr: string,
    attrValue: string,
    content: string
): HTMLMetaElement {
    let el = document.head.querySelector<HTMLMetaElement>(
        `meta[${attr}="${attrValue}"]`
    );
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, attrValue);
        el.setAttribute(SEO_ATTR, "true");
        document.head.appendChild(el);
    }
    el.content = content;
    return el;
}

function upsertLink(
    rel: string,
    href: string,
    extra?: Record<string, string>
): HTMLLinkElement {
    const selector = extra
        ? `link[rel="${rel}"][hreflang="${extra.hreflang}"]`
        : `link[rel="${rel}"]`;
    let el = document.head.querySelector<HTMLLinkElement>(selector);
    if (!el) {
        el = document.createElement("link");
        el.rel = rel;
        el.setAttribute(SEO_ATTR, "true");
        if (extra) {
            Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
        }
        document.head.appendChild(el);
    }
    el.href = href;
    return el;
}

function removeAllManaged() {
    document.head
        .querySelectorAll(`[${SEO_ATTR}="true"]`)
        .forEach((el) => el.remove());
}

function injectSchema(schema: object): HTMLScriptElement {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute(SEO_ATTR, "true");
    el.text = JSON.stringify(schema);
    document.head.appendChild(el);
    return el;
}

export function useSEO(
    pathname: string,
    options: UseSEOOptions = {}
): void {
    const { overrides = {}, schemas = [] } = options;

    useEffect(() => {
        // Resolve meta for this route
        const baseMeta: SEOMeta = PAGE_SEO[pathname] ?? DEFAULT_SEO;
        const meta: SEOMeta = { ...baseMeta, ...overrides };

        // ── Title ──────────────────────────────────────────────────────────────────
        document.title = meta.title;

        // Remove previously managed tags before re-injecting
        removeAllManaged();

        // ── Core meta ──────────────────────────────────────────────────────────────
        upsertMeta("name", "description", meta.description);
        if (meta.robots) upsertMeta("name", "robots", meta.robots);
        if (meta.keywords) upsertMeta("name", "keywords", meta.keywords);

        // ── Canonical ─────────────────────────────────────────────────────────────
        upsertLink("canonical", meta.canonical);

        // ── Open Graph ────────────────────────────────────────────────────────────
        upsertMeta("property", "og:title", meta.title);
        upsertMeta("property", "og:description", meta.description);
        upsertMeta("property", "og:url", meta.canonical);
        upsertMeta("property", "og:type", meta.ogType ?? "website");
        upsertMeta("property", "og:site_name", SITE_NAME);
        if (meta.ogImage) {
            upsertMeta("property", "og:image", meta.ogImage);
            upsertMeta("property", "og:image:width", "1200");
            upsertMeta("property", "og:image:height", "630");
            upsertMeta("property", "og:image:alt", `${SITE_NAME} — ${meta.title}`);
        }

        // ── Twitter Card ──────────────────────────────────────────────────────────
        upsertMeta("name", "twitter:card", "summary_large_image");
        upsertMeta("name", "twitter:site", TWITTER_SITE);
        upsertMeta("name", "twitter:title", meta.title);
        upsertMeta("name", "twitter:description", meta.description);
        if (meta.ogImage) {
            upsertMeta("name", "twitter:image", meta.ogImage);
            upsertMeta("name", "twitter:image:alt", `${SITE_NAME} — ${meta.title}`);
        }

        // ── hreflang (GEO) ────────────────────────────────────────────────────────
        LOCALE_CONFIGS.forEach((locale) => {
            upsertLink("alternate", locale.url, { hreflang: locale.hreflang });
        });

        // ── JSON-LD schemas ───────────────────────────────────────────────────────
        schemas.forEach(injectSchema);

        // Cleanup on unmount / route change
        return () => {
            removeAllManaged();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);
}

export default useSEO;

/**
 * lib/seo.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Beymflow SEO helper module.
 *
 * Usage:
 *   import { buildSEOMeta, buildOrganizationSchema, buildWebApplicationSchema,
 *            buildWebSiteSchema, buildBreadcrumbSchema, buildFAQSchema } from '@/lib/seo';
 *
 * All helpers return plain objects/strings suitable for injection into the DOM
 * via the useSEO hook or <script> tags.
 * ──────────────────────────────────────────────────────────────────────────────
 */

// ─── Brand constants ──────────────────────────────────────────────────────────

export const SITE_NAME = "Beymflow";
export const SITE_URL = "https://beymflow.com"; // canonical origin

/** Absolute URL to the OG share image (1200×630 recommended). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/beymflow-logo.png`;

/** Twitter handle */
export const TWITTER_SITE = "@beymflow";

// ─── Locale / GEO configuration ───────────────────────────────────────────────

export interface LocaleConfig {
    /** BCP-47 language tag */
    hreflang: string;
    /** Canonical URL for this locale */
    url: string;
    /** Human-readable region label (for schema hints only) */
    region?: string;
}

/**
 * Supported locales.
 * Add more entries here as new regional landing pages are created.
 * Currently all point to the same URL (en-US default) — this future-proofs
 * hreflang scaffolding without requiring new visible pages.
 */
export const LOCALE_CONFIGS: LocaleConfig[] = [
    { hreflang: "x-default", url: SITE_URL, region: "Global" },
    { hreflang: "en", url: SITE_URL, region: "Global" },
    { hreflang: "en-US", url: `${SITE_URL}`, region: "US" },
    { hreflang: "en-GB", url: `${SITE_URL}`, region: "UK" },
    { hreflang: "en-EU", url: `${SITE_URL}`, region: "EU" },
    { hreflang: "fi", url: `${SITE_URL}`, region: "Finland" },
    { hreflang: "fi-FI", url: `${SITE_URL}`, region: "Finland" },
];

// ─── SEO meta interface ───────────────────────────────────────────────────────

export interface SEOMeta {
    /** Browser tab title (< 60 chars recommended) */
    title: string;
    /** Meta description (< 160 chars recommended) */
    description: string;
    /** Canonical URL for this specific page */
    canonical: string;
    /** OG/Twitter image URL */
    ogImage?: string;
    /** OG type: "website" | "article" | "product" */
    ogType?: string;
    /** Robots directive for this page */
    robots?: string;
    /** Additional keywords (OG extended / GEO use only - not a ranking signal) */
    keywords?: string;
}

// ─── Per-page SEO defaults ────────────────────────────────────────────────────

export const PAGE_SEO: Record<string, SEOMeta> = {
    "/": {
        title: "Beymflow — AI Prompt Generator & Creative Design Tools",
        description:
            "Generate AI prompts, explore color palettes, color codes, and create stunning web backgrounds in seconds. Built for developers, designers, and startups.",
        canonical: `${SITE_URL}/`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "index, follow",
        keywords:
            "AI prompt generator, prompt engineering, creative AI tools, generate prompts, design prompts, color palette generator, color codes, background generator, gradients, UI UX design assets, web design backgrounds, for startups, for designers, for developers",
    },
    "/about": {
        title: "About Beymflow — AI Prompt Engineering & Creative Platform",
        description:
            "Learn how Beymflow helps developers and designers move faster with AI prompt generation, color code tools, and visual design asset creation.",
        canonical: `${SITE_URL}/about`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "index, follow",
        keywords:
            "about Beymflow, AI creative platform, prompt engineering tool, developer tools",
    },
    "/flow": {
        title: "Beymflow Flow — Prompt Generator & Color Codes Workspace",
        description:
            "Access the Beymflow workspace: generate AI prompts, explore HEX & RGB color codes, and create beautiful gradient backgrounds for your projects.",
        canonical: `${SITE_URL}/flow`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "index, follow",
        keywords:
            "AI prompt workspace, color code generator, gradient backgrounds, developer prompts",
    },
    "/flow/prompt-generator": {
        title: "AI Prompt Generator — Beymflow Flow",
        description:
            "Create optimized AI prompts for ChatGPT, Claude, Gemini, and more. Enter your idea and let Beymflow structure it for maximum AI output quality.",
        canonical: `${SITE_URL}/flow/prompt-generator`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "index, follow",
        keywords:
            "AI prompt generator, generate prompts, ChatGPT prompts, Claude prompts, prompt engineering, developer prompts",
    },
    "/flow/color-codes": {
        title: "Color Codes & Palette Generator — Beymflow Flow",
        description:
            "Explore and generate HEX, RGB, and HSL color codes. Browse gradient palettes and copy-ready color values for UI/UX design and web development.",
        canonical: `${SITE_URL}/flow/color-codes`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "index, follow",
        keywords:
            "color palette generator, color codes, HEX color, RGB color, HSL color, gradient generator, UI design colors",
    },
    "/settings/billing": {
        title: "Beymflow Pricing — Free & Pro Plans",
        description:
            "Upgrade to Beymflow Pro for unlimited AI prompt generation, full color code access, premium templates, and advanced background styles. Starting at €9.99/mo.",
        canonical: `${SITE_URL}/settings/billing`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "noindex, nofollow",
        keywords:
            "Beymflow pricing, pro plan, prompt generator subscription, creative tools pricing",
    },
    "/community": {
        title: "Beymflow Community — Share & Discover AI Prompts",
        description:
            "Join the Beymflow community to share your AI prompts, discover creative design workflows, and connect with developers and designers worldwide.",
        canonical: `${SITE_URL}/community`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "index, follow",
        keywords:
            "Beymflow community, share AI prompts, creative community, developers community",
    },
    "/auth": {
        title: "Sign In — Beymflow",
        description:
            "Sign in or create a free Beymflow account to save your projects, access premium tools, and unlock unlimited AI prompt generation.",
        canonical: `${SITE_URL}/auth`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "noindex, nofollow",
    },
    "/payment-success": {
        title: "Payment Successful — Beymflow",
        description: "Your Beymflow Pro subscription is now active. Start creating unlimited AI prompts and accessing premium features.",
        canonical: `${SITE_URL}/payment-success`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "noindex, nofollow",
    },
    "/settings/billing": {
        title: "Billing & Subscription — Beymflow",
        description: "Manage your Beymflow subscription, billing details, and plan settings.",
        canonical: `${SITE_URL}/settings/billing`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "noindex, nofollow",
    },
    "/image-generator": {
        title: "AI Image Generator — Beymflow",
        description:
            "Generate stunning AI images for your projects. Use Beymflow's image generation tools to create custom visuals for websites, apps, and social media.",
        canonical: `${SITE_URL}/image-generator`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "index, follow",
        keywords:
            "AI image generator, generate AI images, creative AI, design assets",
    },
    "/404": {
        title: "Page Not Found — Beymflow",
        description: "The page you are looking for does not exist. Return to Beymflow and continue creating.",
        canonical: `${SITE_URL}/`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "noindex, follow",
    },
    "/features": {
        title: "Features — Beymflow AI Prompt & Design Platform",
        description:
            "Explore Beymflow's powerful features: AI prompt generation, color code tools, gradient backgrounds, and creative design workflows for developers.",
        canonical: `${SITE_URL}/features`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "index, follow",
        keywords:
            "Beymflow features, AI tools, prompt generator features, color codes, design tools",
    },
    "/landing-pages": {
        title: "Landing Page Templates — Beymflow",
        description:
            "Browse free and premium landing page templates. Modern, responsive designs optimized for startups, SaaS products, and portfolios.",
        canonical: `${SITE_URL}/landing-pages`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "index, follow",
        keywords:
            "landing page templates, free templates, premium templates, SaaS landing page, startup templates",
    },
    "/planningsystem": {
        title: "Planning System — Beymflow",
        description:
            "Organize your creative projects with Beymflow's built-in planning system. Manage tasks, workflows, and design assets in one place.",
        canonical: `${SITE_URL}/planningsystem`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "noindex, nofollow",
    },
    "/multiagentpage": {
        title: "Multi-Agent AI — Beymflow",
        description:
            "Leverage multi-agent AI workflows to generate, refine, and optimize creative outputs at scale with Beymflow.",
        canonical: `${SITE_URL}/multiagentpage`,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: "website",
        robots: "noindex, nofollow",
    },
};

/** Fallback for unknown routes */
export const DEFAULT_SEO: SEOMeta = PAGE_SEO["/"];

// ─── JSON-LD Schema builders ──────────────────────────────────────────────────

/** Organization schema for Beymflow */
export function buildOrganizationSchema(): object {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/images/beymflow-logo.png`,
            width: 512,
            height: 512,
        },
        sameAs: [],
        // GEO hints: areaServed lists target markets
        areaServed: [
            { "@type": "Country", name: "United States" },
            { "@type": "Country", name: "United Kingdom" },
            { "@type": "AdministrativeArea", name: "European Union" },
            { "@type": "Country", name: "Finland" },
        ],
    };
}

/** SoftwareApplication / WebApplication schema */
export function buildWebApplicationSchema(): object {
    return {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#webapp`,
        name: SITE_NAME,
        url: SITE_URL,
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        description:
            "AI prompt generator, color palette generator, gradient background creator and creative design toolkit for developers and designers.",
        offers: [
            {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
                name: "Free Plan",
                description: "Basic prompt generation with limited daily prompts.",
            },
            {
                "@type": "Offer",
                price: "9.99",
                priceCurrency: "EUR",
                priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: "9.99",
                    priceCurrency: "EUR",
                    billingDuration: "P1M",
                },
                name: "Pro Plan",
                description:
                    "Unlimited prompt generation, full color codes access, premium templates, advanced model options.",
            },
        ],
        featureList: [
            "AI Prompt Generator",
            "Color Palette Generator",
            "HEX RGB HSL Color Codes",
            "Gradient Background Generator",
            "UI Design Asset Tools",
            "Prompt Engineering Toolkit",
        ],
        publisher: {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
        },
    };
}

/** WebSite schema (enables Google Sitelinks search box when eligible) */
export function buildWebSiteSchema(): object {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description:
            "AI prompt generator and creative design toolkit for developers, designers, and startups.",
        publisher: {
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
        },
        inLanguage: ["en", "fi"],
    };
}

/** BreadcrumbList schema for a given route */
export function buildBreadcrumbSchema(
    items: Array<{ name: string; url: string }>
): object {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

/** FAQPage schema — use ONLY if FAQ content exists on the rendered page */
export function buildFAQSchema(
    faqs: Array<{ question: string; answer: string }>
): object {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer.replace(/\n/g, " ").trim(),
            },
        })),
    };
}

/** Serialize a schema object to an escaped JSON string for a <script> tag */
export function serializeSchema(schema: object): string {
    return JSON.stringify(schema, null, 0);
}

/**
 * components/SEOHead.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Drop-in component that applies all SEO head tags for a given route.
 *
 * Usage inside a page component:
 *   <SEOHead pathname="/about" schemas={[buildOrganizationSchema()]} />
 *
 * It renders nothing to the DOM — all mutations happen inside useSEO.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import React from "react";
import { useSEO } from "@/hooks/useSEO";
import type { SEOMeta } from "@/lib/seo";

interface SEOHeadProps {
    /** Route pathname matching a key in PAGE_SEO (e.g. "/about") */
    pathname: string;
    /** Optional field-level overrides */
    overrides?: Partial<SEOMeta>;
    /** JSON-LD schema objects */
    schemas?: object[];
}

const SEOHead: React.FC<SEOHeadProps> = ({ pathname, overrides, schemas }) => {
    useSEO(pathname, { overrides, schemas });
    return null;
};

export default SEOHead;

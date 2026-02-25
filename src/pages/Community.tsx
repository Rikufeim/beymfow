import SEOHead from "@/components/SEOHead";
import { buildBreadcrumbSchema, SITE_URL } from "@/lib/seo";

const Community = () => {
  return (
    <main className="min-h-screen bg-black text-white">
      <SEOHead
        pathname="/community"
        schemas={[
          buildBreadcrumbSchema([
            { name: "Beymflow", url: `${SITE_URL}/` },
            { name: "Community", url: `${SITE_URL}/community` },
          ]),
        ]}
      />
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-[140px] sm:pt-[160px] pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3"
            alt="Community collaboration"
            className="w-full h-full object-cover opacity-40"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-white">
            Community
          </h1>
        </div>
      </section>
    </main>
  );
};

export default Community;


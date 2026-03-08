import { memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { GlassButton } from "@/components/ui/glass-button";
import { BookOpen, Workflow } from "lucide-react";
import { usePrefetchRoute } from "@/hooks/usePrefetchRoute";

const products = [
  {
    icon: BookOpen,
    title: "Prompt Library",
    description: "Explore the biggest prompt library for ChatGPT & Midjourney.",
    buttonText: "Explore >",
    link: "/prompt-lab-page/library",
  },
  {
    icon: Workflow,
    title: "Flow",
    description: "Build complex AI workflows with our visual flow editor.",
    buttonText: "Try Now >",
    link: "/flow-engine",
  },
];

const ProductsGrid = memo(function ProductsGrid() {
  const { prefetchRoute } = usePrefetchRoute();

  const handleHover = useCallback((link: string) => {
    prefetchRoute(link);
  }, [prefetchRoute]);

  return (
    <section className="w-full bg-black py-16 sm:py-20 lg:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {products.map((product, idx) => {
            const Icon = product.icon;
            return (
              <div 
                key={idx} 
                className="flex flex-col items-start gap-4 group h-full"
                onMouseEnter={() => handleHover(product.link)}
              >
                <div className="w-fit rounded-full border border-white/10 bg-white/5 p-4 mb-2 transition-colors duration-200">
                  <Icon 
                    className="h-10 w-10 text-white transition-colors duration-200 group-hover:text-teal-400" 
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {product.title}
                </h3>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  {product.description}
                </p>
                <Link to={product.link} className="mt-auto">
                  <GlassButton
                    size="sm"
                    isSelected={false}
                    contentClassName="text-sm font-medium"
                  >
                    {product.buttonText}
                  </GlassButton>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

export default ProductsGrid;

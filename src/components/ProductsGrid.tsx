import { Link } from "react-router-dom";
import { GlassButton } from "@/components/ui/glass-button";
import { BookOpen, Workflow, FlaskConical, Package } from "lucide-react";

const products = [
  {
    icon: <BookOpen className="h-10 w-10 text-white" />,
    title: "Prompt Library",
    description: "Explore the biggest prompt library for ChatGPT & Midjourney.",
    buttonText: "Explore >",
    link: "/prompt-library",
  },
  {
    icon: <Workflow className="h-10 w-10 text-white" />,
    title: "Flow Engine",
    description: "Build complex AI workflows with our visual flow editor.",
    buttonText: "Try Now >",
    link: "/flow-engine",
  },
  {
    icon: <FlaskConical className="h-10 w-10 text-white" />,
    title: "Prompt Lab",
    description: "Generate, optimize, and refine AI prompts instantly.",
    buttonText: "Open Lab >",
    link: "/prompt-lab-page",
  },
  {
    icon: <Package className="h-10 w-10 text-white" />,
    title: "Digital Products",
    description: "Supercharge your workflow with ultimate AI resources.",
    buttonText: "Shop Now >",
    link: "/premium",
  },
];

const ProductsGrid = () => {
  return (
    <section className="w-full bg-black py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {products.map((product, idx) => (
            <div key={idx} className="flex flex-col items-start gap-4">
              <div className="mb-2">{product.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {product.title}
              </h3>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                {product.description}
              </p>
              <Link to={product.link} className="mt-2">
                <GlassButton
                  size="sm"
                  isSelected={false}
                  contentClassName="text-sm font-medium"
                >
                  {product.buttonText}
                </GlassButton>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsGrid;

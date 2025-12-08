import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ProductCardProps {
  title: string;
  subtitle?: string;
  description: string;
  type: string;
  link: string;
  imageUrl: string;
  buttonText?: string;
  isExternal?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  subtitle,
  description,
  type,
  link,
  imageUrl,
  buttonText = "Learn More",
  isExternal = false
}) => {
  const cardContent = (
    <Card className="relative bg-black border-primary/30 p-0 transition-all duration-500 shadow-lg backdrop-blur-sm hover:shadow-xl hover:shadow-white/5 h-full flex flex-col overflow-hidden rounded-lg min-h-[350px] will-change-transform group grayscale hover:grayscale-0"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        transform: "translateZ(0)",
        borderRadius: 'var(--radius)',
        transition: 'filter 0.5s ease'
      }}
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-black/40 via-black/70 to-black pointer-events-none z-10 will-change-[background-color]"
        style={{
          transform: "translateZ(0)",
          borderRadius: 'var(--radius)'
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-400 px-8 py-6 pointer-events-none will-change-opacity">
        <div className="flex flex-col items-center gap-3">
          <div className="text-sm text-white uppercase tracking-wide font-medium text-center">
            {type}
          </div>
          <h3 className="text-2xl font-bold text-white text-center">
            {title}
          </h3>
          {subtitle && <div className="text-base text-white text-center">{subtitle}</div>}
          <p className="text-white text-center text-base">{description}</p>
        </div>
      </div>
      <div className="flex-1 min-h-[350px]"></div>
      <div className="w-full p-4 flex items-end relative z-30 justify-center mt-auto">
        <Button className="w-full bg-black hover:bg-black/80 text-white py-2 rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20 will-change-[background-color,border-color]"
          tabIndex={0}
          type="button"
        >
          {buttonText}
        </Button>
      </div>
    </Card>
  );

  if (isExternal) {
    return (
      <div
        className="w-full max-w-xl"
      >
        <a href={link} target="_blank" rel="noopener noreferrer" className="block w-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <div
            className="h-full w-full"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden"
            }}
          >
            {cardContent}
          </div>
        </a>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-xl"
    >
      <Link to={link} className="block w-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <div
          className="h-full w-full"
          style={{
            transform: "translateZ(0)",
            backfaceVisibility: "hidden"
          }}
        >
          {cardContent}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
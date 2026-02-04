"use client";

import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePrefetchRoute } from "@/hooks/usePrefetchRoute";
import { useEffect, useState } from "react";

const LOGO_URL = "/images/beymflow-logo.png";

const Header = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { prefetchRoute } = usePrefetchRoute();
  const [logoLoaded, setLogoLoaded] = useState(false);

  const isHeroBackgroundMode = location.pathname === "/flow-engine" && searchParams.get("workspace") === "hero-background";

  useEffect(() => {
    const img = new Image();
    img.src = LOGO_URL;
    img.onload = () => setLogoLoaded(true);
  }, []);

  return (
    <header
      className={`relative z-[999] h-[80px] w-full flex items-center justify-between px-6 md:px-10 transition-all duration-500 ${
        isHeroBackgroundMode ? "bg-transparent" : "bg-black"
      }`}
    >
      {/* Logo */}
      <div className="flex justify-start flex-1">
        <Link to="/" className="flex items-center gap-0 transition-opacity hover:opacity-90 -ml-2 md:-ml-4">
          <img
            src={LOGO_URL}
            alt="Beymflow Logo"
            className={`h-10 sm:h-11 md:h-12 w-auto object-contain flex-shrink-0 transition-opacity duration-200 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="eager"
            decoding="async"
          />
          <span className="relative text-base font-semibold tracking-[0.28em] text-white uppercase hidden sm:block -ml-1">
            Beymflow
          </span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2 font-medium">
        <Link
          to="/flow-engine"
          onMouseEnter={() => prefetchRoute("/flow-engine")}
          className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
        >
          Flow
        </Link>
        <Link
          to="/about"
          onMouseEnter={() => prefetchRoute("/about")}
          className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
        >
          About Us
        </Link>
      </nav>

      {/* Mobile Menu */}
      <div className="flex items-center justify-end flex-1">
        <Sheet>
          <SheetTrigger asChild>
            <button className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-black border-white/10 w-[300px] z-[1000]">
            <div className="flex flex-col gap-6 mt-8">
              <Link
                to="/flow-engine"
                onMouseEnter={() => prefetchRoute("/flow-engine")}
                className="text-gray-300 hover:text-white transition-colors text-lg font-medium px-4"
              >
                Flow
              </Link>
              <Link
                to="/about"
                onMouseEnter={() => prefetchRoute("/about")}
                className="text-gray-300 hover:text-white transition-colors text-lg font-medium px-4"
              >
                About Us
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;

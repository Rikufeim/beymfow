"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePrefetchRoute } from "@/hooks/usePrefetchRoute";
import { useEffect, useState } from "react";

const LOGO_URL = "/images/beymflow-logo.png";

let logoCacheLoaded = false;

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prefetchRoute } = usePrefetchRoute();
  const [logoLoaded, setLogoLoaded] = useState(logoCacheLoaded);

  const isHeroBackgroundMode = location.pathname.startsWith("/flow") || location.pathname === "/" || location.pathname === "/about";

  useEffect(() => {
    if (logoCacheLoaded) {
      setLogoLoaded(true);
      return;
    }
    const img = new Image();
    img.src = LOGO_URL;
    img.onload = () => {
      logoCacheLoaded = true;
      setLogoLoaded(true);
    };
  }, []);

  return (
    <header
      className={`z-[999] h-[80px] w-full flex items-center justify-between px-6 md:px-10 transition-all duration-500 ${isHeroBackgroundMode ? "absolute top-0 left-0 bg-transparent" : "relative bg-black"}`}
    >
      <div className="flex justify-start flex-1">
        <Link to="/" className="flex items-center gap-0 transition-opacity hover:opacity-90 -ml-2 md:-ml-4">
          <img
            src={LOGO_URL}
            alt="Beymflow Logo"
            className={`h-12 sm:h-14 md:h-16 w-auto object-contain flex-shrink-0 transition-opacity duration-200 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="eager"
            decoding="async"
          />
          <span className="relative text-base font-semibold tracking-[0.28em] text-white hidden sm:block -ml-1">
            Beymflow
          </span>
        </Link>
      </div>

      <div className="flex items-center justify-end flex-1 gap-8">
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link
            to="/flow"
            onMouseEnter={() => prefetchRoute("/flow")}
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

        <Sheet>
          <SheetTrigger asChild>
            <button className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-black border-white/10 w-[300px] z-[1000]">
            <div className="flex flex-col gap-6 mt-8">
              <Link to="/flow" className="text-gray-300 hover:text-white transition-colors text-lg font-medium px-4">
                Flow
              </Link>
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors text-lg font-medium px-4">
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

"use client";

import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { Menu, User, LogOut, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePrefetchRoute } from "@/hooks/usePrefetchRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthDialog } from "@/contexts/AuthDialogContext";
import { useEffect, useState } from "react";
import PlanBadge from "@/components/PlanBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOGO_URL = "/images/beymflow-logo.png";

let logoCacheLoaded = false;

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { prefetchRoute } = usePrefetchRoute();
  const { user, signOut } = useAuth();
  const { openAuthDialog } = useAuthDialog();

  const handleFlowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate("/flow");
    } else {
      sessionStorage.setItem("auth_redirect_after", "/flow");
      openAuthDialog(() => navigate("/flow"));
    }
  };
  const [logoLoaded, setLogoLoaded] = useState(logoCacheLoaded);

  const isHeroBackgroundMode = (location.pathname.startsWith("/flow") && searchParams.get("workspace") === "hero-background") || location.pathname === "/" || location.pathname === "/about" || location.pathname === "/premium";

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

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header
      className={`z-[999] h-[80px] w-full flex items-center justify-between px-6 md:px-10 transition-all duration-500 ${isHeroBackgroundMode ? "absolute top-0 left-0 bg-transparent" : "relative bg-black"
        }`}
    >
      {/* Logo */}
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

      {/* Desktop Navigation */}


      {/* Desktop Navigation & Mobile Menu */}
      <div className="flex items-center justify-end flex-1 gap-8">
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link
            to="/premium"
            onMouseEnter={() => prefetchRoute("/premium")}
            className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
          >
            Pricing
          </Link>
          <button
            type="button"
            onClick={handleFlowClick}
            onMouseEnter={() => prefetchRoute("/flow")}
            className="text-gray-400 hover:text-white transition-colors duration-300 text-sm bg-transparent border-none cursor-pointer font-medium"
          >
            Flow
          </button>
          <Link
            to="/about"
            onMouseEnter={() => prefetchRoute("/about")}
            className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
          >
            About Us
          </Link>

          {/* Auth Button/User Menu */}
          {user ? (
            <div className="flex items-center gap-2">
              <PlanBadge />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                  <User size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-black border-white/10">
                  <DropdownMenuItem asChild className="text-white hover:bg-white/10 cursor-pointer">
                    <Link to="/settings/billing">
                      <Settings size={16} className="mr-2" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-white hover:bg-white/10 cursor-pointer">
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <button
              onClick={() => openAuthDialog()}
              className="text-sm font-medium px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
            >
              Sign In
            </button>
          )}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <button className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-black border-white/10 w-[300px] z-[1000]">
            <div className="flex flex-col gap-6 mt-8">
              <Link
                to="/premium"
                onMouseEnter={() => prefetchRoute("/premium")}
                className="text-gray-300 hover:text-white transition-colors text-lg font-medium px-4"
              >
                Pricing
              </Link>
              <button
                type="button"
                onClick={handleFlowClick}
                onMouseEnter={() => prefetchRoute("/flow")}
                className="text-gray-300 hover:text-white transition-colors text-lg font-medium px-4 text-left w-full bg-transparent border-none cursor-pointer"
              >
                Flow
              </button>
              <Link
                to="/about"
                onMouseEnter={() => prefetchRoute("/about")}
                className="text-gray-300 hover:text-white transition-colors text-lg font-medium px-4"
              >
                About Us
              </Link>

              {/* Mobile Auth */}
              {user ? (
                <div className="border-t border-white/10 pt-6 px-4 space-y-3">
                  <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                    Account <PlanBadge />
                  </div>
                  <Link
                    to="/settings/billing"
                    className="w-full flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    <Settings size={16} />
                    Billing
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openAuthDialog()}
                  className="mx-4 text-center px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium w-[calc(100%-2rem)]"
                >
                  Sign In
                </button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;

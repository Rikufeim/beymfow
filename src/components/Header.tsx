"use client";

import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePrefetchRoute } from "@/hooks/usePrefetchRoute";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const { prefetchRoute } = usePrefetchRoute();

  return (
    <header
      className="relative z-[999] h-[80px] w-full flex items-center justify-between px-6 md:px-10 bg-black transition-all duration-500"
      style={{ fontSize: '16px' }}
    >
      {/* ================= VASEN: LOGO ================= */}
      <div className="flex justify-start flex-1">
        <Link to="/" className="flex items-center gap-0 transition-opacity hover:opacity-90 -ml-2 md:-ml-4">
          <img
            src="/images/BeymflowlogoREAL.png"
            alt="Beymflow Logo"
            className="h-[60px] object-contain"
          />
          <span className="relative text-base font-semibold tracking-[0.28em] text-white uppercase hidden sm:block -ml-1" style={{ fontSize: '16px' }}>
            Beymflow
          </span>
        </Link>
      </div>

      {/* ================= KESKI: NAVIGAATIO (Desktop) ================= */}
      <nav className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2 font-medium">
        {/* 1. Pricing */}
        <Link
          to="/premium"
          onMouseEnter={() => prefetchRoute("/premium")}
          className="text-gray-400 hover:text-white hover:opacity-100 hover:brightness-105 transition-colors duration-300 text-sm"
          style={{ fontSize: '14px' }}
        >
          Pricing
        </Link>

        {/* 2. Prompts */}
        <Link
          to="/prompt-lab-page"
          onMouseEnter={() => prefetchRoute("/prompt-lab-page")}
          className="text-gray-400 hover:text-white hover:opacity-100 hover:brightness-105 transition-colors duration-300 text-sm"
          style={{ fontSize: '14px' }}
        >
          Prompts
        </Link>

        {/* 3. Flow */}
        <Link
          to="/flow-engine"
          onMouseEnter={() => prefetchRoute("/flow-engine")}
          className="text-gray-400 hover:text-white hover:opacity-100 hover:brightness-105 transition-colors duration-300 text-sm"
          style={{ fontSize: '14px' }}
        >
          Flow
        </Link>

        {/* Templates */}
        <Link
          to="/templates"
          onMouseEnter={() => prefetchRoute("/templates")}
          className="text-gray-400 hover:text-white hover:opacity-100 hover:brightness-105 transition-colors duration-300 text-sm"
          style={{ fontSize: '14px' }}
        >
          Templates
        </Link>

        {/* 4. About Us */}
        <Link
          to="/about"
          onMouseEnter={() => prefetchRoute("/about")}
          className="text-gray-400 hover:text-white hover:opacity-100 hover:brightness-105 transition-colors duration-300 text-sm"
          style={{ fontSize: '14px' }}
        >
          About Us
        </Link>

      </nav>

      {/* ================= OIKEA: TOIMINNOT ================= */}
      <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-6 flex-1">
        {/* Mobiili Menu Nappi */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>

          {/* Mobiili Menu Sisältö */}
          <SheetContent side="right" className="bg-black border-white/10 w-[300px] z-[1000]">
            <div className="flex flex-col gap-6 mt-8">
              {user ? (
                <GlassButton
                  onClick={signOut}
                  contentClassName="flex items-center justify-center gap-2 w-full"
                  className="w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </GlassButton>
              ) : (
                !isAuthPage && (
                  <div className="flex flex-col gap-3">
                    <Link to="/auth" className="w-full text-left text-gray-300 hover:text-white transition" style={{ fontSize: '14px' }}>
                      Login
                    </Link>
                    <Link to="/premium" className="w-full">
                      <GlassButton
                        contentClassName="w-full text-center"
                        className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
                        size="sm"
                      >
                        Get All-Access
                      </GlassButton>
                    </Link>
                  </div>
                )
              )}

              <>
                <Link
                  to="/prompt-lab-page"
                  onMouseEnter={() => prefetchRoute("/prompt-lab-page")}
                  className="text-gray-300 hover:text-white hover:opacity-100 hover:brightness-105 transition-colors text-lg font-medium px-4"
                  style={{ fontSize: '18px' }}
                >
                  Prompts
                </Link>
                <Link
                  to="/flow-engine"
                  onMouseEnter={() => prefetchRoute("/flow-engine")}
                  className="text-gray-300 hover:text-white hover:opacity-100 hover:brightness-105 transition-colors text-lg font-medium px-4"
                  style={{ fontSize: '18px' }}
                >
                  Flow
                </Link>
                <Link
                  to="/templates"
                  onMouseEnter={() => prefetchRoute("/templates")}
                  className="text-gray-300 hover:text-white hover:opacity-100 hover:brightness-105 transition-colors text-lg font-medium px-4"
                  style={{ fontSize: '18px' }}
                >
                  Templates
                </Link>
                <Link
                  to="/about"
                  onMouseEnter={() => prefetchRoute("/about")}
                  className="text-gray-300 hover:text-white hover:opacity-100 hover:brightness-105 transition-colors text-lg font-medium px-4"
                  style={{ fontSize: '18px' }}
                >
                  About Us
                </Link>
                <Link
                  to="/premium"
                  onMouseEnter={() => prefetchRoute("/premium")}
                  className="text-gray-300 hover:text-white transition-colors text-lg font-medium px-4"
                  style={{ fontSize: '18px' }}
                >
                  Pricing
                </Link>
              </>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sign In/Out Button */}
        {!isAuthPage && (
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <GlassButton
                onClick={signOut}
                contentClassName="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </GlassButton>
            ) : (
              <>
                <Link to="/auth" className="text-gray-300 hover:text-white transition" style={{ fontSize: '14px' }}>
                  Login
                </Link>
                <Link to="/premium">
                  <GlassButton className="bg-neutral-900 text-white hover:bg-neutral-800" size="sm">
                    Get All-Access
                  </GlassButton>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

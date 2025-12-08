"use client";

import { Link, useLocation } from "react-router-dom";
import { LogOut, Github, Youtube, Instagram, Menu, Twitter } from "lucide-react";
import { useState } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const isHomePage = location.pathname === "/";
  const isAuthPage = location.pathname === "/auth";

  return (
    <header
      className="relative z-[999] h-[80px] w-full flex items-center justify-between px-6 md:px-10 bg-black transition-all duration-500"
    >
      {/* ================= VASEN: LOGO ================= */}
      <div className="flex justify-start flex-1">
        <Link to="/" className="flex items-center gap-1.5 transition-opacity hover:opacity-90 -ml-2 md:-ml-4">
          <img
            src="/images/BeymflowlogoREAL.png"
            alt="Beymflow Logo"
            className="h-[50px] sm:h-[60px] object-contain"
          />
          <span className="relative text-lg sm:text-xl font-semibold tracking-[0.35em] text-white uppercase hidden sm:block">
            Beymflow
            <span className="absolute -top-2 -right-6 text-[10px] tracking-normal text-white/60 lowercase font-normal">
              beta
            </span>
          </span>
        </Link>
      </div>

      {/* ================= KESKI: NAVIGAATIO (Desktop) ================= */}
      {isHomePage && (
        <nav className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2 font-medium">
          {/* 1. Pricing */}
          <Link to="/premium" className="text-white hover:text-white transition-colors duration-300 text-sm">
            Pricing
          </Link>

          {/* 2. About Us */}
          <Link to="/about" className="text-white hover:text-white transition-colors duration-300 text-sm">
            About Us
          </Link>

          {/* 3. Community Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-white hover:text-white transition-colors duration-300 text-sm focus:outline-none cursor-pointer">
              Community
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-black rounded-xl p-2 min-w-[180px] z-[1000]"
              align="center"
            >
              <DropdownMenuItem asChild className="focus:bg-transparent focus:text-white">
                <a
                  href="https://github.com/beymflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-white rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 group"
                >
                  <Github className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" /> <span className="transition-all duration-300 group-hover:font-semibold">GitHub</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-transparent focus:text-white">
                <a
                  href="https://x.com/beymflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-white rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 group"
                >
                  <Twitter className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" /> <span className="transition-all duration-300 group-hover:font-semibold">X</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-transparent focus:text-white">
                <a
                  href="https://www.youtube.com/@Beymflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-white rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 group"
                >
                  <Youtube className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" /> <span className="transition-all duration-300 group-hover:font-semibold">YouTube</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-transparent focus:text-white">
                <a
                  href="https://www.instagram.com/beymflow/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-white rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 group"
                >
                  <Instagram className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" /> <span className="transition-all duration-300 group-hover:font-semibold">Instagram</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      )}

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
                  <Link to="/auth" className="w-full">
                    <GlassButton contentClassName="w-full text-center" className="w-full">
                      Start Creating
                    </GlassButton>
                  </Link>
                )
              )}

              {isHomePage && (
                <>
                  <Link
                    to="/about"
                    className="text-white/90 hover:text-white transition-colors text-lg font-medium px-4"
                  >
                    About Us
                  </Link>
                  <Link
                    to="/premium"
                    className="text-white/90 hover:text-white transition-colors text-lg font-medium px-4"
                  >
                    Pricing
                  </Link>

                  <div className="px-4">
                    <button
                      onClick={() => setIsCommunityOpen(!isCommunityOpen)}
                      className="flex items-center justify-between w-full text-white/90 hover:text-white transition-colors text-lg font-medium mb-3"
                    >
                      Community
                      <svg
                        className="w-4 h-4 transition-transform"
                        style={{ transform: isCommunityOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isCommunityOpen && (
                      <div className="flex flex-col gap-3 pl-2 border-l border-white/10 ml-1">
                        <a
                          href="https://github.com/beymflow"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-white/70 hover:text-white transition-colors p-2"
                        >
                          <Github className="h-5 w-5" /> <span>GitHub</span>
                        </a>
                        <a
                          href="https://x.com/beymflow"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-white/70 hover:text-white transition-colors p-2"
                        >
                          <Twitter className="h-5 w-5" /> <span>X</span>
                        </a>
                        <a
                          href="https://www.youtube.com/@Beymflow"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-white/70 hover:text-white transition-colors p-2"
                        >
                          <Youtube className="h-5 w-5" /> <span>YouTube</span>
                        </a>
                        <a
                          href="https://www.instagram.com/beymflow/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-white/70 hover:text-white transition-colors p-2"
                        >
                          <Instagram className="h-5 w-5" /> <span>Instagram</span>
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sign In/Out Button */}
        {!isAuthPage && (
          <div className="hidden md:block">
            {user ? (
              <GlassButton
                onClick={signOut}
                contentClassName="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </GlassButton>
            ) : (
              <Link to="/auth">
                <GlassButton>
                  Start Creating
                </GlassButton>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

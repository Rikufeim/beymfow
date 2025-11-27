"use client";

import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Github, Youtube, Instagram, Menu, Twitter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
    <motion.header
      className="relative z-[999] h-[80px] w-full flex items-center justify-between px-6 md:px-10 bg-black/20 backdrop-blur-sm transition-all duration-500"
      initial={isHomePage ? { y: -100 } : { y: 0 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* ================= VASEN: LOGO ================= */}
      <div className="flex justify-start flex-1">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <img
            src="/images/BeymflowlogoREAL.png"
            alt="Beymflow Logo"
            className="h-[50px] sm:h-[60px] object-contain"
          />
          <span className="relative text-lg sm:text-xl font-semibold tracking-[0.35em] text-white uppercase hidden sm:block">
            Beymflow
            <span className="absolute -top-2 -right-8 text-[10px] tracking-normal text-white/60 lowercase font-normal">
              beta
            </span>
          </span>
        </Link>
      </div>

      {/* ================= KESKI: NAVIGAATIO (Desktop) ================= */}
      {isHomePage && (
        <nav className="hidden md:flex items-center justify-center gap-8 flex-1 font-medium">
          {/* 1. Pricing */}
          <Link to="/premium" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
            Pricing
          </Link>

          {/* 2. About Us */}
          <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-300 text-sm">
            About Us
          </Link>

          {/* 3. Community Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-300 text-sm focus:outline-none cursor-pointer">
              Community
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 min-w-[180px] z-[1000]"
              align="center"
            >
              <DropdownMenuItem asChild>
                <a
                  href="https://github.com/beymflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  <Github className="h-4 w-4" /> <span>GitHub</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://x.com/beymflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  <Twitter className="h-4 w-4" /> <span>X</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://www.youtube.com/@Beymflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  <Youtube className="h-4 w-4" /> <span>YouTube</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://www.instagram.com/beymflow/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  <Instagram className="h-4 w-4" /> <span>Instagram</span>
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
            <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          {/* Mobiili Menu Sisältö */}
          <SheetContent side="right" className="bg-black/95 backdrop-blur-xl border-white/10 w-[300px] z-[1000]">
            <div className="flex flex-col gap-6 mt-8">
              {user ? (
                <Button
                  variant="outline"
                  onClick={signOut}
                  className="w-full bg-black/80 text-white border-white/20 hover:bg-black/90 hover:border-white/30 rounded-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                !isAuthPage && (
                  <Link to="/auth" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full bg-black/80 text-white border-white/20 hover:bg-black/90 hover:border-white/30 rounded-full"
                    >
                      Start Creating
                    </Button>
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
          <motion.div className="hidden md:block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            {user ? (
              <Button
                variant="outline"
                onClick={signOut}
                className="bg-white/10 text-white border-white/10 hover:bg-white/20 rounded-full px-6"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button
                  variant="outline"
                  className="text-white border-white/10 px-6 shadow-md bg-neutral-950 hover:bg-neutral-800 rounded-md"
                >
                  Start Creating
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;

"use client";

import { Link, useLocation } from "react-router-dom";
import { LogOut, Github, Youtube, Instagram, Menu, Twitter, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";

const Header = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const isHomePage = location.pathname === "/";
  const isAuthPage = location.pathname === "/auth";

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      className="relative z-[999] h-[80px] w-full flex items-center justify-between px-6 md:px-10 bg-background/60 dark:bg-background/60 backdrop-blur-sm transition-all duration-500 border-b border-border/50"
    >
      {/* ================= VASEN: LOGO ================= */}
      <div className="flex justify-start flex-1">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <img
            src="/images/BeymflowlogoREAL.png"
            alt="Beymflow Logo"
            className="h-[50px] sm:h-[60px] object-contain"
          />
          <span className="relative text-lg sm:text-xl font-semibold tracking-[0.35em] text-foreground uppercase hidden sm:block">
            Beymflow
            <span className="absolute -top-2 -right-8 text-[10px] tracking-normal text-muted-foreground lowercase font-normal">
              beta
            </span>
          </span>
        </Link>
      </div>

      {/* ================= KESKI: NAVIGAATIO (Desktop) ================= */}
      {isHomePage && (
        <nav className="hidden md:flex items-center justify-center gap-8 flex-1 font-medium">
          {/* 1. Pricing */}
          <Link to="/premium" className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm">
            Pricing
          </Link>

          {/* 2. About Us */}
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm">
            About Us
          </Link>

          {/* 3. Community Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm focus:outline-none cursor-pointer">
              Community
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-2 min-w-[180px] z-[1000]"
              align="center"
            >
              <DropdownMenuItem asChild>
                <a
                  href="https://github.com/beymflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg cursor-pointer"
                >
                  <Github className="h-4 w-4" /> <span>GitHub</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://x.com/beymflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg cursor-pointer"
                >
                  <Twitter className="h-4 w-4" /> <span>X</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://www.youtube.com/@Beymflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg cursor-pointer"
                >
                  <Youtube className="h-4 w-4" /> <span>YouTube</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://www.instagram.com/beymflow/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg cursor-pointer"
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
            <Button variant="ghost" size="icon" className="md:hidden text-foreground hover:bg-accent">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>

          {/* Mobiili Menu Sisältö */}
          <SheetContent side="right" className="bg-card/95 backdrop-blur-xl border-border w-[300px] z-[1000]">
            <div className="flex flex-col gap-6 mt-8">
              {/* Theme Toggle in Mobile Menu */}
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="w-full bg-accent backdrop-blur-md text-foreground border border-border hover:bg-accent/80 hover:border-border rounded-full flex items-center justify-center gap-2"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </Button>

              {user ? (
                <Button
                  variant="outline"
                  onClick={signOut}
                  className="w-full bg-accent backdrop-blur-md text-foreground border border-border hover:bg-accent/80 hover:border-border rounded-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                !isAuthPage && (
                  <Link to="/auth" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full bg-accent backdrop-blur-md text-foreground border border-border hover:bg-accent/80 hover:border-border rounded-full"
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
                    className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium px-4"
                  >
                    About Us
                  </Link>
                  <Link
                    to="/premium"
                    className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium px-4"
                  >
                    Pricing
                  </Link>

                  <div className="px-4">
                    <button
                      onClick={() => setIsCommunityOpen(!isCommunityOpen)}
                      className="flex items-center justify-between w-full text-muted-foreground hover:text-foreground transition-colors text-lg font-medium mb-3"
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
                      <div className="flex flex-col gap-3 pl-2 border-l border-border ml-1">
                        <a
                          href="https://github.com/beymflow"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors p-2"
                        >
                          <Github className="h-5 w-5" /> <span>GitHub</span>
                        </a>
                        <a
                          href="https://x.com/beymflow"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors p-2"
                        >
                          <Twitter className="h-5 w-5" /> <span>X</span>
                        </a>
                        <a
                          href="https://www.youtube.com/@Beymflow"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors p-2"
                        >
                          <Youtube className="h-5 w-5" /> <span>YouTube</span>
                        </a>
                        <a
                          href="https://www.instagram.com/beymflow/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors p-2"
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

        {/* Desktop Sign In/Out Button + Theme Toggle */}
        {!isAuthPage && (
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full bg-accent backdrop-blur-md border border-border text-foreground hover:bg-accent/80 hover:border-border transition-all"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Sign In/Out Button */}
            {user ? (
              <Button
                variant="outline"
                onClick={signOut}
                className="bg-accent backdrop-blur-md text-foreground border border-border hover:bg-accent/80 hover:border-border rounded-full px-6 transition-all"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth">
                <Button
                  variant="outline"
                  className="bg-accent backdrop-blur-md text-foreground border border-border hover:bg-accent/80 hover:border-border rounded-full px-6 transition-all"
                >
                  Start Creating
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

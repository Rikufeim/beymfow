"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, User, LogOut, Settings, FileText, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePrefetchRoute } from "@/hooks/usePrefetchRoute";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthDialog } from "@/contexts/AuthDialogContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOGO_URL = "/images/beymflow-logo.png";

let logoCacheLoaded = false;

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prefetchRoute } = usePrefetchRoute();
  const [logoLoaded, setLogoLoaded] = useState(logoCacheLoaded);
  const { user, signOut, loading } = useAuth();
  const { openAuthDialog } = useAuthDialog();

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

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header
      className={`z-[999] h-[80px] w-full flex items-center justify-between px-6 md:px-10 transition-all duration-500 ${isHeroBackgroundMode ? "absolute top-0 left-0 bg-transparent" : "relative bg-background"}`}
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
          <span className="relative text-base font-semibold tracking-[0.28em] text-foreground hidden sm:block -ml-1">
            Beymflow
          </span>
        </Link>
      </div>

      <div className="flex items-center justify-end flex-1 gap-4 md:gap-8">
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link
            to="/flow"
            onMouseEnter={() => prefetchRoute("/flow")}
            className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm"
          >
            Flow
          </Link>
          <Link
            to="/about"
            onMouseEnter={() => prefetchRoute("/about")}
            className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm"
          >
            About Us
          </Link>
        </nav>

        {/* Auth UI */}
        {!loading && (
          <>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-foreground hover:bg-muted"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  <DropdownMenuItem
                    onClick={() => navigate("/settings")}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/flow/documentation")}
                    className="cursor-pointer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Documentation
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/flow/feedback")}
                    className="cursor-pointer"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Give Feedback
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAuthDialog()}
                className="border-border text-foreground hover:bg-muted"
              >
                Sign in
              </Button>
            )}
          </>
        )}

        <Sheet>
          <SheetTrigger asChild>
            <button className="md:hidden text-foreground hover:bg-muted p-2 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background border-border w-[300px] z-[1000]">
            <div className="flex flex-col gap-6 mt-8">
              <Link to="/flow" className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium px-4">
                Flow
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium px-4">
                About Us
              </Link>
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium px-4">
                        Settings
                      </Link>
                      <Link to="/flow/documentation" className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium px-4">
                        Documentation
                      </Link>
                      <Link to="/flow/feedback" className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium px-4">
                        Give Feedback
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="text-destructive hover:text-destructive/80 transition-colors text-lg font-medium px-4 text-left"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => openAuthDialog()}
                      className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium px-4 text-left"
                    >
                      Sign in
                    </button>
                  )}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;

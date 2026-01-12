"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
      />
    </svg>
  );
}

function DumbbellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 6.5h-2a1 1 0 00-1 1v9a1 1 0 001 1h2m0-11v11m0-11a1 1 0 011-1h2a1 1 0 011 1v11a1 1 0 01-1 1h-2a1 1 0 01-1-1m11-11h2a1 1 0 011 1v9a1 1 0 01-1 1h-2m0-11v11m0-11a1 1 0 00-1-1h-2a1 1 0 00-1 1v11a1 1 0 001 1h2a1 1 0 001-1m-5.5-5.5h-3"
      />
    </svg>
  );
}

function StretchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4c1.5 0 3 1.5 3 3s-1.5 3-3 3-3-1.5-3-3 1.5-3 3-3zM4 20l4-4m0 0l2-6 4 2 4-6m-10 10l2 2m8-8l2 6"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

const navItems = [
  { href: "/", label: "Track Calories", icon: FlameIcon },
  { href: "/workouts", label: "Workouts", icon: DumbbellIcon },
  { href: "/stretches", label: "Stretches", icon: StretchIcon },
  { href: "/age-goal-fitness", label: "Smart Plans", icon: TargetIcon },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/progress", label: "Progress", icon: ChartIcon },
  { href: "/personalized-plan", label: "AI Plan", icon: SparklesIcon },
];

// Color mapping for each route with explicit Tailwind classes
const tabColorMap: Record<
  string,
  {
    gradient: string;
    text: string;
    bg: string;
    shadow: string;
    shadowHover: string;
  }
> = {
  "/": {
    gradient: "bg-gradient-to-br from-emerald-500 to-lime-500",
    text: "text-emerald-400",
    bg: "bg-emerald-500/15",
    shadow: "shadow-emerald-500/20",
    shadowHover: "group-hover:shadow-emerald-500/40",
  },
  "/workouts": {
    gradient: "bg-gradient-to-br from-red-500 to-rose-500",
    text: "text-red-400",
    bg: "bg-red-500/15",
    shadow: "shadow-red-500/20",
    shadowHover: "group-hover:shadow-red-500/40",
  },
  "/stretches": {
    gradient: "bg-gradient-to-br from-cyan-500 to-blue-500",
    text: "text-cyan-400",
    bg: "bg-cyan-500/15",
    shadow: "shadow-cyan-500/20",
    shadowHover: "group-hover:shadow-cyan-500/40",
  },
  "/calendar": {
    gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    text: "text-amber-400",
    bg: "bg-amber-500/15",
    shadow: "shadow-amber-500/20",
    shadowHover: "group-hover:shadow-amber-500/40",
  },
  "/progress": {
    gradient: "bg-gradient-to-br from-violet-500 to-purple-500",
    text: "text-violet-400",
    bg: "bg-violet-500/15",
    shadow: "shadow-violet-500/20",
    shadowHover: "group-hover:shadow-violet-500/40",
  },
  "/personalized-plan": {
    gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
    text: "text-pink-400",
    bg: "bg-pink-500/15",
    shadow: "shadow-pink-500/20",
    shadowHover: "group-hover:shadow-pink-500/40",
  },
  "/age-goal-fitness": {
    gradient: "bg-gradient-to-br from-indigo-500 to-purple-500",
    text: "text-indigo-400",
    bg: "bg-indigo-500/15",
    shadow: "shadow-indigo-500/20",
    shadowHover: "group-hover:shadow-indigo-500/40",
  },
};

// Get color for current route, default to emerald for home
function getColorForRoute(pathname: string) {
  return tabColorMap[pathname] || tabColorMap["/"];
}

export function Navbar() {
  const pathname = usePathname();
  const colors = getColorForRoute(pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 group shrink-0"
            >
              <div
                className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shadow-lg transition-shadow",
                  colors.gradient,
                  colors.shadow,
                  colors.shadowHover
                )}
              >
                <span className="text-black font-bold text-base sm:text-lg">
                  G
                </span>
              </div>
              <span className="font-bold text-sm sm:text-lg md:text-xl whitespace-nowrap">
                <span className="text-foreground">GetFit</span>
                <span className={cn(colors.text, "inline text-xs sm:text-base md:text-lg")}>
                  {" "}by Darsh
                </span>
              </span>
            </Link>

            {/* Desktop Nav Links - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-1 flex-1 min-w-0 ml-4">
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const itemColors = getColorForRoute(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                        isActive
                          ? `${itemColors.bg} ${itemColors.text} shadow-sm`
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon
                        className={cn("w-4 h-4", isActive && itemColors.text)}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Mobile Menu Drawer */}
          <div className="fixed top-[56px] sm:top-[64px] left-0 right-0 bottom-0 z-40 bg-background border-t border-border/40 overflow-y-auto md:hidden">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const itemColors = getColorForRoute(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                        isActive
                          ? `${itemColors.bg} ${itemColors.text} shadow-sm`
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon
                        className={cn("w-5 h-5", isActive && itemColors.text)}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}

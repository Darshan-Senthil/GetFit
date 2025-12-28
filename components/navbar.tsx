"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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

const navItems = [
  { href: "/", label: "Track Calories", icon: FlameIcon },
  { href: "/workouts", label: "Workouts", icon: DumbbellIcon },
  { href: "/stretches", label: "Stretches", icon: StretchIcon },
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
};

// Get color for current route, default to emerald for home
function getColorForRoute(pathname: string) {
  return tabColorMap[pathname] || tabColorMap["/"];
}

export function Navbar() {
  const pathname = usePathname();
  const colors = getColorForRoute(pathname);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shadow-lg transition-shadow",
                colors.gradient,
                colors.shadow,
                colors.shadowHover
              )}
            >
              <span className="text-black font-bold text-lg">G</span>
            </div>
            <span className="font-bold text-xl">
              <span className="text-foreground">GetFit</span>
              <span className={colors.text}> by Darsh</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const itemColors = getColorForRoute(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? `${itemColors.bg} ${itemColors.text} shadow-sm`
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon
                    className={cn("w-4 h-4", isActive && itemColors.text)}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

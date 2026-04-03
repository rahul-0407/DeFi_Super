"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  Coins,
  BarChart3,
  LogOut,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Swap", href: "/swap", icon: ArrowLeftRight },
  { name: "Lending", href: "/lending", icon: Landmark },
  { name: "Staking", href: "/staking", icon: Coins },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export const ConditionalShell = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut, configured } = useAuth();

  const isPublicRoute =
    pathname === "/" || pathname === "/login" || pathname === "/coming-soon";
  const isAppRoute = !isPublicRoute;

  // Check demo mode auth synchronously from localStorage (no useEffect delay)
  const [demoAuth, setDemoAuth] = React.useState(false);

  // Keep demoAuth in sync on navigation (e.g. after sign-out)
  React.useEffect(() => {
    if (!configured) {
      setDemoAuth(localStorage.getItem("defix_auth") === "true");
    }
  }, [configured, pathname]);

  const isAuthenticated = configured ? !!user : demoAuth;

  // Redirect unauthenticated users away from app routes (replace, not push)
  React.useEffect(() => {
    if (!loading && isAppRoute && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAppRoute, isAuthenticated, router]);

  // Public pages — render without shell
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show loading spinner while checking auth (both Supabase and demo modes)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not authenticated — show spinner while redirect fires (never render protected content)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayEmail = user?.email || (demoAuth ? "admin@demo.com" : null);

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-white">
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-white/6 hidden md:flex flex-col bg-[#0A0A0A] fixed h-screen z-30">
        {/* Brand */}
        <div className="px-6 pt-7 pb-6 flex items-center gap-3">
          <svg
            width="24"
            height="24"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 4L28 10V22L16 28L4 22V10L16 4Z"
              stroke="white"
              strokeWidth="2.5"
            />
            <circle cx="16" cy="16" r="6" fill="#77b8a2" />
          </svg>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Pareto
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group ${
                  isActive
                    ? "bg-white/8 text-white"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/4"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-linear-to-b from-blue-400 to-purple-500" />
                )}
                <Icon
                  size={18}
                  className={
                    isActive
                      ? "text-blue-400"
                      : "text-gray-600 group-hover:text-gray-400 transition-colors"
                  }
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User & Sign Out */}
        <div className="px-3 pb-6 space-y-2">
          {displayEmail && (
            <div className="px-4 py-2 rounded-xl bg-white/3 border border-white/6 text-[11px] text-gray-500 truncate">
              {displayEmail}
            </div>
          )}
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] text-gray-500 hover:text-red-400 hover:bg-red-500/6 transition-all duration-200"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-[260px] overflow-auto min-h-screen">
        <header className="h-14 border-b border-white/6 flex items-center justify-between px-8 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-xl z-20">
          <div className="text-[13px] text-gray-500">
            {displayEmail && (
              <span>
                Signed in as{" "}
                <span className="text-gray-300 font-medium">
                  {displayEmail}
                </span>
              </span>
            )}
          </div>
          <div id="wallet-button">{/* Wallet button injected by page */}</div>
        </header>
        <div className="p-8 pb-20">{children}</div>
      </main>
    </div>
  );
};

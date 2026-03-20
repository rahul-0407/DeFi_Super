"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

export const ConditionalShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut, configured } = useAuth();

  const isLandingOrLogin = pathname === "/" || pathname === "/login";
  const isAppRoute = !isLandingOrLogin;

  // Check demo mode auth (localStorage) when Supabase isn't configured
  const [demoAuth, setDemoAuth] = React.useState(false);
  React.useEffect(() => {
    if (!configured) {
      setDemoAuth(localStorage.getItem("defix_auth") === "true");
    }
  }, [configured, pathname]);

  const isAuthenticated = configured ? !!user : demoAuth;

  // Redirect unauthenticated users away from app routes
  React.useEffect(() => {
    if (!loading && isAppRoute && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAppRoute, isAuthenticated, router]);

  // Landing or login pages — render without shell
  if (isLandingOrLogin) {
    return <>{children}</>;
  }

  // Show loading state while checking auth (only when configured)
  if (configured && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not authenticated on app route — don't render (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 hidden md:block bg-[#0A0A0A]">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            DeFi Super
          </h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {[
            { name: "Dashboard", href: "/dashboard" },
            { name: "Swap", href: "/swap" },
            { name: "Lending", href: "/lending" },
            { name: "Staking", href: "/staking" },
            { name: "Analytics", href: "/analytics" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                pathname === item.href
                  ? "bg-white/10 text-white font-bold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        {/* Sign Out Button */}
        <div className="mt-auto px-4 pt-8">
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-screen">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0A0A0A]">
          <div className="text-sm text-gray-400">
            {user?.email && <span>Signed in as <span className="text-white font-medium">{user.email}</span></span>}
          </div>
          <div id="wallet-button">
            {/* Wallet button */}
          </div>
        </header>
        <div className="p-8 pb-20">{children}</div>
      </main>
    </div>
  );
};

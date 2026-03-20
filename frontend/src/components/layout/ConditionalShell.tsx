"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export const ConditionalShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  // Sync auth state from localStorage
  useEffect(() => {
    const auth = localStorage.getItem("defix_auth") === "true";
    setIsAuth(auth);

    // If on an app route but not auth, redirect to landing
    const isAppRoute = pathname !== "/" && pathname !== "/login";
    if (isAppRoute && !auth) {
      router.push("/");
    }
  }, [pathname, router]);

  const isLandingOrLogin = pathname === "/" || pathname === "/login";

  if (isLandingOrLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Only for App Routes */}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-screen">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0A0A0A]">
          <div className="text-sm text-gray-400 italic">Connected to Institutional Portal</div>
          <div id="wallet-button">
            {/* Wallet button or user menu */}
          </div>
        </header>
        <div className="p-8 pb-20">{children}</div>
      </main>
    </div>
  );
};

"use client";

import React from "react";
import Link from "next/link";

const ParetoNav = () => {
  return (
    <nav className="fixed top-6 left-6 right-6 z-50 py-3 px-8 flex justify-between items-center transition-all glass-nav max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        {/* Pareto Logo Symbol */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 4L28 10V22L16 28L4 22V10L16 4Z"
            stroke="#203f34"
            strokeWidth="2"
          />
          <circle cx="16" cy="16" r="6" fill="#77b8a2" />
        </svg>
        <span className="text-xl font-bold tracking-tight text-neutral-900">
          Pareto
        </span>
      </div>

      <div className="hidden md:flex items-center gap-10">
        <Link
          href="/coming-soon"
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Product
        </Link>
        <Link
          href="/coming-soon"
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Features
        </Link>
        <Link
          href="/coming-soon"
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Partners
        </Link>
      </div>

      <Link href="/login">
        <button className="bg-[#b1f748] text-neutral-900 px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform active:scale-95 shadow-sm shadow-[#b1f748]/20">
          Enter App
        </button>
      </Link>
    </nav>
  );
};

export default ParetoNav;

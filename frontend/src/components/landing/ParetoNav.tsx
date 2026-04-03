"use client";

import React from "react";
import Link from "next/link";

const ParetoNav = () => {
  return (
    <nav className="fixed top-6 left-6 right-6 z-50 py-3 px-8 flex justify-between items-center transition-all glass-nav max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        {/* Pareto Logo Symbol */}
        <div className="w-8 h-8 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z" fill="currentColor" fillOpacity="0.1"/>
            <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
          </svg>
        </div>
        <span className="text-2xl font-semibold tracking-tight text-neutral-900">Pareto</span>
      </div>

      <div className="hidden md:flex items-center gap-10">
        <Link href="#product" className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors">Product</Link>
        <Link href="#features" className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors">Features</Link>
        <Link href="#partners" className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors">Partners</Link>
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

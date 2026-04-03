"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const USPStat = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-[#f0f4f0]/60 backdrop-blur-sm rounded-[2rem] p-8 flex flex-col items-center justify-center flex-1 min-w-[140px] border border-white/40">
    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">{label}</span>
    <span className="text-4xl font-serif text-deep-green">{value}</span>
  </div>
);

const featureData = [
  {
    title: "Composable",
    desc: "USP is transferable, permissionless, and seamlessly integrates into DeFi and CeFi for enhanced efficiency.",
    icon: (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 10C35.5 10 40 14.5 40 20C40 25.5 35.5 30 30 30C24.5 30 20 25.5 20 20C20 14.5 24.5 10 30 10Z" stroke="#203f34" strokeWidth="1.5"/>
        <path d="M10 30H50M30 10V50" stroke="#203f34" strokeWidth="1" strokeDasharray="4 4"/>
        <path d="M40 40C45.5 40 50 44.5 50 50" stroke="#203f34" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 50C10 44.5 14.5 40 20 40" stroke="#203f34" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    title: "Overcollateralized",
    desc: "Backed 1:1, USP is fully collateralized by stablecoins",
    icon: (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 10L50 20V40L30 50L10 40V20L30 10Z" stroke="#203f34" strokeWidth="2"/>
        <text x="30" y="35" textAnchor="middle" className="text-xl font-bold fill-deep-green">1/1</text>
      </svg>
    )
  },
  {
    title: "Safe",
    desc: "Although backed by solid, liquid assets, USP is also protected by a stability fund, funded by protocol revenue, to shield holders in a systemic crisis.",
    icon: (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="15" width="30" height="30" rx="4" stroke="#203f34" strokeWidth="2"/>
        <circle cx="30" cy="30" r="10" stroke="#203f34" strokeWidth="1"/>
        <path d="M30 20V25M30 35V40M20 30H25M35 30H40" stroke="#203f34" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  }
];

const ParetoUSP = () => {
  const [token, setToken] = useState<"USP" | "sUSP">("USP");

  return (
    <section className="py-20 px-6 bg-[#e3e8e2]">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Main USP Card */}
        <div className="bg-[#d7e4ea] rounded-[3rem] p-12 border border-black/5 relative overflow-hidden flex flex-col gap-12 lg:flex-row lg:items-center shadow-sm">
          
          {/* Top Left Text */}
          <div className="lg:w-1/2 flex flex-col gap-8 relative z-10">
             <h2 className="text-5xl font-serif text-deep-green leading-[1.1] max-w-md">
               USP, the credit-based synthetic dollar
             </h2>
             <p className="text-xs text-neutral-500 leading-relaxed font-mono-inter uppercase tracking-wide max-w-sm">
               USP is a synthetic dollar protocol backed by real-world institutional-grade private credit.
             </p>
             <div className="flex gap-4">
                <button className="px-10 py-3 rounded-full border border-black/20 text-[10px] font-bold uppercase tracking-widest text-deep-green hover:bg-deep-green hover:text-white transition-all">Open in App</button>
                <button className="px-10 py-3 rounded-full border border-black/20 text-[10px] font-bold uppercase tracking-widest text-deep-green hover:bg-deep-green hover:text-white transition-all">Documents</button>
             </div>
          </div>

          {/* Right Section: Toggle, Stats */}
          <div className="lg:w-1/2 flex flex-col gap-12 relative z-10">
            {/* Toggle Bar */}
            <div className="flex justify-end">
              <div className="bg-[#d1dbe5] rounded-xl p-1 flex items-center shadow-inner border border-white/20 ">
                <button 
                  onClick={() => setToken("USP")}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${token === "USP" ? "bg-[#203f34]  text-white shadow-lg" : "text-neutral-500"}`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${token === "USP" ? "border-white" : "border-neutral-500"}`}>
                    <span className="text-[10px]">$</span>
                  </div>
                  USP
                </button>
                <button 
                  onClick={() => setToken("sUSP")}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${token === "sUSP" ? "bg-[#203f34] text-white shadow-lg" : "text-neutral-500"}`}
                >
                   <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${token === "sUSP" ? "border-white" : "border-neutral-500"}`}>
                    <span className="text-[10px]">$</span>
                  </div>
                  sUSP
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-4">
              <USPStat label="Price" value="$1" />
              <USPStat label="TVL" value="$30m" />
              <USPStat label="Collateralization" value="15.2%" />
            </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] border border-black/5 rounded-full pointer-events-none"></div>
        </div>

        {/* Bottom Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featureData.map((feature, i) => (
            <div key={i} className="bg-[#d7e4ea] backdrop-blur-md rounded-[3rem] p-10 border border-white/60 flex flex-col gap-8 h-full">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center border border-white/40 mb-4">
                 {feature.icon}
              </div>
              <h3 className="text-3xl font-serif text-deep-green">{feature.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-mono-inter uppercase tracking-wide">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ParetoUSP;

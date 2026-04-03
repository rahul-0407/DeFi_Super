"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Link from "next/link";

const USPStat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-[#f0f4f0]/60 backdrop-blur-sm rounded-[2rem] p-8 flex flex-col items-center justify-center flex-1 min-w-[140px] border border-white/40">
    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
      {label}
    </span>
    <span className="text-4xl font-serif text-deep-green">{value}</span>
  </div>
);

const featureData = [
  {
    title: "Yield Aggregation",
    desc: "Assets are intelligently routed across the ecosystem to capture the highest risk-adjusted yield in real-time.",
    icon: (
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="30"
          cy="30"
          r="20"
          stroke="#203f34"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M30 15V20M30 40V45M15 30H20M40 30H45"
          stroke="#203f34"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M22 22L26 26M34 34L38 38"
          stroke="#203f34"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Permissionless Liquidity",
    desc: "Access institutional-grade markets without central gatekeepers. All risk parameters and collateralization are handled by autonomous on-chain logic.",
    icon: (
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30 10V50M10 30H50"
          stroke="#203f34"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <rect
          x="20"
          y="20"
          width="20"
          height="25"
          rx="2"
          stroke="#203f34"
          strokeWidth="2"
        />
        <circle cx="30" cy="28" r="4" stroke="#203f34" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Instant Liquidity",
    desc: "Access deep liquidity for any asset pair through our unified AMM engine, supporting WETH, USDC, and native ecosystem tokens.",
    icon: (
      <svg
        width="60"
        height="60"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 30C20 24.5 24.5 20 30 20C35.5 20 40 24.5 40 30C40 35.5 35.5 40 30 40C24.5 40 20 35.5 20 30Z"
          stroke="#203f34"
          strokeWidth="2"
        />
        <path
          d="M10 30L20 30M40 30L50 30M30 10L30 20M30 40L30 50"
          stroke="#203f34"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
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
              USDC, the ecosystem-backed stablecoin
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed font-mono-inter uppercase tracking-wide max-w-sm">
              USDC is the primary dollar protocol powering the entire Pareto
              ecosystem for lending, swaps, and rewards.
            </p>
            <div className="flex gap-4">
              <Link href="/login">
                <button className="px-10 py-3 rounded-full border border-black/20 text-[10px] font-bold uppercase tracking-widest text-deep-green hover:bg-deep-green hover:text-white transition-all">
                  Open in App
                </button>
              </Link>
              <Link href="/coming-soon">
                <button className="px-10 py-3 rounded-full border border-black/20 text-[10px] font-bold uppercase tracking-widest text-deep-green hover:bg-deep-green hover:text-white transition-all">
                  Documents
                </button>
              </Link>
            </div>
          </div>

          {/* Right Section: Toggle, Stats */}
          <div className="lg:w-1/2 flex flex-col gap-12 relative z-10">
            {/* Toggle Bar */}
            <div className="flex justify-end">
              <div className="bg-[#d1dbe5] rounded-xl p-1 flex items-center shadow-inner border border-white/20 ">
                <button
                  onClick={() => setToken("USP")}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${token === "USP" ? "bg-deep-green text-secondary-fixed shadow-lg scale-105" : "text-neutral-500"}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${token === "USP" ? "border-secondary-fixed" : "border-neutral-500"}`}
                  >
                    <span className="text-[10px]">$</span>
                  </div>
                  USDC
                </button>
                <button
                  onClick={() => setToken("sUSP")}
                  className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${token === "sUSP" ? "bg-deep-green text-secondary-fixed shadow-lg scale-105" : "text-neutral-500"}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${token === "sUSP" ? "border-secondary-fixed" : "border-neutral-500"}`}
                  >
                    <span className="text-[10px]">d</span>
                  </div>
                  D_USDC
                </button>
              </div>
            </div>

            {/* Data Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={token}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-4xl font-serif text-deep-green mb-4 leading-tight">
                    {token === "USP"
                      ? "USDC, the Ecosystem-Backed Stablecoin"
                      : "D_USDC, the Interest-Bearing Receipt"}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed font-mono-inter uppercase tracking-wide">
                    {token === "USP"
                      ? "USDC is the primary dollar protocol powering the entire Pareto liquidity landscape, ensuring deep stability and efficient swapping."
                      : "D_USDC represents your supplied USDC position in the lending pool, automatically accruing compound interest and protocol rewards."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Target APY
                    </p>
                    <p className="text-3xl font-serif text-deep-green">23.5%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Status
                    </p>
                    <p className="text-3xl font-serif text-deep-green">
                      ACCRUING
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-black/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Collateralization
                    </span>
                    <span className="text-xs font-bold text-deep-green">
                      148.5%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      className="h-full bg-deep-green"
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Decorative background circle */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] border border-black/5 rounded-full pointer-events-none"></div>
        </div>

        {/* Bottom Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featureData.map((feature, i) => (
            <div
              key={i}
              className="bg-[#d7e4ea] backdrop-blur-md rounded-[3rem] p-10 border border-white/60 flex flex-col gap-8 h-full"
            >
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center border border-white/40 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-3xl font-serif text-deep-green">
                {feature.title}
              </h3>
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

"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const ParetoHero = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 px-6 overflow-hidden bg-[#f0f4f0]">
      {/* Refined Wavy Background Pattern (SVG) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 flex justify-center">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Left Side Waves */}
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.path
              key={`left-${i}`}
              d={`M0 ${100 + i * 20} Q 360 ${200 + i * 5} 650 400`}
              stroke="#77b8a2"
              strokeWidth="0.8"
              fill="none"
              initial={{ pathLength: 0, opacity: 1 }}
              animate={{ pathLength: 1, opacity: 1 + i / 100 }}
              transition={{ duration: 2, delay: i * 0.03 }}
            />
          ))}
          {/* Right Side Waves */}
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.path
              key={`right-${i}`}
              d={`M1440 ${100 + i * 20} Q 1080 ${200 + i * 5} 790 400`}
              stroke="#77b8a2"
              strokeWidth="0.8"
              fill="none"
              initial={{ pathLength: 0, opacity: 1 }}
              animate={{ pathLength: 1, opacity: 1 + i / 100 }}
              transition={{ duration: 2, delay: i * 0.03 }}
            />
          ))}
          {/* Centering Glow */}
          <circle
            cx="720"
            cy="400"
            r="400"
            fill="url(#mintGlow)"
            opacity="0.2"
          />
          <defs>
            <radialGradient
              id="mintGlow"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(720 300) rotate(90) scale(300)"
            >
              <stop stopColor="#77b8a2" />
              <stop offset="1" stopColor="#77b8a2" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center text-center">
        {/* Ecosystem Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-10 shadow-xl border border-white/50 max-w-lg mb-20 relative overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-8 ">
            <svg
              width="48"
              height="48"
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
            <div className="text-left">
              <h3 className="text-xl font-bold text-neutral-900">
                DEFI Yield Vault
              </h3>
              <p className="text-xs text-neutral-400 uppercase tracking-widest">
                Automated Strategy
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-8">
            <span className="px-4 py-1 bg-neutral-100 rounded-full text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              USDC
            </span>
            <span className="px-4 py-1 bg-neutral-100 rounded-full text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Optimized
            </span>
          </div>

          <p className="text-sm text-neutral-500 leading-relaxed text-left mb-12 max-w-xs">
            Dynamic capital allocation across the most efficient lending markets
            and liquidity pools in the Pareto ecosystem.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-neutral-100 pt-8">
            <div className="bg-secondary-fixed/10 p-4 rounded-xl border border-secondary-fixed/20">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">
                DEFI Price
              </p>
              <p className="text-2xl font-bold text-deep-green font-serif">
                $0.50
              </p>
            </div>
            <div className="bg-secondary-fixed/10 p-4 rounded-xl border border-secondary-fixed/20">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">
                Staking APY
              </p>
              <p className="text-2xl font-bold text-deep-green italic font-serif">
                23.5%
              </p>
            </div>
            <div className="bg-[#f5f5f5] p-4 rounded-xl border border-black/5">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">
                Total Value Locked
              </p>
              <p className="text-2xl font-bold text-neutral-900">$142.4m</p>
            </div>
          </div>
        </motion.div>

        {/* Tab-like Buttons */}
        <div className="flex gap-4 mb-16">
          <div className="px-6 py-2 rounded-full border border-neutral-200 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Lending & Borrow
          </div>
          <div className="px-6 py-2 rounded-full border border-neutral-200 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            AMM & Swap
          </div>
          <div className="px-6 py-2 rounded-full border border-secondary-fixed text-[10px] font-bold uppercase tracking-widest text-[#1c3a30] bg-white/50">
            Staking Rewards
          </div>
        </div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-6xl font-serif text-[#1c3a30] max-w-4xl leading-[0.9] tracking-tight"
        >
          The Universal Terminal for the New Economy
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-sm md:text-xl text-neutral-500 max-w-2xl leading-relaxed font-serif tracking-wide"
        >
          Pareto is a unified interface for swaps, lending, staking, and
          institutional-grade analytics. One powerful app to manage your entire
          on-chain financial lifecycle.
        </motion.p>
      </div>
    </section>
  );
};

export default ParetoHero;

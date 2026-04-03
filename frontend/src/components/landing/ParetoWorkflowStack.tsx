"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";

const workflowData = [
  {
    id: "swap",
    title: "Swap",
    color: "bg-[#d7e4ea]",
    desc: "Execute seamless token swaps across multiple liquidity sources with zero-slippage algorithms and institutional-grade execution.",
    buttons: [
      { label: "Open In App", theme: "dark" },
      { label: "Documents", theme: "outline" },
    ],
    steps: [
      {
        num: "1",
        title: "Route Discovery",
        desc: "Our engine scans dozens of liquidity sources to find the most efficient route for your trade.",
      },
      {
        num: "2",
        title: "Price Execution",
        desc: "Lock in the best available prices with minimal slippage using our optimized routing logic.",
      },
      {
        num: "3",
        title: "Slippage Control",
        desc: "Advanced protection mechanisms ensure your trades are executed within your specified tolerance.",
      },
      {
        num: "4",
        title: "Instant Finality",
        desc: "Experience near-instant settlement on the most liquid on-chain markets.",
      },
    ],
    illustration: (
      <svg
        width="240"
        height="240"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M60 180H180V200C180 211 153 220 120 220C87 220 60 211 60 200V180Z"
          fill="#b1f748"
          fillOpacity="0.1"
          stroke="#4a5a4a"
          strokeWidth="1.5"
        />
        <path
          d="M60 160H180V180C180 191 153 200 120 200C87 200 60 191 60 180V160Z"
          fill="#b1f748"
          fillOpacity="0.15"
          stroke="#4a5a4a"
          strokeWidth="1.5"
        />
        <path
          d="M60 140H180V160C180 171 153 180 120 180C87 180 60 171 60 160V140Z"
          fill="#b1f748"
          fillOpacity="0.2"
          stroke="#4a5a4a"
          strokeWidth="1.5"
        />
        <circle
          cx="120"
          cy="120"
          r="40"
          stroke="#4a5a4a"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M110 110L130 130M130 110L110 130"
          stroke="#4a5a4a"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "lend",
    title: "Lend",
    color: "bg-[#dbdfe7]",
    desc: "Supply liquidity to the Pareto ecosystem and earn real-time interest. Receive interest-bearing receipt tokens (D_USDC) while maintaining full control of your capital.",
    buttons: [
      { label: "Open In App", theme: "dark" },
      { label: "Markets", theme: "outline" },
    ],
    steps: [
      {
        num: "1",
        title: "Market Selection",
        desc: "Choose from verified USDC liquidity pools backed by the Pareto protocol's risk-adjusted curation.",
      },
      {
        num: "2",
        title: "Liquidity Supply",
        desc: "Supply assets permissionlessly. No KYC or legal agreements required—everything is handled on-chain.",
      },
      {
        num: "3",
        title: "Receipt tokens",
        desc: "Receive D_USDC tokens representing your share of the pool, automatically accruing compound interest.",
      },
      {
        num: "4",
        title: "Reward Capture",
        desc: "Earn additional **DEFI** governance rewards alongside your variable interest yield.",
      },
    ],
    illustration: (
      <svg
        width="240"
        height="240"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M120 40L160 80L120 120L80 80L120 40Z"
          fill="#77b8a2"
          fillOpacity="0.1"
          stroke="#203f34"
          strokeWidth="1.5"
        />
        <path
          d="M120 80L160 120L120 160L80 120L120 80Z"
          fill="#77b8a2"
          fillOpacity="0.15"
          stroke="#203f34"
          strokeWidth="1.5"
        />
        <circle
          cx="120"
          cy="120"
          r="60"
          stroke="#203f34"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <path
          d="M100 120H140M120 100V140"
          stroke="#203f34"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "borrow",
    title: "Borrow",
    color: "bg-[#dce6dc]",
    desc: "Unlock liquidity without selling your assets. Provide WETH collateral to open an over-collateralized borrow position in USDC with instant finality.",
    buttons: [{ label: "Open In App", theme: "dark" }],
    steps: [
      {
        num: "1",
        title: "Collateral Deposit",
        desc: "Provide protocol-approved assets like WETH as collateral to secure your permissionless credit line.",
      },
      {
        num: "2",
        title: "Credit Routing",
        desc: "Access competitive interest rates sourced from the most efficient liquidity pools in the Pareto ecosystem.",
      },
      {
        num: "3",
        title: "Instant Credit",
        desc: "Withdraw borrowed USDC directly to your wallet. No due diligence or credit checks—code is the arbiter.",
      },
      {
        num: "4",
        title: "Risk Management",
        desc: "Monitor your health factor and LTV 24/7 with our institutional-grade risk visualization engine.",
      },
    ],
    illustration: (
      <svg
        width="240"
        height="240"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M120 40C75.8 40 40 75.8 40 120C40 164.2 75.8 200 120 200C164.2 200 200 164.2 200 120"
          stroke="#203f34"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M120 120L40 120"
          stroke="#203f34"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M120 120V40"
          stroke="#203f34"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M60 100V120M50 110H70"
          stroke="#203f34"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse
          cx="160"
          cy="140"
          rx="30"
          ry="10"
          fill="#dce6dc"
          stroke="#203f34"
          strokeWidth="1.5"
        />
        <path
          d="M130 140V170C130 175.5 143.4 180 160 180C176.6 180 190 175.5 190 170V140"
          stroke="#203f34"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

const ParetoWorkflowStack = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Snappy, responsive spring for 1:1 synchronization
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <div ref={containerRef} className="relative h-[450vh] bg-[#f0f4f0]">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto w-full px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative h-[700px]">
            {/* Left Cards Stack */}
            <div className="lg:col-span-5 relative h-full flex items-center justify-center">
              {workflowData.map((item, index) => {
                // Re-calibrated ranges for 1:1 scroll synchronization
                const ranges = [
                  { exitStart: 0.15, exitEnd: 0.4 },
                  {
                    enterStart: 0.15,
                    enterEnd: 0.4,
                    exitStart: 0.6,
                    exitEnd: 0.85,
                  },
                  { enterStart: 0.6, enterEnd: 0.85 },
                ];

                const r = ranges[index];

                // Opacity logic
                const opacity = useTransform(
                  smoothProgress,
                  index === 0
                    ? [0, r.exitStart!, r.exitEnd!]
                    : index === 2
                      ? [r.enterStart!, r.enterEnd!, 1.0]
                      : [r.enterStart!, r.enterEnd!, r.exitStart!, r.exitEnd!],
                  index === 0
                    ? [1, 1, 0]
                    : index === 2
                      ? [0, 1, 1]
                      : [0, 1, 1, 0],
                );

                // Scale logic
                const scale = useTransform(
                  smoothProgress,
                  [r.exitStart || 0.85, r.exitEnd || 1],
                  [1, 0.9],
                );

                // Y logic - Coming from 600px below matches the 0.25 progress range (1:1 feel)
                const y = useTransform(
                  smoothProgress,
                  [r.enterStart || 0, r.enterEnd || 0.4],
                  [600, 0],
                );

                return (
                  <motion.div
                    key={item.id}
                    style={{
                      scale: index < 2 ? scale : 1,
                      opacity,
                      y: index === 0 ? 0 : y,
                      zIndex: workflowData.length - index,
                    }}
                    className={`absolute inset-0 max-w-lg mx-auto ${item.color} backdrop-blur-md rounded-[3rem] p-12 border border-white/60 shadow-xl flex flex-col justify-between h-[700px]`}
                  >
                    <div className="flex flex-col gap-6">
                      <h2 className="text-6xl font-serif text-deep-green leading-tight">
                        {item.title}
                      </h2>
                      <p className="text-xl text-deep-green leading-relaxed font-serif tracking-wide">
                        {item.desc}
                      </p>
                    </div>

                    <div className="flex justify-center -my-4">
                      <div className="scale-90 transform origin-center">
                        {item.illustration}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      {item.buttons.map((btn, bi) => (
                        <Link
                          key={bi}
                          href={
                            btn.label === "Open In App"
                              ? "/login"
                              : "/coming-soon"
                          }
                        >
                          <button className="px-8 py-3 rounded-full border border-neutral-900 text-[11px] font-bold tracking-widest transition-all hover:bg-neutral-900 hover:text-white">
                            {btn.label}
                          </button>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Text Content Stack */}
            <div className="lg:col-span-7 relative h-full flex flex-col justify-center">
              {workflowData.map((item, index) => {
                const ranges = [
                  { exitStart: 0.15, exitEnd: 0.4 },
                  {
                    enterStart: 0.15,
                    enterEnd: 0.4,
                    exitStart: 0.6,
                    exitEnd: 0.85,
                  },
                  { enterStart: 0.6, enterEnd: 0.85 },
                ];
                const r = ranges[index];

                const opacity = useTransform(
                  smoothProgress,
                  index === 0
                    ? [0, r.exitStart!, r.exitEnd!]
                    : index === 2
                      ? [r.enterStart!, r.enterEnd!, 1.0]
                      : [r.enterStart!, r.enterEnd!, r.exitStart!, r.exitEnd!],
                  index === 0
                    ? [1, 1, 0]
                    : index === 2
                      ? [0, 1, 1]
                      : [0, 1, 1, 0],
                );

                const y = useTransform(
                  smoothProgress,
                  index === 0
                    ? [0, r.exitStart!, r.exitEnd!]
                    : index === 2
                      ? [r.enterStart!, r.enterEnd!, 1.0]
                      : [r.enterStart!, r.enterEnd!, r.exitStart!, r.exitEnd!],
                  index === 0
                    ? [0, 0, -200]
                    : index === 2
                      ? [200, 0, 0]
                      : [200, 0, 0, -200],
                );

                return (
                  <motion.div
                    key={item.id}
                    style={{ y, opacity, zIndex: 10 }}
                    className={`absolute inset-0 flex flex-col justify-center ${index === 0 ? "" : "pointer-events-none"}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                      {item.steps.map((step, si) => (
                        <div key={si} className="flex flex-col gap-6">
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-bold font-mono-inter italic text-[#77b8a2]">
                              {step.num}.
                            </span>
                            <h3 className="text-2xl font-serif text-deep-green">
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-xl text-neutral-600 leading-relaxed font-serif tracking-wide">
                            {step.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParetoWorkflowStack;

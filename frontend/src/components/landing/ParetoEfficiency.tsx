"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Percent, Eye, Cpu, Layers } from "lucide-react";

const EfficiencyCard = ({
  title,
  desc,
  icon: Icon,
  isOpen,
  onClick,
  colorClass,
}: any) => {
  return (
    <div
      className={`rounded-[2.5rem] p-8 transition-all cursor-pointer ${colorClass} border border-black/5 mb-4 last:mb-0`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-deep-green" />
          </div>
          <h3 className="text-2xl font-serif text-deep-green">{title}</h3>
        </div>
        <ChevronDown
          className={`w-6 h-6 text-deep-green transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-8 text-neutral-500 leading-relaxed font-mono-inter uppercase tracking-wide text-xs max-w-xl">
              {desc}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ParetoEfficiency = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const features = [
    {
      title: "Optimized Capital Costs",
      desc: "Pareto leverages unified liquidity pools to minimize slippage. Supply assets to earn **DEFI** rewards while maintaining highly competitive borrowing rates.",
      icon: Percent,
      color: "bg-[#dbe4db]",
    },
    {
      title: "Full Transparency",
      desc: "Every transaction and **DEFI** distribution is verifiable on-chain. Our analytics engine provides direct visibility into protocol health and performance.",
      icon: Eye,
      color: "bg-[#e2e8f0]",
    },
    {
      title: "Ecosystem Composability",
      desc: "Receive interest-bearing receipt tokens for your supplied liquidity. Use these assets to unlock secondary yield strategies and maximize **DEFI** accumulation.",
      icon: Cpu,
      color: "bg-[#f5f5f5]",
    },
    {
      title: "Risk-Adjusted Curation",
      desc: "Benefit from institutional-grade vault management. Stakers of **DEFI** participate in governance to ensure protocol stability and long-term performance.",
      icon: Layers,
      color: "bg-[#e2e8f0]",
    },

  ];

  return (
    <section className="py-32 px-6 bg-[#f0f4f0]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Header */}
        <div className="lg:col-span-4">
          <p className="text-[10px] font-bold text-[#77b8a2] uppercase tracking-[0.3em] mb-6">
            Our Advantage
          </p>
          <h2 className="text-5xl font-serif text-deep-green mb-8 leading-tight">
            Choose Efficiency
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed font-mono-inter uppercase tracking-wide">
            Liquidity built for the future, available today.
          </p>
        </div>

        {/* Right Cards */}
        <div className="lg:col-span-8">
          {features.map((feature, i) => (
            <EfficiencyCard
              key={i}
              {...feature}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(i)}
              colorClass={feature.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ParetoEfficiency;

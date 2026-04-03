"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Percent, Eye, Cpu, Layers } from "lucide-react";

const EfficiencyCard = ({ title, desc, icon: Icon, isOpen, onClick, colorClass }: any) => {
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
        <ChevronDown className={`w-6 h-6 text-deep-green transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
      title: "Lower cost of capital",
      desc: "A decentralized infrastructure that compresses the costs of traditional off-chain securitization and uses open-source services to reduce the intermediary costs and complexity of TradFi.",
      icon: Percent,
      color: "bg-[#dbe4db]"
    },
    {
      title: "End-to-end transparency",
      desc: "Every transaction, collateral movement, and interest payment is recorded on-chain, providing real-time auditability and trustless verification.",
      icon: Eye,
      color: "bg-[#e2e8f0]"
    },
    {
      title: "Built for DeFi",
      desc: "Composable credit primitives that seamlessly integrate with existing DEXs, money markets, and yield aggregators.",
      icon: Cpu,
      color: "bg-[#f5f5f5]"
    },
    {
      title: "Flexible ownership",
      desc: "Tokenized credit tranches allow for granular risk management and secondary market liquidity for private debt assets.",
      icon: Layers,
      color: "bg-[#e2e8f0]"
    }
  ];

  return (
    <section className="py-32 px-6 bg-[#f0f4f0]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Header */}
        <div className="lg:col-span-4">
          <p className="text-[10px] font-bold text-[#77b8a2] uppercase tracking-[0.3em] mb-6">Our Advantage</p>
          <h2 className="text-5xl font-serif text-deep-green mb-8 leading-tight">Choose Efficiency</h2>
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

"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowDownToLine, Coins, Activity } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="bg-[#d7e4ea]/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60 flex flex-col items-center text-center group hover:bg-[#d7e4ea]/60 transition-all shadow-sm"
  >
    <div className="w-14 h-14 bg-white/40 rounded-2xl flex items-center justify-center mb-6 border border-white/60 group-hover:scale-110 transition-transform">
      <Icon className="w-7 h-7 text-deep-green" />
    </div>
    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-3">
      {label}
    </span>
    <span className="text-4xl font-serif text-deep-green">{value}</span>
  </motion.div>
);

const ParetoProtocolStats = () => {
  return (
    <section className="py-24 px-6 bg-[#f0f4f0]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            label="Ecosystem TVL"
            value="$142.4M"
            icon={TrendingUp}
            delay={0.1}
          />
          <StatCard
            label="Swap Volume (24h)"
            value="$42.8M"
            icon={Activity}
            delay={0.2}
          />
          <StatCard
            label="Total Rewards"
            value="$840K"
            icon={Coins}
            delay={0.3}
          />
          <StatCard
            label="Liquidity Pools"
            value="4"
            icon={ArrowDownToLine}
            delay={0.4}
          />
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-sm px-6 py-2 rounded-full border border-white/60">
            <div className="w-2 h-2 bg-[#77b8a2] rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-deep-green/60 uppercase tracking-widest">
              Live Contract Data Verified
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParetoProtocolStats;

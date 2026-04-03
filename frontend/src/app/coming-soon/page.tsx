"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ParetoNav from "@/components/landing/ParetoNav";
import ParetoFooter from "@/components/landing/ParetoFooter";
import { ArrowLeft, Construction } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen bg-[#f0f4f0] flex flex-col">
      <ParetoNav />

      <div className="flex-1 flex items-center justify-center px-6 pt-32 pb-20">
        <div className="max-w-2xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12 flex justify-center"
          >
            <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center border border-white/80 shadow-sm">
              <Construction className="w-10 h-10 text-deep-green" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl md:text-6xl font-serif text-deep-green mb-8 leading-tight tracking-tight px-4"
          >
            Expanding the Ecosystem.
            <br />
            Coming Soon.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm md:text-base text-neutral-500 leading-relaxed font-serif tracking-wide mb-12 max-w-lg mx-auto px-6"
          >
            Our legal and engineering teams are finalizing the deployment of
            this module. Pareto is building a unified terminal to manage the
            entire lifecycle of your on-chain assets.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link href="/">
              <button className="group flex items-center gap-3 px-8 py-3 bg-white/60 backdrop-blur-sm border border-white/80 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] text-deep-green hover:bg-white/80 transition-all shadow-sm mx-auto">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Terminal
              </button>
            </Link>
          </motion.div>
        </div>
      </div>

      <ParetoFooter />
    </main>
  );
}

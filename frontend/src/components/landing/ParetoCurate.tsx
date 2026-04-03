"use client";

import React from "react";
import { motion } from "framer-motion";

const ParetoCurate = () => {
  return (
    <section className="py-32 px-6 bg-[#d9e4d9]/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Card */}
          <div className="lg:col-span-5 bg-[#dce6dc] rounded-[3rem] p-12 border border-black/10 relative overflow-hidden min-h-[650px] flex flex-col justify-between shadow-sm">
            <div className="relative z-10">
              <h2 className="text-6xl font-serif text-deep-green leading-tight mb-8">Curate</h2>
              <p className="text-sm text-neutral-600 leading-relaxed font-mono-inter uppercase tracking-wide max-w-xs">
                Leverage your underwriting expertise on-chain to enhance capital efficiency, mitigate counterparty risk, and elevate market transparency with institutional-grade credit structuring.
              </p>
            </div>

            {/* Illustration */}
            <div className="flex justify-center relative">
              {/* Decorative concentric circles behind illustration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-black/5 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-black/5 rounded-full"></div>
              
              <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                {/* 3D-ish Chart segments and coins illustration simplified */}
                <path d="M120 40C75.8 40 40 75.8 40 120C40 164.2 75.8 200 120 200C164.2 200 200 164.2 200 120" stroke="#203f34" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M120 120L40 120" stroke="#203f34" strokeWidth="1.5" strokeDasharray="4 4"/>
                <path d="M120 120V40" stroke="#203f34" strokeWidth="1.5" strokeDasharray="4 4"/>
                
                {/* Plus icons */}
                <path d="M60 100V120M50 110H70" stroke="#203f34" strokeWidth="2" strokeLinecap="round"/>
                <path d="M80 70V90M70 80H90" stroke="#203f34" strokeWidth="2" strokeLinecap="round"/>
                <path d="M50 70V90M40 80H60" stroke="#203f34" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                
                {/* Coins stack */}
                <ellipse cx="160" cy="140" rx="30" ry="10" fill="#dce6dc" stroke="#203f34" strokeWidth="1.5"/>
                <path d="M130 140V170C130 175.5 143.4 180 160 180C176.6 180 190 175.5 190 170V140" stroke="#203f34" strokeWidth="1.5"/>
                <path d="M130 150C130 155.5 143.4 160 160 160C176.6 160 190 155.5 190 150" stroke="#203f34" strokeWidth="1.5"/>
                <path d="M130 160C130 165.5 143.4 170 160 170C176.6 170 190 165.5 190 160" stroke="#203f34" strokeWidth="1.5"/>
              </svg>
            </div>

            <div className="flex justify-center mb-4">
              <button className="px-16 py-3 rounded-full border border-black/20 text-[11px] font-bold uppercase tracking-widest text-deep-green hover:bg-deep-green hover:text-white transition-all bg-white/20 backdrop-blur-sm">
                Open in App
              </button>
            </div>
          </div>

          {/* Right Process Steps */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24 pt-12">
            {[
              {
                num: "1",
                title: "Curator Onboarding",
                desc: "Curators undergo a comprehensive due diligence process before being authorized to manage a Credit Vault."
              },
              {
                num: "2",
                title: "Vault Configuration",
                desc: "Curators can set vault fees and earn from their curatorship."
              },
              {
                num: "3",
                title: "Curator App",
                desc: "Curators have access to a dedicated application that provides real-time visibility."
              },
              {
                num: "4",
                title: "Performance and Risk Reporting",
                desc: "Curators oversee the generation and distribution of reports on vault performance and risk exposures."
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col"
              >
                <div className="flex flex-col gap-8">
                  <h3 className="text-2xl font-serif text-deep-green">{step.num}. {step.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed font-mono-inter uppercase tracking-wide max-w-xs">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParetoCurate;

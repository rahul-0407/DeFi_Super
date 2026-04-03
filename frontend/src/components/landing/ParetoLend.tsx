"use client";

import React from "react";
import { motion } from "framer-motion";

const ParetoLend = () => {
  return (
    <section className="py-32 px-6 bg-transparent font-serif">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Illustration Section */}
          <div className="lg:col-span-5 bg-[#d7e4ea] backdrop-blur-md rounded-[3rem] p-12 border border-white/60 relative overflow-hidden min-h-[600px] flex flex-col justify-between">
            <div>
              <h2 className="text-5xl font-serif text-deep-green leading-tight mb-8">Lend</h2>
              <p className=" text-deep-green leading-relaxed text-xl tracking-wide max-w-xs">
                Expand your fixed-income portfolio with structured yield strategies tailored to diverse risk profiles. Self-onboard seamlessly via privacy-preserving, compliant KYC, so you can focus on optimizing returns.
              </p>
            </div>

            {/* Illustration Placeholder (SVG) */}
            <div className="flex justify-center my-12">
               <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M60 180H180V200C180 211 153 220 120 220C87 220 60 211 60 200V180Z" fill="#b1f748" fillOpacity="0.1" stroke="#4a5a4a" strokeWidth="1.5"/>
                  <path d="M60 160H180V180C180 191 153 200 120 200C87 200 60 191 60 180V160Z" fill="#b1f748" fillOpacity="0.15" stroke="#4a5a4a" strokeWidth="1.5"/>
                  <path d="M60 140H180V160C180 171 153 180 120 180C87 180 60 171 60 160V140Z" fill="#b1f748" fillOpacity="0.2" stroke="#4a5a4a" strokeWidth="1.5"/>
                  <circle cx="120" cy="120" r="40" stroke="#4a5a4a" strokeWidth="1.5" strokeDasharray="4 4"/>
                  <path d="M110 110L130 130M130 110L110 130" stroke="#4a5a4a" strokeWidth="2" strokeLinecap="round"/>
               </svg>
            </div>

            <div className="flex gap-4">
              <button className="px-8 py-3 rounded-full border border-neutral-900 text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-all">Open in App</button>
              <button className="px-8 py-3 rounded-full border border-neutral-900 text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-900 hover:text-white transition-all">Documents</button>
            </div>
          </div>

          {/* Right Process Steps */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-40 pt-16 mt-12">
            {[
              {
                num: "1",
                title: "Explore Credit Vaults",
                desc: "Each market is uniquely structured based on borrower profiles, supported assets, blockchain networks, and loan terms."
              },
              {
                num: "2",
                title: "Execute Loan Agreement",
                desc: "Formalize credit terms by signing a legally binding agreement that outlines borrower obligations and lender rights."
              },
              {
                num: "3",
                title: "Asset Deployment",
                desc: "Allocate assets to credit vaults, receive interest-bearing credit tokens in return, and use them across DeFi."
              },
              {
                num: "4",
                title: "Seamless KYC Verification",
                desc: "Access eligibility is verified through zk-proofed KYC, ensuring compliance and privacy."
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xl font-bold font-mono-inter italic">
                    {step.num}.
                  </span>
                  <h3 className="text-2xl font-serif text-deep-green">{step.title}</h3>
                </div>
                <p className="text-xl text-neutral-600 leading-relaxed font-serif tracking-wide">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParetoLend;

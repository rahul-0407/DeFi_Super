"use client";

import React from "react";
import { motion } from "framer-motion";

const ParetoBorrow = () => {
  return (
    <section className="py-32 px-6 bg-transparent font-serif">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Illustration Section */}
          <div className="lg:col-span-5 bg-[#dbdfe7] backdrop-blur-md rounded-[3rem] p-12 border border-white/60 relative overflow-hidden min-h-[600px] flex flex-col justify-between">
            <div>
              <h2 className="text-6xl font-serif text-deep-green leading-tight mb-8">Borrow</h2>
              <p className="text-xl text-neutral-500 leading-relaxed  tracking-wide max-w-xs">
                Streamline the creation and securitization of your credit - interest rates, lockup periods, withdrawal cycles, reserve ratios, risk-adjusted tranches: construct the credit line that works best for you.
              </p>
            </div>

            {/* Illustration Placeholder (SVG) */}
            <div className="flex justify-center my-12">
               <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M120 40L160 80L120 120L80 80L120 40Z" fill="#77b8a2" fillOpacity="0.1" stroke="#203f34" strokeWidth="1.5"/>
                  <path d="M120 80L160 120L120 160L80 120L120 80Z" fill="#77b8a2" fillOpacity="0.15" stroke="#203f34" strokeWidth="1.5"/>
                  <circle cx="120" cy="120" r="60" stroke="#203f34" strokeWidth="1" strokeDasharray="4 4"/>
                  <path d="M100 120H140M120 100V140" stroke="#203f34" strokeWidth="2" strokeLinecap="round"/>
               </svg>
            </div>

            <div className="flex gap-4">
              <button className="px-10 py-3 rounded-full border border-deep-green text-[11px] font-bold uppercase tracking-widest hover:bg-deep-green hover:text-white transition-all">Open in App</button>
            </div>
          </div>

          {/* Right Process Steps */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-40 pt-12 mt-10">
            {[
              {
                num: "1",
                title: "Get Onboarded",
                desc: "Prospective borrowers undergo a due diligence process before gaining access to a credit vault."
              },
              {
                num: "2",
                title: "Vault Configuration",
                desc: "Borrowers set key parameters like loan duration, interest rate model, early exit terms, tranche structure, preferred KYC processes, and utilize an available legal framework."
              },
              {
                num: "3",
                title: "Yield Generation",
                desc: "Once a loan cycle commences, borrowers receive funds directly into their designated wallet."
              },
              {
                num: "4",
                title: "Interest Payment",
                desc: "Credit Vaults automate accounting. Borrowers must pay interest at the end of each cycle; unclaimed interest returns to the lending pool."
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
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-xl font-bold font-mono-inter italic text-[#77b8a2]">
                    {step.num}.
                  </span>
                  <div className="flex flex-col gap-6">
                    <h3 className="text-2xl font-serif text-deep-green">{step.title}</h3>
                    <p className="text-xl text-neutral-600 leading-relaxed  tracking-wide">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParetoBorrow;

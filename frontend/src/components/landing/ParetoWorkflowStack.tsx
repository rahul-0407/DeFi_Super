"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const workflowData = [
  {
    id: "lend",
    title: "Lend",
    color: "bg-[#d7e4ea]",
    desc: "Expand your fixed-income portfolio with structured yield strategies tailored to diverse risk profiles. Self-onboard seamlessly via privacy-preserving, compliant KYC, so you can focus on optimizing returns.",
    buttons: [
      { label: "Open in App", theme: "dark" },
      { label: "Documents", theme: "outline" }
    ],
    steps: [
      { num: "1", title: "Explore Credit Vaults", desc: "Each market is uniquely structured based on borrower profiles, supported assets, blockchain networks, and loan terms." },
      { num: "2", title: "Execute Loan Agreement", desc: "Formalize credit terms by signing a legally binding agreement that outlines borrower obligations and lender rights." },
      { num: "3", title: "Asset Deployment", desc: "Allocate assets to credit vaults, receive interest-bearing credit tokens in return, and use them across DeFi." },
      { num: "4", title: "Seamless KYC Verification", desc: "Access eligibility is verified through zk-proofed KYC, ensuring compliance and privacy." }
    ],
    illustration: (
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 180H180V200C180 211 153 220 120 220C87 220 60 211 60 200V180Z" fill="#b1f748" fillOpacity="0.1" stroke="#4a5a4a" strokeWidth="1.5"/>
        <path d="M60 160H180V180C180 191 153 200 120 200C87 200 60 191 60 180V160Z" fill="#b1f748" fillOpacity="0.15" stroke="#4a5a4a" strokeWidth="1.5"/>
        <path d="M60 140H180V160C180 171 153 180 120 180C87 180 60 171 60 160V140Z" fill="#b1f748" fillOpacity="0.2" stroke="#4a5a4a" strokeWidth="1.5"/>
        <circle cx="120" cy="120" r="40" stroke="#4a5a4a" strokeWidth="1.5" strokeDasharray="4 4"/>
        <path d="M110 110L130 130M130 110L110 130" stroke="#4a5a4a" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: "borrow",
    title: "Borrow",
    color: "bg-[#dbdfe7]",
    desc: "Streamline the creation and securitization of your credit - interest rates, lockup periods, withdrawal cycles, reserve ratios, risk-adjusted tranches: construct the credit line that works best for you.",
    buttons: [
      { label: "Open in App", theme: "dark" }
    ],
    steps: [
      { num: "1", title: "Get Onboarded", desc: "Prospective borrowers undergo a due diligence process before gaining access to a credit vault." },
      { num: "2", title: "Vault Configuration", desc: "Borrowers set key parameters like loan duration, interest rate model, early exit terms, tranche structure, preferred KYC processes, and utilize an available legal framework." },
      { num: "3", title: "Yield Generation", desc: "Once a loan cycle commences, borrowers receive funds directly into their designated wallet." },
      { num: "4", title: "Interest Payment", desc: "Credit Vaults automate accounting. Borrowers must pay interest at the end of each cycle; unclaimed interest returns to the lending pool." }
    ],
    illustration: (
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M120 40L160 80L120 120L80 80L120 40Z" fill="#77b8a2" fillOpacity="0.1" stroke="#203f34" strokeWidth="1.5"/>
        <path d="M120 80L160 120L120 160L80 120L120 80Z" fill="#77b8a2" fillOpacity="0.15" stroke="#203f34" strokeWidth="1.5"/>
        <circle cx="120" cy="120" r="60" stroke="#203f34" strokeWidth="1" strokeDasharray="4 4"/>
        <path d="M100 120H140M120 100V140" stroke="#203f34" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: "curate",
    title: "Curate",
    color: "bg-[#dce6dc]",
    desc: "Leverage your underwriting expertise on-chain to enhance capital efficiency, mitigate counterparty risk, and elevate market transparency with institutional-grade credit structuring.",
    buttons: [
      { label: "Open in App", theme: "dark" }
    ],
    steps: [
      { num: "1", title: "Curator Onboarding", desc: "Curators undergo a comprehensive due diligence process before being authorized to manage a Credit Vault." },
      { num: "2", title: "Vault Configuration", desc: "Curators can set vault fees and earn from their curatorship." },
      { num: "3", title: "Curator App", desc: "Curators have access to a dedicated application that provides real-time visibility." },
      { num: "4", title: "Performance and Risk Reporting", desc: "Curators oversee the generation and distribution of reports on vault performance and risk exposures." }
    ],
    illustration: (
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M120 40C75.8 40 40 75.8 40 120C40 164.2 75.8 200 120 200C164.2 200 200 164.2 200 120" stroke="#203f34" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M120 120L40 120" stroke="#203f34" strokeWidth="1.5" strokeDasharray="4 4"/>
        <path d="M120 120V40" stroke="#203f34" strokeWidth="1.5" strokeDasharray="4 4"/>
        <path d="M60 100V120M50 110H70" stroke="#203f34" strokeWidth="2" strokeLinecap="round"/>
        <ellipse cx="160" cy="140" rx="30" ry="10" fill="#dce6dc" stroke="#203f34" strokeWidth="1.5"/>
        <path d="M130 140V170C130 175.5 143.4 180 160 180C176.6 180 190 175.5 190 170V140" stroke="#203f34" strokeWidth="1.5"/>
      </svg>
    )
  }
];

const ParetoWorkflowStack = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Snappy, responsive spring for 1:1 synchronization
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001
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
                  { exitStart: 0.15, exitEnd: 0.40 },
                  { enterStart: 0.15, enterEnd: 0.40, exitStart: 0.60, exitEnd: 0.85 },
                  { enterStart: 0.60, enterEnd: 0.85 }
                ];
                
                const r = ranges[index];
                
                // Opacity logic
                const opacity = useTransform(
                  smoothProgress, 
                  index === 0 ? [0, r.exitStart!, r.exitEnd!] : 
                  index === 2 ? [r.enterStart!, r.enterEnd!, 1.0] : 
                  [r.enterStart!, r.enterEnd!, r.exitStart!, r.exitEnd!],
                  index === 0 ? [1, 1, 0] : 
                  index === 2 ? [0, 1, 1] : 
                  [0, 1, 1, 0]
                );

                // Scale logic
                const scale = useTransform(
                  smoothProgress,
                  [r.exitStart || 0.85, r.exitEnd || 1],
                  [1, 0.9]
                );

                // Y logic - Coming from 600px below matches the 0.25 progress range (1:1 feel)
                const y = useTransform(
                   smoothProgress,
                   [r.enterStart || 0, r.enterEnd || 0.4],
                   [600, 0]
                );
                
                return (
                  <motion.div
                    key={item.id}
                    style={{ 
                      scale: index < 2 ? scale : 1, 
                      opacity, 
                      y: index === 0 ? 0 : y,
                      zIndex: workflowData.length - index 
                    }}
                    className={`absolute inset-0 max-w-lg mx-auto ${item.color} backdrop-blur-md rounded-[3rem] p-12 border border-white/60 shadow-xl flex flex-col justify-between h-[700px]`}
                  >
                    <div className="flex flex-col gap-6">
                      <h2 className="text-6xl font-serif text-deep-green leading-tight">{item.title}</h2>
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
                         <button 
                           key={bi}
                           className="px-8 py-3 rounded-full border border-neutral-900 text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-neutral-900 hover:text-white"
                         >
                           {btn.label}
                         </button>
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
                  { exitStart: 0.15, exitEnd: 0.40 },
                  { enterStart: 0.15, enterEnd: 0.40, exitStart: 0.60, exitEnd: 0.85 },
                  { enterStart: 0.60, enterEnd: 0.85 }
                ];
                const r = ranges[index];

                const opacity = useTransform(
                  smoothProgress, 
                  index === 0 ? [0, r.exitStart!, r.exitEnd!] : 
                  index === 2 ? [r.enterStart!, r.enterEnd!, 1.0] : 
                  [r.enterStart!, r.enterEnd!, r.exitStart!, r.exitEnd!],
                  index === 0 ? [1, 1, 0] : 
                  index === 2 ? [0, 1, 1] : 
                  [0, 1, 1, 0]
                );

                const y = useTransform(
                  smoothProgress, 
                  index === 0 ? [0, r.exitStart!, r.exitEnd!] : 
                  index === 2 ? [r.enterStart!, r.enterEnd!, 1.0] : 
                  [r.enterStart!, r.enterEnd!, r.exitStart!, r.exitEnd!],
                  index === 0 ? [0, 0, -200] : 
                  index === 2 ? [200, 0, 0] : 
                  [200, 0, 0, -200]
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
                               <span className="text-xl font-bold font-mono-inter italic text-[#77b8a2]">{step.num}.</span>
                               <h3 className="text-2xl font-serif text-deep-green">{step.title}</h3>
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

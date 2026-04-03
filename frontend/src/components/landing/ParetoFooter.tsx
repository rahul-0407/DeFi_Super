"use client";

import React from "react";
import Link from "next/link";

const ParetoFooter = () => {
  return (
    <footer className="bg-on-background text-white pt-32 pb-12 px-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between mb-32 gap-16">
          {/* Logo & Newsletter */}
          <div className="lg:w-1/3">
            <div className="flex items-center gap-3 mb-16">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#b1f748" strokeWidth="2" opacity="0.4"/>
                <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16" stroke="#b1f748" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="3" fill="#b1f748"/>
              </svg>
              <span className="text-3xl font-bold tracking-tight">Pareto</span>
            </div>

            <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-6">Subscribe to our newsletter</p>
            <div className="flex items-center border-b border-neutral-700 pb-4 max-w-sm">
              <input
                type="email"
                placeholder="Email"
                className="bg-transparent border-none focus:ring-0 text-xl font-serif text-white placeholder:text-neutral-700 w-full"
              />
              <button className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 hover:text-secondary-fixed transition-colors ml-4">Subscribe</button>
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-12">
            <div>
              <h5 className="text-neutral-600 text-[11px] font-bold uppercase tracking-[0.2em] mb-10">Resources</h5>
              <ul className="space-y-6 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Brand Kit</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Governance</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-neutral-600 text-[11px] font-bold uppercase tracking-[0.2em] mb-10">Products</h5>
              <ul className="space-y-6 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                <li><Link href="#" className="hover:text-white transition-colors">FAS_USDC</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors text-secondary-fixed">BAS_USDT</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAL_USDC</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Middle Line & Icons */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-neutral-800 gap-8 mb-20">
          <div className="flex gap-4">
            {['X', 'Dis', 'Tel', 'Li', 'Op', 'W'].map((icon, i) => (
              <div key={i} className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-500 hover:border-neutral-600 hover:text-white transition-all cursor-pointer">
                {icon}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-[11px] font-bold uppercase tracking-widest text-neutral-500">
            <Link href="#" className="hover:text-white transition-colors">IPFS app</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="text-neutral-600 text-[10px] font-medium leading-relaxed max-w-7xl font-mono-inter uppercase tracking-tight opacity-60">
          All content available on this Website is general in nature, not directed or tailored to any particular person, and is for informational purposes only. Neither the Website nor any of its content is offered as investment advice and should not be deemed as investment advice or a recommendation to purchase or sell any specific security. The information contained herein reflects the opinions and projections of Pareto as of the date hereof, which are subject to change without notice at any time. Pareto does not represent that any opinion or projection will be realized. Neither Pareto nor any of its advisers, officers, directors, or affiliates represents that the information presented on this Website is accurate, current, or complete, and such information is subject to change without notice. Any performance information must be considered in conjunction with applicable disclosures. Past performance is not a guarantee of future results. Neither this Website nor its contents should be construed as legal, tax, or other advice. Individuals are urged to consult with their own tax or legal advisers before entering into any advisory contract.
        </div>
      </div>
    </footer>
  );
};

export default ParetoFooter;

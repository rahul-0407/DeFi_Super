"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md">
    <div className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2 text-xl font-light tracking-tighter text-neutral-900">
        <span className="font-extrabold tracking-tight">purefi</span>
      </div>
      <div className="hidden md:flex items-center gap-8 font-medium text-sm tracking-tight text-neutral-600">
        <Link className="text-neutral-900 font-semibold border-b-2 border-neutral-900 pb-1" href="#">Products</Link>
        <Link className="hover:text-neutral-900 transition-colors" href="#">UFI Token</Link>
        <Link className="hover:text-neutral-900 transition-colors" href="#">Team</Link>
        <Link className="hover:text-neutral-900 transition-colors" href="#">Blog</Link>
        <Link className="hover:text-neutral-900 transition-colors" href="#">Wiki</Link>
      </div>
      <Link href="/login" className="flex items-center gap-1">
        <button className="px-6 py-2.5 rounded-l-full border-[1.5px] border-neutral-900 border-r-0 text-sm font-semibold hover:scale-[1.02] transition-transform duration-200 active:scale-95 text-neutral-900">
          Launch app
        </button>
        <div className="w-10 h-10 rounded-full border-[1.5px] border-neutral-900 flex items-center justify-center hover:scale-[1.02] transition-transform duration-200 active:scale-95">
          <span className="material-symbols-outlined text-neutral-900 text-lg" style={{ fontVariationSettings: "'wght' 400" }}>north_east</span>
        </div>
      </Link>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative min-h-screen flex items-center pt-32 lg:pt-48 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
    <div className="relative z-10 flex flex-col items-center text-center w-full">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl md:text-[72px] font-light tracking-[-0.03em] leading-[1.1] mb-8 text-neutral-900"
      >
        The Gateway<br/>
        <span className="text-neutral-900/40">to Institutional Capital</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-xl text-lg text-slate-500 font-normal leading-relaxed mb-12"
      >
        The sole gateway for institutional DeFi access. Join us to transform your institution's financial landscape.
      </motion.p>
      
      <div className="flex items-center gap-1 group">
        <Link href="/login" className="flex items-center gap-0">
          <button className="bg-neutral-900 text-white px-10 py-4 rounded-l-full font-bold text-lg hover:bg-neutral-800 transition-all active:scale-95">
            Launch app
          </button>
          <div className="bg-neutral-900 w-12 h-12 rounded-full flex items-center justify-center hover:bg-neutral-800 transition-all active:scale-95">
            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'wght' 400" }}>north_east</span>
          </div>
        </Link>
      </div>
    </div>

    {/* Decorative Blades */}
    <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-full h-[600px] flex justify-center pointer-events-none">
      <motion.div 
        animate={{ rotate: [-25, -20, -25], x: [-160, -150, -160] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="ribbon-blade absolute w-[400px] h-[100px] bg-[#b8ff4f] -translate-x-40" 
      />
      <motion.div 
        animate={{ rotate: [15, 20, 15], x: [80, 90, 80] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="ribbon-blade absolute w-[450px] h-[120px] bg-[#7fffee] translate-x-20 translate-y-20" 
      />
      <motion.div 
        animate={{ rotate: [-10, -5, -10] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="ribbon-blade absolute w-[380px] h-[90px] bg-[#c4b5fd] -translate-x-10 translate-y-40" 
      />
    </div>

    {/* Exchange Cards */}
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 glass-card rounded-t-2xl overflow-hidden">
          {[
            { name: "Robic Exchange", desc: "Platform that make easy connection", href: "#" },
            { name: "Pancakeswap", desc: "Provides opportunities for users.", href: "#" },
            { name: "Quickswap", desc: "Users can benefit from quick", href: "#" }
          ].map((exchange, idx) => (
            <div key={idx} className={`p-8 flex flex-col gap-4 ${idx < 2 ? 'md:border-r border-neutral-200/30' : ''} ${idx > 0 ? 'border-t md:border-t-0 border-neutral-200/30' : ''}`}>
              <h3 className="text-xl font-semibold text-neutral-900">{exchange.name}</h3>
              <p className="text-sm text-neutral-500">{exchange.desc}</p>
              <Link href={exchange.href} className="flex items-center justify-between mt-auto pt-4">
                <span className="text-sm font-medium text-neutral-900">Get Started</span>
                <div className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-neutral-700 text-sm" style={{ fontVariationSettings: "'wght' 400" }}>north_east</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const BentoGrid = () => (
  <section className="max-w-7xl mx-auto px-8 py-32">
    <div className="text-center mb-20">
      <h2 className="text-5xl font-light mb-6 text-neutral-900">The PureFi Ecosystem</h2>
      <div className="w-24 h-1 bg-neutral-900 mx-auto rounded-full opacity-10"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* AML Risk Score */}
      <motion.div whileHover={{ y: -5 }} className="md:col-span-8 glass-card rounded-[2rem] p-10 flex flex-col justify-between group cursor-pointer transition-all hover:bg-white/60">
        <div>
          <span className="material-symbols-outlined text-4xl mb-6 text-neutral-700">security_update_good</span>
          <h3 className="text-3xl font-light mb-4 text-neutral-900">AML Risk Score</h3>
          <p className="text-slate-600 max-w-md">Real-time wallet health monitoring and malicious actor detection using proprietary AI models.</p>
        </div>
        <div className="mt-12 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-slate-200/50 rounded-full text-xs font-semibold text-neutral-700">AI POWERED</span>
            <span className="px-3 py-1 bg-slate-200/50 rounded-full text-xs font-semibold text-neutral-700">REAL-TIME</span>
          </div>
          <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform text-neutral-900">arrow_forward</span>
        </div>
      </motion.div>
      {/* KYC Module */}
      <motion.div whileHover={{ y: -5 }} className="md:col-span-4 bg-neutral-900 rounded-[2rem] p-10 flex flex-col justify-between text-white overflow-hidden relative">
        <div className="relative z-10">
          <span className="material-symbols-outlined text-4xl mb-6 text-[#b1f748]">verified_user</span>
          <h3 className="text-3xl font-light mb-4">KYC Module</h3>
          <p className="text-slate-400">On-chain identity verification that maintains user privacy via ZK-proofs.</p>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#b1f748]/20 blur-3xl"></div>
      </motion.div>
      {/* Token Analytics */}
      <motion.div whileHover={{ y: -5 }} className="md:col-span-4 glass-card rounded-[2rem] p-10 flex flex-col justify-between">
        <div>
          <span className="material-symbols-outlined text-4xl mb-6 text-[#5f5292]">analytics</span>
          <h3 className="text-2xl font-light mb-4 text-neutral-900">Token Analytics</h3>
          <p className="text-slate-600 text-sm">Deep dive into token distributions, liquidity pools, and smart contract vulnerabilities.</p>
        </div>
      </motion.div>
      {/* Institutional Gateway */}
      <motion.div whileHover={{ y: -5 }} className="md:col-span-8 glass-card rounded-[2rem] p-10 flex items-center gap-12">
        <div className="flex-1">
          <h3 className="text-2xl font-light mb-4 text-neutral-900">Institutional Gateway</h3>
          <p className="text-slate-600 mb-6 text-sm">Custom compliance workflows for VCs, hedge funds, and family offices entering DeFi.</p>
          <button className="text-neutral-900 font-semibold flex items-center gap-2 group">
            Explore Solutions <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
        <div className="hidden lg:block w-48 h-32 bg-slate-200/50 rounded-2xl flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-5xl opacity-20">account_balance</span>
        </div>
      </motion.div>
    </div>
  </section>
);

const ComplianceMonitoring = () => (
  <section className="bg-gray-200/50 py-32">
    <div className="max-w-7xl mx-auto px-8">
      <div className="flex flex-col lg:flex-row gap-20 items-center">
        <div className="flex-1 space-y-12">
          <h2 className="text-5xl font-light leading-tight text-neutral-900">Interactive <br/>Compliance Monitoring</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-[#b1f748] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-neutral-700">bar_chart_4_bars</span>
              </div>
              <div>
                <h4 className="text-xl font-medium mb-2 text-neutral-900">Live Risk Feed</h4>
                <p className="text-slate-600">Continuous monitoring of all major EVM chains for suspicious transactions.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-[#c3b4fc] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-neutral-700">hub</span>
              </div>
              <div>
                <h4 className="text-xl font-medium mb-2 text-neutral-900">Network Mapping</h4>
                <p className="text-slate-600">Visualize wallet connections and identify high-risk clusters instantly.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full">
          <div className="glass-card rounded-[2rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h5 className="font-semibold text-lg text-neutral-900">Network Health</h5>
              <div className="flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs uppercase font-bold tracking-widest opacity-60">Live</span>
              </div>
            </div>
            <div className="h-64 flex items-end gap-3 px-4">
               {[40, 70, 55, 90, 45, 60].map((h, i) => (
                 <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className={`w-full rounded-t-full transition-all hover:opacity-80 ${
                      i % 3 === 0 ? "bg-slate-300" : i % 3 === 1 ? "bg-[#b1f748]" : "bg-[#c3b4fc]"
                    }`}
                 />
               ))}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-neutral-200/50">
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Total Scanned</p>
                <p className="text-xl font-medium text-neutral-900">1.2M+</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Threats Blocked</p>
                <p className="text-xl font-medium text-neutral-900">42.5k</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Avg Score</p>
                <p className="text-xl font-medium text-neutral-900">84/100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const UfiToken = () => (
  <section className="max-w-7xl mx-auto px-8 py-32 overflow-hidden relative">
    <div className="absolute bottom-0 right-[20%] w-[400px] h-[400px] bg-[#b1f748]/80 blur-[100px] rounded-full z-[-15]"></div>
    <div className="flex flex-col md:flex-row items-center gap-16">
      <div className="flex-1 order-2 md:order-1">
        <div className="glass-card rounded-[2.5rem] p-10 max-w-md mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <span className="material-symbols-outlined text-4xl opacity-10">toll</span>
          </div>
          <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-12 opacity-40">Governance Token</h4>
          <div className="mb-12">
            <p className="text-4xl font-light mb-2 text-neutral-900">$UFI Token</p>
            <p className="text-6xl font-bold tracking-tighter text-neutral-900">$1.24 <span className="text-sm font-medium text-green-500 tracking-normal ml-2">+4.2%</span></p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-neutral-200/50">
              <span className="text-sm opacity-60">Staking APY</span>
              <span className="font-semibold text-neutral-900">12.4%</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-neutral-200/50">
              <span className="text-sm opacity-60">Circulating Supply</span>
              <span className="font-semibold text-neutral-900">45.2M</span>
            </div>
          </div>
          <button className="w-full bg-neutral-900 text-white rounded-full py-4 mt-12 font-semibold hover:scale-[1.02] transition-transform">Get $UFI Now</button>
        </div>
      </div>
      <div className="flex-1 order-1 md:order-2">
        <h2 className="text-5xl font-light mb-8 text-neutral-900">Fueling the Protocol</h2>
        <p className="text-xl text-slate-600 leading-relaxed mb-10">
          The $UFI token is the backbone of the PureFi ecosystem. Holders benefit from protocol revenue sharing, discounted service fees, and governance voting rights.
        </p>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h5 className="text-lg font-bold mb-2 text-neutral-900">Discounted Fees</h5>
            <p className="text-sm text-slate-500">Up to 40% reduction on compliance reports for token holders.</p>
          </div>
          <div>
            <h5 className="text-lg font-bold mb-2 text-neutral-900">DAO Governance</h5>
            <p className="text-sm text-slate-500">Vote on new chain integrations and protocol parameters.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Roadmap = () => (
  <section className="py-32 relative overflow-hidden lg:min-h-screen flex items-center">
    <div className="max-w-screen-2xl mx-auto px-6 relative z-10 w-full">
      {/* Header */}
      <div className="mb-16">
        <h2 className="text-7xl font-light text-neutral-900 mb-6">Our Roadmap</h2>
        <p className="text-lg text-neutral-500 max-w-2xl ml-auto md:ml-48 text-right md:text-left">
          Available on BNB Smart Chain, Ethereum, Polygon and<br />NEAR Protocol
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-13">
        {/* Left Abstract Element */}
        <div className="w-full lg:w-1/4 flex flex-col items-center lg:items-start pt-12">
          <div className="iridescent-star w-32 h-32 relative mb-24">
            <div className="absolute inset-0 border border-white/20 rounded-full blur-[2px]"></div>
          </div>
          {/* Footer Read More at bottom left */}
          <div className="hidden lg:flex items-center gap-3 mt-auto">
            <button className="px-8 py-3 rounded-full border border-neutral-400 text-sm font-medium text-neutral-800 hover:bg-white/20 transition-all">Read more</button>
            <div className="w-12 h-12 rounded-full border border-neutral-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-neutral-800 text-lg">north_east</span>
            </div>
          </div>
        </div>
        {/* Roadmap Grid (3x2 format as in visual) */}
        <div className="w-full lg:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {[
              {
                title: "PureFi User Portal",
                desc: "Easy to integrate hosted AML & KYC integration for a streamlined and frictionless experience.",
                tags: ["Popup Window", "Standalone Portal"]
              },
              {
                title: "PureFi Suite",
                desc: "Full-featured suite of Web3 tools for real-time protection against malicious actors.",
                tags: ["Phishing Protection", "Malicious Address Protection"]
              },
              {
                title: "PureFi Report",
                desc: "Reporting solution for malicious addresses, phishing, and scams.",
                tags: ["UFI Reward Incentives", "Standalone Portal"]
              },
              {
                title: "PureFi SDK",
                desc: "New iteration of our development kit for an easy integration of our AML & KYC solutions.",
                tags: ["Popup Window", "Account Abstraction Support"]
              },
              {
                title: "PureFi AML",
                desc: "New AML data provider, making it more accessible and decentralized.",
                tags: ["Popup Window", "Standalone Portal"]
              },
              {
                title: "PureFi Framework",
                desc: "Expansion to ZK-Rollups, that will play a crucial role in the future of blockchain.",
                tags: ["Polygon zkEVM", "zkSync Era"]
              }
            ].map((item, idx) => (
              <div key={idx} className={`glass-roadmap-card  p-8 flex flex-col h-[320px] transition-all hover:scale-[1.02] ${idx % 2 === 1 ? 'bg-white!' : ''}`}>
                <h3 className="text-2xl font-semibold mb-4 text-neutral-800">{item.title}</h3>
                <button className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 self-start text-neutral-500  ${idx % 2 === 1 ? 'bg-gray-200!' : 'bg-white!'}`}>Release</button>
                <p className="text-sm text-neutral-600 mb-4 leading-relaxed">{item.desc}</p>
                <ul className="space-y-3 mt-6">
                  {item.tags.map((tag, tidx) => (
                    <li key={tidx} className="flex items-center gap-3 text-sm text-neutral-700">
                      <div className="status-dot"></div> {tag}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Mobile Footer Read More */}
      <div className="flex lg:hidden items-center justify-center gap-3 mt-12 px-8">
        <button className="px-8 py-3 rounded-full border border-neutral-400 text-sm font-medium text-neutral-800 hover:bg-white/20 transition-all">Read more</button>
        <div className="w-12 h-12 rounded-full border border-neutral-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-neutral-800 text-lg">north_east</span>
        </div>
      </div>
    </div>
  </section>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is the PureFi Super App?",
      a: "The PureFi Super App is a comprehensive DeFi platform that integrates AML risk scoring, KYC verification, and access to elite institutional capital in one seamless interface."
    },
    {
      q: "How does the AML risk scoring work?",
      a: "Our proprietary AI models scan on-chain data in real-time to provide a safety score for any wallet, helping you avoid interacting with malicious actors."
    },
    {
      q: "Which DeFi protocols can I access through the app?",
      a: "Currently, we support core functionalities like Swap, Lending, and Staking across major EVM chains including Ethereum, Polygon, and BSC."
    },
    {
      q: "Is my personal information safe with ZK-KYC?",
      a: "Absolutely. We use Zero-Knowledge Proofs to verify your identity. This means you can prove you're a verified user without ever revealing your private documents on-chain."
    },
    {
      q: "How can I earn rewards with the $UFI token?",
      a: "$UFI holders can stake their tokens to earn protocol fees, participate in DAO governance, and enjoy significant discounts on institutional compliance reports."
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-8">
        <div className="flex flex-col items-center mb-16">
          <span className="px-6 py-1 rounded-full border border-neutral-200 text-xs font-medium uppercase tracking-widest text-neutral-500 mb-6">FAQs</span>
          <h2 className="text-6xl font-light text-neutral-900">Have any question</h2>
        </div>
      <div className="space-y-0">
        {faqs.map((faq, i) => (
          <div 
            key={i} 
            className="border-b border-neutral-300 py-8 flex flex-col group cursor-pointer transition-colors hover:bg-neutral-50/50 px-4 -mx-4"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <div className="flex justify-between items-center w-full">
              <h6 className="text-xl text-neutral-800 font-normal">{faq.q}</h6>
              <motion.span 
                animate={{ rotate: openIndex === i ? 45 : 0 }}
                className="material-symbols-outlined text-neutral-400 group-hover:text-neutral-900 transition-colors"
                style={{ fontVariationSettings: "'wght' 300" }}
              >
                add
              </motion.span>
            </div>
            <motion.div
              initial={false}
              animate={{ 
                height: openIndex === i ? "auto" : 0,
                opacity: openIndex === i ? 1 : 0,
                marginTop: openIndex === i ? 16 : 0
              }}
              transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="overflow-hidden"
            >
              <p className="text-neutral-500 leading-relaxed max-w-2xl text-lg">
                {faq.a}
              </p>
            </motion.div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="pt-32 pb-16">
    <div className="max-w-7xl mx-auto px-8">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-32">
        {/* Newsletter */}
        <div className="w-full lg:w-1/3">
          <h3 className="text-4xl font-light text-neutral-900 mb-8">Join our newsletter</h3>
          <div className="relative max-w-sm">
            <div className="flex items-center border border-neutral-200 rounded-full p-1 bg-white/50 backdrop-blur-sm">
              <input className="w-full bg-transparent border-none px-6 py-3 focus:ring-0 text-sm placeholder:text-neutral-400" placeholder="Enter your mail" type="email" />
              <button className="bg-on-background text-white rounded-full px-6 py-3 text-[10px] font-bold tracking-widest hover:bg-black transition-colors shrink-0">JOIN NOW</button>
            </div>
          </div>
        </div>
        {/* Links */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
          <div>
            <h5 className="text-sm font-bold text-neutral-900 mb-6">Privacy Policy</h5>
            <ul className="space-y-4 text-sm text-neutral-500 font-medium">
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Overview</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">ETH2 Staking</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Rocket Pool Staking</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">REth Token</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-bold text-neutral-900 mb-6">Disclaimer</h5>
            <ul className="space-y-4 text-sm text-neutral-500 font-medium">
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">How It Works</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Local Nodes</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Cloud Nodes</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">REth Token</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-bold text-neutral-900 mb-6">Cookie Policy</h5>
            <ul className="space-y-4 text-sm text-neutral-500 font-medium">
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Troduction</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">ETH2 Staking</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Explainer Series</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 pt-12 border-t border-neutral-200/50">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#7fffee] via-[#b8ff4f] to-[#c4b5fd]"></div>
            <span className="text-2xl font-bold tracking-tighter text-neutral-900">purefi</span>
          </div>
          <p className="text-xs text-neutral-400 font-medium">Easy to integrate hosted AML & KYC integration.</p>
        </div>
        {/* Socials */}
        <div className="flex gap-3">
          {[
            { icon: "brand_family", href: "#" },
            { icon: "send", href: "#" },
            { icon: "work", href: "#" },
            { icon: "terminal", href: "#" },
            { icon: "forum", href: "#" },
            { icon: "article", href: "#" },
            { icon: "play_circle", href: "#" }
          ].map((social, i) => (
            <Link key={i} className="w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-md text-neutral-900 hover:bg-neutral-50 transition-colors" href={social.href}>
              <i className="material-symbols-outlined text-lg">{social.icon}</i>
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default function PureFiV2() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Hero />
      <BentoGrid />
      <ComplianceMonitoring />
      <UfiToken />
      <div className="roadmap-gradient-bg">
        <Roadmap />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}

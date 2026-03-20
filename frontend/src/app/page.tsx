"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

/* ─────────────── NAVBAR ─────────────── */
const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-md">
    <div className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-2.5 text-xl font-light tracking-tighter text-neutral-900">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7fffee] via-[#b8ff4f] to-[#c4b5fd]"></div>
        <span className="font-extrabold tracking-tight">DeFi Super</span>
      </div>
      <div className="hidden md:flex items-center gap-8 font-medium text-sm tracking-tight text-neutral-600">
        <Link className="text-neutral-900 font-semibold border-b-2 border-neutral-900 pb-1" href="#features">Features</Link>
        <Link className="hover:text-neutral-900 transition-colors" href="#protocol">Protocol</Link>
        <Link className="hover:text-neutral-900 transition-colors" href="#ecosystem">Ecosystem</Link>
        <Link className="hover:text-neutral-900 transition-colors" href="#faq">FAQ</Link>
      </div>
      <Link href="/login" className="flex items-center gap-1">
        <button className="px-6 py-2.5 rounded-full border-[1.5px] border-neutral-900 text-sm font-semibold hover:scale-[1.02] transition-transform duration-200 active:scale-95 text-neutral-900">
          Launch app
        </button>
        <div className="w-10 h-10 rounded-full border-[1.5px] border-neutral-900 flex items-center justify-center hover:scale-[1.02] transition-transform duration-200 active:scale-95">
          <span className="material-symbols-outlined text-neutral-900 text-lg" style={{ fontVariationSettings: "'wght' 400" }}>north_east</span>
        </div>
      </Link>
    </div>
  </nav>
);

/* ─────────────── HERO ─────────────── */
const Hero = () => (
  <section className="relative min-h-screen flex items-center pt-32 lg:pt-48 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
    <div className="relative z-10 flex flex-col items-center text-center w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="px-5 py-1.5 rounded-full border border-neutral-300 text-xs font-bold uppercase tracking-[0.15em] text-neutral-500 mb-8"
      >
        Live on Sepolia Testnet
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl md:text-[72px] font-light tracking-[-0.03em] leading-[1.1] mb-8 text-neutral-900"
      >
        Your All-in-One<br/>
        <span className="text-neutral-900/40">DeFi Command Center</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-xl text-lg text-slate-500 font-normal leading-relaxed mb-12"
      >
        Swap tokens, lend &amp; borrow assets, stake for rewards, and track protocol analytics — all from a single powerful dashboard.
      </motion.p>

      <div className="flex items-center gap-1">
        <Link href="/login">
          <button className="bg-neutral-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-neutral-800 transition-all active:scale-95">
            Launch app
          </button>
        </Link>
        <Link href="/login" className="bg-neutral-900 w-15 h-15 rounded-full flex items-center justify-center hover:bg-neutral-800 transition-all active:scale-95">
          <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'wght' 400" }}>north_east</span>
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

    {/* Protocol Summary Cards */}
    <div className="absolute bottom-0 left-0 right-0 z-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 glass-card rounded-t-2xl overflow-hidden">
          {[
            { icon: "account_balance_wallet", label: "Total Value Locked", value: "$2.4M+", desc: "Across all protocol pools" },
            { icon: "swap_horiz", label: "Total Swaps Executed", value: "18,500+", desc: "Token swaps processed" },
            { icon: "group", label: "Active Stakers", value: "1,200+", desc: "Earning DEFI rewards daily" }
          ].map((stat, idx) => (
            <div key={idx} className={`p-8 flex flex-col gap-3 ${idx < 2 ? 'md:border-r border-neutral-200/30' : ''} ${idx > 0 ? 'border-t md:border-t-0 border-neutral-200/30' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-neutral-700">{stat.icon}</span>
                <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">{stat.label}</h3>
              </div>
              <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-sm text-neutral-500">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);



/* ─────────────── FEATURES GRID ─────────────── */
const FeaturesGrid = () => (
  <section id="features" className="roadmap-gradient-bg py-32">
    <div className="max-w-7xl mx-auto px-8">
    <div className="text-center mb-20">
      <h2 className="text-5xl font-light mb-6 text-neutral-900">Everything You Need in DeFi</h2>
      <p className="text-lg text-slate-500 max-w-2xl mx-auto">One platform. Four powerful modules. Zero compromise on security or performance.</p>
      <div className="w-24 h-1 bg-neutral-900 mx-auto rounded-full opacity-10 mt-8"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Instant Swap */}
      <motion.div whileHover={{ y: -5 }} className="md:col-span-8 glass-card rounded-[2rem] p-10 flex flex-col justify-between group cursor-pointer transition-all hover:bg-white/60">
        <div>
          <span className="material-symbols-outlined text-4xl mb-6 text-neutral-700">swap_horiz</span>
          <h3 className="text-3xl font-light mb-4 text-neutral-900">Instant Token Swap</h3>
          <p className="text-slate-600 max-w-md">Swap between WETH, USDC, and DEFI tokens instantly via our DeFiRouter with real-time Chainlink price feeds and minimal slippage.</p>
        </div>
        <div className="mt-12 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-slate-200/50 rounded-full text-xs font-semibold text-neutral-700">CHAINLINK ORACLES</span>
            <span className="px-3 py-1 bg-slate-200/50 rounded-full text-xs font-semibold text-neutral-700">LOW SLIPPAGE</span>
          </div>
          <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform text-neutral-900">arrow_forward</span>
        </div>
      </motion.div>
      {/* Lend & Borrow */}
      <motion.div whileHover={{ y: -5 }} className="md:col-span-4 bg-neutral-900 rounded-[2rem] p-10 flex flex-col justify-between text-white overflow-hidden relative">
        <div className="relative z-10">
          <span className="material-symbols-outlined text-4xl mb-6 text-[#b1f748]">account_balance</span>
          <h3 className="text-3xl font-light mb-4">Lend &amp; Borrow</h3>
          <p className="text-slate-400">Supply collateral and borrow assets with real-time health factor monitoring and liquidation protection.</p>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#b1f748]/20 blur-3xl"></div>
      </motion.div>
      {/* Stake & Earn */}
      <motion.div whileHover={{ y: -5 }} className="md:col-span-4 glass-card rounded-[2rem] p-10 flex flex-col justify-between">
        <div>
          <span className="material-symbols-outlined text-4xl mb-6 text-[#5f5292]">trending_up</span>
          <h3 className="text-2xl font-light mb-4 text-neutral-900">Stake &amp; Earn</h3>
          <p className="text-slate-600 text-sm">Stake $DEFI tokens to earn protocol rewards with no lock-up period. Flexible staking with competitive APY.</p>
        </div>
      </motion.div>
      {/* Protocol Analytics */}
      <motion.div whileHover={{ y: -5 }} className="md:col-span-8 glass-card rounded-[2rem] p-10 flex items-center gap-12">
        <div className="flex-1">
          <h3 className="text-2xl font-light mb-4 text-neutral-900">Protocol Analytics</h3>
          <p className="text-slate-600 mb-6 text-sm">Track TVL, pool performance, swap volumes, and lending metrics across the entire DeFi Super ecosystem in real-time.</p>
          <Link href="/login" className="text-neutral-900 font-semibold flex items-center gap-2 group">
            View Dashboard <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
        <div className="hidden lg:block w-48 h-32 bg-slate-200/50 rounded-2xl flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-5xl opacity-20">analytics</span>
        </div>
      </motion.div>
    </div>
    </div>
  </section>
);

/* ─────────────── LIVE PROTOCOL STATS ─────────────── */
const ProtocolStats = () => (
  <section id="protocol" className="bg-gray-200/50 py-32">
    <div className="max-w-7xl mx-auto px-8">
      <div className="flex flex-col lg:flex-row gap-20 items-center">
        <div className="flex-1 space-y-12">
          <h2 className="text-5xl font-light leading-tight text-neutral-900">Real-Time<br/>Protocol Dashboard</h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-[#b1f748] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-neutral-700">show_chart</span>
              </div>
              <div>
                <h4 className="text-xl font-medium mb-2 text-neutral-900">Live Price Feeds</h4>
                <p className="text-slate-600">Chainlink oracle-powered ETH/USD price feeds for accurate swap rates and collateral valuation.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-[#c3b4fc] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-neutral-700">water_drop</span>
              </div>
              <div>
                <h4 className="text-xl font-medium mb-2 text-neutral-900">Multi-Pool Liquidity</h4>
                <p className="text-slate-600">Deep liquidity across WETH/USDC and WETH/DEFI pools for minimal slippage on every trade.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-[#7fffee] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-neutral-700">health_and_safety</span>
              </div>
              <div>
                <h4 className="text-xl font-medium mb-2 text-neutral-900">Health Factor Monitoring</h4>
                <p className="text-slate-600">Real-time health factor tracking for lending positions to prevent unexpected liquidations.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full">
          <div className="glass-card rounded-[2rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h5 className="font-semibold text-lg text-neutral-900">Protocol Health</h5>
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
                <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Total Liquidity</p>
                <p className="text-xl font-medium text-neutral-900">$2.4M+</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Swaps (24h)</p>
                <p className="text-xl font-medium text-neutral-900">1,250+</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-50 mb-1">Avg APY</p>
                <p className="text-xl font-medium text-neutral-900">12.4%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────── DEFI TOKEN ─────────────── */
const DefiToken = () => (
  <section id="ecosystem" className="max-w-7xl mx-auto px-8 py-32 overflow-hidden relative">
    <div className="absolute bottom-0 right-[20%] w-[400px] h-[400px] bg-[#b1f748]/80 blur-[100px] rounded-full z-[-15]"></div>
    <div className="flex flex-col md:flex-row items-center gap-16">
      <div className="flex-1 order-2 md:order-1">
        <div className="glass-card rounded-[2.5rem] p-10 max-w-md mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <span className="material-symbols-outlined text-4xl opacity-10">toll</span>
          </div>
          <h4 className="text-sm font-bold uppercase tracking-[0.2em] mb-12 opacity-40">Governance Token</h4>
          <div className="mb-12">
            <p className="text-4xl font-light mb-2 text-neutral-900">$DEFI Token</p>
            <p className="text-6xl font-bold tracking-tighter text-neutral-900">$0.85 <span className="text-sm font-medium text-green-500 tracking-normal ml-2">+6.1%</span></p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-neutral-200/50">
              <span className="text-sm opacity-60">Staking APY</span>
              <span className="font-semibold text-neutral-900">12.4%</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-neutral-200/50">
              <span className="text-sm opacity-60">Circulating Supply</span>
              <span className="font-semibold text-neutral-900">100M</span>
            </div>
          </div>
          <Link href="/login">
            <button className="w-full bg-neutral-900 text-white rounded-full py-4 mt-12 font-semibold hover:scale-[1.02] transition-transform">Get $DEFI Now</button>
          </Link>
        </div>
      </div>
      <div className="flex-1 order-1 md:order-2">
        <h2 className="text-5xl font-light mb-8 text-neutral-900">Powering the Protocol</h2>
        <p className="text-xl text-slate-600 leading-relaxed mb-10">
          The $DEFI token is the backbone of the DeFi Super ecosystem. Holders earn staking rewards, participate in governance, and gain access to premium protocol features.
        </p>
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h5 className="text-lg font-bold mb-2 text-neutral-900">Staking Rewards</h5>
            <p className="text-sm text-slate-500">Earn competitive APY by staking $DEFI with no lock-up period — unstake anytime.</p>
          </div>
          <div>
            <h5 className="text-lg font-bold mb-2 text-neutral-900">Governance Voting</h5>
            <p className="text-sm text-slate-500">Vote on protocol upgrades, new pool listings, and parameter changes.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────── HOW IT WORKS ─────────────── */
const HowItWorks = () => (
  <section className="py-32">
    <div className="max-w-7xl mx-auto px-8">
      <div className="text-center mb-20">
        <span className="px-6 py-1 rounded-full border border-neutral-200 text-xs font-medium uppercase tracking-widest text-neutral-500 mb-6 inline-block">Getting Started</span>
        <h2 className="text-5xl font-light text-neutral-900 mb-6">How It Works</h2>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">Start using DeFi Super in three simple steps.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { step: "01", icon: "account_balance_wallet", title: "Connect Wallet", desc: "Link your MetaMask or any Web3 wallet via RainbowKit to get started securely." },
          { step: "02", icon: "tune", title: "Choose Your Strategy", desc: "Swap tokens, supply collateral to borrow, or stake $DEFI for passive rewards." },
          { step: "03", icon: "rocket_launch", title: "Earn & Grow", desc: "Track your portfolio, monitor health factors, and watch your DeFi earnings grow." }
        ].map((item, idx) => (
          <motion.div key={idx} whileHover={{ y: -5 }} className="glass-card rounded-[2rem] p-10 text-center relative overflow-hidden group cursor-pointer">
            <span className="text-7xl font-black text-neutral-900/5 absolute top-4 right-6">{item.step}</span>
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-white text-2xl">{item.icon}</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-neutral-900">{item.title}</h3>
            <p className="text-slate-500 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────── ROADMAP ─────────────── */
const Roadmap = () => (
  <section className="py-32 relative overflow-hidden lg:min-h-screen flex items-center">
    <div className="max-w-screen-2xl mx-auto px-6 relative z-10 w-full">
      {/* Header */}
      <div className="mb-16">
        <h2 className="text-7xl font-light text-neutral-900 mb-6">Our Roadmap</h2>
        <p className="text-lg text-neutral-500 max-w-2xl ml-auto md:ml-48 text-right md:text-left">
          Building the future of decentralized finance,<br />one milestone at a time.
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-13">
        {/* Left Abstract Element */}
        <div className="w-full lg:w-1/4 flex flex-col items-center lg:items-start pt-12">
          <div className="iridescent-star w-32 h-32 relative mb-24">
            <div className="absolute inset-0 border border-white/20 rounded-full blur-[2px]"></div>
          </div>
          <div className="hidden lg:flex items-center gap-3 mt-auto">
            <Link href="/login" className="px-8 py-3 rounded-full border border-neutral-400 text-sm font-medium text-neutral-800 hover:bg-white/20 transition-all">Get Started</Link>
            <div className="w-12 h-12 rounded-full border border-neutral-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-neutral-800 text-lg">north_east</span>
            </div>
          </div>
        </div>
        {/* Roadmap Grid */}
        <div className="w-full lg:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {[
              { title: "DeFi Super v1", desc: "Core AMM with automated market making, multi-token swap support, and liquidity pool management.", tags: ["Token Swaps", "Liquidity Pools"], status: "LIVE" },
              { title: "Lending Protocol", desc: "Collateralized lending and borrowing with real-time health factor monitoring and liquidation protection.", tags: ["Supply & Borrow", "Health Factor"], status: "LIVE" },
              { title: "Staking System", desc: "Flexible $DEFI token staking with no lock-up period and competitive APY rewards distribution.", tags: ["Flexible Unstaking", "Daily Rewards"], status: "LIVE" },
              { title: "Analytics Dashboard", desc: "Comprehensive protocol analytics with TVL tracking, pool performance, and historical data visualization.", tags: ["Real-time Data", "Subgraph Indexing"], status: "LIVE" },
              { title: "Flash Loans", desc: "Atomic flash loan functionality for arbitrage and advanced DeFi strategies within a single transaction.", tags: ["Atomic Execution", "Zero Collateral"], status: "IN PROGRESS" },
              { title: "Multi-Chain Expansion", desc: "Deployment across Polygon, Arbitrum, and Base for lower fees and broader accessibility.", tags: ["Polygon", "Arbitrum"], status: "PLANNED" }
            ].map((item, idx) => (
              <div key={idx} className={`glass-roadmap-card p-8 flex flex-col h-[320px] transition-all hover:scale-[1.02] ${idx % 2 === 1 ? 'bg-white!' : ''}`}>
                <h3 className="text-2xl font-semibold mb-4 text-neutral-800">{item.title}</h3>
                <button className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 self-start ${
                  item.status === "LIVE" ? "bg-[#b1f748]/30 text-green-700" :
                  item.status === "IN PROGRESS" ? "bg-[#c3b4fc]/30 text-purple-700" :
                  "bg-white/50 text-neutral-500"
                }`}>{item.status}</button>
                <p className="text-sm text-neutral-600 mb-4 leading-relaxed">{item.desc}</p>
                <ul className="space-y-3 mt-auto">
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
      {/* Mobile Footer */}
      <div className="flex lg:hidden items-center justify-center gap-3 mt-12 px-8">
        <Link href="/login" className="px-8 py-3 rounded-full border border-neutral-400 text-sm font-medium text-neutral-800 hover:bg-white/20 transition-all">Get Started</Link>
        <div className="w-12 h-12 rounded-full border border-neutral-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-neutral-800 text-lg">north_east</span>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────── FAQ ─────────────── */
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { q: "What is DeFi Super?", a: "DeFi Super is an all-in-one decentralized finance platform that combines token swapping, lending & borrowing, staking, and protocol analytics into a single, powerful dashboard." },
    { q: "How does the token swap work?", a: "Our DeFiRouter uses an automated market maker (AMM) model with Chainlink price feeds to execute swaps between WETH, USDC, and DEFI tokens with minimal slippage." },
    { q: "What are the lending parameters?", a: "You can supply WETH as collateral and borrow USDC. The protocol monitors your health factor in real-time to protect against unexpected liquidations." },
    { q: "How do I stake and earn rewards?", a: "Simply deposit $DEFI tokens into the staking contract. There's no lock-up period — you can unstake anytime while earning competitive APY rewards." },
    { q: "Which networks are supported?", a: "DeFi Super is currently live on the Ethereum Sepolia testnet with plans to expand to Polygon, Arbitrum, and Base in upcoming releases." }
  ];

  return (
    <section id="faq" className="py-32 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-8">
        <div className="flex flex-col items-center mb-16">
          <span className="px-6 py-1 rounded-full border border-neutral-200 text-xs font-medium uppercase tracking-widest text-neutral-500 mb-6">FAQs</span>
          <h2 className="text-6xl font-light text-neutral-900">Frequently Asked</h2>
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
                <p className="text-neutral-500 leading-relaxed max-w-2xl text-lg">{faq.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────── FOOTER ─────────────── */
const Footer = () => (
  <footer className="pt-32 pb-16">
    <div className="max-w-7xl mx-auto px-8">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-32">
        {/* Newsletter */}
        <div className="w-full lg:w-1/3">
          <h3 className="text-4xl font-light text-neutral-900 mb-8">Stay in the loop</h3>
          <div className="relative max-w-sm">
            <div className="flex items-center border border-neutral-200 rounded-full p-1 bg-white/50 backdrop-blur-sm">
              <input className="w-full bg-transparent border-none px-6 py-3 focus:ring-0 text-sm placeholder:text-neutral-400" placeholder="Enter your email" type="email" />
              <button className="bg-neutral-900 text-white rounded-full px-6 py-3 text-[10px] font-bold tracking-widest hover:bg-black transition-colors shrink-0">SUBSCRIBE</button>
            </div>
          </div>
        </div>
        {/* Links */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
          <div>
            <h5 className="text-sm font-bold text-neutral-900 mb-6">Protocol</h5>
            <ul className="space-y-4 text-sm text-neutral-500 font-medium">
              <li><Link className="hover:text-neutral-900 transition-colors" href="/login">Swap</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="/login">Lending</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="/login">Staking</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="/login">Analytics</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-bold text-neutral-900 mb-6">Resources</h5>
            <ul className="space-y-4 text-sm text-neutral-500 font-medium">
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Documentation</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Smart Contracts</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">GitHub</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Audit Reports</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-bold text-neutral-900 mb-6">Community</h5>
            <ul className="space-y-4 text-sm text-neutral-500 font-medium">
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Discord</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Twitter</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Governance Forum</Link></li>
              <li><Link className="hover:text-neutral-900 transition-colors" href="#">Blog</Link></li>
            </ul>
          </div>
        </div>
      </div>
      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 pt-12 border-t border-neutral-200/50">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7fffee] via-[#b8ff4f] to-[#c4b5fd]"></div>
            <span className="text-2xl font-bold tracking-tighter text-neutral-900">DeFi Super</span>
          </div>
          <p className="text-xs text-neutral-400 font-medium">Your all-in-one decentralized finance platform.</p>
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

/* ─────────────── MAIN PAGE ─────────────── */
export default function DeFiSuperLanding() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Hero />
      <FeaturesGrid />
      <ProtocolStats />
      <DefiToken />
      <HowItWorks />
      <div className="roadmap-gradient-bg">
        <Roadmap />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}

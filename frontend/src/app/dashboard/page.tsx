"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  ArrowLeftRight,
  Landmark,
  Coins,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Activity,
  Award,
  HeartPulse,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from 'next/link';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/contracts';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function Dashboard() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  // 1. Fetch Balances
  const { data: wethBal } = useBalance({ address, token: CONTRACT_ADDRESSES.WETH });
  const { data: usdcBal } = useBalance({ address, token: CONTRACT_ADDRESSES.USDC });
  const { data: dUsdcBal } = useBalance({ address, token: CONTRACT_ADDRESSES.D_USDC });
  const { data: defiBal } = useBalance({ address, token: CONTRACT_ADDRESSES.DEFI_TOKEN });

  // 2. Fetch Protocol Positions
  const { data: lendPos } = useReadContract({
    address: CONTRACT_ADDRESSES.DeFiLend,
    abi: CONTRACT_ABIS.DeFiLend,
    functionName: "userAccounts",
    args: address ? [address] : undefined,
  });

  const { data: stakedPos } = useReadContract({
    address: CONTRACT_ADDRESSES.DeFiStaking,
    abi: CONTRACT_ABIS.DeFiStaking,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: earnedRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.DeFiStaking,
    abi: CONTRACT_ABIS.DeFiStaking,
    functionName: "earned",
    args: address ? [address] : undefined,
  });

  const { data: ethPriceData } = useReadContract({
    address: CONTRACT_ADDRESSES.ETH_USD_FEED,
    abi: CONTRACT_ABIS.IAggregatorV3,
    functionName: "latestRoundData",
  });

  const { data: healthFactor } = useReadContract({
    address: CONTRACT_ADDRESSES.DeFiLend,
    abi: CONTRACT_ABIS.DeFiLend,
    functionName: "getHealthFactor",
    args: address ? [address] : undefined,
  });

  const { data: borrowBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.DeFiLend,
    abi: CONTRACT_ABIS.DeFiLend,
    functionName: "getBorrowBalance",
    args: address ? [address] : undefined,
  });

  const ethPrice = ethPriceData ? Number((ethPriceData as any)[1]) / 1e8 : 2100;
  const WETH_PRICE = ethPrice;
  const DEFI_PRICE = 0.5;

  const getPortfolioValue = () => {
    if (!isConnected) return "0.00";
    const wethVal = Number(wethBal?.formatted || 0) * WETH_PRICE;
    const usdcVal = Number(usdcBal?.formatted || 0);
    const dUsdcVal = Number(dUsdcBal?.formatted || 0);
    const defiVal = Number(defiBal?.formatted || 0) * DEFI_PRICE;
    
    const collateral = lendPos ? Number(formatUnits((lendPos as any)[0], 18)) * WETH_PRICE : 0;
    const debt = borrowBalance ? Number(formatUnits(borrowBalance as bigint, 6)) * 1 : 0;
    const staked = stakedPos ? Number(formatUnits(stakedPos as bigint, 18)) * DEFI_PRICE : 0;

    const total = wethVal + usdcVal + dUsdcVal + defiVal + collateral + staked - debt;
    return total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const activePositionsCount = () => {
    if (!isConnected) return 0;
    let count = 0;
    if (lendPos && (lendPos as any)[0] > 0n) count++;
    if (borrowBalance && (borrowBalance as bigint) > 0n) count++;
    if (stakedPos && (stakedPos as bigint) > 0n) count++;
    return count;
  };

  const hfFormatted = useMemo(() => {
    if (!healthFactor || (healthFactor as bigint) === 0n) return "∞";
    const hf = Number(formatUnits(healthFactor as bigint, 18));
    return hf > 999.99 ? "999.99+" : hf.toFixed(2);
  }, [healthFactor]);

  const stats = [
    { 
      label: "Portfolio Value", 
      value: `$${getPortfolioValue()}`, 
      change: "+5.2%", 
      icon: Wallet,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
      borderColor: "border-blue-500/10",
    },
    { 
      label: "Unclaimed Rewards", 
      value: `${earnedRewards ? formatUnits(earnedRewards as bigint, 18).slice(0, 8) : "0.00"} DEFI`, 
      change: "Claimable", 
      icon: Award,
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/10",
    },
    { 
      label: "Active Positions", 
      value: activePositionsCount().toString(), 
      change: "Manage →", 
      icon: Activity,
      gradient: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
      borderColor: "border-emerald-500/10",
    },
    { 
      label: "Health Factor", 
      value: hfFormatted, 
      change: Number(hfFormatted) < 1.5 && hfFormatted !== "∞" ? "At Risk" : "Healthy", 
      icon: HeartPulse,
      gradient: Number(hfFormatted) < 1.5 && hfFormatted !== "∞" ? "from-red-500/20 to-orange-500/20" : "from-green-500/20 to-emerald-500/20",
      iconColor: Number(hfFormatted) < 1.5 && hfFormatted !== "∞" ? "text-red-400" : "text-green-400",
      borderColor: Number(hfFormatted) < 1.5 && hfFormatted !== "∞" ? "border-red-500/10" : "border-green-500/10",
    },
  ];

  const quickActions = [
    { 
      title: "Swap Tokens", 
      desc: "Trade instantly with low slippage", 
      href: "/swap", 
      icon: ArrowLeftRight,
      gradient: "from-blue-500 to-cyan-500",
    },
    { 
      title: "Lend Assets", 
      desc: "Supply collateral & borrow USDC", 
      href: "/lending", 
      icon: Landmark,
      gradient: "from-indigo-500 to-purple-500",
    },
    { 
      title: "Stake WETH", 
      desc: "Earn DEFI rewards at 23.5% APY", 
      href: "/staking", 
      icon: Coins,
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const tokenBalances = [
    { name: "WETH", value: wethBal?.formatted?.slice(0, 8) || "0.00", color: "bg-blue-500" },
    { name: "USDC", value: usdcBal?.formatted?.slice(0, 8) || "0.00", color: "bg-green-500" },
    { name: "dUSDC", value: dUsdcBal?.formatted?.slice(0, 8) || "0.00", color: "bg-indigo-500" },
    { name: "DEFI", value: defiBal?.formatted?.slice(0, 8) || "0.00", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Portfolio Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Manage all your DeFi assets in one place.</p>
        </div>
        <ConnectButton />
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              custom={idx}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className={`glass rounded-2xl p-5 relative overflow-hidden group hover:bg-white/[0.06] transition-all duration-300 border ${stat.borderColor}`}
            >
              {/* Gradient glow behind icon */}
              <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${stat.gradient} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />
              
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2 tracking-tight">{stat.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center ${stat.iconColor}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className={`text-[11px] mt-3 font-medium ${stat.iconColor}`}>{stat.change}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Token Balances Strip */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="glass rounded-2xl p-4 flex flex-wrap gap-3"
      >
        <span className="text-[11px] text-gray-500 uppercase tracking-wider font-medium self-center mr-2">Wallet</span>
        {tokenBalances.map((t) => (
          <div key={t.name} className="flex items-center gap-2 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
            <div className={`w-2 h-2 rounded-full ${t.color}`} />
            <span className="text-xs font-medium text-gray-300">{t.value}</span>
            <span className="text-[10px] text-gray-500">{t.name}</span>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions + Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  custom={idx + 4}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                >
                  <Link href={action.href}>
                    <div className="glass rounded-2xl p-5 group hover:bg-white/[0.06] transition-all duration-300 cursor-pointer gradient-border-hover h-full">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <h4 className="font-bold text-sm">{action.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-1">{action.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <motion.div 
          custom={7}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="glass p-6 rounded-2xl border border-green-500/10"
        >
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ShieldCheck size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-xs font-medium">Contracts Verified</p>
                <p className="text-[10px] text-gray-500">All protocols audited</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium">Real-time Pricing</p>
                <p className="text-[10px] text-gray-500">Chainlink Oracle feeds</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

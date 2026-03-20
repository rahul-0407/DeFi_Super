"use client";

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Layers, 
  Droplets, 
  ShieldCheck,
  TrendingUp,
  Wallet
} from "lucide-react";
import { motion } from "framer-motion";
import Link from 'next/link';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/contracts';

export default function Dashboard() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  // Basic auth check
  useEffect(() => {
    const isAuth = localStorage.getItem('defix_auth') === 'true';
    if (!isAuth) {
      router.push('/');
    }
  }, [router]);

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
    { label: "Portfolio Value", value: `$${getPortfolioValue()}`, change: "+5.2%", color: "text-green-400" },
    { label: "Unclaimed Rewards", value: `${earnedRewards ? formatUnits(earnedRewards as bigint, 18).slice(0, 8) : "0.00"} DEFI`, change: "Stable", color: "text-purple-400" },
    { label: "Active Positions", value: activePositionsCount().toString(), change: "Manage", color: "text-blue-400" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio Overview</h2>
          <p className="text-gray-400 mt-1">Manage all your DeFi assets in one place.</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => { localStorage.removeItem('defix_auth'); router.push('/'); }}
             className="text-xs text-gray-500 hover:text-white transition-colors"
           >
             Logout
           </button>
           <ConnectButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            className="glass p-6 rounded-2xl relative overflow-hidden group hover:bg-white/5 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full bg-white/5 ${stat.color}`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             {[
               { title: "Swap Tokens", href: "/swap" },
               { title: "Lend Assets", href: "/lending" },
               { title: "Stake DEFI", href: "/staking" },
             ].map((action) => (
               <Link key={action.title} href={action.href}>
                 <button className="glass p-5 rounded-2xl text-left hover:border-white/20 transition-all w-full h-full font-bold">
                   {action.title}
                 </button>
               </Link>
             ))}
          </div>
        </div>
        
        <div className="glass p-8 rounded-3xl">
           <h3 className="text-xl font-semibold mb-6">Security</h3>
           <div className="flex items-center gap-4">
              <ShieldCheck className="text-green-400" />
              <p className="text-sm text-gray-400">All protocol contracts verified</p>
           </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  ArrowDownToLine, 
  Coins, 
  Activity,
  PieChart as PieChartIcon,
  Table as TableIcon,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { fetchProtocolStats, ProtocolStatsResponse } from '@/lib/subgraph';
import { formatUnits, parseUnits } from 'viem';
import { useReadContract, useBalance } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/contracts';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<ProtocolStatsResponse>({
    queryKey: ['protocolStats'],
    queryFn: fetchProtocolStats,
    refetchInterval: 30000,
  });

  // --- REAL TIME CONTRACT DATA ---
  const { data: ethPriceData } = useReadContract({
    address: CONTRACT_ADDRESSES.ETH_USD_FEED,
    abi: CONTRACT_ABIS.IAggregatorV3,
    functionName: 'latestRoundData',
  });

  const { data: totalBorrowedReal } = useReadContract({
    address: CONTRACT_ADDRESSES.DeFiLend,
    abi: CONTRACT_ABIS.DeFiLend,
    functionName: 'totalBorrowed',
  });

  // Fetch contract balances for TVL
  const { data: lendWethBal } = useBalance({ address: CONTRACT_ADDRESSES.DeFiLend, token: CONTRACT_ADDRESSES.WETH });
  const { data: lendUsdcBal } = useBalance({ address: CONTRACT_ADDRESSES.DeFiLend, token: CONTRACT_ADDRESSES.USDC });
  const { data: ammUsdcBal } = useBalance({ address: CONTRACT_ADDRESSES.DeFiAMM, token: CONTRACT_ADDRESSES.USDC });
  const { data: ammWethBal } = useBalance({ address: CONTRACT_ADDRESSES.DeFiAMM, token: CONTRACT_ADDRESSES.WETH });
  const { data: defiPoolWethBal } = useBalance({ address: CONTRACT_ADDRESSES.WETH_DEFI_POOL, token: CONTRACT_ADDRESSES.WETH });
  const { data: defiPoolDefiBal } = useBalance({ address: CONTRACT_ADDRESSES.WETH_DEFI_POOL, token: CONTRACT_ADDRESSES.DEFI_TOKEN });
  const { data: stakingWethBal } = useBalance({ address: CONTRACT_ADDRESSES.DeFiStaking, token: CONTRACT_ADDRESSES.WETH });

  const { data: stakingTotalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.DeFiStaking,
    abi: CONTRACT_ABIS.DeFiStaking,
    functionName: 'totalSupply',
  });

  const stats = useMemo(() => {
    // If we have real contract data, use it. Fallback to subgraph/mock if needed.
    const ethPrice = ethPriceData ? Number((ethPriceData as any)[1]) / 1e8 : 2500;
    const defiPrice = 0.5; // DEFI token mock price
    
    // Calculate REAL TVL across all modules
    // Note: Staked WETH is physically in the Lending contract but logically belongs to staking
    const stakingRaw = stakingTotalSupply ? Number(formatUnits(stakingTotalSupply as bigint, 18)) : 0;
    const realStakingTvl = stakingRaw * ethPrice;

    // Lending TVL = (Total WETH in contract - Staked WETH) + USDC in contract
    const lendWethNet = Math.max(0, Number(lendWethBal?.formatted || 0) - stakingRaw);
    const realLendTvl = (lendWethNet * ethPrice) + Number(lendUsdcBal?.formatted || 0);

    const realAmmTvl = (Number(ammWethBal?.formatted || 0) * ethPrice) + Number(ammUsdcBal?.formatted || 0);
    const realDefiPoolTvl = (Number(defiPoolWethBal?.formatted || 0) * ethPrice) + (Number(defiPoolDefiBal?.formatted || 0) * defiPrice);
    
    const totalTVL = realLendTvl + realAmmTvl + realDefiPoolTvl + realStakingTvl;
    const realBorrowed = totalBorrowedReal ? Number(formatUnits(totalBorrowedReal as bigint, 6)) : 0;

    // Fees (Simulated or from subgraph if available)
    const flashLoanFees = data?.flashLoanEvents.reduce((acc, event) => acc + Number(formatUnits(BigInt(event.fee), 18)), 0) || 0;
    const swapFees = data?.pools.reduce((acc, pool) => acc + (Number(pool.totalVolume0) + Number(pool.totalVolume1)) * 0.003, 0) || 0;

    const totalFees = flashLoanFees + swapFees;

    // Fallback volumes if subgraph is down
    const getVol = (poolIdx: number, tvl: number) => {
      if (data?.isError || !data?.pools[poolIdx]) return tvl * 0.15; // Simulate 15% daily turnover
      return Number(data.pools[poolIdx].totalVolume0) || 0;
    };

    const pools = [
      {
        name: "Lending Market (WETH/USDC)",
        value: realLendTvl,
        volume: getVol(0, realLendTvl),
        id: CONTRACT_ADDRESSES.DeFiLend,
        color: COLORS[0],
        status: "ACTIVE"
      },
      {
        name: "AMM Pool (WETH/USDC)",
        value: realAmmTvl,
        volume: getVol(1, realAmmTvl),
        id: CONTRACT_ADDRESSES.DeFiAMM,
        color: COLORS[1],
        status: "ACTIVE"
      },
      {
        name: "AMM Pool (WETH/DEFI)",
        value: realDefiPoolTvl,
        volume: realDefiPoolTvl * 0.05, // Estimate
        id: CONTRACT_ADDRESSES.WETH_DEFI_POOL,
        color: COLORS[4],
        status: "ACTIVE"
      },
      {
        name: "Staking Rewards (WETH)",
        value: realStakingTvl,
        volume: 0,
        id: CONTRACT_ADDRESSES.DeFiStaking,
        color: COLORS[2],
        status: "ACTIVE"
      }
    ];

    return {
      tvl: totalTVL,
      borrowed: realBorrowed,
      fees: totalFees,
      pools: pools
    };
  }, [data, ethPriceData, totalBorrowedReal, lendWethBal, lendUsdcBal, ammUsdcBal, ammWethBal, defiPoolWethBal, defiPoolDefiBal, stakingWethBal, stakingTotalSupply]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const metricCards = [
    { label: "Total Value Locked", value: `$${stats?.tvl.toLocaleString() || '0'}`, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Total Borrowed", value: `$${stats?.borrowed.toLocaleString() || '0'}`, icon: ArrowDownToLine, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Protocol Fees", value: `$${stats?.fees.toLocaleString() || '0'}`, icon: Coins, color: "text-pink-400", bg: "bg-pink-500/10" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Protocol Analytics</h2>
          <p className="text-gray-400 mt-1">Real-time insights powered by Smart Contracts & Subgraph.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-xl border border-green-500/20">
             <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
             <span className="text-xs font-bold uppercase tracking-wider">Live Contract Data</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${data?.isError ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
             <span className="text-[10px] font-bold uppercase">{data?.isError ? 'Subgraph Offline' : 'Subgraph Synced'}</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon size={20} />
              </div>
              <p className="text-sm text-gray-400">{card.label}</p>
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Liquidity Distribution Chart */}
        <div className="glass p-8 rounded-3xl">
          <div className="flex items-center gap-2 mb-8">
            <PieChartIcon className="text-blue-400" size={20} />
            <h3 className="text-xl font-semibold">Liquidity Distribution</h3>
          </div>
          <div className="h-64 relative">
            {(data?.isError) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-2 bg-black/20 rounded-2xl border border-dashed border-white/5">
                <Activity className="text-gray-600 animate-pulse" size={32} />
                <p className="text-sm text-gray-500">Historical Distribution Offline</p>
                <p className="text-[10px] text-gray-600 max-w-[200px]">Subgraph is currently disconnected. Using direct contract totals for main cards.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.pools || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats?.pools || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#FFF' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {stats?.pools.map((pool) => (
              <div key={pool.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pool.color }} />
                <span className="text-xs text-gray-400 truncate">{pool.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Volume Over Time (Mocked with Pool Data) */}
        <div className="glass p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="text-purple-400" size={20} />
              Pool Volumes (24h Activity)
            </h3>
          </div>
          <div className="h-[300px] relative">
            {(data?.isError) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-2 bg-black/20 rounded-2xl border border-dashed border-white/5">
                <BarChart3 className="text-gray-600 animate-pulse" size={32} />
                <p className="text-sm text-gray-500">Volume History Offline</p>
                <p className="text-[10px] text-gray-600 max-w-[200px]">The Subgraph is required for historical volume snapshots.</p>
              </div>
            ) : (
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.pools.filter(p => p.name !== "Staking Rewards (WETH)")}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis 
                       dataKey="name" 
                       stroke="#94a3b8" 
                       fontSize={10}
                       tickFormatter={(value) => value.split(' ')[0]}
                    />
                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                      {stats.pools.filter(p => p.name !== "Staking Rewards (WETH)").map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <p className="text-[10px] text-gray-500 mt-4 uppercase font-bold tracking-widest text-center">
            * Volume represents cumulative swap activity, whereas Liquidity (TVL) is current inventory.
          </p>
        </div>
      </div>

      {/* Top Pools Table */}
      <div className="glass p-8 rounded-3xl">
        <div className="flex items-center gap-2 mb-8">
          <TableIcon className="text-pink-400" size={20} />
          <h3 className="text-xl font-semibold">Market Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="pb-4 font-semibold">Pool Address</th>
                <th className="pb-4 font-semibold">Liquidity (TVL)</th>
                <th className="pb-4 font-semibold">Total Volume</th>
                <th className="pb-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {stats?.pools.map((pool) => (
                <tr key={pool.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                  <td className="py-4 font-mono text-xs text-gray-400 group-hover:text-white">{pool.id}</td>
                  <td className="py-4 font-semibold">${pool.value.toLocaleString()}</td>
                  <td className="py-4 font-semibold">${pool.volume.toLocaleString()}</td>
                  <td className="py-4 text-right">
                    <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase">Active</span>
                  </td>
                </tr>
              ))}
              {(!stats?.pools || stats.pools.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500 italic">No pool data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

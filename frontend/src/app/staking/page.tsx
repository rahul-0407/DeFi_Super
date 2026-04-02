"use client";

import { useState, useEffect } from "react";
import { Sparkles, Zap, ChevronRight, Loader2, CheckCircle2, ShieldCheck, TrendingUp, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useBalance
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from "@/contracts";
import { useLoading } from "@/providers/LoadingProvider";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const [stakeAmount, setStakeAmount] = useState("");
  const [isTxSuccess, setIsTxSuccess] = useState(false);
  const { setIsLoading: setGlobalLoading } = useLoading();

  // Contract Config
  const stakingContract = CONTRACT_ADDRESSES.DeFiStaking;
  const stakingTokenAddress = CONTRACT_ADDRESSES.WETH;

  // 1. Fetch User Data
  const { data: stakedBalance, refetch: refetchStaked } = useReadContract({
    address: stakingContract,
    abi: CONTRACT_ABIS.DeFiStaking,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: earnedRewards, refetch: refetchEarned } = useReadContract({
    address: stakingContract,
    abi: CONTRACT_ABIS.DeFiStaking,
    functionName: "earned",
    args: address ? [address] : undefined,
  });

  const { data: stakingTokenBalance, refetch: refetchDefiBal } = useBalance({ address, token: stakingTokenAddress });

  // 2. Global Data
  const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
    address: stakingContract,
    abi: CONTRACT_ABIS.DeFiStaking,
    functionName: "totalSupply",
  });

  // 3. Transaction Hooks
  const { writeContract: writeStaking, data: txHash } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxConfirmed, isError: isTxError } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isTxError) {
      setGlobalLoading(false);
    }
  }, [isTxError]);

  useEffect(() => {
    if (isTxConfirmed) {
      setIsTxSuccess(true);
      setStakeAmount("");
      setGlobalLoading(false);
      refetchStaked();
      refetchEarned();
      refetchTotalStaked();
      refetchDefiBal();
      setTimeout(() => setIsTxSuccess(false), 5000);
    }
  }, [isTxConfirmed]);

  const handleStake = async () => {
    if (!stakeAmount || !address) return;
    setGlobalLoading(true);
    const amount = parseUnits(stakeAmount, 18);

    try {
      writeStaking({
        address: stakingTokenAddress,
        abi: CONTRACT_ABIS.IERC20,
        functionName: "approve",
        args: [stakingContract, amount],
      });
      sessionStorage.setItem("pendingStake", stakeAmount);
    } catch (e) {
      console.error(e);
    }
  };

  // Chain Stake after Approval
  useEffect(() => {
    const pendingAmount = sessionStorage.getItem("pendingStake");
    if (isTxConfirmed && pendingAmount) {
      sessionStorage.removeItem("pendingStake");
      setGlobalLoading(true); // Keep loading active for the second transaction
      writeStaking({
        address: stakingContract,
        abi: CONTRACT_ABIS.DeFiStaking,
        functionName: "stake",
        args: [parseUnits(pendingAmount, 18)],
      });
    }
  }, [isTxConfirmed]);
  
  const handleClaim = () => {
    setGlobalLoading(true);
    writeStaking({
      address: stakingContract,
      abi: CONTRACT_ABIS.DeFiStaking,
      functionName: "getReward",
    });
  };

  const handleWithdraw = () => {
     if (!stakedBalance) return;
     setGlobalLoading(true);
     writeStaking({
        address: stakingContract,
        abi: CONTRACT_ABIS.DeFiStaking,
        functionName: "withdraw",
        args: [stakedBalance],
     });
  };

  const hasRewards = earnedRewards && earnedRewards !== 0n;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {isTxSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 size={20} />
            <span className="font-bold text-sm">Staking Updated!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight">Yield Farming</h2>
        <p className="text-gray-500 text-sm mt-1">Stake WETH to secure the protocol and earn DEFI rewards.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main Staking Card */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="glass rounded-2xl p-6 border border-white/[0.06] hover:border-white/[0.1] transition-all group relative overflow-hidden lg:col-span-2"
        >
          <div className="absolute top-4 right-4 text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/10">
            Active Pool
          </div>

          <div className="space-y-6">
            {/* Pool Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg uppercase tracking-tight">DEFI Governance Staking</h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-green-400 font-bold">23.5% Total APY</p>
                  <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-[9px] font-bold border border-blue-500/10">
                    <TrendingUp size={9} />
                    <span>Yield Looping</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stake + Position Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-y border-white/[0.05]">
              {/* Stake Input */}
              <div className="space-y-3">
                <div className="bg-white/[0.04] p-5 rounded-xl border border-white/[0.06] focus-within:border-white/[0.15] transition-all">
                  <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-3">
                    <span>Stake WETH</span>
                    <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setStakeAmount(stakingTokenBalance?.formatted || "0")}>
                      Bal: {stakingTokenBalance?.formatted.slice(0, 8)}
                    </span>
                  </div>
                  <input 
                    type="number" 
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-2xl font-bold outline-none w-full"
                  />
                </div>
                <button 
                  onClick={handleStake}
                  disabled={!stakeAmount || isTxLoading || !isConnected}
                  className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] font-bold text-sm transition-all border border-white/[0.08] flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isTxLoading ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                  Stake Tokens
                </button>
              </div>

              {/* Position Display */}
              <div className="space-y-4 flex flex-col justify-center bg-white/[0.03] p-6 rounded-xl relative overflow-hidden border border-white/[0.06]">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Your Staked Balance</p>
                  <p className="text-2xl font-black text-indigo-400">{formatUnits((stakedBalance as bigint) || 0n, 18).slice(0, 10)} WETH</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Unclaimed Rewards</p>
                  <p className="text-2xl font-black text-purple-400">{formatUnits((earnedRewards as bigint) || 0n, 18).slice(0, 10)} DEFI</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleClaim}
                    disabled={!hasRewards || isTxLoading}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-[0.98] ${
                      hasRewards 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 shadow-purple-500/20 animate-glow-pulse' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    Claim
                  </button>
                  <button 
                    onClick={handleWithdraw}
                    disabled={!stakedBalance || stakedBalance === 0n || isTxLoading}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.04] hover:bg-red-500/15 text-[11px] font-bold transition-all border border-white/[0.06] active:scale-[0.98]"
                  >
                    Unstake All
                  </button>
                </div>
                <Sparkles className="absolute -right-4 -bottom-4 w-16 h-16 text-white/[0.03]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Sidebar */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <div className="glass p-6 rounded-2xl border border-indigo-500/10">
            <h4 className="font-medium text-[11px] text-gray-500 uppercase tracking-widest mb-6 text-center">Global Pool Data</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Total Value Staked</span>
                <span className="font-bold text-white">{formatUnits((totalStaked as bigint) || 0n, 18).slice(0, 10)} WETH</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Yield Breakdown</span>
                <div className="text-right">
                  <p className="font-bold text-green-400 text-xs">18.5% Staking</p>
                  <p className="font-bold text-blue-400 text-[9px]">+5.0% Lending</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Yield Source</span>
                <span className="font-bold text-blue-400 flex items-center gap-1 text-xs">
                  <ShieldCheck size={12} />
                  Lending Pool
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/[0.05] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
                  <Award size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Protocol Multiplier</p>
                  <p className="text-sm font-black">1.25x</p>
                </div>
              </div>
              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Yield Looping</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Tokens are auto-supplied to the <span className="text-white font-bold">DeFiLend Market</span> for extra yield.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

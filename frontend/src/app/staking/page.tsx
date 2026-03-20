"use client";

import { useState, useEffect } from "react";
import { Sparkles, Zap, Timer, Award, ChevronRight, Loader2, CheckCircle2, ShieldCheck, TrendingUp } from "lucide-react";
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

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const [stakeAmount, setStakeAmount] = useState("");
  const [isTxSuccess, setIsTxSuccess] = useState(false);

  // Contract Config
  const stakingContract = CONTRACT_ADDRESSES.DeFiStaking;
  const stakingTokenAddress = CONTRACT_ADDRESSES.WETH; // Staking contract accepts WETH

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
  const { isLoading: isTxLoading, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isTxConfirmed) {
      setIsTxSuccess(true);
      setStakeAmount("");
      refetchStaked();
      refetchEarned();
      refetchTotalStaked();
      refetchDefiBal();
      setTimeout(() => setIsTxSuccess(false), 5000);
    }
  }, [isTxConfirmed]);

  const handleStake = async () => {
    if (!stakeAmount || !address) return;
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
      writeStaking({
        address: stakingContract,
        abi: CONTRACT_ABIS.DeFiStaking,
        functionName: "stake",
        args: [parseUnits(pendingAmount, 18)],
      });
    }
  }, [isTxConfirmed]);

  const handleClaim = () => {
    writeStaking({
      address: stakingContract,
      abi: CONTRACT_ABIS.DeFiStaking,
      functionName: "getReward",
    });
  };

  const handleWithdraw = () => {
     if (!stakedBalance) return;
     writeStaking({
        address: stakingContract,
        abi: CONTRACT_ABIS.DeFiStaking,
        functionName: "withdraw",
        args: [stakedBalance],
     });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <AnimatePresence>
        {isTxSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 size={24} />
            <span className="font-bold">Staking Updated!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Yield Farming</h2>
        <p className="text-gray-400 mt-1">Stake WETH to secure the protocol and earn DEFI rewards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="glass rounded-[32px] p-8 border-white/5 hover:border-white/10 transition-all group relative overflow-hidden lg:col-span-2"
            >
               <div className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                  Active Pool
               </div>

               <div className="space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl">
                        <Zap size={32} />
                     </div>
                      <div>
                        <h3 className="font-bold text-2xl uppercase tracking-tight">DEFI Governance Staking</h3>
                        <div className="flex items-center gap-3">
                           <p className="text-green-400 font-bold text-lg">23.5% Total APY</p>
                           <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-500/10">
                              <TrendingUp size={10} />
                              <span>Yield Looping Active</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-y border-white/5">
                     <div className="space-y-4">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 focus-within:border-white/20 transition-all">
                           <div className="flex justify-between text-xs text-gray-500 uppercase font-bold mb-4">
                              <span>Stake WETH</span>
                              <span className="cursor-pointer hover:text-white" onClick={() => setStakeAmount(stakingTokenBalance?.formatted || "0")}>
                                 Bal: {stakingTokenBalance?.formatted.slice(0, 8)}
                              </span>
                           </div>
                           <input 
                              type="number" 
                              value={stakeAmount}
                              onChange={(e) => setStakeAmount(e.target.value)}
                              placeholder="0.0"
                              className="bg-transparent text-3xl font-bold outline-none w-full"
                           />
                        </div>
                        <button 
                           onClick={handleStake}
                           disabled={!stakeAmount || isTxLoading || !isConnected}
                           className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
                        >
                           {isTxLoading ? <Loader2 className="animate-spin" /> : <ChevronRight size={20} />}
                           Stake Tokens
                        </button>
                     </div>

                     <div className="space-y-6 flex flex-col justify-center bg-white/5 p-8 rounded-2xl relative overflow-hidden">
                        <div>
                           <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Your Staked Balance</p>
                           <p className="text-3xl font-black text-indigo-400">{formatUnits((stakedBalance as bigint) || 0n, 18).slice(0, 10)} WETH</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Unclaimed Rewards</p>
                       <p className="text-3xl font-black text-purple-400">{formatUnits((earnedRewards as bigint) || 0n, 18).slice(0, 10)} DEFI</p>
                    </div>
                        <div className="flex gap-2">
                           <button 
                              onClick={handleClaim}
                              disabled={!earnedRewards || earnedRewards === 0n || isTxLoading}
                              className="flex-1 py-3 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 font-bold text-sm hover:opacity-90 transition-all shadow-lg"
                           >
                              Claim
                           </button>
                           <button 
                              onClick={handleWithdraw}
                              disabled={!stakedBalance || stakedBalance === 0n || isTxLoading}
                              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-xs font-bold transition-all border border-white/5"
                           >
                              Unstake All
                           </button>
                        </div>
                        <Sparkles className="absolute -right-4 -bottom-4 w-20 h-20 text-white/5" />
                     </div>
                  </div>
               </div>
            </motion.div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
                <div className="glass p-8 rounded-[32px] border border-indigo-500/20 shadow-2xl">
                   <h4 className="font-bold text-center text-gray-400 uppercase tracking-widest text-[10px] mb-8">Global Pool Data</h4>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-400">Total Value Staked</span>
                         <span className="font-bold text-white text-lg">{formatUnits((totalStaked as bigint) || 0n, 18).slice(0, 10)} WETH</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-400">Yield Breakdown</span>
                         <div className="text-right">
                            <p className="font-bold text-green-400">18.5% Staking</p>
                            <p className="font-bold text-blue-400 text-[10px]">+5.0% Lending</p>
                         </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-gray-400">Yield Source</span>
                         <span className="font-bold text-blue-400 flex items-center gap-1">
                            <ShieldCheck size={14} />
                            Lending Pool
                         </span>
                      </div>
                   </div>
                   <div className="mt-8 pt-8 border-t border-white/5">
                      <div className="space-y-4">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400">
                               <Award size={20} />
                            </div>
                            <div>
                               <p className="text-xs font-bold text-gray-400 uppercase">Protocol Multiplier</p>
                               <p className="text-lg font-black">1.25x</p>
                            </div>
                         </div>
                         <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-bold mb-1">Production Feature: Yield Looping</p>
                            <p className="text-[10px] text-gray-400 leading-relaxed">
                               Your tokens are automatically supplied to the <span className="text-white font-bold">DeFiLend Market</span> to earn real interest while securing the protocol.
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
            </div>
      </div>
    </div>
  );
}

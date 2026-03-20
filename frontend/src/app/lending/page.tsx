"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, Info, Search, Loader2, CheckCircle2 } from "lucide-react";
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

export default function LendingPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"supply" | "pool" | "borrow">("supply");
  const [amount, setAmount] = useState("");
  const [isTxSuccess, setIsTxSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract Config
  const lendContract = CONTRACT_ADDRESSES.DeFiLend;
  const weth = CONTRACT_ADDRESSES.WETH;
  const usdc = CONTRACT_ADDRESSES.USDC;

  // 1. Fetch User Data
  const { data: userAccount, refetch: refetchAccount } = useReadContract({
    address: lendContract,
    abi: CONTRACT_ABIS.DeFiLend,
    functionName: "userAccounts",
    args: address ? [address] : undefined,
  });

  const { data: healthFactor, refetch: refetchHealth } = useReadContract({
    address: lendContract,
    abi: CONTRACT_ABIS.DeFiLend,
    functionName: "getHealthFactor",
    args: address ? [address] : undefined,
  });

  const { data: borrowBalance, refetch: refetchBorrowBal } = useReadContract({
    address: lendContract,
    abi: CONTRACT_ABIS.DeFiLend,
    functionName: "getBorrowBalance",
    args: address ? [address] : undefined,
  });

  const { data: ethBalance, refetch: refetchEthBal } = useBalance({ address, token: weth });
  const { data: usdcBalance, refetch: refetchUsdcBal } = useBalance({ address, token: usdc });
  const { data: dUsdcBalance, refetch: refetchDUsdcBal } = useBalance({ address, token: CONTRACT_ADDRESSES.D_USDC });

  const { data: userLiquidity, refetch: refetchUserLiq } = useReadContract({
    address: lendContract,
    abi: CONTRACT_ABIS.DeFiLend,
    functionName: "suppliedLiquidity",
    args: address ? [address] : undefined,
  });

  const { data: totalBorrowedPool } = useReadContract({
    address: lendContract,
    abi: CONTRACT_ABIS.DeFiLend,
    functionName: "totalBorrowed",
  });

  const { data: poolBalance } = useBalance({ address: lendContract, token: usdc });

  // 2. Global Protocol Data (Interest Rates)
  const { data: baseRate } = useReadContract({ address: lendContract, abi: CONTRACT_ABIS.DeFiLend, functionName: "baseRate" });
  const { data: multiplier } = useReadContract({ address: lendContract, abi: CONTRACT_ABIS.DeFiLend, functionName: "multiplier" });
  const { data: reserveFactor } = useReadContract({ address: lendContract, abi: CONTRACT_ABIS.DeFiLend, functionName: "reserveFactor" });

  // APY Calculations
  const calculateRates = () => {
    if (!totalBorrowedPool || !poolBalance) return { borrowAPR: 4.2, supplyAPY: 2.1 };
    
    const borrowed = Number(formatUnits(totalBorrowedPool as bigint, 6));
    const cash = Number(poolBalance.formatted);
    const totalLiquidity = borrowed + cash;
    
    if (totalLiquidity === 0) return { borrowAPR: Number(formatUnits(baseRate as bigint || 0n, 18)) * 100, supplyAPY: 0 };
    
    const utilization = borrowed / totalLiquidity;
    const bRate = Number(formatUnits(baseRate as bigint || 0n, 18));
    const mRate = Number(formatUnits(multiplier as bigint || 0n, 18));
    const rFactor = Number(formatUnits(reserveFactor as bigint || 0n, 18));
    
    const borrowAPR = (bRate + (mRate * utilization)) * 100;
    const supplyAPY = borrowAPR * utilization * (1 - rFactor);
    
    return { borrowAPR, supplyAPY };
  };

  const { borrowAPR, supplyAPY } = calculateRates();

  // 3. Transaction Hooks
  const { writeContract: writeLend, data: txHash, error: wagmiError, reset: resetWagmi } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isTxConfirmed) {
      setIsTxSuccess(true);
      setAmount("");
      refetchAccount();
      refetchHealth();
      refetchEthBal();
      refetchUsdcBal();
      refetchDUsdcBal();
      refetchBorrowBal();
      refetchUserLiq();
      setTimeout(() => setIsTxSuccess(false), 5000);
    }
  }, [isTxConfirmed]);

  const clearError = () => {
    setError(null);
    resetWagmi();
  };

  const handleAction = async (action: "deposit" | "borrow" | "repay" | "withdraw" | "supplyBorrowToken" | "withdrawLiquidity") => {
    if (!amount || !address) return;

    const isWeth = action === "deposit" || action === "withdraw";
    const parsedAmount = parseUnits(amount, isWeth ? 18 : 6);

    // Balance check
    if (action === "deposit") {
      const balance = ethBalance?.value || 0n;
      if (parsedAmount > balance) {
        setError(`Insufficient WETH balance. You have ${ethBalance?.formatted} WETH.`);
        return;
      }
    }
    if (action === "withdraw") {
      if (parsedAmount > collateral) {
        setError(`Insufficient collateral supplied. You only have ${formatUnits(collateral, 18)} WETH.`);
        return;
      }
    }
    if (action === "repay" || action === "supplyBorrowToken") {
      const balance = usdcBalance?.value || 0n;
      if (parsedAmount > balance) {
        setError(`Insufficient USDC balance. You have ${usdcBalance?.formatted} USDC.`);
        return;
      }
    }
    if (action === "withdrawLiquidity") {
      const supplied = (userLiquidity as bigint) || 0n;
      if (parsedAmount > supplied) {
        setError(`Insufficient liquidity supplied. You only have ${formatUnits(supplied, 6)} USDC.`);
        return;
      }
    }

    try {
      if (action === "deposit" || action === "repay" || action === "supplyBorrowToken") {
        // Double check approval in real app, here we just trigger
        writeLend({
          address: isWeth ? weth : usdc,
          abi: CONTRACT_ABIS.IERC20,
          functionName: "approve",
          args: [lendContract, parsedAmount],
        });
        // Simplification: In this demo UI, the user would need to click again or we chain.
        // Let's implement a chain for a smoother demo.
        sessionStorage.setItem("pendingAction", JSON.stringify({ action, amount }));
      } else {
        writeLend({
          address: lendContract,
          abi: CONTRACT_ABIS.DeFiLend,
          functionName: action,
          args: [parsedAmount],
        });
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Chain transaction for Approve + (Deposit/Repay)
  useEffect(() => {
    const pendingJson = sessionStorage.getItem("pendingAction");
    if (isTxConfirmed && pendingJson) {
      const pending = JSON.parse(pendingJson);
      sessionStorage.removeItem("pendingAction");
      
      const isWeth = pending.action === "deposit";
      const parsedAmount = parseUnits(pending.amount, isWeth ? 18 : 6);
      
      writeLend({
        address: lendContract,
        abi: CONTRACT_ABIS.DeFiLend,
        functionName: pending.action,
        args: [parsedAmount],
      });
    }
  }, [isTxConfirmed]);

  const collateral = userAccount ? (userAccount as bigint[])[0] : 0n;
  const borrowed = userAccount ? (userAccount as bigint[])[1] : 0n;
  const hfValue = healthFactor ? Number(healthFactor) / 1e18 : 0;
  // Format HF: Cap at 999.99 for UI cleanliness, show infinity if truly 0 borrows
  const hfFormatted = healthFactor 
    ? (hfValue > 999 ? "999.99+" : hfValue.toFixed(2)) 
    : "∞";

  const displayError = error || (wagmiError ? (wagmiError as any).shortMessage || wagmiError.message : null);

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
            <span className="font-bold">Transaction Confirmed!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {displayError && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            title={displayError}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer"
            onClick={clearError}
          >
            <Info size={24} />
            <span className="font-bold">
              {displayError.includes("user rejected") ? "Transaction Rejected" : displayError.slice(0, 100)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lending Market</h2>
          <p className="text-gray-400 mt-1">Manage collateral, supply liquidity, and borrow assets.</p>
        </div>
        <div className="flex gap-4">
           <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="text-sm text-gray-400">Total Collateral:</span>
              <span className="text-blue-400 font-bold">{formatUnits(collateral, 18).slice(0, 8)} WETH</span>
           </div>
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
               <span className="text-sm text-gray-400">Total Borrowed:</span>
               <span className="text-red-400 font-bold">{formatUnits(borrowBalance as bigint || 0n, 6).slice(0, 8)} USDC</span>
            </div>
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
               <span className="text-sm text-gray-400">Health Factor:</span>
               <span className={`font-bold ${Number(hfFormatted) < 1.1 ? 'text-red-400' : 'text-green-400'}`}>
                 {hfFormatted}
               </span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Actions */}
        <div className="lg:col-span-2 space-y-6">
           <div className="glass rounded-3xl p-8 space-y-8">
              <div className="flex gap-1 bg-white/5 p-1 rounded-2xl w-fit">
                 <button 
                  onClick={() => setActiveTab("supply")}
                  className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'supply' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                   Collateral
                 </button>
                 <button 
                  onClick={() => setActiveTab("pool")}
                  className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'pool' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                   Pool
                 </button>
                 <button 
                  onClick={() => setActiveTab("borrow")}
                  className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'borrow' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                   Borrow
                 </button>
              </div>

              <div className="space-y-4">
                 <div className="bg-white/5 rounded-2xl p-6 border border-white/5 focus-within:border-white/20 transition-all">
                     <div className="flex justify-between text-sm text-gray-400 mb-4">
                       <span>Amount to {activeTab === "supply" ? "supply collateral" : activeTab === "pool" ? "supply liquidity" : "borrow"}</span>
                       <span className="cursor-pointer hover:text-white transition-colors" onClick={() => {
                          if (activeTab === "supply") setAmount(ethBalance?.formatted || "0");
                          else if (activeTab === "pool") setAmount(usdcBalance?.formatted || "0");
                          else setAmount(formatUnits(borrowBalance as bigint || 0n, 6));
                       }}>
                          {activeTab === "supply" ? (
                            `Wallet: ${ethBalance?.formatted.slice(0, 8)} WETH`
                          ) : activeTab === "pool" ? (
                            `Wallet: ${usdcBalance?.formatted.slice(0, 8)} USDC`
                          ) : (
                            `Total Debt: ${Number(formatUnits(borrowBalance as bigint || 0n, 6)).toFixed(6)} USDC`
                          )}
                       </span>
                    </div>
                       <div className="flex items-center gap-4">
                          <div className="relative w-full">
                            <input 
                              type="number" 
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.0" 
                              className="bg-transparent text-4xl font-bold outline-none w-full pr-20"
                            />
                            <button 
                              onClick={() => {
                                if (activeTab === "supply") setAmount(ethBalance?.formatted || "0");
                                else setAmount(formatUnits(borrowBalance as bigint || 0n, 6));
                              }}
                              className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all"
                            >
                              MAX
                            </button>
                          </div>
                          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl font-bold shrink-0">
                             {activeTab === "supply" ? "WETH" : "USDC"}
                          </div>
                       </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    {activeTab === "supply" ? (
                      <>
                        <button 
                          onClick={() => handleAction("deposit")}
                          disabled={!amount || Number(amount) <= 0 || isTxLoading || !isConnected || parseUnits(amount, 18) > (ethBalance?.value || 0n)}
                          className="py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          {isTxLoading ? <Loader2 className="animate-spin" /> : <ArrowUpRight size={20} />}
                          Supply WETH
                        </button>
                        <button 
                          onClick={() => handleAction("withdraw")}
                          disabled={!amount || Number(amount) <= 0 || isTxLoading || !isConnected || parseUnits(amount, 18) > collateral}
                          className="py-4 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl font-bold border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          Withdraw
                        </button>
                      </>
                    ) : activeTab === "pool" ? (
                      <div className="flex flex-col gap-4">
                        <button 
                          onClick={() => handleAction("supplyBorrowToken")}
                          disabled={!amount || Number(amount) <= 0 || isTxLoading || !isConnected || parseUnits(amount, 6) > (usdcBalance?.value || 0n)}
                          className="py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 w-full"
                        >
                          {isTxLoading ? <Loader2 className="animate-spin" /> : <ArrowUpRight size={20} />}
                          Supply USDC Liquidity
                        </button>
                        <button 
                          onClick={() => handleAction("withdrawLiquidity")}
                          disabled={!amount || Number(amount) <= 0 || isTxLoading || !isConnected || parseUnits(amount, 6) > ((userLiquidity as bigint) || 0n)}
                          className="py-4 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl font-bold border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          Withdraw Liquidity
                        </button>
                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                             <span className="text-xs text-gray-400">Receipt Tokens (dUSDC):</span>
                             <span className="text-sm font-bold text-indigo-400">{dUsdcBalance?.formatted.slice(0, 8) || "0.00"} dUSDC</span>
                          </div>
                          <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                             <span className="text-xs text-gray-400">Total Underlying Value:</span>
                             <span className="text-sm font-bold text-white">{userLiquidity ? formatUnits(userLiquidity as bigint, 6).slice(0, 8) : "0.00"} USDC</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleAction("borrow")}
                          disabled={!amount || Number(amount) <= 0 || isTxLoading || !isConnected}
                          className="py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          {isTxLoading ? <Loader2 className="animate-spin" /> : <ArrowDownLeft size={20} />}
                          Borrow USDC
                        </button>
                        <button 
                          onClick={() => handleAction("repay")}
                          disabled={!amount || Number(amount) <= 0 || isTxLoading || !isConnected || parseUnits(amount, 6) > (usdcBalance?.value || 0n)}
                          className="py-4 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl font-bold border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          Repay
                        </button>
                      </>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Account Overview */}
        <div className="space-y-6">
           <div className="glass p-8 rounded-3xl border border-blue-500/20 shadow-2xl shadow-blue-500/5">
              <h3 className="font-semibold mb-6 flex items-center gap-2 text-gray-300">
                 Market Info <Info size={14} className="text-gray-500" />
              </h3>
              
              <div className="space-y-6">
                 <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-sm text-gray-400">Supply APY (WETH)</span>
                    <span className="text-green-400 font-bold">2.45%</span>
                 </div>
                 <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-sm text-gray-400">Borrow APR (USDC)</span>
                    <span className="text-red-400 font-bold">4.20%</span>
                 </div>
                 <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-sm text-gray-400">Max LTV</span>
                    <span className="text-white font-bold">80%</span>
                 </div>
                 <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-gray-400">Liquidation Penalty</span>
                    <span className="text-white font-bold">5%</span>
                 </div>
              </div>
           </div>

           <div className="glass p-6 rounded-3xl bg-linear-to-br from-blue-500/5 to-transparent border-blue-500/10">
              <div className="flex gap-4">
                 <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <Info size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-semibold">Asset Details</h4>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                       WETH is used as collateral. USDC is the primary borrowing asset in this market.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

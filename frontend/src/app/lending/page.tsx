"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Info, Loader2, CheckCircle2, Droplets, ShieldCheck, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useBalance
} from "wagmi";
import { parseUnits, formatUnits, maxUint256 } from "viem";
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from "@/contracts";
import { useLoading } from "@/providers/LoadingProvider";

const TABS = [
  { key: "supply" as const, label: "Collateral", color: "bg-blue-600" },
  { key: "pool" as const, label: "Pool", color: "bg-indigo-600" },
  { key: "borrow" as const, label: "Borrow", color: "bg-purple-600" },
];

export default function LendingPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"supply" | "pool" | "borrow">("supply");
  const [amount, setAmount] = useState("");
  const [isTxSuccess, setIsTxSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setIsLoading: setGlobalLoading } = useLoading();

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

  // Allowance Checks
  const { data: wethAllowance, refetch: refetchWethAllowance } = useReadContract({
    address: weth,
    abi: CONTRACT_ABIS.IERC20,
    functionName: "allowance",
    args: address ? [address, lendContract] : undefined,
  });

  const { data: usdcAllowance, refetch: refetchUsdcAllowance } = useReadContract({
    address: usdc,
    abi: CONTRACT_ABIS.IERC20,
    functionName: "allowance",
    args: address ? [address, lendContract] : undefined,
  });

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

  // 3. Transaction Hooks — uses async/await pattern (no useEffect chaining)
  const { writeContractAsync, error: wagmiError, reset: resetWagmi } = useWriteContract();
  const [isTxLoading, setIsTxLoading] = useState(false);

  const refetchAll = () => {
    refetchAccount();
    refetchHealth();
    refetchEthBal();
    refetchUsdcBal();
    refetchDUsdcBal();
    refetchBorrowBal();
    refetchUserLiq();
    refetchWethAllowance();
    refetchUsdcAllowance();
  };

  const clearError = () => {
    setError(null);
    resetWagmi();
  };

  const handleAction = async (action: "deposit" | "borrow" | "repay" | "withdraw" | "supplyBorrowToken" | "withdrawLiquidity") => {
    if (!amount || !address) return;
    clearError();
    setGlobalLoading(true);

    const isWeth = action === "deposit" || action === "withdraw";
    const parsedAmount = parseUnits(amount, isWeth ? 18 : 6);

    // Balance checks
    if (action === "deposit") {
      if (parsedAmount > (ethBalance?.value || 0n)) {
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
      if (parsedAmount > (usdcBalance?.value || 0n)) {
        setError(`Insufficient USDC balance. You have ${usdcBalance?.formatted} USDC.`);
        return;
      }
    }
    if (action === "withdrawLiquidity") {
      if (parsedAmount > ((userLiquidity as bigint) || 0n)) {
        setError(`Insufficient liquidity supplied. You only have ${formatUnits((userLiquidity as bigint) || 0n, 6)} USDC.`);
        return;
      }
    }

    setIsTxLoading(true);
    try {
      const needsApproval = action === "deposit" || action === "repay" || action === "supplyBorrowToken";

      if (needsApproval) {
        const tokenAddr = isWeth ? weth : usdc;
        
        // Fresh read of allowance directly from the blockchain
        const { readContract, waitForTransactionReceipt } = await import("wagmi/actions");
        const { config } = await import("@/providers/Web3Provider");

        const allowance = await readContract(config, {
          address: tokenAddr,
          abi: CONTRACT_ABIS.IERC20,
          functionName: "allowance",
          args: [address, lendContract],
        });

        const currentAllowance = (allowance as bigint) || 0n;

        // Only approve if the current allowance is less than the parsed amount
        if (currentAllowance < parsedAmount) {
          // Use maxUint256 (Infinite Approval) to ensure we never have to ask again
          const approveTxHash = await writeContractAsync({
            address: tokenAddr,
            abi: CONTRACT_ABIS.IERC20,
            functionName: "approve",
            args: [lendContract, maxUint256],
          });

          // Wait for the approve tx to be mined before proceeding
          await waitForTransactionReceipt(config, { hash: approveTxHash });
          
          // Refetch UI allowance after successful approval
          if (isWeth) await refetchWethAllowance();
          else await refetchUsdcAllowance();
        }

        // Now call the actual contract function (repay / deposit / supplyBorrowToken)
        await writeContractAsync({
          address: lendContract,
          abi: CONTRACT_ABIS.DeFiLend,
          functionName: action,
          args: [parsedAmount],
        });
      } else {
        // Direct actions (borrow, withdraw, withdrawLiquidity) — no approval needed
        await writeContractAsync({
          address: lendContract,
          abi: CONTRACT_ABIS.DeFiLend,
          functionName: action,
          args: [parsedAmount],
        });
      }

      // Success!
      setIsTxSuccess(true);
      setAmount("");
      refetchAll();
      setTimeout(() => setIsTxSuccess(false), 5000);
    } catch (e: any) {
      console.error("Transaction failed:", e);
      const msg = e?.shortMessage || e?.message || "Transaction failed";
      if (!msg.includes("User rejected") && !msg.includes("user rejected")) {
        setError(msg.slice(0, 150));
        setTimeout(() => setError(null), 8000);
      }
    } finally {
      setIsTxLoading(false);
      setGlobalLoading(false);
    }
  };

  const collateral = userAccount ? (userAccount as bigint[])[0] : 0n;
  const borrowed = userAccount ? (userAccount as bigint[])[1] : 0n;
  const hfValue = healthFactor ? Number(healthFactor) / 1e18 : 0;
  const hfFormatted = healthFactor 
    ? (hfValue > 999 ? "999.99+" : hfValue.toFixed(2)) 
    : "∞";

  const displayError = error || (wagmiError ? (wagmiError as any).shortMessage || wagmiError.message : null);

  const headerStats = [
    { label: "Collateral", value: `${formatUnits(collateral, 18).slice(0, 8)} WETH`, color: "text-blue-400", border: "border-blue-500/10" },
    { label: "Borrowed", value: `${formatUnits(borrowBalance as bigint || 0n, 6).slice(0, 8)} USDC`, color: "text-red-400", border: "border-red-500/10" },
    { label: "Health Factor", value: hfFormatted, color: Number(hfFormatted) < 1.1 ? "text-red-400" : "text-green-400", border: Number(hfFormatted) < 1.1 ? "border-red-500/10" : "border-green-500/10" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast: Success */}
      <AnimatePresence>
        {isTxSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 size={20} />
            <span className="font-bold text-sm">Transaction Confirmed!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast: Error */}
      <AnimatePresence>
        {displayError && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            title={displayError}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer max-w-md"
            onClick={clearError}
          >
            <Info size={20} />
            <span className="font-bold text-sm truncate">
              {displayError.includes("user rejected") ? "Transaction Rejected" : displayError.slice(0, 100)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lending Market</h2>
          <p className="text-gray-500 text-sm mt-1">Manage collateral, supply liquidity, and borrow assets.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {headerStats.map((s) => (
            <div key={s.label} className={`glass px-4 py-2.5 rounded-xl flex items-center gap-2 border ${s.border}`}>
              <span className="text-[11px] text-gray-500 uppercase tracking-wider">{s.label}</span>
              <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="glass rounded-2xl p-6 space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl w-fit">
              {TABS.map((tab) => (
                <button 
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    activeTab === tab.key 
                      ? `${tab.color} text-white shadow-lg` 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.06] focus-within:border-white/[0.15] transition-all">
              <div className="flex justify-between text-[11px] text-gray-500 mb-4 uppercase tracking-wider">
                <span>Amount to {activeTab === "supply" ? "supply collateral" : activeTab === "pool" ? "supply liquidity" : "borrow"}</span>
                <span className="cursor-pointer hover:text-white transition-colors normal-case" onClick={() => {
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
                    className="bg-transparent text-3xl font-bold outline-none w-full pr-16"
                  />
                  <button 
                    onClick={() => {
                      if (activeTab === "supply") setAmount(ethBalance?.formatted || "0");
                      else setAmount(formatUnits(borrowBalance as bigint || 0n, 6));
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/[0.08] hover:bg-white/[0.15] rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider"
                  >
                    Max
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.08] px-4 py-2 rounded-xl font-bold text-sm shrink-0">
                  <div className={`w-2 h-2 rounded-full ${activeTab === "supply" ? "bg-blue-500" : "bg-green-500"}`} />
                  {activeTab === "supply" ? "WETH" : "USDC"}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {activeTab === "supply" ? (
                <>
                  <button 
                    onClick={() => handleAction("deposit")}
                    disabled={!amount || Number(amount) <= 0 || isTxLoading || !isConnected || parseUnits(amount, 18) > (ethBalance?.value || 0n)}
                    className="py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isTxLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                    Supply WETH
                  </button>
                  <button 
                    onClick={() => handleAction("withdraw")}
                    disabled={!amount || Number(amount) <= 0 || isTxLoading || !isConnected || parseUnits(amount, 18) > collateral}
                    className="py-3.5 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-bold text-sm border border-white/[0.08] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Withdraw
                  </button>
                </>
              ) : activeTab === "pool" ? (
                <div className="col-span-2 flex flex-col gap-3">
                  <button 
                    onClick={() => handleAction("supplyBorrowToken")}
                    disabled={!amount || Number(amount) <= 0 || isTxLoading || !isConnected || parseUnits(amount, 6) > (usdcBalance?.value || 0n)}
                    className="py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 w-full"
                  >
                    {isTxLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                    Supply USDC Liquidity
                  </button>
                  <button 
                    onClick={() => handleAction("withdrawLiquidity")}
                    disabled={!amount || Number(amount) <= 0 || isTxLoading || !isConnected || parseUnits(amount, 6) > ((userLiquidity as bigint) || 0n)}
                    className="py-3.5 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-bold text-sm border border-white/[0.08] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Withdraw Liquidity
                  </button>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <div className="flex justify-between items-center px-4 py-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-gray-500 uppercase">Receipt (dUSDC)</span>
                      <span className="text-xs font-bold text-indigo-400">{dUsdcBalance?.formatted.slice(0, 8) || "0.00"}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-gray-500 uppercase">Underlying</span>
                      <span className="text-xs font-bold text-white">{userLiquidity ? formatUnits(userLiquidity as bigint, 6).slice(0, 8) : "0.00"} USDC</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => handleAction("borrow")}
                    disabled={!amount || Number(amount) <= 0 || isTxLoading || !isConnected}
                    className="py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-sm shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {isTxLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownLeft size={16} />}
                    Borrow USDC
                  </button>
                  <button 
                    onClick={() => handleAction("repay")}
                    disabled={!amount || Number(amount) <= 0 || isTxLoading || !isConnected || parseUnits(amount, 6) > (usdcBalance?.value || 0n)}
                    className="py-3.5 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-bold text-sm border border-white/[0.08] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Repay
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Side: Market Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="glass p-6 rounded-2xl border border-blue-500/10">
            <h3 className="font-medium text-[11px] uppercase tracking-wider text-gray-500 mb-5 flex items-center gap-2">
              Market Info <Info size={12} className="text-gray-600" />
            </h3>
            
            <div className="space-y-0">
              {[
                { label: "Supply APY (WETH)", value: `${supplyAPY.toFixed(2)}%`, color: "text-green-400", icon: TrendingUp },
                { label: "Borrow APR (USDC)", value: `${borrowAPR.toFixed(2)}%`, color: "text-red-400", icon: TrendingUp },
                { label: "Max LTV", value: "80%", color: "text-white", icon: ShieldCheck },
                { label: "Liquidation Penalty", value: "5%", color: "text-white", icon: Droplets },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`flex justify-between items-center py-3.5 ${idx < 3 ? 'border-b border-white/[0.05]' : ''}`}>
                    <span className="text-xs text-gray-400 flex items-center gap-2">
                      <Icon size={13} className="text-gray-600" />
                      {item.label}
                    </span>
                    <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass p-5 rounded-2xl border border-blue-500/10 bg-gradient-to-br from-blue-500/[0.03] to-transparent">
            <div className="flex gap-3">
              <div className="w-9 h-9 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                <Info size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold">Asset Details</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  WETH is used as collateral. USDC is the primary borrowing asset in this market.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

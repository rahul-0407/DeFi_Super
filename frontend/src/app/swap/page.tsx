"use client";

import { useState, useEffect } from "react";
import { RefreshCw, ArrowDown, Settings2, Info, CheckCircle2, Loader2 } from "lucide-react";
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

export default function SwapPage() {
  const { address, isConnected } = useAccount();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [slippage, setSlippage] = useState("0.5");
  const { setIsLoading: setGlobalLoading } = useLoading();

  // For this demo, we swap WETH to USDC or DEFI
  const [targetToken, setTargetToken] = useState<"USDC" | "DEFI">("USDC");
  
  const tokenIn = CONTRACT_ADDRESSES.WETH;
  const tokenOut = targetToken === "USDC" ? CONTRACT_ADDRESSES.USDC : CONTRACT_ADDRESSES.DEFI_TOKEN;
  const pool = targetToken === "USDC" ? CONTRACT_ADDRESSES.DeFiAMM : CONTRACT_ADDRESSES.WETH_DEFI_POOL;

  // 1. Fetch Balances
  const { data: balanceIn, refetch: refetchBalanceIn } = useBalance({
    address,
    token: tokenIn,
  });

  const { data: balanceOut, refetch: refetchBalanceOut } = useBalance({
    address,
    token: tokenOut,
  });

  // 2. Fetch AMM Reserves
  const { data: reserves, refetch: refetchReserves } = useReadContract({
    address: pool,
    abi: CONTRACT_ABIS.DeFiAMM,
    functionName: "reserve0",
  });
  const { data: reserve0 } = useReadContract({ address: pool, abi: CONTRACT_ABIS.DeFiAMM, functionName: "reserve0" });
  const { data: reserve1 } = useReadContract({ address: pool, abi: CONTRACT_ABIS.DeFiAMM, functionName: "reserve1" });

  // 3. Pricing Logic
  useEffect(() => {
    if (fromAmount && reserve0 && reserve1) {
      const amountIn = parseUnits(fromAmount, balanceIn?.decimals || 18);
      const amountInWithFee = amountIn * 997n;
      const numerator = amountInWithFee * (reserve1 as bigint);
      const denominator = ((reserve0 as bigint) * 1000n) + amountInWithFee;
      const amountOut = numerator / denominator;
      
      setToAmount(formatUnits(amountOut, balanceOut?.decimals || 6));
    } else {
      setToAmount("");
    }
  }, [fromAmount, reserve0, reserve1, balanceIn, balanceOut]);

  // 4. Swap Execution
  const { writeContract: writeApprove, data: approveHash } = useWriteContract();
  const { writeContract: writeSwap, data: swapHash } = useWriteContract();

  const { isLoading: isApproving, isError: isApproveError } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isConfirmingSwap, isSuccess: swapFinalized, isError: isSwapError } = useWaitForTransactionReceipt({ hash: swapHash });

  useEffect(() => {
    if (isApproveError || isSwapError) {
      setGlobalLoading(false);
      setIsSwapping(false);
    }
  }, [isApproveError, isSwapError]);

  useEffect(() => {
    if (swapFinalized) {
      setIsSuccess(true);
      setFromAmount("");
      setIsSwapping(false);
      setGlobalLoading(false);
      refetchBalanceIn();
      refetchBalanceOut();
      refetchReserves();
      setTimeout(() => setIsSuccess(false), 5000);
    }
  }, [swapFinalized]);

  const handleSwap = async () => {
    if (!fromAmount || !address) return;
    setIsSwapping(true);
    setGlobalLoading(true);

    try {
      const amountIn = parseUnits(fromAmount, balanceIn?.decimals || 18);

      writeApprove({
        address: tokenIn,
        abi: CONTRACT_ABIS.IERC20,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.DeFiRouter, amountIn],
      });
    } catch (e) {
      console.error(e);
      setIsSwapping(false);
      setGlobalLoading(false);
    }
  };

  // Chain swap after approval
  useEffect(() => {
    if (approveHash && !isApproving) {
      const amountIn = parseUnits(fromAmount, balanceIn?.decimals || 18);
      const amountOutMin = parseUnits(toAmount, balanceOut?.decimals || 6) * 99n / 100n;
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);

      writeSwap({
        address: CONTRACT_ADDRESSES.DeFiRouter,
        abi: CONTRACT_ABIS.DeFiRouter,
        functionName: "swap",
        args: [pool, amountIn, true, amountOutMin, deadline],
      });
    }
  }, [approveHash, isApproving]);

  const isLoading = isApproving || isConfirmingSwap;

  return (
    <div className="flex flex-col items-center pt-6 px-4">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold tracking-tight">Swap Tokens</h2>
        <p className="text-gray-500 text-sm mt-1">Trade tokens instantly with low slippage.</p>
      </motion.div>

      {/* Swap Card with Glow */}
      <div className="relative w-full max-w-[460px]">
        {/* Background glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-[40px] blur-2xl animate-glow-pulse" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="glass w-full rounded-2xl p-5 space-y-3 relative overflow-hidden"
        >
          {/* Success Overlay */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 z-20 bg-green-500/90 backdrop-blur-xl flex flex-col items-center justify-center text-white rounded-2xl"
              >
                <CheckCircle2 size={40} className="mb-2" />
                <h3 className="text-lg font-bold">Swap Successful!</h3>
                <p className="text-xs opacity-90 mt-1">Your transaction has been processed.</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-all"
                >
                  Close
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex justify-between items-center px-1">
            <h3 className="text-base font-bold">Swap</h3>
            <div className="flex gap-3 text-gray-500">
              <RefreshCw 
                size={15} 
                onClick={() => { refetchReserves(); refetchBalanceIn(); refetchBalanceOut(); }}
                className={`hover:text-white cursor-pointer transition-colors ${isLoading ? 'animate-spin' : ''}`} 
              />
              <Settings2 size={15} className="hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Input From */}
          <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] focus-within:border-white/[0.15] transition-all">
            <div className="flex justify-between text-[11px] text-gray-500 mb-2">
              <span className="uppercase tracking-wider">You pay</span>
              <span>Balance: {balanceIn?.formatted.slice(0, 8)} {balanceIn?.symbol}</span>
            </div>
            <div className="flex justify-between gap-4 items-center">
              <input 
                type="number" 
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="bg-transparent text-2xl font-bold outline-none w-full"
              />
              <div className="bg-white/[0.08] hover:bg-white/[0.12] px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all shrink-0">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold">W</div>
                <span className="font-bold text-sm">{balanceIn?.symbol || "ETH"}</span>
              </div>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center -my-4 relative z-10">
            <div className="bg-[#141414] border border-white/[0.08] p-2 rounded-xl text-gray-500 hover:text-white hover:rotate-180 cursor-pointer transition-all duration-300 shadow-xl">
              <ArrowDown size={16} />
            </div>
          </div>

          {/* Input To */}
          <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] focus-within:border-white/[0.15] transition-all">
            <div className="flex justify-between text-[11px] text-gray-500 mb-2">
              <span className="uppercase tracking-wider">You receive</span>
              <span>Balance: {balanceOut?.formatted.slice(0, 8)} {balanceOut?.symbol}</span>
            </div>
            <div className="flex justify-between gap-4 items-center">
              <div className="relative w-full">
                <input 
                  type="number" 
                  placeholder="0.0"
                  value={toAmount}
                  readOnly
                  className="bg-transparent text-2xl font-bold outline-none w-full text-gray-300"
                />
                {isLoading && (
                  <div className="absolute left-0 top-0 w-full h-full bg-transparent flex items-center">
                    <div className="h-3 w-20 bg-white/[0.08] animate-pulse rounded" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => setTargetToken(targetToken === "USDC" ? "DEFI" : "USDC")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-purple-500/15 shrink-0"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold">
                  {targetToken[0]}
                </div>
                <span className="font-bold text-sm">{targetToken}</span>
              </button>
            </div>
            <p className="text-[9px] text-gray-600 mt-2 text-right">Click token to switch output</p>
          </div>

          {/* Details */}
          <AnimatePresence>
            {fromAmount && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-1 py-1 space-y-1.5 text-xs text-gray-500"
              >
                <div className="flex justify-between">
                  <span>Exchange Rate</span>
                  <span className="text-gray-300">1 {balanceIn?.symbol} = {(Number(toAmount) / Number(fromAmount)).toFixed(4)} {balanceOut?.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">Slippage <Info size={10}/></span>
                  <span className="text-gray-300">{slippage}%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Swap Button */}
          {!isConnected ? (
            <div className="text-center py-3.5 text-gray-500 text-xs bg-white/[0.03] rounded-xl border border-dashed border-white/[0.08]">
              Please connect your wallet to swap
            </div>
          ) : (
            <button 
              onClick={handleSwap}
              disabled={!fromAmount || isSwapping || isLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 ${
                !fromAmount || isLoading
                  ? 'bg-white/[0.04] text-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 shadow-purple-500/20'
              }`}
            >
              {isApproving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Approving...
                </>
              ) : isConfirmingSwap ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Swapping...
                </>
              ) : (
                'Swap'
              )}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

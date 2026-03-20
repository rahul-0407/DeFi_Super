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

export default function SwapPage() {
  const { address, isConnected } = useAccount();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [slippage, setSlippage] = useState("0.5");

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
    functionName: "reserve0", // Simplified: assuming WETH is reserve0
  });
  // Actually reserve0 and reserve1
  const { data: reserve0 } = useReadContract({ address: pool, abi: CONTRACT_ABIS.DeFiAMM, functionName: "reserve0" });
  const { data: reserve1 } = useReadContract({ address: pool, abi: CONTRACT_ABIS.DeFiAMM, functionName: "reserve1" });

  // 3. Pricing Logic
  useEffect(() => {
    if (fromAmount && reserve0 && reserve1) {
      const amountIn = parseUnits(fromAmount, balanceIn?.decimals || 18);
      // Math: amountOut = (amountIn * 997 * resOut) / (resIn * 1000 + amountIn * 997)
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

  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isConfirmingSwap, isSuccess: swapFinalized } = useWaitForTransactionReceipt({ hash: swapHash });

  useEffect(() => {
    if (swapFinalized) {
      setIsSuccess(true);
      setFromAmount("");
      setIsSwapping(false);
      refetchBalanceIn();
      refetchBalanceOut();
      refetchReserves();
      setTimeout(() => setIsSuccess(false), 5000);
    }
  }, [swapFinalized]);

  const handleSwap = async () => {
    if (!fromAmount || !address) return;
    setIsSwapping(true);

    try {
      const amountIn = parseUnits(fromAmount, balanceIn?.decimals || 18);
      const amountOutMin = parseUnits(toAmount, balanceOut?.decimals || 6) * 99n / 100n; // 1% slippage fallback
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 600); // 10 mins

      // 1. Approve Router
      writeApprove({
        address: tokenIn,
        abi: CONTRACT_ABIS.IERC20,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.DeFiRouter, amountIn],
      });

      // We need to wait for approval to finish before calling swap.
      // In a real app, we'd check allowance first.
      // For simplicity here, we'll assume the user waits for the tx to confirm and then clicks Swap again or we chain it.
      // Better: Chain it after approval receipt.
    } catch (e) {
      console.error(e);
      setIsSwapping(false);
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
    <div className="flex flex-col items-center justify-center pt-10 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-[480px] rounded-[32px] p-6 space-y-4 relative overflow-hidden"
      >
        <AnimatePresence>
          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 z-20 bg-green-500/90 flex flex-col items-center justify-center text-white"
            >
              <CheckCircle2 size={48} className="mb-2" />
              <h3 className="text-xl font-bold">Swap Successful!</h3>
              <p className="text-sm opacity-90">Your transaction has been processed.</p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-all"
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold">Swap</h2>
          <div className="flex gap-4 text-gray-400">
            <RefreshCw 
              size={18} 
              onClick={() => { refetchReserves(); refetchBalanceIn(); refetchBalanceOut(); }}
              className={`hover:text-white cursor-pointer transition-colors ${isLoading ? 'animate-spin' : ''}`} 
            />
            <Settings2 size={18} className="hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Input From */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 focus-within:border-white/20 transition-all">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>You pay</span>
            <span>Balance: {balanceIn?.formatted.slice(0, 8)} {balanceIn?.symbol}</span>
          </div>
          <div className="flex justify-between gap-4">
            <input 
              type="number" 
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="bg-transparent text-3xl font-semibold outline-none w-full"
            />
            <button className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full flex items-center gap-2 transition-all">
              <div className="w-5 h-5 rounded-full bg-blue-500" />
              <span className="font-bold">{balanceIn?.symbol || "ETH"}</span>
            </button>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center -my-6 relative z-10">
          <div className="bg-[#1A1A1A] border border-white/10 p-2 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-all shadow-xl">
            <ArrowDown size={20} />
          </div>
        </div>

        {/* Input To */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 focus-within:border-white/20 transition-all">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>You receive</span>
            <span>Balance: {balanceOut?.formatted.slice(0, 8)} {balanceOut?.symbol}</span>
          </div>
          <div className="flex justify-between gap-4">
            <div className="relative w-full">
              <input 
                type="number" 
                placeholder="0.0"
                value={toAmount}
                readOnly
                className="bg-transparent text-3xl font-semibold outline-none w-full text-gray-200"
              />
              {isLoading && (
                <div className="absolute left-0 top-0 w-full h-full bg-transparent flex items-center">
                  <div className="h-4 w-24 bg-white/10 animate-pulse rounded" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setTargetToken(targetToken === "USDC" ? "DEFI" : "USDC")}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-full flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                  {targetToken[0]}
                </div>
                <span className="font-bold">{targetToken}</span>
              </button>
              <span className="text-[10px] text-center text-gray-500">Click to switch</span>
            </div>
          </div>
        </div>

        {/* Details */}
        {fromAmount && (
            <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: "auto" }}
               className="px-2 py-2 space-y-2 text-sm text-gray-400"
            >
                <div className="flex justify-between">
                    <span>Exchange Rate</span>
                    <span>1 {balanceIn?.symbol} = {(Number(toAmount) / Number(fromAmount)).toFixed(4)} {balanceOut?.symbol}</span>
                </div>
                <div className="flex justify-between">
                    <span className="flex items-center gap-1">Slippage Tolerance <Info size={12}/></span>
                    <span>{slippage}%</span>
                </div>
            </motion.div>
        )}

        {/* Swap Button */}
        {!isConnected ? (
           <div className="text-center py-4 text-gray-400 bg-white/5 rounded-2xl border border-dashed border-white/10">
              Please connect your wallet to swap
           </div>
        ) : (
          <button 
            onClick={handleSwap}
            disabled={!fromAmount || isSwapping || isLoading}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 ${
              !fromAmount || isLoading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-linear-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 shadow-purple-500/20'
            }`}
          >
            {isApproving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Approving...
              </>
            ) : isConfirmingSwap ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Swapping...
              </>
            ) : (
              'Swap'
            )}
          </button>
        )}
      </motion.div>
    </div>
  );
}

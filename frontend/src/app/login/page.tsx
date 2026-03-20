"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "12345") {
      localStorage.setItem("defix_auth", "true");
      router.push("/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 bg-slate-50/50 backdrop-blur-sm z-50">
      <div className="purefi-bg" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass p-10 rounded-[2.5rem] bg-white/40 border-white/60 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-6 mb-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Lock size={28} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">Sign In</h1>
            <p className="text-slate-500 mt-2 font-medium">Access your institutional portal</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              />
            </div>
          </div>

          {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}

          <button type="submit" className="w-full py-4 rounded-2xl bg-[#121212] text-white font-bold text-lg shadow-xl shadow-slate-900/10 hover:shadow-2xl transition-all">
            Unlock Portal
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm font-medium">
          Forgot your credentials? <span className="text-blue-500 cursor-pointer hover:underline">Contact Security</span>
        </p>
      </motion.div>
    </div>
  );
}

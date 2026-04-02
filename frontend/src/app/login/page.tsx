"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ChevronRight } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const router = useRouter();
  const configured = isSupabaseConfigured();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && !agreeTerms) {
      setError("Please agree to the terms of service.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);

    if (!configured) {
      if (email === "admin@demo.com" && password === "admin123") {
        localStorage.setItem("defix_auth", "true");
        router.push("/dashboard");
      } else {
        setError("Demo mode: use admin@demo.com / admin123");
      }
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);

    if (!configured) {
      setError("Please configure Supabase credentials in your .env file to use Google Auth.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  return (
    <main className="h-screen w-full flex bg-white overflow-hidden relative font-sans">
      {/* Split Screen Container */}
      <div className="w-full h-full flex flex-row">
        
        {/* Left Side: Background Image */}
        <div 
          className="hidden lg:block lg:flex-1 relative bg-cover bg-center transition-all duration-700"
          style={{ 
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAYZm0t16XS0lJwXwctxQrAY6oAKLa0rvQ5hhlG9RbjFlhlDNOuYg7KomMxpdBfyLKnb4_eMKoZo2XIFB2hoEqzVaDOLF20wnVyZK2C4ePIo5eu16swfo3SIQZhUdl3qtDkD_5yMFpcPF_um702i88em2oV2ye0R7v2fdOCZQfEWPqIHrzFOMM-1VcIXufakOweb-Qn-I6DohJ2EyJbvx6dHXNx1gc3DVV4Z1EjfWYaEytVxy7VLD-qifGztTlC-doyNE9YrO4TPhbY')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Optional Overlay for better contrast if needed */}
          <div className="absolute inset-0 bg-black/5"></div>
          
          {/* Logo/Branding on Image */}
          <div className="absolute top-12 left-12">
            <h2 className="text-2xl font-bold text-white drop-shadow-md">DeFi Super</h2>
          </div>
        </div>

        {/* Right Side: Form Area */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-[38%] h-full flex flex-col justify-center px-10 md:px-20 bg-white z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]"
        >
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">
                {mode === "signin" ? "Sign in" : "Sign up"}
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Welcome to DeFi Super supply chain platform.<br />
                {mode === "signin" ? "Log in to your account to continue." : "Register as a member to experience."}
              </p>
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all font-semibold text-slate-700 mb-8 disabled:opacity-50 shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">or use email</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider ml-1" htmlFor="email">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-[#004bb4]/20 focus:bg-white transition-all text-sm text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider ml-1" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-[#004bb4]/20 focus:bg-white transition-all text-sm text-slate-700 tracking-widest"
                  />
                </div>
              </div>

              {/* Terms of Service Checkbox (Only for Sign Up) */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#004bb4] focus:ring-[#004bb4]"
                />
                <label htmlFor="terms" className="text-xs text-slate-400 font-medium">
                  I agree to the <a href="#" className="hover:underline text-slate-500">terms of service</a>
                </label>
              </div>

              {error && <p className="text-rose-500 text-xs font-bold bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p>}
              {message && <p className="text-emerald-600 text-xs font-bold bg-emerald-50 p-3 rounded-lg border border-emerald-100">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#004bb4] text-white font-bold text-sm shadow-lg shadow-blue-900/10 hover:bg-[#003d94] hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? "Please wait..." : (
                  <>
                    {mode === "signin" ? "Sign In" : "Create Account"}
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-16 pt-8 border-t border-slate-50">
              <p className="text-sm text-slate-400 font-medium">
                {mode === "signin" ? (
                  <>
                    Already a member? 
                    <button 
                      onClick={() => { setMode("signup"); setError(""); setMessage(""); }} 
                      className="text-[#004bb4] font-bold ml-2 hover:underline inline-flex items-center gap-1"
                    >
                      Sign up <ChevronRight size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account? 
                    <button 
                      onClick={() => { setMode("signin"); setError(""); setMessage(""); }} 
                      className="text-[#004bb4] font-bold ml-2 hover:underline inline-flex items-center gap-1"
                    >
                      Sign in <ChevronRight size={14} />
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

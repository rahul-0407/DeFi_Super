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
      setError(
        "Please configure Supabase credentials in your .env file to use Google Auth.",
      );
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
    <main className="h-screen w-full flex bg-[#f0f4f0] overflow-hidden relative font-sans">
      {/* Split Screen Container */}
      <div className="w-full h-full flex flex-col lg:flex-row">
        {/* Left Side: Branding / Background */}
        <div className="hidden lg:flex lg:w-[45%] h-full bg-[#203f34] relative flex-col justify-between p-16 overflow-hidden">
          {/* Subtle background pattern (optional) */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-[10px] font-bold text-[#77b8a2] uppercase tracking-[0.4em] mb-8">
                The Advantage
              </p>
              <h2 className="text-6xl font-serif text-[#f0f4f0] leading-tight mb-8 uppercase tracking-tighter">
                The Universal
                <br />
                Terminal for the
                <br />
                New Economy
              </h2>
              <p className="text-sm text-[#f0f4f0]/60 leading-relaxed font-mono-inter uppercase tracking-widest max-w-sm">
                Pareto is a unified interface for swaps, lending, staking, and
                institutional-grade analytics. One powerful app to manage your
                entire on-chain financial lifecycle.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 4L28 10V22L16 28L4 22V10L16 4Z"
                  stroke="#f0f4f0"
                  strokeWidth="2"
                />
                <circle cx="16" cy="16" r="6" fill="#77b8a2" />
              </svg>
              <span className="text-2xl font-serif text-[#f0f4f0] uppercase tracking-tighter">
                Pareto
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="flex-1 h-full flex items-center justify-center p-6 lg:p-20 relative bg-[#f0f4f0]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-[#d7e4ea] rounded-[3rem] p-12 lg:p-16 border border-white relative shadow-xl shadow-black/5"
          >
            <div className="w-full max-w-md mx-auto">
              {/* Header */}
              <div className="mb-12 text-center">
                <h1 className="text-5xl font-serif text-slate-800 mb-4">
                  {mode === "signin" ? "Terminal Access" : "Create Account"}
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed font-mono-inter uppercase tracking-widest">
                  {mode === "signin"
                    ? "Access your unified Pareto terminal"
                    : "Register for the next generation of financial infrastructure"}
                </p>
              </div>

              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-full bg-white border border-black/5 hover:bg-slate-50 transition-all font-bold text-[10px] uppercase tracking-[0.2em] text-slate-700 mb-10 disabled:opacity-50 shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-10">
                <div className="flex-1 h-px bg-black/5"></div>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">
                  or use e-mail
                </span>
                <div className="flex-1 h-px bg-black/5"></div>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailAuth} className="space-y-8">
                <div className="space-y-2">
                  <label
                    className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-4"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="institutional@partner.com"
                      required
                      className="w-full pl-14 pr-6 py-5 rounded-full bg-white border border-white focus:border-[#77b8a2] outline-none transition-all text-xs font-mono-inter uppercase tracking-wide text-slate-700 placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-4"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-14 pr-6 py-5 rounded-full bg-white border border-white focus:border-[#77b8a2] outline-none transition-all text-xs font-mono-inter text-slate-700 tracking-widest placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Terms of Service Checkbox (Only for Sign Up) */}
                {mode === "signup" && (
                  <div className="flex items-center gap-3 px-4">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded-full border-white text-[#203f34] focus:ring-[#203f34] bg-white accent-[#203f34]"
                    />
                    <label
                      htmlFor="terms"
                      className="text-[10px] text-slate-400 font-bold uppercase tracking-widest"
                    >
                      I agree to the{" "}
                      <a href="#" className="hover:underline text-slate-600">
                        terms of service
                      </a>
                    </label>
                  </div>
                )}

                {/* Status Messages */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white text-[10px] font-bold uppercase tracking-widest bg-rose-500 p-4 rounded-2xl text-center shadow-lg shadow-rose-500/20"
                  >
                    {error}
                  </motion.p>
                )}
                {message && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white text-[10px] font-bold uppercase tracking-widest bg-emerald-500 p-4 rounded-2xl text-center shadow-lg shadow-emerald-500/20"
                  >
                    {message}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-5 rounded-full bg-[#203f34] text-[#f0f4f0] font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-black/10 hover:bg-[#2d5244] hover:shadow-2xl transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? (
                    "Authenticating..."
                  ) : (
                    <>
                      {mode === "signin" ? "Enter Terminal" : "Create Account"}
                      <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Mode Toggle */}
              <div className="mt-12 pt-8 border-t border-black/5 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {mode === "signin" ? (
                    <>
                      New partner?
                      <button
                        onClick={() => {
                          setMode("signup");
                          setError("");
                          setMessage("");
                        }}
                        className="text-[#203f34] font-extrabold ml-2 hover:underline inline-flex items-center gap-1"
                      >
                        Create Account <ChevronRight size={10} />
                      </button>
                    </>
                  ) : (
                    <>
                      Already registered?
                      <button
                        onClick={() => {
                          setMode("signin");
                          setError("");
                          setMessage("");
                        }}
                        className="text-[#203f34] font-extrabold ml-2 hover:underline inline-flex items-center gap-1"
                      >
                        Sign in <ChevronRight size={10} />
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

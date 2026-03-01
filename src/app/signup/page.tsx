"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email.trim(), password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      
      // Auto sign in after signup
      const signInRes = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });
      
      if (signInRes?.error) {
        setError("Account created but failed to sign in automatically.");
      } else if (signInRes?.url) {
        window.location.href = signInRes.url;
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-[var(--paper-border)] bg-[var(--paper)]">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain transition-transform group-hover:scale-105" />
          <span className="font-logo font-black text-xl sm:text-2xl text-[var(--ink)] tracking-tight">Bhaaratheeya velugu</span>
        </Link>
        <ThemeToggle className="shrink-0" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-[var(--paper)] border border-[var(--paper-border)] shadow-[var(--shadow-modal)] rounded-2xl overflow-hidden"
        >
          <div className="p-6 sm:p-8 pb-6 border-b border-[var(--paper-border)] flex flex-col items-center">
            <h2 className="font-editorial font-bold text-2xl sm:text-3xl text-[var(--ink)] mb-2">Create Account</h2>
            <p className="text-[var(--ink-muted)] text-sm font-medium uppercase tracking-widest text-center">Join Bhaaratheeya velugu</p>
          </div>

          <div className="p-6 sm:p-8 bg-[var(--paper)]">
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {error && (
                <div className="p-3 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[var(--accent)] text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full py-3 px-4 rounded-xl border-2 border-[var(--paper-border)] bg-[var(--paper)] text-[var(--ink)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--masthead)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full py-3 px-4 rounded-xl border-2 border-[var(--paper-border)] bg-[var(--paper)] text-[var(--ink)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--masthead)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--ink-muted)] uppercase tracking-wider mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full py-3 px-4 rounded-xl border-2 border-[var(--paper-border)] bg-[var(--paper)] text-[var(--ink)] placeholder-[var(--ink-muted)] focus:outline-none focus:border-[var(--masthead)] transition-colors"
                  />
                  <p className="text-xs text-[var(--ink-muted)] mt-1.5">Must be at least 8 characters</p>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 mt-6 rounded-xl bg-[var(--masthead)] text-white font-bold shadow-md hover:bg-[var(--masthead-hover)] disabled:opacity-70 transition-all"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </motion.form>

            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="flex-1 h-px bg-[var(--paper-border)]"></div>
              <span className="text-xs font-medium text-[var(--ink-muted)] uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-[var(--paper-border)]"></div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl })}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border-2 border-[var(--paper-border)] bg-[var(--paper)] text-[var(--ink)] font-bold hover:border-[var(--masthead)] hover:bg-[var(--paper-elevated)] shadow-sm transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>
            
            <p className="mt-8 text-center text-sm font-medium text-[var(--ink-secondary)]">
              Already have an account?{" "}
              <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-[var(--masthead)] hover:underline font-bold">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      
      <footer className="py-6 text-center text-xs font-medium text-[var(--ink-muted)] uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Bhaaratheeya velugu
      </footer>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--ink-muted)] font-editorial uppercase tracking-widest">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}

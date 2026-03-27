'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Lock, User } from 'lucide-react';
import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageTransition from '@/components/PageTransition';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      const redirectPath = searchParams.get('redirect') || '/admin';
      router.push(redirectPath);
      router.refresh();
    } catch {
      setError('Unable to sign in right now. Please try again.');
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-dark relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[320px] bg-gold/8 rounded-full blur-3xl" />
        <div className="relative max-w-md mx-auto px-4 py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 border border-gold/25 bg-gold/8 rounded-full px-4 py-2 text-gold text-xs tracking-[0.22em] uppercase mb-4">
              <ShieldCheck size={14} />
              Admin Access
            </div>
            <h1 className="text-4xl sm:text-5xl font-light text-gold font-serif italic mb-3">
              Control Panel Login
            </h1>
            <p className="text-gray-400 text-sm sm:text-base text-center">
              Sign in with your master admin email or receptionist username and password to access the dashboard.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="bg-dark-card border border-dark-border rounded-2xl p-6 sm:p-8 space-y-5"
          >
            <div>
              <label className="block text-xs text-gray-400 tracking-[0.18em] uppercase mb-2">Email or Username</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/70" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-dark border border-dark-border rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                  placeholder="admin@thesuite.com or suite.reception"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 tracking-[0.18em] uppercase mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/70" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark border border-dark-border rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 text-center">
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold to-[#d7b65a] text-dark font-semibold rounded-xl py-3.5 shadow-[0_10px_24px_rgba(201,166,70,0.25)] hover:brightness-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In to Admin'}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </PageTransition>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginContent />
    </Suspense>
  );
}

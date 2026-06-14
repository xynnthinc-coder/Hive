"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import HiveLogo from '@/components/HiveLogo';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        'Login gagal. Cek email dan password kamu.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#030712] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-primary/10 rounded-full blur-[100px] mix-blend-screen animate-ambient" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen animate-ambient" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] bg-tertiary/10 rounded-full blur-[80px] mix-blend-screen animate-float" />
        
        {/* Subtle grid texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[1000px] bg-surface-container/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10 animate-fade-up">
        
        {/* Left: Branding Panel */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-surface-container-high/50 to-transparent border-r border-white/5">
          <div className="relative z-10">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <HiveLogo size={56} />
            </Link>
          </div>

          <div className="relative z-10 my-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wider uppercase mb-6">
              Welcome to Hive
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight text-white">
              Elevate your <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#818cf8] to-secondary">
                learning experience
              </span>
            </h1>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-[85%]">
              Platform diskusi dan belajar bersama yang dirancang khusus untuk mewujudkan ekosistem kelas digital yang lebih interaktif dan menyenangkan.
            </p>
          </div>
          
          <div className="relative z-10 flex items-center gap-6 text-sm text-on-surface-variant/50 font-medium">
            <span>© {new Date().getFullYear()} Hive</span>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative bg-surface/50">
          <div className="w-full max-w-[380px] mx-auto">
            <div className="lg:hidden mb-10 flex justify-center">
              <HiveLogo size={64} />
            </div>
            
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Selamat Datang</h2>
              <p className="text-on-surface-variant text-sm">Masuk ke akun Anda untuk melanjutkan.</p>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3 text-sm text-error mb-6 animate-shake flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="login-email" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Email atau Username</label>
                <div className="relative">
                  <input
                    id="login-email"
                    type="text"
                    placeholder="Email atau Username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-surface-container-lowest/50 border border-white/10 rounded-xl py-3.5 px-4 pl-11 text-[0.95rem] text-white outline-none transition-all placeholder:text-on-surface-variant/30 focus:bg-surface-container-low/80 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="login-password" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Password</label>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-surface-container-lowest/50 border border-white/10 rounded-xl py-3.5 px-4 pl-11 text-[0.95rem] text-white outline-none transition-all placeholder:text-on-surface-variant/30 focus:bg-surface-container-low/80 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full relative overflow-hidden group bg-white text-[#030712] border-none rounded-xl py-3.5 px-4 mt-4 text-[0.95rem] font-bold cursor-pointer transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                disabled={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#030712]/30 border-t-[#030712] rounded-full animate-spin" />
                    <span className="relative z-10">Memproses...</span>
                  </>
                ) : (
                  <span className="relative z-10">Masuk ke Hive</span>
                )}
              </button>
            </form>

            <div className="text-center mt-10 text-sm text-on-surface-variant/80">
              Belum punya akun?{' '}
              <Link href="/register" className="font-semibold text-white hover:text-primary transition-colors">
                Daftar sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

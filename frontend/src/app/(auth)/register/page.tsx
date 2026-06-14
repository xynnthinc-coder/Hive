"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import HiveLogo from '@/components/HiveLogo';

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Password tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
      });
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors).flat()[0] as string;
        setError(firstError);
      } else {
        setError('Registrasi gagal. Coba lagi.');
      }
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
            <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold tracking-wider uppercase mb-6">
              Join the Community
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight text-white">
              Start your <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-primary to-[#818cf8]">
                journey here
              </span>
            </h1>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-[85%]">
              Buat akun Anda sekarang dan bergabunglah dengan ribuan pelajar lainnya dalam kelas digital masa depan.
            </p>
          </div>
          
          <div className="relative z-10 flex items-center gap-6 text-sm text-on-surface-variant/50 font-medium">
            <span>© {new Date().getFullYear()} Hive</span>
          </div>
        </div>

        {/* Right: Form Panel */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative bg-surface/50">
          <div className="w-full max-w-[380px] mx-auto">
            <div className="lg:hidden mb-8 flex justify-center">
              <HiveLogo size={64} />
            </div>
            
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Buat Akun</h2>
              <p className="text-on-surface-variant text-sm">Bergabung ke komunitas kelas digital Anda.</p>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3 text-sm text-error mb-6 animate-shake flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-name" className="text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-wider">Nama Lengkap</label>
                <div className="relative">
                  <input
                    id="register-name"
                    type="text"
                    placeholder="Nama lengkap Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-surface-container-lowest/50 border border-white/10 rounded-xl py-3 px-4 pl-10 text-[0.9rem] text-white outline-none transition-all placeholder:text-on-surface-variant/30 focus:bg-surface-container-low/80 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-email" className="text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-wider">Email</label>
                <div className="relative">
                  <input
                    id="register-email"
                    type="email"
                    placeholder="nama@sekolah.sch.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-surface-container-lowest/50 border border-white/10 rounded-xl py-3 px-4 pl-10 text-[0.9rem] text-white outline-none transition-all placeholder:text-on-surface-variant/30 focus:bg-surface-container-low/80 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-password" className="text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    id="register-password"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-surface-container-lowest/50 border border-white/10 rounded-xl py-3 px-4 pl-10 text-[0.9rem] text-white outline-none transition-all placeholder:text-on-surface-variant/30 focus:bg-surface-container-low/80 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="register-confirm" className="text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-wider">Konfirmasi Password</label>
                <div className="relative">
                  <input
                    id="register-confirm"
                    type="password"
                    placeholder="Ulangi password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    className="w-full bg-surface-container-lowest/50 border border-white/10 rounded-xl py-3 px-4 pl-10 text-[0.9rem] text-white outline-none transition-all placeholder:text-on-surface-variant/30 focus:bg-surface-container-low/80 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Role Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.7rem] font-bold text-on-surface-variant uppercase tracking-wider">Saya adalah</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all ${
                      role === 'student'
                        ? 'bg-primary/15 border-primary/40 text-primary'
                        : 'bg-surface-container-lowest/50 border-white/10 text-on-surface-variant/60 hover:border-white/20'
                    }`}
                    onClick={() => setRole('student')}
                  >
                    Siswa
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border cursor-pointer transition-all ${
                      role === 'teacher'
                        ? 'bg-honey/15 border-honey/40 text-honey'
                        : 'bg-surface-container-lowest/50 border-white/10 text-on-surface-variant/60 hover:border-white/20'
                    }`}
                    onClick={() => setRole('teacher')}
                  >
                    Guru
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full relative overflow-hidden group bg-white text-[#030712] border-none rounded-xl py-3.5 px-4 mt-2 text-[0.95rem] font-bold cursor-pointer transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                disabled={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#030712]/30 border-t-[#030712] rounded-full animate-spin" />
                    <span className="relative z-10">Memproses...</span>
                  </>
                ) : (
                  <span className="relative z-10">Buat Akun</span>
                )}
              </button>
            </form>

            <div className="text-center mt-8 text-sm text-on-surface-variant/80">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-semibold text-white hover:text-primary transition-colors">
                Masuk di sini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/auth';
import AppLayout from '@/components/AppLayout';
import HiveCard from '@/components/ui/HiveCard';
import HiveButton from '@/components/ui/HiveButton';
import HiveAvatar from '@/components/ui/HiveAvatar';
import HiveModal from '@/components/ui/HiveModal';
import { HiveInput } from '@/components/ui/HiveInput';
import HiveToast, { showToast } from '@/components/ui/HiveToast';

const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const IconLogOut = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      className={`relative w-10 h-[22px] rounded-full cursor-pointer transition-all duration-200 border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
        ${checked ? 'bg-primary' : 'bg-surface-container-highest'}`}
      onClick={onChange}
    >
      <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200
        ${checked ? 'left-[22px]' : 'left-[3px]'}`}
      />
    </button>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  toggle?: boolean;
  checked?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
  iconColor?: string;
  badge?: string;
}

function SettingRow({ icon, label, desc, toggle, checked, onToggle, onClick, iconColor = 'bg-surface-container-high text-on-surface-variant', badge }: SettingRowProps) {
  const isClickable = !!(onClick || onToggle);
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl transition-all duration-150
        ${isClickable ? 'cursor-pointer hover:bg-surface-container-high/40 active:scale-[0.995]' : ''}`}
      onClick={onClick || (toggle ? onToggle : undefined)}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[0.875rem] font-semibold text-on-surface truncate max-w-full">{label}</span>
            {badge && (
              <span className="px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider rounded-md bg-surface-container-highest text-on-surface-variant/60 shrink-0">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant/70 break-words line-clamp-2">{desc}</p>
        </div>
      </div>
      {toggle
        ? <Toggle checked={checked || false} onChange={onToggle || (() => {})} />
        : onClick
          ? <span className="text-on-surface-variant/40 shrink-0"><IconChevronRight /></span>
          : null
      }
    </div>
  );
}

function SectionHeader({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 pb-1">
      <span className={`w-[3px] h-3.5 rounded-full ${accent}`} />
      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant/60">
        {children}
      </span>
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);

  // Password change modal
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwData, setPwData] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleLogout = async () => {
    if (!confirm('Yakin ingin logout?')) return;
    try {
      await logout();
      window.location.href = '/login';
    } catch {
      showToast('Gagal logout.', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');

    if (pwData.password.length < 8) {
      setPwError('Password baru minimal 8 karakter.');
      return;
    }
    if (pwData.password !== pwData.password_confirmation) {
      setPwError('Konfirmasi password tidak cocok.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await authService.changePassword(pwData);
      showToast(res.message);
      setShowPwModal(false);
      setPwData({ current_password: '', password: '', password_confirmation: '' });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.current_password?.[0] || 'Gagal mengubah password.';
      setPwError(msg);
    } finally { setPwLoading(false); }
  };

  return (
    <AppLayout title="Pengaturan" activeNav="settings">
      <HiveToast />

      <div className="max-w-[1200px] mx-auto w-full">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-1">
            Pengaturan <span className="text-gradient-brand">Akun</span>
          </h2>
          <p className="text-sm text-on-surface-variant">
            Kelola preferensi dan konfigurasi akun kamu.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 items-start">

          {/* ── LEFT: Account Card ── */}
          <aside className="w-full xl:w-[280px] shrink-0 flex flex-col gap-4">
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container overflow-hidden">
              {/* Top accent bar */}
              <div className="h-[3px] w-full bg-gradient-to-r from-primary/60 via-honey/40 to-transparent" />
              <div className="p-5">
                <div className="flex items-center gap-3.5 mb-5">
                  <HiveAvatar name={user?.name || '?'} size="md" hex />
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.9rem] font-bold text-on-surface truncate">{user?.name}</div>
                    <div className="text-xs text-on-surface-variant/70 truncate">{user?.email}</div>
                  </div>
                </div>
                <HiveButton
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => window.location.href = '/profile'}
                >
                  Lihat Profil
                </HiveButton>
              </div>
            </div>

            {/* Quick nav */}
            <div className="rounded-2xl border border-outline-variant/15 bg-surface-container/40 p-3 flex flex-col gap-0.5">
              {[
                { label: 'Tampilan', id: '#tampilan' },
                { label: 'Notifikasi', id: '#notifikasi' },
                { label: 'Keamanan', id: '#keamanan' },
                { label: 'Tentang', id: '#tentang' },
              ].map(item => (
                <a
                  key={item.id}
                  href={item.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50 transition-all"
                >
                  {item.label}
                  <IconChevronRight />
                </a>
              ))}
            </div>
          </aside>

          {/* ── RIGHT: Settings panels ── */}
          <main className="flex-1 flex flex-col gap-4 min-w-0">

            {/* Tampilan */}
            <section id="tampilan" className="rounded-2xl border border-outline-variant/15 bg-surface-container/50 overflow-hidden">
              <div className="px-4 pt-5 pb-2">
                <SectionHeader accent="bg-primary">Tampilan</SectionHeader>
              </div>
              <div className="px-1 pb-3">
                <SettingRow
                  icon={<IconMoon />}
                  label="Mode Gelap"
                  desc="Hive saat ini hanya mendukung tampilan gelap"
                  toggle
                  checked={darkMode}
                  onToggle={() => {
                    setDarkMode(!darkMode);
                    showToast('Hive saat ini hanya mendukung dark mode');
                  }}
                  iconColor="bg-primary/10 text-primary"
                  badge="default"
                />
                <div className="mx-4 h-px bg-outline-variant/10" />
                <SettingRow
                  icon={<IconGlobe />}
                  label="Bahasa"
                  desc="Bahasa Indonesia"
                  iconColor="bg-surface-container-high text-on-surface-variant"
                />
              </div>
            </section>

            {/* Notifikasi */}
            <section id="notifikasi" className="rounded-2xl border border-outline-variant/15 bg-surface-container/50 overflow-hidden">
              <div className="px-4 pt-5 pb-2">
                <SectionHeader accent="bg-honey">Notifikasi</SectionHeader>
              </div>
              <div className="px-1 pb-3">
                <SettingRow
                  icon={<IconBell />}
                  label="Push Notification"
                  desc="Terima notifikasi saat ada balasan atau aktivitas baru"
                  toggle
                  checked={notifEnabled}
                  onToggle={() => setNotifEnabled(!notifEnabled)}
                  iconColor="bg-honey/10 text-honey"
                />
              </div>
            </section>

            {/* Keamanan */}
            <section id="keamanan" className="rounded-2xl border border-outline-variant/15 bg-surface-container/50 overflow-hidden">
              <div className="px-4 pt-5 pb-2">
                <SectionHeader accent="bg-secondary">Keamanan</SectionHeader>
              </div>
              <div className="px-1 pb-3">
                <SettingRow
                  icon={<IconLock />}
                  label="Ubah Password"
                  desc="Perbarui kata sandi akun kamu"
                  onClick={() => {
                    setPwError('');
                    setPwData({ current_password: '', password: '', password_confirmation: '' });
                    setShowPwModal(true);
                  }}
                  iconColor="bg-secondary/10 text-secondary"
                />
              </div>
            </section>

            {/* Tentang */}
            <section id="tentang" className="rounded-2xl border border-outline-variant/15 bg-surface-container/50 overflow-hidden">
              <div className="px-4 pt-5 pb-2">
                <SectionHeader accent="bg-outline">Tentang</SectionHeader>
              </div>
              <div className="px-1 pb-3">
                <SettingRow
                  icon={<IconInfo />}
                  label="Tentang Hive"
                  desc="Versi 1.0.0 — Forum Diskusi Kelas"
                  iconColor="bg-surface-container-high text-on-surface-variant"
                />
              </div>
            </section>

            {/* Logout */}
            <div
              className="rounded-2xl border border-error/15 bg-error/[0.02] hover:bg-error/[0.05] transition-all duration-150 cursor-pointer group"
              onClick={handleLogout}
            >
              <div className="flex items-center gap-3.5 px-5 py-4">
                <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center shrink-0 text-error">
                  <IconLogOut />
                </div>
                <div>
                  <div className="text-[0.875rem] font-semibold text-error">Logout</div>
                  <div className="text-xs text-on-surface-variant/60">Keluar dari akun Hive</div>
                </div>
                <span className="ml-auto text-error/40 group-hover:text-error/70 transition-colors">
                  <IconChevronRight />
                </span>
              </div>
            </div>

          </main>
        </div>
      </div>

      {/* ── Password Change Modal ── */}
      <HiveModal open={showPwModal} onClose={() => setShowPwModal(false)} title="Ubah Password">
        <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
          {pwError && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-3 text-sm text-error">
              {pwError}
            </div>
          )}
          <HiveInput
            label="Password saat ini"
            type="password"
            value={pwData.current_password}
            onChange={e => setPwData({ ...pwData, current_password: e.target.value })}
            required
            autoComplete="current-password"
          />
          <HiveInput
            label="Password baru"
            type="password"
            value={pwData.password}
            onChange={e => setPwData({ ...pwData, password: e.target.value })}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <HiveInput
            label="Konfirmasi password baru"
            type="password"
            value={pwData.password_confirmation}
            onChange={e => setPwData({ ...pwData, password_confirmation: e.target.value })}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <div className="flex gap-2 justify-end">
            <HiveButton variant="secondary" type="button" onClick={() => setShowPwModal(false)}>Batal</HiveButton>
            <HiveButton variant="primary" type="submit" loading={pwLoading}>Ubah Password</HiveButton>
          </div>
        </form>
      </HiveModal>
    </AppLayout>
  );
}
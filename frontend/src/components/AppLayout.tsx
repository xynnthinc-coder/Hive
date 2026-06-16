"use client";

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { classService } from '@/services/class';
import type { ClassRoom } from '@/services/auth';
import { searchService, type SearchThread } from '@/services/search';
import { notificationService } from '@/services/notification';
import HiveLogo from './HiveLogo';
import HiveAvatar from './ui/HiveAvatar';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  activeNav?: string;
}

/* ── SVG Icon Components ── */
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

const IconLogOut = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const IconMessageSquare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);

/* ── Accent colors for class items ── */
const ACCENT_COLORS = [
  '#F5A623', '#919bff', '#3cddc7', '#fd6f85', '#a78bfa', '#fb923c',
];

/* ── Sidebar Nav Item ── */
function NavItem({
  active, icon, label, onClick, badge,
}: {
  active: boolean; icon: ReactNode; label: string; onClick: () => void; badge?: number;
}) {
  return (
    <button
      className={[
        'flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium',
        'cursor-pointer transition-default w-full text-left font-sans relative',
        active
          ? 'bg-honey/[0.08] text-honey before:content-[""] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[60%] before:rounded-r before:bg-honey'
          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
      ].join(' ')}
      onClick={onClick}
    >
      <span className={`w-[18px] h-[18px] shrink-0 ${active ? 'opacity-100' : 'opacity-60'}`}>{icon}</span>
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto text-[0.6rem] font-bold bg-honey text-surface rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

export default function AppLayout({ children, title = 'Dashboard', activeNav }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drawerClasses, setDrawerClasses] = useState<ClassRoom[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchThread[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Notification badge
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const navigate = (path: string) => {
    setSidebarOpen(false);
    router.push(path);
  };

  const isActive = (nav: string) => {
    if (activeNav) return activeNav === nav;
    if (nav === 'dashboard') return pathname === '/dashboard';
    if (nav === 'lounge') return pathname?.includes('/lounge');
    if (nav === 'profile') return pathname === '/profile';
    if (nav === 'notifications') return pathname === '/notifications';
    if (nav === 'settings') return pathname === '/settings';
    return false;
  };

  // Check if we're inside a class detail page
  const isClassDetail = pathname?.startsWith('/class/');
  const showBackButton = isClassDetail;

  // Extract current class ID from URL if on a class page
  const currentClassId = pathname?.match(/\/class\/(\d+)/)?.[1];

  // Load classes on mount (for desktop sidebar & mobile drawer)
  useEffect(() => {
    if (drawerClasses.length === 0 && !drawerLoading) {
      setDrawerLoading(true);
      classService.myClasses()
        .then(res => setDrawerClasses(res.classes || []))
        .catch(() => {})
        .finally(() => setDrawerLoading(false));
    }
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    notificationService.unreadCount()
      .then(res => setUnreadNotifs(res.unread_count))
      .catch(() => {});
    // Refresh every 30s
    const interval = setInterval(() => {
      notificationService.unreadCount()
        .then(res => setUnreadNotifs(res.unread_count))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Search debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearchLoading(true);
    setSearchOpen(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await searchService.threads(value.trim());
        setSearchResults(res.threads);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Figure out which class to navigate to for Lounge
  const handleLoungeNav = () => {
    if (currentClassId) {
      // Already in a class — go to its lounge
      navigate(`/class/${currentClassId}/lounge`);
    } else if (drawerClasses.length > 0) {
      // Go to first class's lounge
      navigate(`/class/${drawerClasses[0].id}/lounge`);
    } else {
      // No classes — load them, then navigate
      classService.myClasses()
        .then(res => {
          const classes = res.classes || [];
          setDrawerClasses(classes);
          if (classes.length > 0) {
            navigate(`/class/${classes[0].id}/lounge`);
          } else {
            navigate('/dashboard');
          }
        })
        .catch(() => navigate('/dashboard'));
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ═══════════════════════════════════════════════════════════════
          Mobile Class Drawer Overlay
         ═══════════════════════════════════════════════════════════════ */}
      <div
        className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ═══════════════════════════════════════════════════════════════
          Mobile Class Drawer (Google Classroom style)
         ═══════════════════════════════════════════════════════════════ */}
      <div
        className={[
          'md:hidden fixed top-0 left-0 bottom-0 w-[300px] z-[60]',
          'bg-surface-container-low/95 backdrop-blur-2xl',
          'border-r border-outline-variant/10 flex flex-col',
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Honeycomb overlay */}
        <div className="absolute inset-0 honeycomb-bg rounded-none pointer-events-none" />

        {/* Drawer header */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
          <div className="flex items-center gap-2.5">
            <HiveLogo size={38} />
            <span className="text-lg font-extrabold tracking-tight text-gradient-brand">Hive</span>
          </div>
          <button
            className="bg-transparent border-none text-on-surface-variant cursor-pointer p-1.5 rounded-xl transition-default flex items-center justify-center hover:text-on-surface hover:bg-surface-container"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="w-5 h-5"><IconX /></span>
          </button>
        </div>

        {/* Class list */}
        <div className="relative flex-1 overflow-y-auto py-3 px-3">
          <div className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-outline px-3 mb-2">
            Kelas Saya
          </div>

          {drawerLoading ? (
            <div className="flex justify-center py-8">
              <div className="spinner" />
            </div>
          ) : drawerClasses.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="w-12 h-12 rounded-2xl bg-honey/10 flex items-center justify-center mx-auto mb-3">
                <span className="w-6 h-6 text-honey"><IconBook /></span>
              </div>
              <p className="text-sm text-on-surface-variant">Belum ada kelas</p>
              <button
                className="mt-3 text-xs font-semibold text-honey bg-honey/10 py-2 px-4 rounded-full border border-honey/20 cursor-pointer font-sans transition-default hover:bg-honey/20"
                onClick={() => navigate('/dashboard')}
              >
                Gabung Kelas
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {drawerClasses.map((cls, i) => {
                const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
                const isCurrentClass = currentClassId === String(cls.id);

                return (
                  <button
                    key={cls.id}
                    className={[
                      'flex items-center gap-3 py-3 px-3 rounded-xl text-left w-full',
                      'cursor-pointer transition-default font-sans border-none',
                      isCurrentClass
                        ? 'bg-honey/[0.08] border-l-2 border-l-honey'
                        : 'bg-transparent hover:bg-surface-container-high/40',
                    ].join(' ')}
                    onClick={() => navigate(`/class/${cls.id}`)}
                  >
                    {/* Class color badge */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[1rem] font-bold shrink-0"
                      style={{ backgroundColor: `${accent}15`, color: accent }}
                    >
                      {cls.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${isCurrentClass ? 'text-honey' : 'text-on-surface'}`}>
                        {cls.name}
                      </div>
                      <div className="text-[0.65rem] text-on-surface-variant truncate">
                        {cls.academic_year}
                        {cls.members_count != null && ` · ${cls.members_count} anggota`}
                      </div>
                    </div>
                    <span className={`w-4 h-4 shrink-0 ${isCurrentClass ? 'text-honey' : 'text-outline'}`}>
                      <IconChevronRight />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer footer — user info */}
        <div className="relative px-4 py-3 border-t border-outline-variant/10 flex items-center gap-3">
          <HiveAvatar name={user?.name || '?'} size="sm" hex />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-on-surface truncate">{user?.name}</div>
            <div className={`text-[0.65rem] capitalize font-medium ${user?.role === 'teacher' ? 'text-honey' : 'text-on-surface-variant'}`}>
              {user?.role || 'student'}
            </div>
          </div>
          <button
            className="bg-transparent border-none text-outline cursor-pointer p-2 rounded-xl transition-default flex items-center justify-center hover:text-error hover:bg-error/10"
            onClick={logout}
            title="Logout"
          >
            <span className="w-[18px] h-[18px]"><IconLogOut /></span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          Desktop Sidebar (unchanged)
         ═══════════════════════════════════════════════════════════════ */}
      <aside className="w-[260px] bg-surface-container-low/80 backdrop-blur-xl flex-col fixed top-0 left-0 bottom-0 z-50 border-r border-outline-variant/10 transition-slow hidden md:flex">
        {/* Honeycomb pattern overlay */}
        <div className="absolute inset-0 honeycomb-bg rounded-none pointer-events-none" />

        {/* Logo */}
        <div className="relative p-6 pb-4 flex items-center gap-2">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <div className="relative">
              <HiveLogo size={50} />
              <div className="absolute inset-0 rounded-lg bg-honey/20 blur-lg opacity-0 group-hover:opacity-100 transition-default" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gradient-brand">Hive</span>
          </div>
        </div>

        <div className="h-px bg-outline-variant/15 mx-5" />

        {/* Main nav */}
        <nav className="relative py-3 px-3 flex flex-col gap-0.5">
          <div className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-outline px-3 mb-1">Menu</div>
          <NavItem active={isActive('dashboard')} icon={<IconHome />} label="Dashboard" onClick={() => navigate('/dashboard')} />
          <NavItem active={isActive('notifications')} icon={<IconBell />} label="Notifikasi" onClick={() => navigate('/notifications')} badge={unreadNotifs} />
          <NavItem active={isActive('profile')} icon={<IconUser />} label="Profile" onClick={() => navigate('/profile')} />
        </nav>

        <div className="h-px bg-outline-variant/15 mx-5" />

        {/* Secondary nav */}
        <nav className="relative py-3 px-3 flex flex-col gap-0.5">
          <div className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-outline px-3 mb-1">Lainnya</div>
          <NavItem active={isActive('settings')} icon={<IconSettings />} label="Pengaturan" onClick={() => navigate('/settings')} />
        </nav>

        <div className="h-px bg-outline-variant/15 mx-5" />

        {/* Class list */}
        <div className="relative flex-1 overflow-y-auto py-3 px-3 min-h-0">
          <div className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-outline px-3 mb-2">Kelas Saya</div>
          {drawerClasses.length === 0 && !drawerLoading ? (
            <div className="text-xs text-on-surface-variant/50 px-3 py-2">Belum ada kelas</div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {drawerClasses.map((cls, i) => {
                const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
                const isCurrentClass = currentClassId === String(cls.id);
                return (
                  <button
                    key={cls.id}
                    className={[
                      'flex items-center gap-2.5 py-2 px-3 rounded-xl text-left w-full',
                      'cursor-pointer transition-default font-sans border-none text-sm',
                      isCurrentClass
                        ? 'bg-honey/[0.08] text-honey font-semibold'
                        : 'bg-transparent text-on-surface-variant hover:bg-surface-container-high/40 hover:text-on-surface',
                    ].join(' ')}
                    onClick={() => navigate(`/class/${cls.id}`)}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                    <span className="truncate">{cls.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User section */}
        <div className="relative mt-auto px-4 py-4 flex items-center gap-3 border-t border-outline-variant/10">
          <HiveAvatar name={user?.name || '?'} size="sm" hex />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-on-surface truncate">{user?.name}</div>
            <div className={`text-[0.65rem] capitalize font-medium ${user?.role === 'teacher' ? 'text-honey' : 'text-on-surface-variant'}`}>
              {user?.role || 'student'}
            </div>
          </div>
          <button
            className="bg-transparent border-none text-outline cursor-pointer p-2 rounded-xl transition-default flex items-center justify-center hover:text-error hover:bg-error/10"
            onClick={logout}
            title="Logout"
          >
            <span className="w-[18px] h-[18px]"><IconLogOut /></span>
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════
          Main Content Area
         ═══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 md:ml-[260px] min-h-screen flex flex-col pb-20 md:pb-0">
        {/* Header */}
        <header className="px-4 md:px-8 h-16 flex items-center justify-between glass-bg border-b border-outline-variant/10 sticky top-0 z-40">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Mobile burger — opens class drawer */}
            <button
              className="md:hidden bg-transparent border-none text-on-surface-variant cursor-pointer p-1.5 rounded-xl transition-default flex items-center justify-center hover:text-on-surface hover:bg-surface-container"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="w-5 h-5"><IconMenu /></span>
            </button>
            {showBackButton && (
              <button
                className="bg-transparent border-none text-on-surface-variant cursor-pointer p-1.5 rounded-xl transition-default flex items-center justify-center hover:text-on-surface hover:bg-surface-container"
                onClick={() => router.back()}
                title="Kembali"
              >
                <span className="w-5 h-5"><IconArrowLeft /></span>
              </button>
            )}
            <h1 className="text-lg font-bold tracking-tight truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Search bar (desktop only) */}
            <div ref={searchRef} className="hidden md:block relative">
              <div className={`flex items-center gap-2 bg-surface-container-high/60 rounded-full py-2 px-4 min-w-[260px] border transition-default ${
                searchOpen ? 'border-honey/30 bg-surface-container-high' : 'border-outline-variant/10'
              } focus-within:border-honey/30 focus-within:bg-surface-container-high`}>
                <span className="w-4 h-4 text-outline shrink-0"><IconSearch /></span>
                <input
                  type="text"
                  placeholder="Cari thread..."
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  onFocus={() => { if (searchQuery.trim().length >= 2) setSearchOpen(true); }}
                  className="bg-transparent border-none outline-none font-sans text-sm text-on-surface w-full placeholder:text-outline"
                />
                {searchQuery && (
                  <button
                    className="bg-transparent border-none cursor-pointer text-outline hover:text-on-surface p-0.5 transition-default"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false); }}
                  >
                    <span className="w-3.5 h-3.5 block"><IconX /></span>
                  </button>
                )}
              </div>

              {/* Search Dropdown */}
              {searchOpen && (
                <div className="absolute top-full mt-2 left-0 right-0 min-w-[360px] max-h-[400px] overflow-y-auto rounded-2xl border border-outline-variant/15 bg-surface-container/95 backdrop-blur-xl shadow-2xl z-50">
                  {searchLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="spinner" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="w-8 h-8 mx-auto mb-2 text-on-surface-variant/50"><IconSearch /></div>
                      <p className="text-sm text-on-surface-variant">Tidak ada hasil untuk &quot;{searchQuery}&quot;</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      <div className="px-4 py-2 text-[0.6rem] font-bold uppercase tracking-widest text-outline">
                        {searchResults.length} hasil ditemukan
                      </div>
                      {searchResults.map(thread => (
                        <button
                          key={thread.id}
                          className="w-full text-left px-4 py-3 hover:bg-surface-container-high/60 transition-default cursor-pointer bg-transparent border-none font-sans flex items-start gap-3"
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                            navigate(`/class/${thread.class_id}/thread/${thread.id}`);
                          }}
                        >
                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
                              {thread.forum_channel?.icon === '💬' ? (
                                <div className="w-4 h-4"><IconMessageSquare /></div>
                              ) : (
                                thread.forum_channel?.icon || <div className="w-4 h-4"><IconMessageSquare /></div>
                              )}
                            </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-on-surface truncate">{thread.title}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[0.65rem] text-honey font-medium">{thread.class_name}</span>
                              <span className="text-[0.5rem] text-outline">•</span>
                              <span className="text-[0.65rem] text-on-surface-variant">{thread.forum_channel?.name}</span>
                              <span className="text-[0.5rem] text-outline">•</span>
                              <span className="text-[0.65rem] text-on-surface-variant">↑{thread.vote_count} · {thread.reply_count} balasan</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Settings gear (mobile) */}
            <button
              className="md:hidden bg-transparent border-none text-on-surface-variant cursor-pointer p-2 rounded-xl transition-default flex items-center justify-center hover:text-on-surface hover:bg-surface-container"
              onClick={() => navigate('/settings')}
              title="Pengaturan"
            >
              <span className="w-5 h-5"><IconSettings /></span>
            </button>
            {/* Avatar */}
            <div className="cursor-pointer" onClick={() => navigate('/profile')}>
              <HiveAvatar name={user?.name || '?'} size="sm" hex />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8 flex-1 animate-slide-up overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          Mobile Bottom Navigation — Home, Lounge, Profile
         ═══════════════════════════════════════════════════════════════ */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-[68px] glass-bg border-t border-outline-variant/10 z-50 items-center justify-around px-4 safe-area-bottom">
        {/* Home */}
        <button
          className={[
            'flex flex-col items-center gap-1 py-2 px-4 rounded-2xl relative',
            'text-[0.6rem] font-semibold cursor-pointer transition-default',
            'bg-transparent border-none font-sans uppercase tracking-wide',
            isActive('dashboard') ? 'text-honey' : 'text-outline hover:text-on-surface',
          ].join(' ')}
          onClick={() => navigate('/dashboard')}
        >
          <span className="w-[22px] h-[22px]"><IconHome /></span>
          <span>Home</span>
          {isActive('dashboard') && (
            <span className="absolute -bottom-0 w-5 h-0.5 rounded-full bg-honey" />
          )}
        </button>

        {/* Lounge — center, slightly emphasized */}
        <button
          className={[
            'flex flex-col items-center gap-1 py-2 px-4 rounded-2xl relative',
            'text-[0.6rem] font-semibold cursor-pointer transition-default',
            'bg-transparent border-none font-sans uppercase tracking-wide',
            isActive('lounge') || (activeNav === 'class' && pathname?.includes('/lounge'))
              ? 'text-secondary'
              : 'text-outline hover:text-on-surface',
          ].join(' ')}
          onClick={handleLoungeNav}
        >
          <span className="w-[22px] h-[22px] relative">
            <IconChat />
            {/* Live dot */}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary border-2 border-surface" />
          </span>
          <span>Lounge</span>
          {(isActive('lounge') || (activeNav === 'class' && pathname?.includes('/lounge'))) && (
            <span className="absolute -bottom-0 w-5 h-0.5 rounded-full bg-secondary" />
          )}
        </button>

        {/* Profile */}
        <button
          className={[
            'flex flex-col items-center gap-1 py-2 px-4 rounded-2xl relative',
            'text-[0.6rem] font-semibold cursor-pointer transition-default',
            'bg-transparent border-none font-sans uppercase tracking-wide',
            isActive('profile') ? 'text-honey' : 'text-outline hover:text-on-surface',
          ].join(' ')}
          onClick={() => navigate('/profile')}
        >
          <span className="w-[22px] h-[22px]"><IconUser /></span>
          <span>Profil</span>
          {isActive('profile') && (
            <span className="absolute -bottom-0 w-5 h-0.5 rounded-full bg-honey" />
          )}
        </button>
      </nav>
    </div>
  );
}

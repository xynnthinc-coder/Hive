"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/auth';
import AppLayout from '@/components/AppLayout';
import HiveCard from '@/components/ui/HiveCard';
import HiveButton from '@/components/ui/HiveButton';
import HiveBadge from '@/components/ui/HiveBadge';
import HiveAvatar from '@/components/ui/HiveAvatar';
import HiveModal from '@/components/ui/HiveModal';
import { HiveInput } from '@/components/ui/HiveInput';
import HiveToast, { showToast } from '@/components/ui/HiveToast';
import HivePagination from '@/components/ui/HivePagination';

const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const IconTrendUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconReply = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 00-4-4H4"/>
  </svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent: string }) {
  return (
    <div className={`relative flex flex-col gap-3 p-5 rounded-xl border border-outline-variant/15 bg-surface-container/40 overflow-hidden group hover:-translate-y-0.5 transition-all duration-200`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[3rem] opacity-40 blur-2xl transition-opacity group-hover:opacity-60 ${accent}`} />
      <div className={`relative w-9 h-9 rounded-lg flex items-center justify-center ${accent.replace('/20', '/10')} text-on-surface-variant`}>
        {icon}
      </div>
      <div className="relative">
        <div className="text-2xl font-bold text-on-surface leading-none mb-1">{value}</div>
        <div className="text-xs text-on-surface-variant/70 font-medium">{label}</div>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

const IconEdit3 = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IconMessageCircle = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
const IconInbox = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;

const activityConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  thread: { icon: <IconEdit3 />, color: 'bg-primary/10 text-primary', label: 'Membuat thread' },
  reply: { icon: <IconMessageCircle />, color: 'bg-secondary/10 text-secondary', label: 'Membalas thread' },
  best_answer: { icon: <IconStar />, color: 'bg-honey/10 text-honey', label: 'Best answer di' },
};

export default function Profile() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    nickname: user?.nickname || '',
    bio: user?.bio || '',
  });
  const [editLoading, setEditLoading] = useState(false);

  // Stats & Activity
  const [stats, setStats] = useState<{
    thread_count: number; reply_count: number; total_upvotes: number;
    class_count: number; best_answer_count: number;
  } | null>(null);
  const [activity, setActivity] = useState<Array<{
    type: string; id: number; title: string; body?: string;
    class_id?: number; class_name?: string; thread_id?: number;
    vote_count?: number; reply_count?: number; created_at: string;
  }>>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityLastPage, setActivityLastPage] = useState(1);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await authService.stats();
        setStats(res);
      } catch {} finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const loadActivity = async (page: number) => {
    setActivityLoading(true);
    try {
      // Assuming authService.activity() now accepts page parameter
      const actRes = await authService.activity(page);
      setActivity(actRes.activity || actRes); // fallback if structure changed
      setActivityPage(actRes.current_page || 1);
      setActivityLastPage(actRes.last_page || 1);
    } catch {} finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    loadActivity(1);
  }, []);

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await authService.updateProfile({
        name: editData.name.trim(),
        nickname: editData.nickname.trim() || null,
        bio: editData.bio.trim() || null,
      });
      showToast(res.message);
      if (setUser && res.user) setUser(res.user);
      setShowEdit(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal memperbarui profil.', 'error');
    } finally { setEditLoading(false); }
  };

  const detailItems = [
    { icon: <IconMail />, label: 'Email', value: user?.email },
    { icon: <IconShield />, label: 'Role', value: user?.role || 'student', capitalize: true },
    { icon: <IconCalendar />, label: 'Bergabung', value: memberSince },
    { icon: <IconUser />, label: 'Bio', value: user?.bio || '-' },
  ];

  return (
    <AppLayout title="Profile" activeNav="profile">
      <HiveToast />

      {/* ── Full-width two-column layout ── */}
      <div className="flex flex-col xl:flex-row gap-6 w-full max-w-[1200px] mx-auto">

        {/* ── LEFT: Identity Panel ── */}
        <aside className="w-full xl:w-[300px] shrink-0 flex flex-col gap-4 ">

          {/* Avatar card */}
          <div className="relative rounded-2xl border border-outline-variant/20 bg-surface-container overflow-hidden">
            {/* Banner */}
            <div className="h-28 w-full bg-gradient-to-br from-primary/20 via-surface-container-high to-surface-container-highest relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
            </div>

            {/* Avatar overlap */}
            <div className="px-6 pb-6 flex flex-col items-center text-center">
              <div className="relative -mt-10 mb-4 w-fit drop-shadow-md">
                <div className="p-1.5 bg-surface-container hex-clip">
                  <HiveAvatar name={user?.name || '?'} size="xl" hex />
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-[1.15rem] font-bold text-on-surface tracking-tight leading-tight">
                  {user?.name}
                </h2>
                {user?.nickname && (
                  <p className="text-sm text-on-surface-variant mt-0.5">@{user.nickname}</p>
                )}
              </div>

              <div className="mb-5">
                <HiveBadge variant={user?.role === 'teacher' ? 'teacher' : 'member'} dot>
                  {user?.role === 'teacher' ? 'Guru' : 'Siswa'}
                </HiveBadge>
              </div>

              <HiveButton
                variant="secondary"
                size="sm"
                icon={<IconEdit />}
                className="w-full"
                onClick={() => {
                  setEditData({ name: user?.name || '', nickname: user?.nickname || '', bio: user?.bio || '' });
                  setShowEdit(true);
                }}
              >
                Edit Profil
              </HiveButton>
            </div>
          </div>

          {/* Meta info card */}
          <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-5 flex flex-col gap-4">
            <h3 className="text-[0.65rem] font-bold uppercase tracking-widest text-on-surface-variant/60">
              Informasi Akun
            </h3>
            {detailItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 text-on-surface-variant mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.65rem] font-bold uppercase tracking-wider text-on-surface-variant/50 mb-0.5">
                    {item.label}
                  </div>
                  <div className={`text-sm font-medium text-on-surface break-words ${item.capitalize ? 'capitalize' : ''}`}>
                    {item.value || '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── RIGHT: Activity & Stats ── */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">

          {/* Page heading */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface mb-1">
              Profil <span className="text-gradient-brand">Pengguna</span>
            </h2>
            <p className="text-sm text-on-surface-variant">
              Lihat statistik dan riwayat aktivitas kamu di Hive.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<IconChat />}
              label="Thread Dibuat"
              value={statsLoading ? '—' : (stats?.thread_count ?? 0)}
              accent="bg-primary/20"
            />
            <StatCard
              icon={<IconTrendUp />}
              label="Upvotes Diterima"
              value={statsLoading ? '—' : (stats?.total_upvotes ?? 0)}
              accent="bg-secondary/20"
            />
            <StatCard
              icon={<IconReply />}
              label="Balasan Ditulis"
              value={statsLoading ? '—' : (stats?.reply_count ?? 0)}
              accent="bg-honey/20"
            />
            <StatCard
              icon={<IconStar />}
              label="Best Answer"
              value={statsLoading ? '—' : (stats?.best_answer_count ?? 0)}
              accent="bg-primary/20"
            />
          </div>

          {/* Activity feed */}
          <div className="flex-1 rounded-2xl border border-outline-variant/15 bg-surface-container/30 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-primary block" />
                Aktivitas Terbaru
              </h3>
              {activity.length > 0 && (
                <span className="text-[0.7rem] text-on-surface-variant/50 font-medium uppercase tracking-wider">
                  {activity.length} item
                </span>
              )}
            </div>

            {activityLoading ? (
              <div className="flex flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high/50 shrink-0 animate-pulse" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="h-2.5 rounded bg-surface-container-highest/60 w-3/4 animate-pulse" />
                      <div className="h-2 rounded bg-surface-container-highest/40 w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant/50">
                  <div className="mb-4 text-on-surface-variant/30"><IconInbox /></div>
                  <p className="text-sm font-medium">Belum ada aktivitas</p>
                  <p className="text-xs mt-1">Aktivitas forum Anda akan muncul di sini</p>
                </div>
            ) : (
              <div className="flex flex-col gap-1">
                {activity.map((item, i) => {
                  const config = activityConfig[item.type] || activityConfig.thread;
                  return (
                    <button
                      key={`${item.type}-${item.id}-${i}`}
                      className="w-full text-left flex items-center gap-3 py-2.5 px-3 rounded-xl bg-transparent border-none cursor-pointer transition-default hover:bg-surface-container-high/40 font-sans group"
                      onClick={() => {
                        if (item.class_id && item.type === 'thread') {
                          router.push(`/class/${item.class_id}/thread/${item.id}`);
                        } else if (item.class_id && item.thread_id) {
                          router.push(`/class/${item.class_id}/thread/${item.thread_id}`);
                        }
                      }}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                        <span className="text-sm">{config.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-on-surface-variant mb-0.5">
                          {config.label} <span className="text-honey font-medium">{item.class_name}</span>
                        </div>
                        <div className="text-sm font-semibold text-on-surface truncate group-hover:text-honey transition-colors">
                          {item.title}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[0.6rem] text-outline">{timeAgo(item.created_at)}</div>
                        {(item.vote_count !== undefined && item.vote_count > 0) && (
                          <div className="text-[0.6rem] text-honey font-medium">↑{item.vote_count}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
                <HivePagination 
                  currentPage={activityPage} 
                  lastPage={activityLastPage} 
                  onPageChange={loadActivity} 
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Edit Profile Modal ── */}
      <HiveModal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Profil">
        <form onSubmit={handleEditProfile} className="flex flex-col gap-5">
          <HiveInput label="Nama lengkap" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} required />
          <HiveInput label="Nickname (opsional)" placeholder="@username" value={editData.nickname} onChange={e => setEditData({...editData, nickname: e.target.value})} maxLength={50} />
          <HiveInput.Textarea label="Bio (opsional)" placeholder="Ceritakan sedikit tentang kamu..." value={editData.bio} onChange={e => setEditData({...editData, bio: e.target.value})} rows={3} maxLength={500} />
          <div className="flex gap-2 justify-end pt-1">
            <HiveButton variant="secondary" type="button" onClick={() => setShowEdit(false)}>Batal</HiveButton>
            <HiveButton variant="primary" type="submit" loading={editLoading}>Simpan Perubahan</HiveButton>
          </div>
        </form>
      </HiveModal>
    </AppLayout>
  );
}
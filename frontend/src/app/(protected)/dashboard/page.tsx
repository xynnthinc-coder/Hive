"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { classService } from '@/services/class';
import { feedService, type FeedThread } from '@/services/feed';
import { threadService, type ForumChannel } from '@/services/thread';
import type { ClassRoom } from '@/services/auth';
import AppLayout from '@/components/AppLayout';
import HiveCard from '@/components/ui/HiveCard';
import HiveButton from '@/components/ui/HiveButton';
import HiveBadge from '@/components/ui/HiveBadge';
import HiveAvatar from '@/components/ui/HiveAvatar';
import HiveModal from '@/components/ui/HiveModal';
import HiveEmptyState from '@/components/ui/HiveEmptyState';
import { HiveInput } from '@/components/ui/HiveInput';
import HiveToast, { showToast } from '@/components/ui/HiveToast';
import MarkdownEditor from '@/components/ui/MarkdownEditor';
import { stripMarkdown } from '@/utils/markdown';

/* ─── Icons ─────────────────────────────────────────────────────────── */
const IcoKey = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);
const IcoPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcoUsers = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IcoMsg = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const IcoCal = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IcoBook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);
const IcoChat = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const IcoBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const IconFire = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>
  </svg>
);
const IconArrowUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);
const IconComment = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const IconMsgEmpty = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

/* ─── Banner color per class ───────────────────────────────── */
const ACCENT_COLORS = [
  '#F5A623', '#919bff', '#3cddc7', '#fd6f85', '#a78bfa', '#fb923c',
];

/* ─── Helpers ──────────────────────────────────────────────── */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Selamat pagi';
  if (h < 17) return 'Selamat siang';
  return 'Selamat malam';
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/* ─── Component ──────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [myClasses, setMyClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading]     = useState(true);

  /* join */
  const [showJoin, setShowJoin]   = useState(false);
  const [joinCode, setJoinCode]   = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  /* create */
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({ name: '', description: '', academic_year: '' });
  const [createLoading, setCreateLoading] = useState(false);

  /* feed */
  const [feedThreads, setFeedThreads] = useState<FeedThread[]>([]);
  const [hotThreads, setHotThreads] = useState<FeedThread[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [feedPage, setFeedPage] = useState(1);
  const [feedHasMore, setFeedHasMore] = useState(false);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);

  /* new thread from dashboard */
  const [showNewThread, setShowNewThread] = useState(false);
  const [ntClassId, setNtClassId] = useState<number>(0);
  const [ntChannels, setNtChannels] = useState<ForumChannel[]>([]);
  const [ntChannelId, setNtChannelId] = useState<number>(0);
  const [ntTitle, setNtTitle] = useState('');
  const [ntBody, setNtBody] = useState('');
  const [ntLoading, setNtLoading] = useState(false);
  const [ntChannelLoading, setNtChannelLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [classRes, feedRes, hotRes] = await Promise.allSettled([
          classService.myClasses(),
          feedService.list(),
          feedService.hot()
        ]);

        if (classRes.status === 'fulfilled') {
          setMyClasses(classRes.value.classes);
        }
        
        if (feedRes.status === 'fulfilled') {
          setFeedThreads(feedRes.value.threads || []);
          setFeedHasMore((feedRes.value.meta?.current_page || 1) < (feedRes.value.meta?.last_page || 1));
        }

        if (hotRes.status === 'fulfilled') {
          setHotThreads(hotRes.value.threads || []);
        }
      } finally {
        setLoading(false);
        setFeedLoading(false);
      }
    };
    init();
  }, []);

  // Reload feed when class filter changes
  useEffect(() => {
    if (feedLoading) return; // Skip initial render
    const reload = async () => {
      setFeedLoading(true);
      setFeedPage(1);
      try {
        const params: any = {};
        if (selectedClass) params.class_id = selectedClass;
        const feedRes = await feedService.list(params);
        setFeedThreads(feedRes.threads || []);
        setFeedHasMore(feedRes.meta?.current_page < feedRes.meta?.last_page);
      } catch {}
      setFeedLoading(false);
    };
    reload();
  }, [selectedClass]);

  const loadMoreFeed = async () => {
    const nextPage = feedPage + 1;
    setFeedLoadingMore(true);
    try {
      const params: any = { page: nextPage };
      if (selectedClass) params.class_id = selectedClass;
      const feedRes = await feedService.list(params);
      setFeedThreads(prev => [...prev, ...(feedRes.threads || [])]);
      setFeedPage(nextPage);
      setFeedHasMore(feedRes.meta?.current_page < feedRes.meta?.last_page);
    } catch {}
    setFeedLoadingMore(false);
  };

  const loadClasses = async () => {
    try {
      const res = await classService.myClasses();
      setMyClasses(res.classes);
    } catch {} finally { setLoading(false); }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinLoading(true);
    try {
      const res = await classService.join(joinCode.trim());
      showToast(res.message);
      setJoinCode('');
      setShowJoin(false);
      await loadClasses();
    } catch (err: any) {
      showToast(err.response?.data?.errors?.invite_code?.[0] || err.response?.data?.message || 'Gagal bergabung.', 'error');
    } finally { setJoinLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createData.name.trim() || !createData.academic_year.trim()) return;
    setCreateLoading(true);
    try {
      const res = await classService.create(createData);
      showToast(res.message);
      setShowCreate(false);
      setCreateData({ name: '', description: '', academic_year: '' });
      await loadClasses();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal membuat kelas.', 'error');
    } finally { setCreateLoading(false); }
  };

  /* Navigate to thread — needs class_id from forum_channel */
  const goToThread = (thread: FeedThread) => {
    const classId = thread.forum_channel?.class_id;
    if (classId) {
      router.push(`/class/${classId}/thread/${thread.id}`);
    }
  };

  /* Load channels when user picks a class for new thread */
  const handleNtClassChange = async (classId: number) => {
    setNtClassId(classId);
    setNtChannels([]);
    setNtChannelId(0);
    if (!classId) return;
    setNtChannelLoading(true);
    try {
      const res = await threadService.getChannels(classId);
      setNtChannels(res.channels);
      if (res.channels.length > 0) setNtChannelId(res.channels[0].id);
    } catch {}
    setNtChannelLoading(false);
  };

  const handleNewThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ntClassId || !ntChannelId || !ntTitle.trim() || !ntBody.trim()) return;
    setNtLoading(true);
    try {
      const res = await threadService.create(ntClassId, {
        forum_channel_id: ntChannelId,
        title: ntTitle.trim(),
        body: ntBody.trim(),
      });
      showToast('Thread berhasil dibuat!');
      setShowNewThread(false);
      setNtTitle(''); setNtBody(''); setNtClassId(0); setNtChannels([]); setNtChannelId(0);
      router.push(`/class/${ntClassId}/thread/${res.thread.id}`);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal membuat thread.', 'error');
    } finally { setNtLoading(false); }
  };

  const openNewThread = () => {
    setNtTitle(''); setNtBody(''); setNtChannels([]); setNtChannelId(0);
    if (myClasses.length > 0) {
      setNtClassId(myClasses[0].id);
      handleNtClassChange(myClasses[0].id);
    }
    setShowNewThread(true);
  };

  return (
    <AppLayout title="Dashboard" activeNav="dashboard">
      <HiveToast />

      {/* ── Greeting ── */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-[1.75rem] font-bold tracking-tight mb-1">
            {greeting()}, <span className="text-gradient-brand">{user?.name?.split(' ')[0]}</span> ✦
          </h2>
          <p className="text-sm text-on-surface-variant">
            {myClasses.length > 0
              ? `Kamu punya ${myClasses.length} kelas aktif.`
              : 'Belum ada kelas. Yuk gabung atau buat kelas baru!'}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <HiveButton variant="secondary" size="md" icon={<IcoKey />} onClick={() => setShowJoin(true)}>
            Gabung
          </HiveButton>
          <HiveButton variant="primary" size="md" icon={<IcoPlus />} onClick={() => setShowCreate(true)}>
            Buat Kelas
          </HiveButton>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 stagger-children">
        {[
          { icon: <IcoBook />, color: 'text-honey', bg: 'bg-honey/[0.08]', num: myClasses.length, label: 'Kelas aktif' },
          { icon: <IcoChat />, color: 'text-secondary', bg: 'bg-secondary/[0.08]', num: feedThreads.length, label: 'Thread terbaru' },
          { icon: <IcoBell />, color: 'text-primary', bg: 'bg-primary/[0.08]', num: hotThreads.length, label: 'Hot today' },
        ].map((s, i) => (
          <HiveCard key={i} padding="md" className="relative overflow-hidden">
            {/* Accent glow */}
            <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-[2rem] ${s.bg} opacity-60 blur-xl`} />
            <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg} ${s.color}`}>
              {s.icon}
            </div>
            <div className="relative text-2xl font-bold leading-none mb-1 text-on-surface">{s.num}</div>
            <div className="relative text-xs text-on-surface-variant">{s.label}</div>
          </HiveCard>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          Global Thread Feed
         ═══════════════════════════════════════════════════════════════ */}

      {/* ── Class Filter Chips ── */}
      {myClasses.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none">
          <button
            className={[
              'flex items-center gap-1.5 border rounded-full py-2 px-4 text-xs font-semibold font-sans cursor-pointer transition-default whitespace-nowrap shrink-0',
              selectedClass === null
                ? 'bg-honey/10 border-honey/25 text-honey'
                : 'bg-surface-container-high/60 border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface',
            ].join(' ')}
            onClick={() => setSelectedClass(null)}
          >
            Semua Kelas
          </button>
          {myClasses.map((cls, i) => (
            <button
              key={cls.id}
              className={[
                'flex items-center gap-1.5 border rounded-full py-2 px-4 text-xs font-semibold font-sans cursor-pointer transition-default whitespace-nowrap shrink-0',
                selectedClass === cls.id
                  ? 'bg-honey/10 border-honey/25 text-honey'
                  : 'bg-surface-container-high/60 border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface',
              ].join(' ')}
              onClick={() => setSelectedClass(cls.id)}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ACCENT_COLORS[i % ACCENT_COLORS.length] }} />
              {cls.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Hot Today ── */}
      {hotThreads.length > 0 && selectedClass === null && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-honey"><IconFire /></span>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-honey">Hot Today</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 pt-2 -my-2 px-1 -mx-1 scrollbar-none">
            {hotThreads.map(thread => (
              <HiveCard
                key={thread.id}
                interactive
                padding="md"
                className="min-w-[260px] max-w-[300px] shrink-0"
                onClick={() => goToThread(thread)}
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <HiveBadge variant="primary">{thread.forum_channel?.name}</HiveBadge>
                  {thread.class_name && (
                    <span className="text-[0.6rem] text-on-surface-variant/60 font-medium">· {thread.class_name}</span>
                  )}
                </div>
                <h4 className="text-sm font-semibold mb-3 leading-snug line-clamp-2 text-on-surface">{thread.title}</h4>
                <div className="flex items-center gap-2.5">
                  <HiveAvatar name={thread.user?.name || '?'} size="xs" />
                  <span className="flex items-center gap-1 text-xs text-on-surface-variant"><IconArrowUp /> {thread.vote_count}</span>
                  <span className="flex items-center gap-1 text-xs text-on-surface-variant"><IconComment /> {thread.reply_count}</span>
                </div>
              </HiveCard>
            ))}
          </div>
        </div>
      )}

      {/* ── Global Thread List ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-4 rounded-full bg-primary" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-outline">
            {selectedClass ? 'Diskusi Kelas' : 'Semua Diskusi'}
          </span>
        </div>

        {feedLoading ? (
          <div className="flex items-center justify-center min-h-[200px]"><div className="spinner" /></div>
        ) : feedThreads.length === 0 ? (
          <HiveEmptyState
            icon={<IconMsgEmpty />}
            title="Belum ada diskusi"
            description={myClasses.length === 0
              ? 'Gabung ke kelas dulu, lalu mulai berdiskusi!'
              : 'Belum ada thread di kelas kamu. Jadilah yang pertama!'}
          />
        ) : (
          <div className="flex flex-col gap-3 stagger-children">
            {feedThreads.map(thread => (
              <HiveCard
                key={thread.id}
                interactive
                padding="md"
                onClick={() => goToThread(thread)}
              >
                {thread.is_pinned && (
                  <div className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-honey mb-2"><IconPin /> Pinned</div>
                )}

                {/* Author row */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <HiveAvatar name={thread.user?.name || '?'} size="sm" />
                  <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                    <span className="text-sm font-semibold text-on-surface">{thread.user?.display_name || thread.user?.name}</span>
                    <span className="text-xs text-outline">{timeAgo(thread.created_at)}</span>
                  </div>
                  {/* Class name badge (global feed) */}
                  {thread.class_name && (
                    <span className="text-[0.6rem] font-semibold text-on-surface-variant/60 bg-surface-container-high/60 py-1 px-2.5 rounded-full shrink-0">
                      {thread.class_name}
                    </span>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-[0.95rem] font-bold mb-1.5 leading-snug text-on-surface">{thread.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-3 line-clamp-2">
                  {stripMarkdown(thread.body)}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-on-surface-variant"><IconEye /> {thread.vote_count + thread.reply_count}</span>
                    <span className="flex items-center gap-1 text-xs text-on-surface-variant"><IconArrowUp /> {thread.vote_count}</span>
                    <span className="flex items-center gap-1 text-xs text-on-surface-variant"><IconComment /> {thread.reply_count}</span>
                  </div>
                  <HiveBadge variant="primary">{thread.forum_channel?.name}</HiveBadge>
                </div>

                {thread.has_best_answer && (
                  <div className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-honey mt-2.5"><IconStar /> Terjawab</div>
                )}
              </HiveCard>
            ))}
          </div>
        )}

        {/* Load more button */}
        {!feedLoading && feedHasMore && (
          <div className="flex justify-center mt-6">
            <HiveButton
              variant="secondary"
              size="md"
              onClick={loadMoreFeed}
              loading={feedLoadingMore}
            >
              Muat lebih banyak
            </HiveButton>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          My Classes Section (kept as-is)
         ═══════════════════════════════════════════════════════════════ */}

      {/* ── Classes Header ── */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-outline">
          Kelas saya ({myClasses.length})
        </span>
      </div>

      {/* ── Classes Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="spinner" />
        </div>
      ) : myClasses.length === 0 ? (
        <HiveEmptyState
          title="Belum ada kelas"
          description="Gabung dengan kode invite atau buat kelas baru."
          action={
            <HiveButton variant="primary" size="md" icon={<IcoPlus />} onClick={() => setShowCreate(true)}>
              Buat Kelas
            </HiveButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 stagger-children">
          {myClasses.map((cls, idx) => {
            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
            return (
              <HiveCard
                key={cls.id}
                interactive
                padding="sm"
                onClick={() => router.push(`/class/${cls.id}`)}
                className="group overflow-hidden"
              >
                {/* Top accent bar */}
                <div className="h-1 w-full rounded-t-xl -mt-4 -mx-4 mb-4" style={{ width: 'calc(100% + 2rem)', background: `linear-gradient(90deg, ${accent}, transparent)` }} />

                <div className="px-1">
                  {/* Role badge */}
                  <HiveBadge
                    variant={cls.current_user_role === 'teacher' ? 'teacher' : 'member'}
                    dot
                    className="mb-3"
                  >
                    {cls.current_user_role === 'teacher' ? 'Teacher' : 'Member'}
                  </HiveBadge>

                  <h3 className="text-[0.95rem] font-semibold mb-1 leading-snug text-on-surface">{cls.name}</h3>
                  <p className="text-xs text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">
                    {cls.description || 'Tidak ada deskripsi'}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 pt-3 border-t border-outline-variant/15 text-[0.65rem] text-on-surface-variant">
                    <span className="flex items-center gap-1"><IcoUsers /> {cls.members_count || 0}</span>
                    <span className="flex items-center gap-1"><IcoMsg /> {cls.forum_channels_count || 0}</span>
                    <span className="flex items-center gap-1"><IcoCal /> {cls.academic_year}</span>
                  </div>
                </div>
              </HiveCard>
            );
          })}

          {/* Add new class card */}
          <div
            onClick={() => setShowCreate(true)}
            className="flex flex-col items-center justify-center gap-3 border border-dashed border-outline-variant/20 rounded-[20px] min-h-[160px] cursor-pointer hover:border-honey/30 hover:bg-honey/[0.03] transition-default text-on-surface-variant"
          >
            <div className="w-10 h-10 rounded-full border border-dashed border-outline-variant/30 flex items-center justify-center text-honey">
              <IcoPlus />
            </div>
            <span className="text-xs font-medium">Buat kelas baru</span>
          </div>
        </div>
      )}

      {/* ── Join Modal ── */}
      <HiveModal open={showJoin} onClose={() => setShowJoin(false)} title="Gabung ke kelas">
        <form onSubmit={handleJoin} className="flex flex-col gap-5">
          <HiveInput
            label="Kode invite"
            placeholder="Contoh: ABC123"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            className="font-mono tracking-widest"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <HiveButton variant="secondary" type="button" onClick={() => setShowJoin(false)}>Batal</HiveButton>
            <HiveButton variant="primary" type="submit" loading={joinLoading} disabled={!joinCode.trim()}>Gabung</HiveButton>
          </div>
        </form>
      </HiveModal>

      {/* ── Create Modal ── */}
      <HiveModal open={showCreate} onClose={() => setShowCreate(false)} title="Buat kelas baru">
        <form onSubmit={handleCreate} className="flex flex-col gap-5">
          <HiveInput
            label="Nama kelas"
            placeholder="XII RPL 1"
            value={createData.name}
            onChange={e => setCreateData({ ...createData, name: e.target.value })}
            required
          />
          <HiveInput.Textarea
            label="Deskripsi (opsional)"
            placeholder="Deskripsi singkat kelas..."
            value={createData.description}
            onChange={e => setCreateData({ ...createData, description: e.target.value })}
            rows={3}
          />
          <HiveInput
            label="Tahun akademik"
            placeholder="2025/2026"
            value={createData.academic_year}
            onChange={e => setCreateData({ ...createData, academic_year: e.target.value })}
            required
          />
          <div className="flex gap-2 justify-end">
            <HiveButton variant="secondary" type="button" onClick={() => setShowCreate(false)}>Batal</HiveButton>
            <HiveButton variant="primary" type="submit" loading={createLoading}>Buat kelas</HiveButton>
          </div>
        </form>
      </HiveModal>

      {/* ── New Thread Modal ── */}
      <HiveModal open={showNewThread} onClose={() => setShowNewThread(false)} title="Buat Thread Baru">
        <form onSubmit={handleNewThread} className="flex flex-col gap-5">
          <HiveInput.Select
            label="Pilih Kelas"
            id="nt-class"
            value={ntClassId}
            onChange={(val) => handleNtClassChange(Number(val))}
            options={myClasses.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Pilih kelas..."
          />

          {ntChannelLoading ? (
            <div className="flex items-center justify-center py-3">
              <div className="spinner" />
            </div>
          ) : ntChannels.length > 0 ? (
            <HiveInput.Select
              label="Forum Channel"
              id="nt-channel"
              value={ntChannelId}
              onChange={(val) => setNtChannelId(Number(val))}
              options={ntChannels.map(ch => ({ value: ch.id, label: ch.name, icon: ch.icon || undefined }))}
            />
          ) : ntClassId ? (
            <p className="text-xs text-on-surface-variant">Tidak ada channel di kelas ini.</p>
          ) : null}

          <HiveInput
            label="Judul Thread"
            id="nt-title"
            placeholder="Tulis judul yang jelas..."
            value={ntTitle}
            onChange={e => setNtTitle(e.target.value)}
            required
            maxLength={255}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface">Isi Thread</label>
            <MarkdownEditor
              value={ntBody}
              onChange={setNtBody}
              placeholder="Jelaskan pertanyaan atau topik... (Mendukung Markdown & Paste Gambar)"
              minHeight="200px"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <HiveButton variant="secondary" type="button" onClick={() => setShowNewThread(false)}>Batal</HiveButton>
            <HiveButton
              variant="primary"
              type="submit"
              loading={ntLoading}
              disabled={!ntClassId || !ntChannelId || !ntTitle.trim() || !ntBody.trim()}
            >
              Post Thread
            </HiveButton>
          </div>
        </form>
      </HiveModal>

      {/* ── Global FAB ── */}
      {myClasses.length > 0 && (
        <button
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-30 w-14 h-14 rounded-2xl gradient-honey border-none text-[#1a0e00] cursor-pointer flex items-center justify-center shadow-[0_8px_32px_rgba(245,166,35,0.35)] transition-default hover:scale-110 hover:shadow-[0_12px_40px_rgba(245,166,35,0.5)] max-md:bottom-[calc(64px+16px)]"
          onClick={openNewThread}
          title="Buat thread baru"
        >
          <span className="flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </span>
        </button>
      )}

    </AppLayout>
  );
}
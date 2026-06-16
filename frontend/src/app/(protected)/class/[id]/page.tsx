"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { classService } from '@/services/class';
import { threadService, type Thread, type ForumChannel } from '@/services/thread';
import type { ClassRoom } from '@/services/auth';
import AppLayout from '@/components/AppLayout';
import HiveCard from '@/components/ui/HiveCard';
import { HiveInput } from '@/components/ui/HiveInput';
import { stripMarkdown } from '@/utils/markdown';
import HiveButton from '@/components/ui/HiveButton';
import HiveBadge from '@/components/ui/HiveBadge';
import HiveAvatar from '@/components/ui/HiveAvatar';
import HiveEmptyState from '@/components/ui/HiveEmptyState';

/* ── Icons ── */
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

const IconCopy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const IconMessageSquare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

const IconMsgEmpty = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

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

export default function ClassDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const classId = parseInt(id);
  const { user } = useAuth();
  const router = useRouter();

  const [classData, setClassData] = useState<ClassRoom | null>(null);
  const [myRole, setMyRole] = useState<string>('member');
  const [channels, setChannels] = useState<ForumChannel[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [hotThreads, setHotThreads] = useState<Thread[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [threadPage, setThreadPage] = useState(1);
  const [threadHasMore, setThreadHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        // Step 1: Load class data (mandatory)
        const classRes = await classService.show(classId);
        if (!isMounted) return;
        setClassData(classRes.class);
        setMyRole(classRes.my_role || 'member');
        if (classRes.forum_channels) {
          setChannels(classRes.forum_channels);
        }

        // Step 2: Load threads, channels, and hot threads in parallel
        const [threadRes, channelRes, hotRes] = await Promise.allSettled([
          threadService.list(classId, { sort: 'latest' }),
          threadService.getChannels(classId),
          threadService.hot(classId)
        ]);

        if (threadRes.status === 'fulfilled') {
          setThreads(threadRes.value.data || []);
          setThreadHasMore(threadRes.value.current_page < threadRes.value.last_page);
        }

        if (channelRes.status === 'fulfilled') {
          setChannels(channelRes.value.channels);
        }

        if (hotRes.status === 'fulfilled') {
          setHotThreads(hotRes.value.threads || []);
        }

      } catch (err: any) {
        // Only redirect on 403 (not member) or 404 (class not found)
        // Don't redirect on timeouts or network errors
        const status = err?.response?.status;
        if (status === 403 || status === 404) {
          router.push('/dashboard');
        } else {
          console.error('[ClassDetail] Failed to load class:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    init();
    return () => { isMounted = false; };
  }, [classId]);

  useEffect(() => {
    // Only reload threads when channel filter changes AFTER initial load
    if (!classData || loading) return;
    const reload = async () => {
      try {
        setLoading(true);
        setThreadPage(1);
        const params: any = { sort: 'latest' };
        if (selectedChannel) params.channel_id = selectedChannel;
        const res = await threadService.list(classId, params);
        setThreads(res.data || []);
        setThreadHasMore(res.current_page < res.last_page);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    reload();
  }, [selectedChannel]);

  const loadMoreThreads = async () => {
    const nextPage = threadPage + 1;
    setLoadingMore(true);
    try {
      const params: any = { sort: 'latest', page: nextPage };
      if (selectedChannel) params.channel_id = selectedChannel;
      const res = await threadService.list(classId, params);
      setThreads(prev => [...prev, ...(res.data || [])]);
      setThreadPage(nextPage);
      setThreadHasMore(res.current_page < res.last_page);
    } catch { /* silent */ }
    setLoadingMore(false);
  };

  const copyInviteCode = () => {
    if (classData?.invite_code) {
      navigator.clipboard.writeText(classData.invite_code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  if (!classData) {
    return (
      <AppLayout title="Loading...">
        <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={classData.name} activeNav="class">
      <div className="max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">{classData.name}</h2>
          {classData.description && <p className="text-sm text-on-surface-variant">{classData.description}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="flex items-center gap-2 hive-card py-2 px-4 cursor-pointer text-on-surface-variant relative hover:border-honey/30 hover:text-honey"
            onClick={copyInviteCode}
            title="Copy invite code"
          >
            <span className="text-[0.65rem] font-bold uppercase tracking-wider">Kode</span>
            <span className="text-sm font-bold text-honey tracking-wider">{classData.invite_code}</span>
            <IconCopy />
            {codeCopied && (
              <span className="absolute -top-8 right-0 bg-secondary/20 text-secondary text-[0.65rem] font-bold py-1 px-2.5 rounded-lg animate-fade-up">
                Copied!
              </span>
            )}
          </button>
          <button
            className="flex items-center gap-2 hive-card py-2 px-4 cursor-pointer text-secondary hover:border-secondary/30 hover:bg-secondary/[0.05] transition-default"
            onClick={() => router.push(`/class/${classId}/lounge`)}
            title="Buka Lounge chat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[16px] h-[16px]">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <span className="text-[0.65rem] font-bold uppercase tracking-wider">Lounge</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
          </button>
          <button
            className="hive-card p-2.5 cursor-pointer text-on-surface-variant hover:border-honey/30 hover:text-honey transition-default flex items-center justify-center"
            onClick={() => router.push(`/class/${classId}/settings`)}
            title="Pengaturan kelas"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Channel Chips ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none">
        <button
          className={[
            'flex items-center gap-1.5 border rounded-full py-2 px-4 text-xs font-semibold font-sans cursor-pointer transition-default whitespace-nowrap shrink-0',
            selectedChannel === null
              ? 'bg-honey/10 border-honey/25 text-honey'
              : 'bg-surface-container-high/60 border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface',
          ].join(' ')}
          onClick={() => setSelectedChannel(null)}
        >
          All Threads
        </button>
        {channels.map(ch => (
          <button
            key={ch.id}
            className={[
              'flex items-center gap-1.5 border rounded-full py-2 px-4 text-xs font-semibold font-sans cursor-pointer transition-default whitespace-nowrap shrink-0',
              selectedChannel === ch.id
                ? 'bg-honey/10 border-honey/25 text-honey'
                : 'bg-surface-container-high/60 border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface',
            ].join(' ')}
            onClick={() => setSelectedChannel(ch.id)}
          >
            {ch.icon === '💬' ? <IconMessageSquare /> : ch.icon && <span className="text-sm">{ch.icon}</span>}
            {ch.name}
            {ch.threads_count !== undefined && (
              <span className={`text-[0.6rem] font-bold py-px px-1.5 rounded-full ${
                selectedChannel === ch.id ? 'bg-honey/20 text-honey' : 'bg-outline-variant/30 text-on-surface-variant'
              }`}>{ch.threads_count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Hot Today ── */}
      {hotThreads.length > 0 && (
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
                onClick={() => router.push(`/class/${classId}/thread/${thread.id}`)}
              >
                <HiveBadge variant="primary" className="mb-2.5">{thread.forum_channel?.name}</HiveBadge>
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

      {/* ── Recent Discussions ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-4 rounded-full bg-primary" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-outline">Recent Discussions</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]"><div className="spinner" /></div>
        ) : threads.length === 0 ? (
          <HiveEmptyState
            icon={<IconMsgEmpty />}
            title="Belum ada diskusi"
            description="Jadilah yang pertama memulai diskusi di kelas ini!"
            action={
              <HiveButton variant="primary" onClick={() => router.push(`/class/${classId}/thread/new`)}>
                Buat Thread Pertama
              </HiveButton>
            }
          />
        ) : (
          <div className="flex flex-col gap-3 stagger-children">
            {threads.map(thread => (
              <HiveCard
                key={thread.id}
                interactive
                padding="md"
                onClick={() => router.push(`/class/${classId}/thread/${thread.id}`)}
              >
                {thread.is_pinned && (
                  <div className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-honey mb-2"><IconPin /> Pinned</div>
                )}

                {/* Author row */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <HiveAvatar name={thread.user?.name || '?'} size="sm" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-on-surface">{thread.user?.display_name || thread.user?.name}</span>
                    <span className="text-xs text-outline">{timeAgo(thread.created_at)}</span>
                  </div>
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
        {!loading && threadHasMore && (
          <div className="flex justify-center mt-6">
            <button
              className="flex items-center gap-2 border rounded-full py-2.5 px-6 text-xs font-semibold font-sans cursor-pointer transition-default bg-surface-container-high/60 border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
              onClick={loadMoreThreads}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <><div className="spinner w-3.5 h-3.5" /> Memuat...</>
              ) : (
                'Muat lebih banyak'
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      <button
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-30 w-14 h-14 rounded-2xl gradient-honey border-none text-[#1a0e00] cursor-pointer flex items-center justify-center shadow-[0_8px_32px_rgba(245,166,35,0.35)] transition-default hover:scale-110 hover:shadow-[0_12px_40px_rgba(245,166,35,0.5)] max-md:bottom-[calc(64px+16px)]"
        onClick={() => router.push(`/class/${classId}/thread/new`)}
        title="Buat thread baru"
      >
        <span className="w-6 h-6"><IconPlus /></span>
      </button>
      </div>
    </AppLayout>
  );
}

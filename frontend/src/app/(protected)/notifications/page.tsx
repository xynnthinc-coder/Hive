"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notificationService, type AppNotification } from '@/services/notification';
import AppLayout from '@/components/AppLayout';
import HiveCard from '@/components/ui/HiveCard';
import HiveEmptyState from '@/components/ui/HiveEmptyState';
import HiveToast, { showToast } from '@/components/ui/HiveToast';
import HivePagination from '@/components/ui/HivePagination';

const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconReplyNotif = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IconVoteNotif = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>;
const IconBestNotif = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconMentionNotif = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"/></svg>;
const IconJoinNotif = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>;
const IconPinNotif = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 11.2V6a3 3 0 00-6 0v5.2a2 2 0 01-1.11 1.35l-1.78.9A2 2 0 005 15.24Z"/></svg>;

const typeConfig: Record<string, { bg: string; icon: React.ReactNode }> = {
  reply: { bg: 'bg-primary/[0.08] text-primary', icon: <IconReplyNotif /> },
  vote: { bg: 'bg-honey/[0.08] text-honey', icon: <IconVoteNotif /> },
  best_answer: { bg: 'bg-secondary/[0.08] text-secondary', icon: <IconBestNotif /> },
  mention: { bg: 'bg-primary/[0.08] text-primary', icon: <IconMentionNotif /> },
  join: { bg: 'bg-on-surface-variant/[0.06] text-on-surface-variant', icon: <IconJoinNotif /> },
  pin: { bg: 'bg-honey/[0.08] text-honey', icon: <IconPinNotif /> },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => { loadNotifications(1); }, []);

  const loadNotifications = async (p: number) => {
    try {
      setLoading(p === 1);
      const res = await notificationService.list(p);
      setNotifications(res.notifications);
      setUnreadCount(res.unread_count);
      setHasMore(res.has_more);
      setPage(p);
      setLastPage(res.last_page || 1);
    } catch {
      // silent
    } finally { setLoading(false); }
  };

  const handleMarkRead = async (notif: AppNotification) => {
    if (!notif.is_read) {
      try {
        await notificationService.markRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {}
    }
    // Navigate to relevant page
    if (notif.data?.class_id && notif.data?.thread_id) {
      router.push(`/class/${notif.data.class_id}/thread/${notif.data.thread_id}`);
    } else if (notif.data?.class_id) {
      router.push(`/class/${notif.data.class_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast('Semua notifikasi ditandai sudah dibaca.');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menandai.', 'error');
    } finally { setMarkingAll(false); }
  };

  return (
    <AppLayout title="Notifikasi" activeNav="notifications">
      <HiveToast />
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">
              Notifikasi ✦
            </h2>
            <p className="text-sm text-on-surface-variant">
              {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua sudah dibaca'}
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="self-end sm:self-auto">
            <button
              disabled={markingAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-honey bg-transparent border border-honey/20 rounded-full py-2 px-4 cursor-pointer transition-default hover:bg-honey/10 font-sans disabled:opacity-50"
              onClick={handleMarkAllRead}
            >
              <IconCheck /> Tandai semua dibaca
            </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="spinner" /></div>
        ) : notifications.length === 0 ? (
          <HiveEmptyState
            icon={<IconBell />}
            title="Belum ada notifikasi"
            description="Kamu akan menerima notifikasi ketika ada aktivitas baru."
          />
        ) : (
          <>
            <div className="flex flex-col gap-2 stagger-children">
              {notifications.map(notif => {
                const config = typeConfig[notif.type] || typeConfig.reply;
                return (
                  <HiveCard
                    key={notif.id}
                    interactive
                    padding="md"
                    onClick={() => handleMarkRead(notif)}
                    className={`group ${!notif.is_read ? 'border-l-2 border-l-honey/40' : 'opacity-60'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
                        <span className="text-base">{config.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-on-surface">{notif.title}</span>
                          {!notif.is_read && <span className="w-2 h-2 rounded-full bg-honey shrink-0" />}
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed mb-1 line-clamp-2">{notif.body}</p>
                        <span className="text-[0.6rem] text-outline">{timeAgo(notif.created_at)}</span>
                      </div>
                    </div>
                  </HiveCard>
                );
              })}
            </div>

            <HivePagination 
              currentPage={page} 
              lastPage={lastPage} 
              onPageChange={loadNotifications} 
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
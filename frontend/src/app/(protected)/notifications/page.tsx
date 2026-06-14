"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notificationService, type AppNotification } from '@/services/notification';
import AppLayout from '@/components/AppLayout';
import HiveCard from '@/components/ui/HiveCard';
import HiveEmptyState from '@/components/ui/HiveEmptyState';
import HiveToast, { showToast } from '@/components/ui/HiveToast';

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

const typeConfig: Record<string, { bg: string; icon: string }> = {
  reply: { bg: 'bg-primary/[0.08]', icon: '💬' },
  vote: { bg: 'bg-honey/[0.08]', icon: '⬆️' },
  best_answer: { bg: 'bg-secondary/[0.08]', icon: '⭐' },
  mention: { bg: 'bg-primary/[0.08]', icon: '@' },
  join: { bg: 'bg-on-surface-variant/[0.06]', icon: '👋' },
  pin: { bg: 'bg-honey/[0.08]', icon: '📌' },
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
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => { loadNotifications(1); }, []);

  const loadNotifications = async (p: number) => {
    try {
      setLoading(p === 1);
      const res = await notificationService.list(p);
      if (p === 1) {
        setNotifications(res.notifications);
      } else {
        setNotifications(prev => [...prev, ...res.notifications]);
      }
      setUnreadCount(res.unread_count);
      setHasMore(res.has_more);
      setPage(p);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">
              Notifikasi ✦
            </h2>
            <p className="text-sm text-on-surface-variant">
              {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua sudah dibaca'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              disabled={markingAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-honey bg-transparent border border-honey/20 rounded-full py-2 px-4 cursor-pointer transition-default hover:bg-honey/10 font-sans disabled:opacity-50"
              onClick={handleMarkAllRead}
            >
              <IconCheck /> Tandai semua dibaca
            </button>
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

            {hasMore && (
              <button
                className="w-full mt-4 py-3 text-sm font-semibold text-honey bg-transparent border border-honey/15 rounded-xl cursor-pointer transition-default hover:bg-honey/5 font-sans"
                onClick={() => loadNotifications(page + 1)}
              >
                Muat lebih banyak
              </button>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
"use client";

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { classService } from '@/services/class';
import { chatService, type ChatMessage, type ChatChannel } from '@/services/chat';
import type { ClassRoom } from '@/services/auth';
import AppLayout from '@/components/AppLayout';
import HiveCard from '@/components/ui/HiveCard';
import HiveAvatar from '@/components/ui/HiveAvatar';
import HiveBadge from '@/components/ui/HiveBadge';
import HiveButton from '@/components/ui/HiveButton';
import HiveModal from '@/components/ui/HiveModal';
import { HiveInput } from '@/components/ui/HiveInput';
import HiveToast, { showToast } from '@/components/ui/HiveToast';
import HiveMessageInput from '@/components/ui/HiveMessageInput';

/* ═══════════════════════════════════════════════════════════════
   Icons
   ═══════════════════════════════════════════════════════════════ */

const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const IconHash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

const IconLoader = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin">
    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

const IconArrowDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */
function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today.getTime() - msgDate.getTime()) / 86400000);

  if (diffDays === 0) return 'Hari Ini';
  if (diffDays === 1) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Group messages and insert date dividers */
function groupMessages(messages: ChatMessage[]): (ChatMessage | { _divider: true; label: string })[] {
  const result: (ChatMessage | { _divider: true; label: string })[] = [];
  let lastDateKey = '';

  for (const msg of messages) {
    const dateKey = new Date(msg.created_at).toDateString();
    if (dateKey !== lastDateKey) {
      result.push({ _divider: true, label: formatDateLabel(msg.created_at) });
      lastDateKey = dateKey;
    }
    result.push(msg);
  }
  return result;
}

function isDivider(item: any): item is { _divider: true; label: string } {
  return item && item._divider === true;
}

/* ═══════════════════════════════════════════════════════════════
   Message Bubble Component
   ═══════════════════════════════════════════════════════════════ */
function MessageBubble({
  msg,
  isOwn,
  isTeacher,
  onDelete,
  showAvatar,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  isTeacher: boolean;
  onDelete: (id: number) => void;
  showAvatar: boolean;
}) {
  const [showActions, setShowActions] = useState(false);
  const canDelete = isOwn || isTeacher;

  return (
    <div
      className={`flex gap-2.5 group relative ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="w-8 shrink-0 flex items-end">
        {showAvatar && !isOwn && (
          <HiveAvatar name={msg.user?.name || '?'} size="xs" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] md:max-w-[70%] min-w-[80px] relative ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Author name (only for others, and only when showing avatar) */}
        {showAvatar && !isOwn && (
          <div className="flex items-center gap-1.5 mb-1 pl-1">
            <span className="text-[0.7rem] font-semibold text-on-surface">
              {msg.user?.display_name || msg.user?.name}
            </span>
            {msg.user?.role === 'teacher' && (
              <span className="text-[0.55rem] font-bold text-honey bg-honey/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Guru
              </span>
            )}
          </div>
        )}

        <div
          className={[
            'rounded-2xl py-2.5 px-4 text-sm leading-relaxed relative',
            isOwn
              ? 'bg-honey/[0.12] text-on-surface rounded-br-md border border-honey/10'
              : 'bg-surface-container-high/70 text-on-surface rounded-bl-md border border-outline-variant/10',
          ].join(' ')}
        >
          {/* Message body */}
          <div className="whitespace-pre-wrap break-words">{msg.body}</div>

          {/* Time */}
          <div className={`text-[0.6rem] mt-1 ${isOwn ? 'text-honey/50 text-right' : 'text-on-surface-variant/50'}`}>
            {formatTime(msg.created_at)}
            {msg.edited_at && <span className="ml-1">(diedit)</span>}
          </div>
        </div>

        {/* Action buttons on hover */}
        {canDelete && showActions && (
          <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} px-1.5`}>
            <button
              onClick={() => onDelete(msg.id)}
              className="bg-surface-container-highest/90 backdrop-blur-sm border border-outline-variant/20 text-on-surface-variant hover:text-error hover:border-error/30 hover:bg-error/10 w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-default"
              title="Hapus pesan"
            >
              <IconTrash />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Lounge Page
   ═══════════════════════════════════════════════════════════════ */
export default function LoungePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const classId = parseInt(id);
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [classData, setClassData] = useState<ClassRoom | null>(null);
  const [myRole, setMyRole] = useState('member');
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Chat channel management
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChName, setNewChName] = useState('');
  const [newChDesc, setNewChDesc] = useState('');
  const [creatingChannel, setCreatingChannel] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const latestMsgIdRef = useRef<number>(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isAtBottomRef = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* ── Load class data & channels ── */
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const res = await classService.show(classId);
        if (!isMounted) return;
        setClassData(res.class);
        setMyRole(res.my_role || 'member');

        const chatCh: ChatChannel[] = res.chat_channels || [];
        setChannels(chatCh);

        if (chatCh.length > 0) {
          setActiveChannel(chatCh[0]);
        }
      } catch (err: any) {
        // Only redirect on 403/404, not on timeouts
        const status = err?.response?.status;
        if (status === 403 || status === 404) {
          router.push('/dashboard');
        } else {
          console.error('[Lounge] Failed to load class:', err);
        }
      }
    };
    init();
    return () => { isMounted = false; };
  }, [classId]);

  /* ── Load messages when channel changes ── */
  useEffect(() => {
    if (!activeChannel) return;
    loadMessages(activeChannel.id);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeChannel?.id]);

  /* ── Polling for new messages ── */
  useEffect(() => {
    if (!activeChannel) return;

    // Clear existing poll
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      if (latestMsgIdRef.current === 0) return;
      try {
        const res = await chatService.pollNew(classId, activeChannel.id, latestMsgIdRef.current);
        if (res.messages.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMsgs = res.messages.filter(m => !existingIds.has(m.id));
            if (newMsgs.length === 0) return prev;

            const updated = [...prev, ...newMsgs];
            latestMsgIdRef.current = updated[updated.length - 1].id;
            return updated;
          });

          // Auto-scroll if user is at bottom
          if (isAtBottomRef.current) {
            setTimeout(() => scrollToBottom('smooth'), 50);
          }
        }
      } catch {
        // silent — poll failed, will retry
      }
    }, 5000); // 5s interval — keeps single-threaded PHP server responsive

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeChannel?.id, classId]);

  /* ── Load initial messages ── */
  const loadMessages = async (channelId: number) => {
    setLoadingInit(true);
    setMessages([]);
    latestMsgIdRef.current = 0;

    try {
      const res = await chatService.getMessages(classId, channelId);
      setMessages(res.messages);
      setHasMore(res.has_more);

      if (res.messages.length > 0) {
        latestMsgIdRef.current = res.messages[res.messages.length - 1].id;
      }

      setTimeout(() => scrollToBottom('instant'), 50);
    } catch {
      // silent
    } finally {
      setLoadingInit(false);
    }
  };

  /* ── Load older messages (scroll up) ── */
  const loadOlderMessages = useCallback(async () => {
    if (!activeChannel || loadingMore || !hasMore || messages.length === 0) return;
    setLoadingMore(true);

    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;

    try {
      const oldestId = messages[0].id;
      const res = await chatService.getMessages(classId, activeChannel.id, { before_id: oldestId });
      setMessages(prev => [...res.messages, ...prev]);
      setHasMore(res.has_more);

      // Maintain scroll position after prepending
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  }, [activeChannel, loadingMore, hasMore, messages, classId]);

  /* ── Send message ── */
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !activeChannel || sending) return;
    setSending(true);
    setInputText('');

    try {
      const res = await chatService.sendMessage(classId, activeChannel.id, text);
      setMessages(prev => {
        const exists = prev.some(m => m.id === res.message.id);
        if (exists) return prev;
        const updated = [...prev, res.message];
        latestMsgIdRef.current = res.message.id;
        return updated;
      });
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch {
      setInputText(text); // Restore on failure
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  /* ── Delete message ── */
  const handleDelete = async (messageId: number) => {
    if (!confirm('Hapus pesan ini?')) return;
    try {
      await chatService.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch {
      // silent
    }
  };

  /* ── Scroll helpers ── */
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = scrollHeight - scrollTop - clientHeight < 80;
    isAtBottomRef.current = atBottom;
    setShowScrollBtn(!atBottom);

    // Load more when scrolled to top
    if (scrollTop < 100 && hasMore && !loadingMore) {
      loadOlderMessages();
    }
  };

  /* ── Keyboard shortcut ── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Channel switch ── */
  const switchChannel = (ch: ChatChannel) => {
    if (ch.id === activeChannel?.id) return;
    setActiveChannel(ch);
  };

  const isTeacher = myRole === 'teacher';

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChName.trim()) return;
    setCreatingChannel(true);
    try {
      const res = await chatService.createChannel(classId, {
        name: newChName.trim(),
        description: newChDesc.trim() || undefined,
      });
      showToast(res.message);
      setChannels(prev => [...prev, res.channel]);
      setShowCreateChannel(false);
      setNewChName(''); setNewChDesc('');
      setActiveChannel(res.channel);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal membuat channel.', 'error');
    } finally { setCreatingChannel(false); }
  };

  const handleDeleteChannel = async () => {
    if (!activeChannel) return;
    if (channels.length <= 1) {
      showToast('Tidak bisa menghapus channel terakhir.', 'error');
      return;
    }
    if (!confirm(`Hapus channel "${activeChannel.name}"? Semua pesan akan ikut terhapus.`)) return;
    try {
      await chatService.deleteChannel(classId, activeChannel.id);
      showToast('Channel berhasil dihapus.');
      const remaining = channels.filter(c => c.id !== activeChannel.id);
      setChannels(remaining);
      setActiveChannel(remaining[0] || null);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus.', 'error');
    }
  };

  // Group messages with date dividers
  const grouped = groupMessages(messages);

  // Determine which messages should show avatar (first message or different user from previous)
  const shouldShowAvatar = (index: number): boolean => {
    const items = grouped;
    if (index === 0) return true;
    const current = items[index];
    if (isDivider(current)) return false;

    // Look at previous non-divider
    for (let i = index - 1; i >= 0; i--) {
      const prev = items[i];
      if (isDivider(prev)) return true;
      return (prev as ChatMessage).user?.id !== (current as ChatMessage).user?.id;
    }
    return true;
  };

  if (!classData) {
    return (
      <AppLayout title="Loading...">
        <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Lounge`} activeNav="class">
      <div className="flex flex-col h-[calc(100dvh-176px)] md:h-[calc(100dvh-112px)] lg:h-[calc(100dvh-128px)] max-w-[1200px] mx-auto w-full overflow-hidden">
        {/* ── Channel Bar ── */}
        <div className="flex items-center gap-2 md:gap-3 mb-3 shrink-0 overflow-hidden">
          {/* Channel chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none flex-1 py-1">
            {channels.map(ch => (
              <button
                key={ch.id}
                className={[
                  'flex items-center gap-1.5 border rounded-full py-2 px-4 text-xs font-semibold font-sans cursor-pointer transition-default whitespace-nowrap shrink-0',
                  activeChannel?.id === ch.id
                    ? 'bg-honey/10 border-honey/25 text-honey'
                    : 'bg-surface-container-high/60 border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface',
                ].join(' ')}
                onClick={() => switchChannel(ch)}
              >
                <IconHash />
                {ch.name}
              </button>
            ))}
          </div>

          {/* Create channel button (teachers only) */}
          {isTeacher && (
            <button
              className="flex items-center justify-center shrink-0 w-9 h-9 rounded-full border border-dashed border-outline-variant/30 text-on-surface-variant hover:border-honey/40 hover:text-honey hover:bg-honey/5 cursor-pointer transition-default bg-transparent"
              title="Buat chat channel"
              onClick={() => setShowCreateChannel(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          )}

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 shrink-0 py-2 px-3 rounded-full bg-secondary/10 border border-secondary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span className="text-[0.65rem] font-bold text-secondary uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* ── Messages Container ── */}
        <div className="flex-1 flex flex-col hive-card overflow-hidden relative">
          {/* Subtle honeycomb overlay */}
          <div className="absolute inset-0 honeycomb-bg rounded-none pointer-events-none" />

          {/* Channel info header */}
          {activeChannel && (
            <div className="relative px-3 md:px-5 py-3 border-b border-outline-variant/10 flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-honey/10 flex items-center justify-center text-honey">
                <IconHash />
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface">{activeChannel.name}</div>
                {activeChannel.description && (
                  <div className="text-[0.65rem] text-on-surface-variant">{activeChannel.description}</div>
                )}
              </div>
              {activeChannel.type === 'announcement' && (
                <HiveBadge variant="honey" className="ml-auto">Pengumuman</HiveBadge>
              )}
              {isTeacher && channels.length > 1 && (
                <button
                  className="ml-auto bg-transparent border-none cursor-pointer text-on-surface-variant hover:text-error p-1.5 rounded-lg transition-default hover:bg-error/10"
                  title="Hapus channel ini"
                  onClick={handleDeleteChannel}
                >
                  <IconTrash />
                </button>
              )}
            </div>
          )}

          {/* Messages scroll area */}
          <div
            ref={messagesContainerRef}
            className="relative flex-1 overflow-y-auto px-4 md:px-5 py-4 flex flex-col gap-1"
            onScroll={handleScroll}
          >
            {/* Loading older */}
            {loadingMore && (
              <div className="flex justify-center py-3 text-on-surface-variant">
                <IconLoader />
              </div>
            )}

            {/* Has more indicator */}
            {hasMore && !loadingMore && (
              <button
                className="text-xs text-on-surface-variant text-center py-2 cursor-pointer bg-transparent border-none font-sans hover:text-honey transition-default"
                onClick={loadOlderMessages}
              >
                Muat pesan sebelumnya...
              </button>
            )}

            {/* Initial loading */}
            {loadingInit ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="spinner" />
              </div>
            ) : messages.length === 0 ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-honey/10 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-honey">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-on-surface mb-1">Belum ada pesan</h3>
                <p className="text-sm text-on-surface-variant max-w-[280px]">
                  Jadilah yang pertama memulai percakapan di channel ini!
                </p>
              </div>
            ) : (
              /* Messages list */
              grouped.map((item, index) => {
                if (isDivider(item)) {
                  return (
                    <div key={`div-${item.label}`} className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-outline-variant/15" />
                      <span className="text-[0.6rem] font-bold text-on-surface-variant uppercase tracking-wider shrink-0">
                        {item.label}
                      </span>
                      <div className="flex-1 h-px bg-outline-variant/15" />
                    </div>
                  );
                }

                const msg = item as ChatMessage;
                return (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isOwn={msg.is_own}
                    isTeacher={myRole === 'teacher'}
                    onDelete={handleDelete}
                    showAvatar={shouldShowAvatar(index)}
                  />
                );
              })
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {showScrollBtn && (
            <button
              className="absolute bottom-6 right-4 z-10 w-9 h-9 rounded-full bg-surface-container-highest/90 backdrop-blur-sm border border-outline-variant/20 flex items-center justify-center cursor-pointer transition-default hover:bg-honey/20 hover:border-honey/30 text-on-surface-variant hover:text-honey shadow-lg"
              onClick={() => scrollToBottom('smooth')}
            >
              <IconArrowDown />
            </button>
          )}
        </div>

        {/* ── Input Bar ── */}
        <div className="shrink-0 z-40 bg-surface-container-low backdrop-blur-xl pb-2 md:pb-4 pt-2">
          <HiveMessageInput
            value={inputText}
            onChange={setInputText}
            onSend={handleSend}
            sending={sending}
            placeholder="Tulis pesan di lounge..."
          />
        </div>
      </div>

      {/* ── Create Channel Modal ── */}
      <HiveModal open={showCreateChannel} onClose={() => setShowCreateChannel(false)} title="Buat Chat Channel">
        <form onSubmit={handleCreateChannel} className="flex flex-col gap-5">
          <HiveInput
            label="Nama channel"
            placeholder="obrolan-bebas"
            value={newChName}
            onChange={e => setNewChName(e.target.value)}
            required
          />
          <HiveInput.Textarea
            label="Deskripsi (opsional)"
            placeholder="Deskripsi singkat channel..."
            value={newChDesc}
            onChange={e => setNewChDesc(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2 justify-end">
            <HiveButton variant="secondary" type="button" onClick={() => setShowCreateChannel(false)}>Batal</HiveButton>
            <HiveButton variant="primary" type="submit" loading={creatingChannel}>Buat Channel</HiveButton>
          </div>
        </form>
      </HiveModal>

      <HiveToast />
    </AppLayout>
  );
}

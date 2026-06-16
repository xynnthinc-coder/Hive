"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { threadService, type Thread } from "@/services/thread";
import { replyService, type Reply } from "@/services/reply";
import { classService } from "@/services/class";
import AppLayout from "@/components/AppLayout";
import HiveCard from "@/components/ui/HiveCard";
import HiveButton from "@/components/ui/HiveButton";
import HiveBadge from "@/components/ui/HiveBadge";
import HiveAvatar from "@/components/ui/HiveAvatar";
import HiveModal from "@/components/ui/HiveModal";
import { HiveInput } from "@/components/ui/HiveInput";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import MarkdownViewer from "@/components/ui/MarkdownViewer";
import HiveMessageInput from "@/components/ui/HiveMessageInput";
import HiveToast, { showToast } from "@/components/ui/HiveToast";

/* ── Icons ── */
const IconArrowUp = ({ active }: { active?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "#F5A623" : "currentColor"}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const IconArrowDown = ({ active }: { active?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={active ? "#fd6f85" : "currentColor"}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconReply = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 00-4-4H4" />
  </svg>
);

const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const IconTrash = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3.5 h-3.5"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
  </svg>
);

const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── Action Button (small, ghost) ── */
function ActionBtn({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      className={`bg-transparent border-none cursor-pointer py-1 px-2 rounded-lg flex items-center gap-1 text-xs font-sans transition-default text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/* ── Vote Button ── */
function VoteBtn({
  children,
  active,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      className={`bg-transparent border-none cursor-pointer p-1 px-1.5 rounded-lg flex items-center gap-0.5 text-xs font-sans transition-default ${active ? "text-honey" : "text-on-surface-variant hover:bg-surface-container-high"} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/* ── Reply Component (recursive) ── */
function ReplyItem({
  reply,
  classId,
  threadId,
  depth,
  userId,
  myRole,
  onRefresh,
}: {
  reply: Reply;
  classId: number;
  threadId: number;
  depth: number;
  userId: number | undefined;
  myRole: string;
  onRefresh: () => void;
}) {
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voteCount, setVoteCount] = useState(reply.vote_count);
  const [myVote, setMyVote] = useState(reply.my_vote || 0);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(reply.body);
  const [editSaving, setEditSaving] = useState(false);

  const handleVote = async (value: -1 | 0 | 1) => {
    const newValue = myVote === value ? 0 : value;
    try {
      const res = await replyService.voteReply(
        reply.id,
        newValue as -1 | 0 | 1,
      );
      setVoteCount(res.vote_count);
      setMyVote(res.my_vote);
    } catch {
      /* silent */
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await replyService.create(classId, threadId, {
        body: replyText,
        parent_id: reply.id,
      });
      setReplyText("");
      setShowReplyForm(false);
      onRefresh();
    } catch {
      /* silent */
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Hapus balasan ini?")) return;
    try {
      await replyService.delete(reply.id);
      onRefresh();
    } catch {
      /* silent */
    }
  };

  const handleBestAnswer = async () => {
    try {
      await replyService.markBestAnswer(reply.id);
      onRefresh();
    } catch {
      /* silent */
    }
  };

  const handleEditSave = async () => {
    if (!editBody.trim() || editBody.trim() === reply.body) {
      setEditing(false);
      return;
    }
    setEditSaving(true);
    try {
      await replyService.update(reply.id, editBody.trim());
      setEditing(false);
      onRefresh();
    } catch {
      /* silent */
    } finally { setEditSaving(false); }
  };

  const isAuthor = userId === reply.user?.id;
  const isTeacher = myRole === "teacher";

  return (
    <div
      className={`${depth > 0 ? "ml-3 md:ml-8 pl-3 md:pl-4 border-l-2 border-honey/15" : ""}`}
    >
      <HiveCard
        padding="md"
        className={`${reply.is_best_answer ? "border-honey/25" : ""}`}
      >
        {reply.is_best_answer && (
          <div className="inline-flex items-center gap-1 text-[0.65rem] font-bold text-honey bg-honey/10 py-1 px-3 rounded-full mb-2.5">
            <IconStar /> Best Answer
          </div>
        )}

        {/* Author */}
        <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
          <HiveAvatar name={reply.user?.name || "?"} size="xs" />
          <span className="text-xs font-semibold text-on-surface">
            {reply.user?.display_name || reply.user?.name}
          </span>
          {reply.user?.role === "teacher" && (
            <HiveBadge variant="teacher">Guru</HiveBadge>
          )}
          <span className="text-[0.65rem] text-outline">
            {timeAgo(reply.created_at)}
          </span>
        </div>

        {/* Body */}
        {editing ? (
          <div className="mb-3">
            <MarkdownEditor
              value={editBody}
              onChange={setEditBody}
              minHeight="120px"
            />
            <div className="flex gap-2 justify-end mt-2">
              <HiveButton variant="ghost" size="sm" onClick={() => { setEditing(false); setEditBody(reply.body); }}>Batal</HiveButton>
              <HiveButton variant="primary" size="sm" onClick={handleEditSave} loading={editSaving} disabled={!editBody.trim()}>Simpan</HiveButton>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <MarkdownViewer content={reply.body} />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 flex-wrap">
          <VoteBtn active={myVote === 1} onClick={() => handleVote(1)}>
            <span className="w-4 h-4">
              <IconArrowUp active={myVote === 1} />
            </span>{" "}
            {voteCount > 0 ? voteCount : ""}
          </VoteBtn>
          <VoteBtn
            active={myVote === -1}
            onClick={() => handleVote(-1)}
            className={myVote === -1 ? "!text-error" : ""}
          >
            <span className="w-4 h-4">
              <IconArrowDown active={myVote === -1} />
            </span>
          </VoteBtn>
          {depth < 2 && (
            <ActionBtn onClick={() => setShowReplyForm(!showReplyForm)}>
              <span className="w-3.5 h-3.5">
                <IconReply />
              </span>{" "}
              Balas
            </ActionBtn>
          )}
          {isTeacher && (
            <ActionBtn
              onClick={handleBestAnswer}
              className="hover:!text-honey hover:!bg-honey/10"
            >
              <IconStar /> {reply.is_best_answer ? "Batal Best" : "Best Answer"}
            </ActionBtn>
          )}
          {isAuthor && !editing && (
            <ActionBtn
              onClick={() => { setEditing(true); setEditBody(reply.body); }}
              className="hover:!text-honey hover:!bg-honey/10"
            >
              <IconEdit /> Edit
            </ActionBtn>
          )}
          {(isAuthor || isTeacher) && (
            <ActionBtn
              onClick={handleDelete}
              className="hover:!text-error hover:!bg-error/10"
            >
              <IconTrash /> Hapus
            </ActionBtn>
          )}
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-3 pt-3 border-t border-outline-variant/10">
            <MarkdownEditor
              value={replyText}
              onChange={setReplyText}
              placeholder="Tulis balasan... (Mendukung Markdown & Paste Gambar)"
              minHeight="120px"
            />
            <div className="flex gap-2 justify-end mt-4">
              <HiveButton
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(false)}
              >
                Batal
              </HiveButton>
              <HiveButton
                variant="primary"
                size="sm"
                onClick={handleReply}
                loading={submitting}
                disabled={!replyText.trim()}
              >
                Balas
              </HiveButton>
            </div>
          </div>
        )}
      </HiveCard>

      {/* Nested children */}
      {reply.children && reply.children.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {reply.children.map((child) => (
            <ReplyItem
              key={child.id}
              reply={child}
              classId={classId}
              threadId={threadId}
              depth={depth + 1}
              userId={userId}
              myRole={myRole}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Thread Detail Page ── */
export default function ThreadDetail({
  params,
}: {
  params: Promise<{ id: string; threadId: string }>;
}) {
  const { id, threadId: tid } = use(params);
  const classId = parseInt(id);
  const threadId = parseInt(tid);
  const { user } = useAuth();
  const router = useRouter();

  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [myRole, setMyRole] = useState("member");
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [threadVoteCount, setThreadVoteCount] = useState(0);
  const [threadMyVote, setThreadMyVote] = useState(0);

  // Edit thread state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      await Promise.allSettled([
        loadThread(),
        loadMyRole(),
      ]);
    };
    init();
  }, [classId, threadId]);

  const loadThread = async () => {
    try {
      setLoading(true);
      const res = await threadService.show(classId, threadId);
      setThread(res.thread);
      setReplies(res.replies || []);
      setThreadVoteCount(res.thread.vote_count);
      setThreadMyVote(res.thread.my_vote || 0);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 404) {
        router.push(`/class/${classId}`);
      } else {
        console.error("[ThreadDetail] Failed to load:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMyRole = async () => {
    try {
      const res = await classService.show(classId);
      setMyRole(res.my_role || "member");
    } catch {
      /* silent */
    }
  };

  const handleThreadVote = async (value: -1 | 0 | 1) => {
    const newValue = threadMyVote === value ? 0 : value;
    try {
      const res = await replyService.voteThread(
        threadId,
        newValue as -1 | 0 | 1,
      );
      setThreadVoteCount(res.vote_count);
      setThreadMyVote(res.my_vote);
    } catch {
      /* silent */
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await replyService.create(classId, threadId, { body: replyText });
      setReplyText("");
      loadThread();
    } catch {
      /* silent */
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!confirm("Hapus thread ini?")) return;
    try {
      await threadService.delete(classId, threadId);
      router.push(`/class/${classId}`);
    } catch {
      /* silent */
    }
  };

  const handleTogglePin = async () => {
    try {
      await threadService.togglePin(classId, threadId);
      loadThread();
    } catch {
      /* silent */
    }
  };

  const handleEditThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setEditLoading(true);
    try {
      await threadService.update(classId, threadId, {
        title: editTitle.trim(),
        body: editBody.trim(),
      });
      showToast('Thread berhasil diperbarui!');
      setShowEditModal(false);
      loadThread();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mengedit thread.', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading || !thread) {
    return (
      <AppLayout title="Loading...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="spinner" />
        </div>
      </AppLayout>
    );
  }

  const isAuthor = user?.id === thread.user?.id;
  const isTeacher = myRole === "teacher";

  return (
    <AppLayout title={thread.forum_channel?.name || "Thread"} activeNav="class">
      <HiveToast />
      <div className="max-w-[1200px] mx-auto w-full pb-40 md:pb-32">
        {/* ── Thread Content ── */}
        <HiveCard padding="lg" className="mb-4 relative overflow-hidden">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-honey/30 to-transparent" />

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start justify-between mb-4 gap-3">
            <div className="flex items-center gap-3">
              <HiveAvatar name={thread.user?.name || "?"} size="md" hex />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-on-surface">
                    {thread.user?.display_name || thread.user?.name}
                  </span>
                  {thread.user?.role === "teacher" && (
                    <HiveBadge variant="teacher">Guru</HiveBadge>
                  )}
                </div>
                <span className="text-xs text-outline">
                  {timeAgo(thread.created_at)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {thread.is_pinned && (
                <HiveBadge variant="honey" icon={<IconPin />}>
                  Pinned
                </HiveBadge>
              )}
              {isTeacher && (
                <ActionBtn onClick={handleTogglePin}>
                  <IconPin /> {thread.is_pinned ? "Unpin" : "Pin"}
                </ActionBtn>
              )}
              {isAuthor && (
                <ActionBtn
                  onClick={() => {
                    setEditTitle(thread.title);
                    setEditBody(thread.body);
                    setShowEditModal(true);
                  }}
                >
                  ✏️ Edit
                </ActionBtn>
              )}
              {(isAuthor || isTeacher) && (
                <ActionBtn
                  onClick={handleDeleteThread}
                  className="hover:!text-error hover:!bg-error/10"
                >
                  <IconTrash /> Hapus
                </ActionBtn>
              )}
            </div>
          </div>

          <HiveBadge variant="primary" className="mb-3">
            {thread.forum_channel?.name}
          </HiveBadge>

          <h1 className="text-xl md:text-2xl font-bold mb-4 leading-tight tracking-tight">
            {thread.title}
          </h1>
          <div className="mb-4">
            <MarkdownViewer content={thread.body} />
          </div>

          {/* Vote Bar */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-outline-variant/10">
            <button
              className={`bg-surface-container-high/60 border border-outline-variant/10 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-default ${threadMyVote === 1 ? "bg-honey/15 border-honey/25 text-honey" : "text-on-surface-variant hover:bg-surface-container-highest"}`}
              onClick={() => handleThreadVote(1)}
            >
              <span className="w-[18px] h-[18px]">
                <IconArrowUp active={threadMyVote === 1} />
              </span>
            </button>
            <span
              className={`text-lg font-bold min-w-[30px] text-center ${threadVoteCount > 0 ? "text-honey" : threadVoteCount < 0 ? "text-error" : "text-on-surface-variant"}`}
            >
              {threadVoteCount}
            </span>
            <button
              className={`bg-surface-container-high/60 border border-outline-variant/10 w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-default ${threadMyVote === -1 ? "bg-error/15 border-error/25 text-error" : "text-on-surface-variant hover:bg-surface-container-highest"}`}
              onClick={() => handleThreadVote(-1)}
            >
              <span className="w-[18px] h-[18px]">
                <IconArrowDown active={threadMyVote === -1} />
              </span>
            </button>
            <span className="w-px h-5 bg-outline-variant/20 mx-2" />
            <span className="text-sm text-on-surface-variant">
              {thread.reply_count} balasan
            </span>
          </div>
        </HiveCard>

        {/* ── Reply Form (Fixed at Bottom) ── */}
        <HiveMessageInput
          value={replyText}
          onChange={setReplyText}
          onSend={handleSubmitReply}
          sending={submitting}
          placeholder="Tulis balasan..."
          className="fixed bottom-[68px] md:bottom-0 left-0 right-0 md:left-[260px] z-40 bg-[#0a1224]/80 backdrop-blur-xl shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.3)] animate-fade-up pb-2 md:pb-4 rounded-t-2xl"
        />

        {/* ── Replies ── */}
        <div className="mt-6">
          <h3 className="text-sm font-bold mb-4 text-on-surface flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-primary" />
            {replies.length} Balasan
          </h3>
          {replies.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">
              <p className="text-sm">
                Belum ada balasan. Jadilah yang pertama!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {replies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  classId={classId}
                  threadId={threadId}
                  depth={0}
                  userId={user?.id}
                  myRole={myRole}
                  onRefresh={loadThread}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Thread Modal ── */}
      <HiveModal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Thread">
        <form onSubmit={handleEditThread} className="flex flex-col gap-5">
          <HiveInput
            label="Judul"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            required
          />
          <MarkdownEditor
            value={editBody}
            onChange={setEditBody}
            placeholder="Isi Thread (Mendukung Markdown & Paste Gambar)"
            minHeight="200px"
          />
          <div className="flex gap-2 justify-end">
            <HiveButton variant="secondary" type="button" onClick={() => setShowEditModal(false)}>Batal</HiveButton>
            <HiveButton variant="primary" type="submit" loading={editLoading}>Simpan</HiveButton>
          </div>
        </form>
      </HiveModal>
    </AppLayout>
  );
}

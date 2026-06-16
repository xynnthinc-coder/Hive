"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { threadService, type ForumChannel } from '@/services/thread';
import AppLayout from '@/components/AppLayout';
import HiveCard from '@/components/ui/HiveCard';
import HiveButton from '@/components/ui/HiveButton';
import { HiveInput } from '@/components/ui/HiveInput';
import MarkdownEditor from '@/components/ui/MarkdownEditor';

export default function NewThread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const classId = parseInt(id);
  const router = useRouter();
  const [channels, setChannels] = useState<ForumChannel[]>([]);
  const [channelId, setChannelId] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    threadService.getChannels(classId).then(res => {
      setChannels(res.channels);
      if (res.channels.length > 0) setChannelId(res.channels[0].id);
    }).catch(() => router.push(`/class/${classId}`));
  }, [classId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !channelId) return;
    setLoading(true);
    setError('');
    try {
      const res = await threadService.create(classId, { forum_channel_id: channelId, title: title.trim(), body: body.trim() });
      router.push(`/class/${classId}/thread/${res.thread.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat thread.');
    } finally { setLoading(false); }
  };

  return (
    <AppLayout title="Buat Thread Baru" activeNav="class">
      <div className="max-w-[1200px] mx-auto w-full">
        <HiveCard padding="lg" className="relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-honey/30 to-transparent" />

          <h2 className="text-xl font-bold mb-1">Buat Diskusi Baru</h2>
          <p className="text-sm text-on-surface-variant mb-6">Ajukan pertanyaan atau mulai diskusi.</p>

          {error && (
            <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3 text-sm text-error mb-5 animate-shake">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <HiveInput.Select
                label="Forum Channel"
                id="thread-channel"
                value={channelId}
                onChange={(val) => setChannelId(Number(val))}
                options={channels.map(ch => ({
                  value: ch.id,
                  label: ch.name,
                  icon: ch.icon || undefined
                }))}
              />
              <p className="text-xs text-on-surface-variant px-1 mt-1">
                Guru dapat menambahkan channel baru melalui <a href={`/class/${classId}/settings`} className="text-honey hover:underline">Pengaturan Kelas</a>.
              </p>
            </div>

            <HiveInput
              label="Judul Thread"
              id="thread-title"
              placeholder="Tulis judul yang jelas..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={255}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Isi Thread</label>
              <MarkdownEditor
                value={body}
                onChange={setBody}
                placeholder="Jelaskan pertanyaan atau topik... (Mendukung Markdown & Paste Gambar)"
                minHeight="250px"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <HiveButton variant="secondary" type="button" onClick={() => router.back()}>
                Batal
              </HiveButton>
              <HiveButton
                variant="primary"
                type="submit"
                loading={loading}
                disabled={!title.trim() || !body.trim()}
              >
                Post Thread
              </HiveButton>
            </div>
          </form>
        </HiveCard>
      </div>
    </AppLayout>
  );
}

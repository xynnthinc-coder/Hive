"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { classService } from '@/services/class';
import { threadService, type ForumChannel } from '@/services/thread';
import type { ClassRoom } from '@/services/auth';
import AppLayout from '@/components/AppLayout';
import HiveCard from '@/components/ui/HiveCard';
import HiveButton from '@/components/ui/HiveButton';
import HiveBadge from '@/components/ui/HiveBadge';
import HiveAvatar from '@/components/ui/HiveAvatar';
import HiveModal from '@/components/ui/HiveModal';
import { HiveInput } from '@/components/ui/HiveInput';
import HiveToast, { showToast } from '@/components/ui/HiveToast';

const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </svg>
);
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconHash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
);
const IconDoor = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconShield = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

interface Member {
  id: number;
  name: string;
  nickname: string | null;
  display_name: string;
  email: string;
  role: string;
  avatar: string | null;
  pivot: { role: string; joined_at: string };
}

export default function ClassSettings({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const classId = parseInt(id);
  const { user } = useAuth();
  const router = useRouter();

  const [classData, setClassData] = useState<ClassRoom | null>(null);
  const [myRole, setMyRole] = useState('member');
  const [members, setMembers] = useState<Member[]>([]);
  const [channels, setChannels] = useState<ForumChannel[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit class modal
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '', academic_year: '' });
  const [editLoading, setEditLoading] = useState(false);

  // New channel modal
  const [showChannel, setShowChannel] = useState(false);
  const [channelData, setChannelData] = useState({ name: '', description: '', icon: '' });
  const [channelLoading, setChannelLoading] = useState(false);

  // Edit channel modal
  const [showEditChannel, setShowEditChannel] = useState(false);
  const [editChannelId, setEditChannelId] = useState<number | null>(null);
  const [editChannelData, setEditChannelData] = useState({ name: '', description: '', icon: '' });
  const [editChannelLoading, setEditChannelLoading] = useState(false);

  const isTeacher = myRole === 'teacher';
  const isCreator = classData?.created_by === user?.id;

  useEffect(() => { loadAll(); }, [classId]);

  const loadAll = async () => {
    try {
      setLoading(true);
      // Sequential calls — php artisan serve is single-threaded
      const classRes = await classService.show(classId);
      setClassData(classRes.class);
      setMyRole(classRes.my_role || 'member');
      setEditData({
        name: classRes.class.name,
        description: classRes.class.description || '',
        academic_year: classRes.class.academic_year,
      });

      const membersRes = await classService.members(classId);
      setMembers(membersRes.members || []);

      const channelsRes = await threadService.getChannels(classId);
      setChannels(channelsRes.channels || []);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 404) {
        router.push('/dashboard');
      } else {
        console.error('[Settings] Failed to load:', err);
      }
    } finally { setLoading(false); }
  };

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await classService.update(classId, editData);
      showToast('Kelas berhasil diperbarui!');
      setShowEdit(false);
      loadAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal memperbarui.', 'error');
    } finally { setEditLoading(false); }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setChannelLoading(true);
    try {
      await threadService.createChannel(classId, channelData);
      showToast('Channel berhasil dibuat!');
      setShowChannel(false);
      setChannelData({ name: '', description: '', icon: '' });
      loadAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal membuat channel.', 'error');
    } finally { setChannelLoading(false); }
  };

  const handleKick = async (memberId: number, memberName: string) => {
    if (!confirm(`Keluarkan ${memberName} dari kelas?`)) return;
    try {
      await classService.kickMember(classId, memberId);
      showToast('Anggota berhasil dikeluarkan.');
      loadAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mengeluarkan.', 'error');
    }
  };

  const handleRoleToggle = async (memberId: number, currentRole: string) => {
    const newRole = currentRole === 'teacher' ? 'member' : 'teacher';
    try {
      await classService.updateMemberRole(classId, memberId, newRole);
      showToast('Role berhasil diperbarui!');
      loadAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mengubah role.', 'error');
    }
  };

  const handleLeave = async () => {
    if (!confirm('Yakin ingin keluar dari kelas ini?')) return;
    try {
      await classService.leave(classId);
      showToast('Berhasil keluar dari kelas.');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal keluar.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirm('HAPUS KELAS INI? Semua data akan hilang. Tindakan ini tidak bisa dibatalkan!')) return;
    try {
      await classService.delete(classId);
      showToast('Kelas berhasil dihapus.');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus.', 'error');
    }
  };

  const handleEditChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editChannelId) return;
    setEditChannelLoading(true);
    try {
      await threadService.updateChannel(classId, editChannelId, editChannelData);
      showToast('Channel berhasil diperbarui!');
      setShowEditChannel(false);
      loadAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal memperbarui.', 'error');
    } finally { setEditChannelLoading(false); }
  };

  const handleDeleteChannel = async (channelId: number, channelName: string) => {
    if (!confirm(`Hapus channel "${channelName}"? Semua thread di channel ini akan ikut terhapus.`)) return;
    try {
      await threadService.deleteChannel(classId, channelId);
      showToast('Channel berhasil dihapus.');
      loadAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus.', 'error');
    }
  };

  if (loading || !classData) {
    return (
      <AppLayout title="Settings">
        <div className="flex items-center justify-center min-h-[60vh]"><div className="spinner" /></div>
      </AppLayout>
    );
  }

  const teachers = members.filter(m => m.pivot?.role === 'teacher');
  const regularMembers = members.filter(m => m.pivot?.role !== 'teacher');

  return (
    <AppLayout title={`${classData.name} — Settings`} activeNav="class">
      <HiveToast />
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">

        {/* ── Class Info ── */}
        <HiveCard padding="lg" className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-honey/30 to-transparent" />
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold mb-1 truncate">{classData.name}</h2>
              <p className="text-sm text-on-surface-variant mb-2 break-words">{classData.description || 'Tidak ada deskripsi'}</p>
              <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap">
                <span>Tahun: <strong>{classData.academic_year}</strong></span>
                <span>Kode: <strong className="text-honey break-all">{classData.invite_code}</strong></span>
                <span>{members.length} anggota</span>
              </div>
            </div>
            {isTeacher && (
              <HiveButton variant="secondary" size="sm" icon={<IconEdit />} onClick={() => setShowEdit(true)}>
                Edit Kelas
              </HiveButton>
            )}
          </div>
        </HiveCard>

        {/* ── Forum Channels ── */}
        <HiveCard padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-primary" />
              <IconHash /> Forum Channels ({channels.length})
            </h3>
            {isTeacher && (
              <HiveButton variant="honey" size="sm" icon={<IconPlus />} onClick={() => setShowChannel(true)}>
                Buat Channel
              </HiveButton>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {channels.map(ch => (
              <div key={ch.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-4 rounded-xl bg-surface-container-high/30 border border-outline-variant/10">
                <div className="flex items-center gap-3 w-full min-w-0">
                  <span className="text-lg shrink-0">{ch.icon || '#'}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-on-surface block truncate">{ch.name}</span>
                    {ch.description && <p className="text-xs text-on-surface-variant break-words line-clamp-2">{ch.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                  <HiveBadge variant="primary">{ch.threads_count || 0} threads</HiveBadge>
                  {isTeacher && (
                    <>
                      <button
                        className="bg-transparent border-none cursor-pointer text-on-surface-variant hover:text-honey p-1.5 rounded-lg transition-default hover:bg-honey/10"
                        title="Edit channel"
                        onClick={() => {
                          setEditChannelId(ch.id);
                          setEditChannelData({ name: ch.name, description: ch.description || '', icon: ch.icon || '' });
                          setShowEditChannel(true);
                        }}
                      >
                        <IconEdit />
                      </button>
                      <button
                        className="bg-transparent border-none cursor-pointer text-on-surface-variant hover:text-error p-1.5 rounded-lg transition-default hover:bg-error/10"
                        title="Hapus channel"
                        onClick={() => handleDeleteChannel(ch.id, ch.name)}
                      >
                        <IconTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {channels.length === 0 && (
              <p className="text-sm text-on-surface-variant text-center py-4">Belum ada channel.</p>
            )}
          </div>
        </HiveCard>

        {/* ── Members ── */}
        <HiveCard padding="lg">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-secondary" />
            <IconUsers /> Anggota ({members.length})
          </h3>

          {/* Teachers */}
          {teachers.length > 0 && (
            <div className="mb-4">
              <div className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-outline mb-2">Guru</div>
              <div className="flex flex-col gap-1.5">
                {teachers.map(m => (
                  <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 px-3 rounded-xl hover:bg-surface-container-high/30 transition-default">
                    <div className="flex items-center gap-3 min-w-0 w-full">
                      <HiveAvatar name={m.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-semibold text-on-surface block truncate">{m.display_name || m.name}</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <HiveBadge variant="teacher"><IconShield /> Guru</HiveBadge>
                          <span className="text-[0.65rem] text-outline truncate">{m.email}</span>
                        </div>
                      </div>
                    </div>
                    {isTeacher && m.id !== user?.id && (
                      <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto flex-wrap">
                        <HiveButton variant="ghost" size="sm" onClick={() => handleRoleToggle(m.id, 'teacher')}>
                          Jadikan Member
                        </HiveButton>
                        <HiveButton variant="danger" size="sm" icon={<IconTrash />} onClick={() => handleKick(m.id, m.name)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Members */}
          <div>
            <div className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-outline mb-2">Anggota</div>
            <div className="flex flex-col gap-1.5">
              {regularMembers.map(m => (
                <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 px-3 rounded-xl hover:bg-surface-container-high/30 transition-default">
                  <div className="flex items-center gap-3 min-w-0 w-full">
                    <HiveAvatar name={m.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-on-surface block truncate">{m.display_name || m.name}</span>
                      <span className="text-[0.65rem] text-outline block truncate">{m.email}</span>
                    </div>
                  </div>
                  {isTeacher && m.id !== user?.id && (
                    <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto flex-wrap">
                      <HiveButton variant="ghost" size="sm" onClick={() => handleRoleToggle(m.id, 'member')}>
                        Jadikan Guru
                      </HiveButton>
                      <HiveButton variant="danger" size="sm" icon={<IconTrash />} onClick={() => handleKick(m.id, m.name)} />
                    </div>
                  )}
                </div>
              ))}
              {regularMembers.length === 0 && (
                <p className="text-sm text-on-surface-variant text-center py-3">Belum ada anggota biasa.</p>
              )}
            </div>
          </div>
        </HiveCard>

        {/* ── Danger Zone ── */}
        <HiveCard padding="lg" className="border-error/20">
          <h3 className="text-sm font-bold mb-4 text-error flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-error" />
            Zona Bahaya
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 px-4 rounded-xl bg-error/[0.03] border border-error/10">
              <div>
                <div className="text-sm font-semibold text-on-surface">Keluar dari kelas</div>
                <div className="text-xs text-on-surface-variant">Kamu akan kehilangan akses ke semua diskusi di kelas ini.</div>
              </div>
              <div className="self-end sm:self-auto">
                <HiveButton variant="danger" size="sm" icon={<IconDoor />} onClick={handleLeave}>
                  Keluar
                </HiveButton>
              </div>
            </div>
            {isCreator && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 px-4 rounded-xl bg-error/[0.03] border border-error/10">
                <div>
                  <div className="text-sm font-semibold text-error">Hapus kelas</div>
                  <div className="text-xs text-on-surface-variant">Menghapus kelas secara permanen. Tidak bisa dibatalkan.</div>
                </div>
                <div className="self-end sm:self-auto">
                  <HiveButton variant="danger" size="sm" icon={<IconTrash />} onClick={handleDelete}>
                    Hapus Kelas
                  </HiveButton>
                </div>
              </div>
            )}
          </div>
        </HiveCard>
      </div>

      {/* ── Edit Class Modal ── */}
      <HiveModal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Kelas">
        <form onSubmit={handleEditClass} className="flex flex-col gap-5">
          <HiveInput label="Nama kelas" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} required />
          <HiveInput.Textarea label="Deskripsi" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} rows={3} />
          <HiveInput label="Tahun akademik" value={editData.academic_year} onChange={e => setEditData({...editData, academic_year: e.target.value})} required />
          <div className="flex gap-2 justify-end">
            <HiveButton variant="secondary" type="button" onClick={() => setShowEdit(false)}>Batal</HiveButton>
            <HiveButton variant="primary" type="submit" loading={editLoading}>Simpan</HiveButton>
          </div>
        </form>
      </HiveModal>

      {/* ── New Channel Modal ── */}
      <HiveModal open={showChannel} onClose={() => setShowChannel(false)} title="Buat Forum Channel">
        <form onSubmit={handleCreateChannel} className="flex flex-col gap-5">
          <HiveInput label="Nama channel" placeholder="Matematika" value={channelData.name} onChange={e => setChannelData({...channelData, name: e.target.value})} required />
          <HiveInput label="Ikon (opsional)" placeholder="#" value={channelData.icon} onChange={e => setChannelData({...channelData, icon: e.target.value})} maxLength={4} />
          <HiveInput.Textarea label="Deskripsi (opsional)" placeholder="Diskusi seputar..." value={channelData.description} onChange={e => setChannelData({...channelData, description: e.target.value})} rows={2} />
          <div className="flex gap-2 justify-end">
            <HiveButton variant="secondary" type="button" onClick={() => setShowChannel(false)}>Batal</HiveButton>
            <HiveButton variant="primary" type="submit" loading={channelLoading}>Buat Channel</HiveButton>
          </div>
        </form>
      </HiveModal>

      {/* ── Edit Channel Modal ── */}
      <HiveModal open={showEditChannel} onClose={() => setShowEditChannel(false)} title="Edit Forum Channel">
        <form onSubmit={handleEditChannel} className="flex flex-col gap-5">
          <HiveInput label="Nama channel" value={editChannelData.name} onChange={e => setEditChannelData({...editChannelData, name: e.target.value})} required />
          <HiveInput label="Ikon (opsional)" value={editChannelData.icon} onChange={e => setEditChannelData({...editChannelData, icon: e.target.value})} maxLength={4} />
          <HiveInput.Textarea label="Deskripsi" value={editChannelData.description} onChange={e => setEditChannelData({...editChannelData, description: e.target.value})} rows={2} />
          <div className="flex gap-2 justify-end">
            <HiveButton variant="secondary" type="button" onClick={() => setShowEditChannel(false)}>Batal</HiveButton>
            <HiveButton variant="primary" type="submit" loading={editChannelLoading}>Simpan</HiveButton>
          </div>
        </form>
      </HiveModal>
    </AppLayout>
  );
}

import api from './api';
import type { ClassRoom } from './auth';

// ─── Class Service ──────────────────────────────────
export const classService = {
  async myClasses(): Promise<{ classes: ClassRoom[] }> {
    const response = await api.get('/classes/my');
    return response.data;
  },

  async show(classId: number): Promise<{
    class: ClassRoom;
    my_role: string;
    forum_channels: any[];
    chat_channels: any[];
  }> {
    const response = await api.get(`/classes/${classId}`);
    return response.data;
  },

  async create(data: {
    name: string;
    description?: string;
    academic_year: string;
  }): Promise<{ message: string; class: ClassRoom }> {
    const response = await api.post('/classes', data);
    return response.data;
  },

  async join(invite_code: string): Promise<{ message: string; class: ClassRoom }> {
    const response = await api.post('/classes/join', { invite_code });
    return response.data;
  },

  async leave(classId: number): Promise<{ message: string }> {
    const response = await api.post(`/classes/${classId}/leave`);
    return response.data;
  },

  async members(classId: number): Promise<{ members: any[] }> {
    const response = await api.get(`/classes/${classId}/members`);
    return response.data;
  },

  async update(classId: number, data: {
    name?: string;
    description?: string;
    academic_year?: string;
  }): Promise<{ message: string; class: ClassRoom }> {
    const response = await api.put(`/classes/${classId}`, data);
    return response.data;
  },

  async delete(classId: number): Promise<{ message: string }> {
    const response = await api.delete(`/classes/${classId}`);
    return response.data;
  },

  async kickMember(classId: number, memberId: number): Promise<{ message: string }> {
    const response = await api.delete(`/classes/${classId}/members/${memberId}`);
    return response.data;
  },

  async updateMemberRole(classId: number, memberId: number, role: 'member' | 'teacher'): Promise<{ message: string }> {
    const response = await api.put(`/classes/${classId}/members/${memberId}/role`, { role });
    return response.data;
  },
};

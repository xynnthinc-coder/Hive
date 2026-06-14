import api from './api';

export interface Thread {
  id: number;
  forum_channel_id: number;
  title: string;
  body: string;
  is_pinned: boolean;
  is_resolved: boolean;
  vote_count: number;
  reply_count: number;
  last_activity_at: string;
  user: {
    id: number;
    name: string;
    nickname: string | null;
    display_name: string;
    avatar: string | null;
    role: string;
  };
  forum_channel: {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
  };
  my_vote: number;
  has_best_answer: boolean;
  created_at: string;
  updated_at: string;
}

export interface ForumChannel {
  id: number;
  class_id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_locked: boolean;
  threads_count?: number;
}

export const threadService = {
  async list(classId: number, params?: {
    channel_id?: number;
    sort?: 'latest' | 'hot' | 'top';
    page?: number;
    per_page?: number;
  }) {
    const response = await api.get(`/classes/${classId}/threads`, { params });
    return response.data;
  },

  async hot(classId: number) {
    const response = await api.get(`/classes/${classId}/threads/hot`);
    return response.data;
  },

  async show(classId: number, threadId: number) {
    const response = await api.get(`/classes/${classId}/threads/${threadId}`);
    return response.data;
  },

  async create(classId: number, data: {
    forum_channel_id: number;
    title: string;
    body: string;
  }) {
    const response = await api.post(`/classes/${classId}/threads`, data);
    return response.data;
  },

  async update(classId: number, threadId: number, data: {
    title?: string;
    body?: string;
  }) {
    const response = await api.put(`/classes/${classId}/threads/${threadId}`, data);
    return response.data;
  },

  async delete(classId: number, threadId: number) {
    const response = await api.delete(`/classes/${classId}/threads/${threadId}`);
    return response.data;
  },

  async togglePin(classId: number, threadId: number) {
    const response = await api.post(`/classes/${classId}/threads/${threadId}/pin`);
    return response.data;
  },

  async getChannels(classId: number): Promise<{ channels: ForumChannel[] }> {
    const response = await api.get(`/classes/${classId}/channels`);
    return response.data;
  },

  async createChannel(classId: number, data: {
    name: string;
    description?: string;
    icon?: string;
  }) {
    const response = await api.post(`/classes/${classId}/channels`, data);
    return response.data;
  },

  async updateChannel(classId: number, channelId: number, data: {
    name?: string;
    description?: string;
    icon?: string;
  }) {
    const response = await api.put(`/classes/${classId}/channels/${channelId}`, data);
    return response.data;
  },

  async deleteChannel(classId: number, channelId: number) {
    const response = await api.delete(`/classes/${classId}/channels/${channelId}`);
    return response.data;
  },
};

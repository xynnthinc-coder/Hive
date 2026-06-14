import api from './api';

export interface AppNotification {
  id: number;
  user_id: number;
  type: 'reply' | 'vote' | 'best_answer' | 'mention' | 'join' | 'pin';
  title: string;
  body: string;
  data: {
    class_id?: number;
    thread_id?: number;
    [key: string]: any;
  } | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const notificationService = {
  async list(page: number = 1): Promise<{
    notifications: AppNotification[];
    unread_count: number;
    has_more: boolean;
    current_page: number;
  }> {
    const response = await api.get('/notifications', { params: { page } });
    return response.data;
  },

  async unreadCount(): Promise<{ unread_count: number }> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  async markRead(notificationId: number): Promise<{ message: string }> {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllRead(): Promise<{ message: string }> {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};

import api from './api';
import type { Thread } from './thread';

export interface FeedThread extends Thread {
  class_name?: string;
  forum_channel: Thread['forum_channel'] & {
    class_id?: number;
  };
}

export const feedService = {
  async list(params?: {
    class_id?: number;
    page?: number;
    per_page?: number;
  }): Promise<{
    threads: FeedThread[];
    meta: { current_page: number; last_page: number; total: number };
  }> {
    const response = await api.get('/feed', { params });
    return response.data;
  },

  async hot(): Promise<{ threads: FeedThread[] }> {
    const response = await api.get('/feed/hot');
    return response.data;
  },
};

import api from './api';

export interface SearchThread {
  id: number;
  class_id: number;
  class_name: string;
  title: string;
  body: string;
  vote_count: number;
  reply_count: number;
  is_pinned: boolean;
  user: {
    id: number;
    name: string;
    display_name: string;
    avatar: string | null;
  } | null;
  forum_channel: {
    name: string;
    icon: string | null;
  } | null;
  created_at: string;
}

export const searchService = {
  async threads(query: string): Promise<{
    threads: SearchThread[];
    query: string;
    count: number;
  }> {
    const response = await api.get('/search/threads', { params: { q: query } });
    return response.data;
  },
};

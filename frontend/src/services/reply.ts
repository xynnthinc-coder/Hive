import api from './api';

export interface Reply {
  id: number;
  thread_id: number;
  parent_id: number | null;
  body: string;
  is_best_answer: boolean;
  vote_count: number;
  user: {
    id: number;
    name: string;
    nickname: string | null;
    display_name: string;
    avatar: string | null;
    role: string;
  };
  my_vote: number;
  children: Reply[];
  created_at: string;
  updated_at: string;
}

export const replyService = {
  async create(classId: number, threadId: number, data: {
    body: string;
    parent_id?: number | null;
  }) {
    const response = await api.post(`/classes/${classId}/threads/${threadId}/replies`, data);
    return response.data;
  },

  async update(replyId: number, body: string) {
    const response = await api.put(`/replies/${replyId}`, { body });
    return response.data;
  },

  async delete(replyId: number) {
    const response = await api.delete(`/replies/${replyId}`);
    return response.data;
  },

  async markBestAnswer(replyId: number) {
    const response = await api.post(`/replies/${replyId}/best-answer`);
    return response.data;
  },

  async voteThread(threadId: number, value: -1 | 0 | 1) {
    const response = await api.post(`/threads/${threadId}/vote`, { value });
    return response.data;
  },

  async voteReply(replyId: number, value: -1 | 0 | 1) {
    const response = await api.post(`/replies/${replyId}/vote`, { value });
    return response.data;
  },
};

import api from './api';

export interface ChatChannel {
  id: number;
  class_id: number;
  name: string;
  slug: string;
  description: string | null;
  type: 'general' | 'announcement' | 'group';
  created_by: number;
}

export interface ChatMessage {
  id: number;
  chat_channel_id: number;
  body: string;
  type: 'text' | 'image' | 'file' | 'code';
  metadata: any;
  is_pinned: boolean;
  is_own: boolean;
  user: {
    id: number;
    name: string;
    nickname: string | null;
    display_name: string;
    avatar: string | null;
    role: string;
  } | null;
  created_at: string;
  edited_at: string | null;
}

export const chatService = {
  /**
   * Get message history for a chat channel.
   * Supports cursor pagination with before_id for infinite scroll up.
   */
  async getMessages(classId: number, channelId: number, params?: {
    before_id?: number;
    per_page?: number;
  }): Promise<{ messages: ChatMessage[]; has_more: boolean }> {
    const response = await api.get(`/classes/${classId}/chat-channels/${channelId}/messages`, { params });
    return response.data;
  },

  /**
   * Poll for new messages after a given message ID.
   */
  async pollNew(classId: number, channelId: number, afterId: number): Promise<{ messages: ChatMessage[] }> {
    const response = await api.get(`/classes/${classId}/chat-channels/${channelId}/messages/poll`, {
      params: { after_id: afterId },
    });
    return response.data;
  },

  /**
   * Send a new message to a chat channel.
   */
  async sendMessage(classId: number, channelId: number, body: string, type: string = 'text'): Promise<{ message: ChatMessage }> {
    const response = await api.post(`/classes/${classId}/chat-channels/${channelId}/messages`, { body, type });
    return response.data;
  },

  /**
   * Delete a message.
   */
  async deleteMessage(messageId: number): Promise<{ message: string }> {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  },

  /**
   * List chat channels for a class.
   */
  async getChannels(classId: number): Promise<{ channels: ChatChannel[] }> {
    const response = await api.get(`/classes/${classId}/chat-channels`);
    return response.data;
  },

  /**
   * Create a new chat channel (teacher only).
   */
  async createChannel(classId: number, data: {
    name: string;
    description?: string;
    type?: string;
  }): Promise<{ message: string; channel: ChatChannel }> {
    const response = await api.post(`/classes/${classId}/chat-channels`, data);
    return response.data;
  },

  /**
   * Delete a chat channel (teacher only).
   */
  async deleteChannel(classId: number, channelId: number): Promise<{ message: string }> {
    const response = await api.delete(`/classes/${classId}/chat-channels/${channelId}`);
    return response.data;
  },
};

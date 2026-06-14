import api from './api';

export interface User {
  id: number;
  name: string;
  nickname: string | null;
  display_name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassRoom {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  academic_year: string;
  invite_code: string;
  created_by: number;
  members_count?: number;
  forum_channels_count?: number;
  chat_channels_count?: number;
  current_user_role?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'student' | 'teacher';
}

// ─── Auth Service ───────────────────────────────────
const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/login', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
  },

  async getUser(): Promise<User> {
    const response = await api.get<User>('/user');
    return response.data;
  },

  async updateProfile(data: {
    name?: string;
    nickname?: string | null;
    bio?: string | null;
  }): Promise<{ message: string; user: User }> {
    const response = await api.put('/user', data);
    return response.data;
  },

  async changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> {
    const response = await api.put('/user/password', data);
    return response.data;
  },

  async stats(): Promise<{
    thread_count: number;
    reply_count: number;
    total_upvotes: number;
    class_count: number;
    best_answer_count: number;
  }> {
    const response = await api.get('/user/stats');
    return response.data;
  },

  async activity(): Promise<{
    activity: Array<{
      type: 'thread' | 'reply' | 'best_answer';
      id: number;
      title: string;
      body?: string;
      class_id?: number;
      class_name?: string;
      channel_name?: string;
      thread_id?: number;
      vote_count?: number;
      reply_count?: number;
      created_at: string;
    }>;
  }> {
    const response = await api.get('/user/activity');
    return response.data;
  },
};

export default authService;

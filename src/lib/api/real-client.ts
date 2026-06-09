import { PUBLIC_API_BASE_URL, PUBLIC_API_TIMEOUT } from '$env/static/public';
import type {
  User, BlogPost, Video, Event, Notification, Media,
  DashboardStats, PaginatedResponse, Role, Speaker, Category, Tag,
  NotificationTemplate, AppSetting, ActivityLog, EventRegistration, AppUser,
  DailyContent, BlogPostInput,
} from '$lib/types';

const REQUEST_TIMEOUT = parseInt(PUBLIC_API_TIMEOUT || '30000', 10);

let accessToken: string | null = null;

async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}): Promise<Response> {
  const { timeout = REQUEST_TIMEOUT, ...fetchOptions } = options;
  const controller = new AbortController();
    const id = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), timeout);
  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function jsonWithTimeout(res: Response, timeout = 10_000): Promise<any> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(new DOMException('JSON parse timed out', 'TimeoutError')), timeout);
  try {
    const text = await res.text();
    return JSON.parse(text);
  } finally {
    clearTimeout(id);
  }
}

function getErrorMessage(err: unknown): string {
  if (err instanceof DOMException && err.name === 'TimeoutError') {
    return 'Request timed out. The server is taking too long to respond.';
  }
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Network error. Please check your connection.';
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

function getTokenFromStorage(key: string): string | null {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

function setTokenInStorage(key: string, value: string): void {
  const rememberMe = sessionStorage.getItem('remember_me') === 'true';
  sessionStorage.setItem(key, value);
  if (rememberMe) {
    localStorage.setItem(key, value);
  }
}

function removeTokenFromStorage(key: string): void {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}

export function getStorageToken(key: string): string | null {
  return getTokenFromStorage(key);
}

export function setStorageToken(key: string, value: string): void {
  setTokenInStorage(key, value);
}

export function removeStorageToken(key: string): void {
  removeTokenFromStorage(key);
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getTokenFromStorage('refresh_token');
  if (!refreshToken) return false;

  try {
    const res = await fetchWithTimeout(`${PUBLIC_API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const json = await jsonWithTimeout(res);
    if (!res.ok || !json.success) return false;

    setAccessToken(json.data.access_token);
    setTokenInStorage('access_token', json.data.access_token);
    if (json.data.refresh_token) {
      setTokenInStorage('refresh_token', json.data.refresh_token);
    }
    return true;
  } catch {
    return false;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetchWithTimeout(`${PUBLIC_API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        const retryRes = await fetchWithTimeout(`${PUBLIC_API_BASE_URL}${path}`, { ...options, headers });
        const retryJson = await jsonWithTimeout(retryRes);
        if (!retryRes.ok || retryJson.success === false) {
          throw new Error(retryJson.message || `Request failed: ${retryRes.status}`);
        }
        return retryJson.data;
      }
    }

    const json = await jsonWithTimeout(res);

    if (!res.ok || json.success === false) {
      throw new Error(json.message || `Request failed: ${res.status}`);
    }

    return json.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
}

async function requestWithMeta<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; meta?: PaginatedResponse<T>['meta'] }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetchWithTimeout(`${PUBLIC_API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        const retryRes = await fetchWithTimeout(`${PUBLIC_API_BASE_URL}${path}`, { ...options, headers });
        const retryJson = await jsonWithTimeout(retryRes);
        if (!retryRes.ok || retryJson.success === false) {
          throw new Error(retryJson.message || `Request failed: ${retryRes.status}`);
        }
        return { data: retryJson.data, meta: retryJson.meta };
      }
    }

    const json = await jsonWithTimeout(res);

    if (!res.ok || json.success === false) {
      throw new Error(json.message || `Request failed: ${res.status}`);
    }

    return { data: json.data, meta: json.meta };
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      return request<{ user: User; access_token: string; refresh_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    supabaseLogin: async (supabaseToken: string) => {
      return request<{ user: User; access_token: string; refresh_token: string }>('/auth/admin/supabase-login', {
        method: 'POST',
        body: JSON.stringify({ supabase_token: supabaseToken }),
      });
    },
    invite: async (data: { email: string; name: string }) => {
      return request<{ message: string; user: User }>('/auth/admin/invite', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    forgotPassword: async (email: string) => {
      return request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    resetPassword: async (token: string, password: string) => {
      return request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
    },
    getCurrentUser: async () => {
      return request<User>('/auth/me');
    },
    logout: async () => {
      return request<{ message: string }>('/auth/logout', { method: 'POST' });
    },
  },

  blog: {
    list: async (params?: { page?: number; limit?: number; search?: string; status?: string; categoryId?: string; featured?: boolean }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.search) qp.set('search', params.search);
      if (params?.status) qp.set('status', params.status);
      if (params?.categoryId) qp.set('categoryId', params.categoryId);
      if (params?.featured !== undefined) qp.set('featured', String(params.featured));
      const { data, meta } = await requestWithMeta<BlogPost[]>(`/blog-posts${qp.toString() ? `?${qp}` : ''}`);
      return { data, meta: meta! };
    },
    getBySlug: async (slug: string) => {
      return request<BlogPost>(`/blog-posts/${slug}`);
    },
    getById: async (id: string) => {
      return request<BlogPost>(`/blog-posts/${id}`);
    },
    create: async (data: BlogPostInput) => {
      return request<BlogPost>('/blog-posts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: Partial<BlogPostInput>) => {
      return request<BlogPost>(`/blog-posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return request<{ success: boolean }>(`/blog-posts/${id}`, { method: 'DELETE' });
    },
    publish: async (id: string) => {
      return request<BlogPost>(`/blog-posts/${id}/publish`, { method: 'PATCH' });
    },
    unpublish: async (id: string) => {
      return request<BlogPost>(`/blog-posts/${id}/unpublish`, { method: 'PATCH' });
    },
    toggleFeatured: async (id: string) => {
      return request<BlogPost>(`/blog-posts/${id}/feature`, { method: 'PATCH' });
    },
  },

  videos: {
    list: async (params?: { page?: number; limit?: number; search?: string; categoryId?: string; speakerId?: string; featured?: boolean }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.search) qp.set('search', params.search);
      if (params?.categoryId) qp.set('categoryId', params.categoryId);
      if (params?.speakerId) qp.set('speakerId', params.speakerId);
      if (params?.featured !== undefined) qp.set('featured', String(params.featured));
      const { data, meta } = await requestWithMeta<Video[]>(`/videos${qp.toString() ? `?${qp}` : ''}`);
      return { data, meta: meta! };
    },
    getById: async (id: string) => {
      return request<Video>(`/videos/${id}`);
    },
    create: async (data: Partial<Video>) => {
      return request<Video>('/videos', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: Partial<Video>) => {
      return request<Video>(`/videos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return request<{ success: boolean }>(`/videos/${id}`, { method: 'DELETE' });
    },
    toggleFeatured: async (id: string) => {
      return request<Video>(`/videos/${id}/feature`, { method: 'PATCH' });
    },
  },

  events: {
    list: async (params?: { page?: number; limit?: number; status?: string; upcoming?: boolean }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.status) qp.set('status', params.status);
      if (params?.upcoming !== undefined) qp.set('upcoming', String(params.upcoming));
      const { data, meta } = await requestWithMeta<Event[]>(`/events${qp.toString() ? `?${qp}` : ''}`);
      return { data, meta: meta! };
    },
    getById: async (id: string) => {
      return request<Event>(`/events/${id}`);
    },
    create: async (data: Partial<Event>) => {
      return request<Event>('/events', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: Partial<Event>) => {
      return request<Event>(`/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return request<{ success: boolean }>(`/events/${id}`, { method: 'DELETE' });
    },
    getRegistrations: async (eventId: string) => {
      return request<EventRegistration[]>(`/events/${eventId}/registrations`);
    },
  },

  notifications: {
    list: async (params?: { page?: number; limit?: number }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      const { data, meta } = await requestWithMeta<Notification[]>(`/notifications${qp.toString() ? `?${qp}` : ''}`);
      return { data, meta: meta! };
    },
    send: async (data: { title: string; body?: string; type?: string; userIds?: string[]; topic?: string; scheduledAt?: string }) => {
      return request<Notification>('/notifications/send', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    broadcast: async (data: { title: string; body?: string; topic?: string; scheduledAt?: string }) => {
      return request<Notification>('/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    markRead: async (id: string) => {
      return request<{ success: boolean }>(`/notifications/read/${id}`, { method: 'PATCH' });
    },
    markAllRead: async () => {
      return request<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' });
    },
    getStats: async () => {
      return request<{ total: number; sent: number; scheduled: number; read: number }>('/notifications/stats');
    },
    getTemplates: async () => {
      return request<NotificationTemplate[]>('/notifications/templates');
    },
  },

  users: {
    list: async (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.search) qp.set('search', params.search);
      if (params?.role) qp.set('role', params.role);
      if (params?.status) qp.set('status', params.status);
      const { data, meta } = await requestWithMeta<User[]>(`/users${qp.toString() ? `?${qp}` : ''}`);
      return { data, meta: meta! };
    },
    getById: async (id: string) => {
      return request<User>(`/users/${id}`);
    },
    create: async (data: Partial<User>) => {
      return request<User>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: Partial<User>) => {
      return request<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return request<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' });
    },
    suspend: async (id: string) => {
      return request<{ message: string }>(`/users/${id}/suspend`, { method: 'PATCH' });
    },
    getActivity: async (userId: string) => {
      return request<ActivityLog[]>(`/users/${userId}/activity`);
    },
    getRoles: async () => {
      return request<Role[]>('/roles');
    },
    getAppUsers: async (params?: { page?: number; limit?: number; search?: string; platform?: string; status?: string }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.search) qp.set('search', params.search);
      if (params?.platform) qp.set('platform', params.platform);
      if (params?.status) qp.set('status', params.status);
      const { data, meta } = await requestWithMeta<AppUser[]>(`/analytics/app-users${qp.toString() ? `?${qp}` : ''}`);
      return { data, meta: meta! };
    },
    getAppUserDetail: async (id: string) => {
      return request<AppUser>(`/analytics/app-users/${id}`);
    },
    updateAppUserStatus: async (id: string, status: AppUser['status']) => {
      return request<{ success: true; user: AppUser }>(`/analytics/app-users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    updateNotificationStatus: async (id: string, enabled: boolean) => {
      return request<{ success: true; user: AppUser }>(`/analytics/app-users/${id}/notifications`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
      });
    },
    sendUserNotification: async (id: string, data: { title: string; message: string }) => {
      return request<{ success: boolean; notificationId: string }>(`/analytics/app-users/${id}/notify`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  media: {
    list: async (params?: { page?: number; limit?: number; type?: string; search?: string }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.type) qp.set('type', params.type);
      if (params?.search) qp.set('search', params.search);
      const { data, meta } = await requestWithMeta<Media[]>(`/media${qp.toString() ? `?${qp}` : ''}`);
      return { data, meta: meta! };
    },
    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      const res = await fetchWithTimeout(`${PUBLIC_API_BASE_URL}/media/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const json = await jsonWithTimeout(res);
      if (!res.ok || json.success === false) {
        throw new Error(json.message || 'Upload failed');
      }
      return json.data as Media;
    },
    createRecord: async (data: { filename: string; originalName: string; mimeType: string; size: number; url: string; thumbnailUrl?: string | null; type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' }) => {
      return request<{ id: string; url: string; filename: string }>('/media', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return request<{ success: boolean }>(`/media/${id}`, { method: 'DELETE' });
    },
    getStats: async () => {
      return request<{ total: number; used: number; byType: Record<string, number> }>('/media/stats');
    },
  },

  analytics: {
    getDashboard: async () => {
      return request<DashboardStats>('/analytics/dashboard');
    },
    getGrowth: async (days = 30) => {
      return request<{ date: string; count: number }[]>(`/analytics/growth?days=${days}`);
    },
    getEngagement: async () => {
      return request<{ date: string; views: number; likes: number; comments: number }[]>('/analytics/engagement');
    },
  },

  settings: {
    getAll: async () => {
      return request<AppSetting[]>('/settings');
    },
    getByKey: async (key: string) => {
      return request<AppSetting>(`/settings/${key}`);
    },
    update: async (key: string, value: Record<string, unknown>) => {
      return request<AppSetting>(`/settings/${key}`, {
        method: 'PATCH',
        body: JSON.stringify({ value }),
      });
    },
    delete: async (key: string) => {
      return request<{ success: boolean }>(`/settings/${key}`, { method: 'DELETE' });
    },
  },

  dailyContent: {
    list: async (params?: { page?: number; limit?: number; type?: string; isActive?: boolean }) => {
      const qp = new URLSearchParams();
      if (params?.page) qp.set('page', String(params.page));
      if (params?.limit) qp.set('limit', String(params.limit));
      if (params?.type) qp.set('type', params.type);
      if (params?.isActive !== undefined) qp.set('isActive', String(params.isActive));
      const { data, meta } = await requestWithMeta<DailyContent[]>(`/daily-content${qp.toString() ? `?${qp}` : ''}`);
      return { data, meta: meta! };
    },
    getById: async (id: string) => {
      return request<DailyContent>(`/daily-content/${id}`);
    },
    getToday: async () => {
      return request<DailyContent>('/daily-content/today');
    },
    create: async (data: Partial<DailyContent>) => {
      return request<DailyContent>('/daily-content', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: Partial<DailyContent>) => {
      return request<DailyContent>(`/daily-content/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string) => {
      return request<{ success: boolean }>(`/daily-content/${id}`, { method: 'DELETE' });
    },
  },

  categories: {
    list: async (type?: string) => {
      const qp = type ? `?type=${type}` : '';
      return request<Category[]>(`/categories${qp}`);
    },
  },

  tags: {
    list: async () => {
      return request<Tag[]>('/tags');
    },
  },

  speakers: {
    list: async () => {
      return request<Speaker[]>('/speakers');
    },
  },
};

import { writable } from 'svelte/store';
import type { User } from '$lib/types';
import { api, setAccessToken, setStorageToken, getStorageToken, removeStorageToken } from '$lib/api/real-client';

function createAuthStore() {
  const { subscribe, set, update } = writable<{
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  async function login(email: string, password: string, rememberMe = false) {
    update((s) => ({ ...s, isLoading: true }));
    try {
      const res = await api.auth.login(email, password);
      setAccessToken(res.access_token);
      sessionStorage.setItem('remember_me', String(rememberMe));
      setStorageToken('access_token', res.access_token);
      setStorageToken('refresh_token', res.refresh_token);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
      return res;
    } catch (err) {
      update((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  }

  async function logout() {
    try {
      await api.auth.logout().catch(() => {});
    } finally {
      setAccessToken(null);
      removeStorageToken('access_token');
      removeStorageToken('refresh_token');
      sessionStorage.removeItem('remember_me');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }

  async function init() {
    const token = getStorageToken('access_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    setAccessToken(token);
    update((s) => ({ ...s, isLoading: true }));
    try {
      const user = await api.auth.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      setAccessToken(null);
      removeStorageToken('access_token');
      removeStorageToken('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }

  return {
    subscribe,
    login,
    logout,
    init,
    setLoading: (isLoading: boolean) => update((s) => ({ ...s, isLoading })),
  };
}

export const authStore = createAuthStore();

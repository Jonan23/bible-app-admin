import { writable } from 'svelte/store';

export const sidebarCollapsed = writable(false);

export function toggleSidebar() {
  sidebarCollapsed.update((v) => !v);
}

export const mobileSidebarOpen = writable(false);

export function toggleMobileSidebar() {
  mobileSidebarOpen.update((v) => !v);
}

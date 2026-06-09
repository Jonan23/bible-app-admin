<script lang="ts">
  import { page } from '$app/stores';
  import { sidebarCollapsed, mobileSidebarOpen } from '$lib/stores/sidebar.svelte';
  import { SIDEBAR_ITEMS } from '$lib/utils/constants';
  import { cn } from '$lib/utils/cn';
  import {
    LayoutDashboard, FileText, Video, Calendar, Bell, Users,
    Image, BarChart3, Settings, ChevronLeft, X, BookOpen, Shield,
  } from 'lucide-svelte';

  const icons: Record<string, any> = {
    LayoutDashboard, FileText, Video, Calendar, Bell,
    Users, Image, BarChart3, Settings, BookOpen, Shield,
  };

  let collapsed = $state(false);
  let mobileOpen = $state(false);

  sidebarCollapsed.subscribe(v => collapsed = v);
  mobileSidebarOpen.subscribe(v => mobileOpen = v);

  $effect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  let currentPath = $derived($page.url.pathname);

  function isActive(href: string): boolean {
    return currentPath.startsWith(href);
  }
</script>

<aside
  class={cn(
    'fixed top-0 left-0 z-40 h-screen bg-sidebar border-r border-white/5',
    'transition-all duration-300 ease-in-out flex flex-col',
    collapsed ? 'w-[68px]' : 'w-64',
    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
  )}
>
  <div class="flex items-center h-16 px-4 border-b border-white/5">
    <div class="flex items-center gap-3 min-w-0">
      <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
        <BookOpen class="w-4 h-4 text-white" />
      </div>
      {#if !collapsed}
        <span class="text-sm font-semibold text-white whitespace-nowrap">Bible Teaching</span>
      {/if}
    </div>
  </div>

  <nav class="flex-1 overflow-y-auto py-4 px-2 space-y-1">
    {#each SIDEBAR_ITEMS as item}
      <a
        href={item.href}
        class={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          'hover:bg-sidebar-hover group relative',
          isActive(item.href)
            ? 'bg-sidebar-active text-sidebar-text-active'
            : 'text-sidebar-text',
        )}
      >
        {#if icons[item.icon]}
          <svelte:component this={icons[item.icon]} class="w-5 h-5 flex-shrink-0" />
        {:else}
          <div class="w-5 h-5 flex-shrink-0" />
        {/if}
        {#if !collapsed}
          <span class="truncate">{item.label}</span>
        {:else}
          <div class="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all whitespace-nowrap z-50 shadow-lg">
            {item.label}
          </div>
        {/if}
      </a>
    {/each}
  </nav>

  <div class="p-2 border-t border-white/5">
    <button
      onclick={() => sidebarCollapsed.update(v => !v)}
      class="hidden lg:flex items-center justify-center w-full py-2 rounded-lg text-sidebar-text hover:bg-sidebar-hover transition-colors"
    >
      <ChevronLeft class={cn('w-4 h-4 transition-transform duration-300', collapsed && 'rotate-180')} />
    </button>
  </div>

  {#if mobileOpen}
    <div
      class="fixed inset-0 bg-black/50 lg:hidden -z-10"
      onclick={() => mobileSidebarOpen.set(false)}
    ></div>
  {/if}
</aside>

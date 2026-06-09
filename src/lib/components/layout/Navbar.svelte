<script lang="ts">
  import { goto } from '$app/navigation';
  import { sidebarCollapsed, toggleMobileSidebar } from '$lib/stores/sidebar.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import { authStore } from '$lib/stores/auth.svelte';
  import { cn } from '$lib/utils/cn';
  import { getInitials } from '$lib/utils/format';
  import { Search, Bell, Moon, Sun, Menu, LogOut, User, Settings, ChevronDown } from 'lucide-svelte';

  let searchQuery = $state('');
  let showProfileMenu = $state(false);
  let showNotifications = $state(false);
  let theme = $state('light');

  themeStore.subscribe(v => theme = v);

  let currentUser = $derived($authStore?.user ?? null);
  let unreadCount = $state(3);

  async function handleLogout() {
    await authStore.logout();
    goto('/login');
  }
</script>

<header
  class={cn(
    'fixed top-0 right-0 z-30 h-16 bg-card border-b border-border',
    'transition-all duration-300 ease-in-out',
    'flex items-center justify-between px-4 lg:px-6',
  )}
  style="left: var(--sidebar-width, 16rem)"
>
  <div class="flex items-center gap-3 flex-1">
    <button
      onclick={toggleMobileSidebar}
      class="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
    >
      <Menu class="w-5 h-5 text-muted-foreground" />
    </button>

    <div class="relative flex-1 max-w-md hidden sm:block">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search..."
        bind:value={searchQuery}
        class="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm
               text-foreground placeholder:text-muted-foreground
               focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
               transition-all"
      />
    </div>
  </div>

  <div class="flex items-center gap-2">
    <button
      onclick={() => themeStore.toggle()}
      class="p-2.5 rounded-xl hover:bg-muted transition-colors"
      title="Toggle theme"
    >
      {#if theme === 'dark'}
        <Sun class="w-4 h-4 text-muted-foreground" />
      {:else}
        <Moon class="w-4 h-4 text-muted-foreground" />
      {/if}
    </button>

    <div class="relative">
      <button
        onclick={() => showNotifications = !showNotifications}
        class="relative p-2.5 rounded-xl hover:bg-muted transition-colors"
      >
        <Bell class="w-4 h-4 text-muted-foreground" />
        {#if unreadCount > 0}
          <span class="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold
                      flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        {/if}
      </button>

      {#if showNotifications}
        <div class="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl animate-scale-in overflow-hidden"
             onclick={(e) => e.stopPropagation()}
             role="menu"
        >
          <div class="p-3 border-b border-border">
            <p class="text-sm font-semibold text-foreground">Notifications</p>
          </div>
          <div class="max-h-80 overflow-y-auto">
            <div class="p-3 hover:bg-muted cursor-pointer border-b border-border">
              <p class="text-sm font-medium text-foreground">New Blog Post Published</p>
              <p class="text-xs text-muted-foreground mt-0.5">The article "Understanding God Grace" is live.</p>
              <p class="text-xs text-muted-foreground mt-1">3 hours ago</p>
            </div>
            <div class="p-3 hover:bg-muted cursor-pointer border-b border-border">
              <p class="text-sm font-medium text-foreground">Summer Youth Retreat</p>
              <p class="text-xs text-muted-foreground mt-0.5">Registration is now open!</p>
              <p class="text-xs text-muted-foreground mt-1">2 days ago</p>
            </div>
            <div class="p-3 hover:bg-muted cursor-pointer">
              <p class="text-sm font-medium text-foreground">Bible Reading Challenge</p>
              <p class="text-xs text-muted-foreground mt-0.5">Join our 30-day challenge starting June 1st!</p>
              <p class="text-xs text-muted-foreground mt-1">5 days ago</p>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <div class="relative">
      <button
        onclick={() => showProfileMenu = !showProfileMenu}
        class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted transition-colors"
      >
        {#if currentUser?.profileImage}
          <img
            src={currentUser.profileImage}
            alt={currentUser.name || ''}
            class="w-8 h-8 rounded-full object-cover"
          />
        {:else}
          <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              {getInitials(currentUser?.name || 'Admin')}
            </span>
          </div>
        {/if}
        <ChevronDown class="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
      </button>

      {#if showProfileMenu}
        <div class="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl animate-scale-in overflow-hidden"
             onclick={(e) => e.stopPropagation()}
             role="menu"
        >
          <div class="p-3 border-b border-border">
            <p class="text-sm font-medium text-foreground">{currentUser?.name || 'Admin'}</p>
            <p class="text-xs text-muted-foreground">{currentUser?.email || ''}</p>
          </div>
          <div class="py-1">
            <a href="/settings" class="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
              <Settings class="w-4 h-4" />
              Settings
            </a>
            <button onclick={handleLogout} class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut class="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</header>

{#if showNotifications || showProfileMenu}
  <div class="fixed inset-0 z-40" onclick={() => { showNotifications = false; showProfileMenu = false; }}></div>
{/if}

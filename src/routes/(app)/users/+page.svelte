<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { api } from '$lib/api/real-client';
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import Modal from '$lib/components/shared/Modal.svelte';
  import SearchBar from '$lib/components/shared/SearchBar.svelte';
  import LoadingSkeleton from '$lib/components/shared/LoadingSkeleton.svelte';
  import AnimatedCounter from '$lib/components/dashboard/AnimatedCounter.svelte';
  import { formatRelativeTime, formatDate, formatNumber, getInitials } from '$lib/utils/format';
  import { cn } from '$lib/utils/cn';
  import {
    APP_USER_COLUMNS, APP_USER_STATUSES, APP_USER_STATUS_LABELS,
    APP_USER_STATUS_COLORS, INTERACTION_VERBS, INTERACTION_ICONS,
    INTERACTION_COLORS, DEVICE_LABELS,
  } from '$lib/utils/constants';
  import type { AppUser, Interaction } from '$lib/types';
  import {
    Users, UserCheck, BellRing, UserPlus, X, Loader2, Send,
    ShieldAlert, ShieldCheck, CheckCircle, AlertTriangle,
    BookHeart, BookOpen, FileText, Video, Calendar, Smartphone, Tablet,
  } from 'lucide-svelte';

  const interactionIconMap: Record<string, any> = {
    devotional_read: BookHeart, scripture_read: BookOpen, blog_read: FileText,
    video_watched: Video, event_attended: Calendar,
  };

  let allUsers = $state<AppUser[]>([]);
  let users = $state<AppUser[]>([]);
  let loading = $state(true);
  let search = $state('');
  let statusFilter = $state('');
  let platformFilter = $state('');
  let page = $state(1);
  let totalPages = $state(1);
  let total = $state(0);
  let limit = 10;

  let drawerUser = $state<AppUser | null>(null);
  let showDrawer = $state(false);

  let notifModalOpen = $state(false);
  let notifTitle = $state('');
  let notifMessage = $state('');
  let sendingNotif = $state(false);
  let notifSent = $state(false);

  let confirmAction = $state<{ type: 'suspend' | 'reactivate' | 'delete'; user: AppUser } | null>(null);
  let confirming = $state(false);

  let drawerActivity = $state<Interaction[]>([]);
  let drawerLoading = $state(false);

  onMount(async () => {
    try {
      const res = await api.users.getAppUsers({ page: 1, limit: 100 });
      allUsers = res.data;
    } catch (e) { console.error(e); }
    await loadUsers();
    loading = false;
  });

  async function loadUsers() {
    try {
      const res = await api.users.getAppUsers({
        page, limit, search: search || undefined,
        status: statusFilter || undefined,
        platform: platformFilter || undefined,
      });
      users = res.data;
      totalPages = res.meta.totalPages;
      total = res.meta.total;
    } catch (e) { console.error(e); }
  }

  function handleSearch(val: string) { search = val; page = 1; loadUsers(); }

  function handleFilter() { page = 1; loadUsers(); }

  function handlePage(p: number) { page = p; loadUsers(); }

  const totalUsers = $derived(allUsers.length);
  const activeUsers = $derived(allUsers.filter((u) => u.status === 'active').length);
  const notifEnabled = $derived(allUsers.filter((u) => u.notificationsEnabled).length);
  const newThisMonth = $derived(
    allUsers.filter((u) => {
      const created = new Date(u.createdAt).getTime();
      return Date.now() - created < 30 * 24 * 60 * 60 * 1000;
    }).length,
  );

  async function openDrawer(user: AppUser) {
    drawerUser = null;
    drawerActivity = [];
    showDrawer = true;
    drawerLoading = true;
    try {
      const detail = await api.users.getAppUserDetail(user.id);
      drawerUser = detail;
      drawerActivity = (detail.interactions || []).slice(0, 15);
    } catch (e) { showDrawer = false; }
    finally { drawerLoading = false; }
  }

  async function handleToggleNotif(user: AppUser) {
    const current = user.notificationsEnabled;
    user.notificationsEnabled = !current;
    try {
      await api.users.updateNotificationStatus(user.id, !current);
    } catch { user.notificationsEnabled = current; }
  }

  async function handleSendNotif() {
    if (!notifTitle.trim() || !drawerUser) return;
    sendingNotif = true;
    try {
      await api.users.sendUserNotification(drawerUser.id, { title: notifTitle, message: notifMessage });
      notifSent = true;
      setTimeout(() => { notifModalOpen = false; notifSent = false; notifTitle = ''; notifMessage = ''; }, 1200);
    } catch (e) { console.error(e); }
    finally { sendingNotif = false; }
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;
    confirming = true;
    try {
      const newStatus = confirmAction.type === 'suspend' ? 'suspended' : 'active';
      await api.users.updateAppUserStatus(confirmAction.user.id, newStatus);
      if (drawerUser && drawerUser.id === confirmAction.user.id) {
        drawerUser.status = newStatus;
      }
      await loadUsers();
      confirmAction = null;
    } catch (e) { console.error(e); }
    finally { confirming = false; }
  }

  let columns = APP_USER_COLUMNS;
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Users Management</h1>
      <p class="text-sm text-muted-foreground mt-1">
        {formatNumber(totalUsers)} Total Users
      </p>
    </div>
  </div>

  {#if loading && users.length === 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each Array(4) as _}
        <div class="rounded-xl border border-border bg-card p-5"><LoadingSkeleton count={3} class="h-4 mb-2" /></div>
      {/each}
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm text-muted-foreground">Total Users</p>
          <div class="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
            <Users class="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <p class="text-2xl font-bold text-foreground"><AnimatedCounter value={totalUsers} duration={600} /></p>
      </div>
      <div class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm text-muted-foreground">Active Users</p>
          <div class="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <UserCheck class="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <p class="text-2xl font-bold text-foreground"><AnimatedCounter value={activeUsers} duration={600} /></p>
      </div>
      <div class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm text-muted-foreground">Notifications Enabled</p>
          <div class="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <BellRing class="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <p class="text-2xl font-bold text-foreground"><AnimatedCounter value={notifEnabled} duration={600} /></p>
      </div>
      <div class="rounded-xl border border-border bg-card p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm text-muted-foreground">New This Month</p>
          <div class="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
            <UserPlus class="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <p class="text-2xl font-bold text-foreground"><AnimatedCounter value={newThisMonth} duration={600} /></p>
      </div>
    </div>
  {/if}

  <div class="flex items-center gap-3 flex-wrap">
    <div class="flex-1 min-w-[200px] max-w-sm"><SearchBar value={search} onchange={handleSearch} placeholder="Search users..." /></div>
    <select bind:value={statusFilter} onchange={handleFilter}
      class="h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
      <option value="">All Status</option>
      {#each APP_USER_STATUSES as s}
        <option value={s}>{APP_USER_STATUS_LABELS[s]}</option>
      {/each}
    </select>
    <select bind:value={platformFilter} onchange={handleFilter}
      class="h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
      <option value="">All Platforms</option>
      {#each Object.entries(DEVICE_LABELS) as [val, label]}
        <option value={val}>{label}</option>
      {/each}
    </select>
  </div>

  <DataTable
    tableData={users}
    {columns}
    {page}
    {totalPages}
    {total}
    {limit}
    {loading}
    onpage={handlePage}
    onrowclick={openDrawer}
    emptyTitle="No users found"
    emptyDescription="Try adjusting your search or filter"
  >
    {#snippet children(item)}
      <button onclick={() => openDrawer(item)} class="p-1.5 rounded-lg hover:bg-muted transition-colors">
        <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
      </button>
    {/snippet}
  </DataTable>
</div>

{#if showDrawer}
  <div class="fixed inset-0 z-50 flex" transition:fade={{ duration: 150 }}>
    <div class="fixed inset-0 bg-black/50" onclick={() => showDrawer = false}></div>
    <div class="relative ml-auto w-full max-w-md bg-card border-l border-border shadow-2xl overflow-y-auto">
      <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-card border-b border-border">
        <h2 class="text-lg font-semibold text-foreground">User Details</h2>
        <button onclick={() => showDrawer = false} class="p-1.5 rounded-lg hover:bg-muted transition-colors"><X class="w-4 h-4 text-muted-foreground" /></button>
      </div>

      {#if drawerUser}
        {@const u = drawerUser}
        <div class="p-6 space-y-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-lg font-semibold text-indigo-700 dark:text-indigo-300 flex-shrink-0">
              {getInitials(u.name)}
            </div>
            <div class="min-w-0">
              <h3 class="text-base font-semibold text-foreground">{u.name}</h3>
              <p class="text-sm text-muted-foreground">{u.email}</p>
              <div class="flex items-center gap-2 mt-1">
                {#if u.phone}
                  <span class="text-xs text-muted-foreground">{u.phone}</span>
                  <span class="text-muted-foreground">•</span>
                {/if}
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {APP_USER_STATUS_COLORS[(u.status || '').toUpperCase()]}">{APP_USER_STATUS_LABELS[(u.status || '').toUpperCase()]}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-lg bg-muted/50 p-3">
              <p class="text-xs text-muted-foreground">Device</p>
              <p class="text-sm font-medium text-foreground mt-0.5 capitalize">{DEVICE_LABELS[u.platform]}</p>
            </div>
            <div class="rounded-lg bg-muted/50 p-3">
              <p class="text-xs text-muted-foreground">Joined</p>
              <p class="text-sm font-medium text-foreground mt-0.5">{formatDate(u.createdAt)}</p>
            </div>
            <div class="rounded-lg bg-muted/50 p-3">
              <p class="text-xs text-muted-foreground">Last Active</p>
              <p class="text-sm font-medium text-foreground mt-0.5">{formatRelativeTime(u.lastActive)}</p>
            </div>
            <div class="rounded-lg bg-muted/50 p-3">
              <p class="text-xs text-muted-foreground">Total Interactions</p>
              <p class="text-sm font-medium text-foreground mt-0.5">{formatNumber(u.interactionCount ?? 0)}</p>
            </div>
          </div>

          <div class="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/30">
            <div class="flex items-center gap-2">
              <BellRing class="w-4 h-4 text-muted-foreground" />
              <span class="text-sm text-foreground">Notifications</span>
            </div>
            <button
              onclick={() => handleToggleNotif(u)}
              class={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                u.notificationsEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600',
              )}
            >
              <span class={cn(
                'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                u.notificationsEnabled ? 'translate-x-6' : 'translate-x-1',
              )}></span>
            </button>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-foreground mb-3">Recent Activity</h4>
            {#if drawerLoading}
              <div class="space-y-2">
                {#each Array(5) as _}
                  <div class="flex items-center gap-3 py-2.5 px-3">
                    <div class="w-7 h-7 rounded-lg bg-muted animate-pulse flex-shrink-0"></div>
                    <div class="flex-1"><div class="h-3 bg-muted rounded animate-pulse w-3/4 mb-1"></div><div class="h-2 bg-muted rounded animate-pulse w-1/2"></div></div>
                  </div>
                {/each}
              </div>
            {:else if drawerActivity.length > 0}
              <div class="space-y-1">
                {#each drawerActivity as ix}
                  {@const Icon = interactionIconMap[ix.type] || interactionIconMap['view']}
                  <div class="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div class={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', INTERACTION_COLORS[ix.type] || INTERACTION_COLORS['view'])}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-medium text-foreground capitalize">{INTERACTION_VERBS[ix.type] || ix.type} {ix.targetType}</p>
                      <p class="text-[10px] text-muted-foreground mt-0.5">{formatRelativeTime(ix.createdAt)}</p>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center py-6">
                <p class="text-xs text-muted-foreground">No activity recorded</p>
              </div>
            {/if}
          </div>

          <div class="flex flex-col gap-2 pt-2 border-t border-border">
            <button onclick={() => { notifModalOpen = true; notifTitle = ''; notifMessage = ''; notifSent = false; }}
              class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
              <Send class="w-4 h-4" /> Send Notification
            </button>
            {#if u.status === 'active'}
              <button onclick={() => confirmAction = { type: 'suspend', user: u }}
                class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
                <ShieldAlert class="w-4 h-4" /> Suspend User
              </button>
            {:else if u.status === 'suspended'}
              <button onclick={() => confirmAction = { type: 'reactivate', user: u }}
                class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors">
                <ShieldCheck class="w-4 h-4" /> Reactivate User
              </button>
            {/if}
          </div>
        </div>
      {:else if drawerLoading}
        <div class="p-6 space-y-4">
          {#each Array(8) as _}
            <LoadingSkeleton count={1} class="h-4" />
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<Modal open={notifModalOpen} title="Send Notification" size="sm" onclose={() => { notifModalOpen = false; notifSent = false; }}>
  {#if notifSent}
    <div class="p-6 text-center">
      <CheckCircle class="w-12 h-12 text-emerald-500 mx-auto mb-3" />
      <p class="text-sm font-semibold text-foreground">Notification Sent</p>
      <p class="text-xs text-muted-foreground mt-1">Message delivered successfully</p>
    </div>
  {:else}
    <div class="p-6 space-y-4">
      <div>
        <label for="notif-title" class="block text-sm font-medium text-foreground mb-1.5">Title</label>
        <input id="notif-title" type="text" bind:value={notifTitle} placeholder="e.g. New Sermon Uploaded"
          class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div>
        <label for="notif-message" class="block text-sm font-medium text-foreground mb-1.5">Message</label>
        <textarea id="notif-message" bind:value={notifMessage} placeholder="Write your message..." rows="4"
          class="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"></textarea>
      </div>
      <button onclick={handleSendNotif} disabled={!notifTitle.trim() || sendingNotif}
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors">
        {#if sendingNotif}
          <Loader2 class="w-4 h-4 animate-spin" /> Sending...
        {:else}
          <Send class="w-4 h-4" /> Send Notification
        {/if}
      </button>
    </div>
  {/if}
</Modal>

{#if confirmAction}
  <div class="fixed inset-0 z-[60] flex items-center justify-center p-4" transition:fade={{ duration: 150 }}>
    <div class="fixed inset-0 bg-black/50" onclick={() => confirmAction = null}></div>
    <div class="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
      <div class="p-6 text-center">
        <div class="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle class="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 class="text-lg font-semibold text-foreground mb-2">
          {confirmAction.type === 'suspend' ? 'Suspend User' : 'Reactivate User'}
        </h3>
        <p class="text-sm text-muted-foreground mb-6">
          {confirmAction.type === 'suspend'
            ? `Are you sure you want to suspend ${confirmAction.user.name}? They will lose access to the app.`
            : `Are you sure you want to reactivate ${confirmAction.user.name}? They will regain full access.`}
        </p>
        <div class="flex gap-3">
          <button onclick={() => confirmAction = null} disabled={confirming}
            class="flex-1 px-4 py-2.5 rounded-xl border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
          <button onclick={handleConfirmAction} disabled={confirming}
            class={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors',
              confirmAction.type === 'suspend' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700',
            )}>
            {#if confirming}
              <Loader2 class="w-4 h-4 animate-spin" /> {confirmAction.type === 'suspend' ? 'Suspending...' : 'Reactivating...'}
            {:else}
              {confirmAction.type === 'suspend' ? 'Suspend' : 'Reactivate'}
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

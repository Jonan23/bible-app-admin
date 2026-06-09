<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { api } from '$lib/api/real-client';
  import LoadingSkeleton from '$lib/components/shared/LoadingSkeleton.svelte';
  import StatusBadge from '$lib/components/shared/StatusBadge.svelte';
  import { ROLE_LABELS, ROLE_COLORS, USER_STATUS_LABELS, USER_STATUS_COLORS } from '$lib/utils/constants';
  import { formatDate, formatRelativeTime } from '$lib/utils/format';
  import type { User, Role, ActivityLog } from '$lib/types';
  import { ArrowLeft, Save, Loader2, ShieldAlert, ShieldCheck, Trash2, History } from 'lucide-svelte';

  let userId = $state('');
  let user = $state<User | null>(null);
  let roles = $state<Role[]>([]);
  let activity = $state<ActivityLog[]>([]);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');

  let name = $state('');
  let email = $state('');
  let phone = $state('');
  let roleId = $state('');

  onMount(async () => {
    userId = $page.params.id || '';
    try {
      const [userData, rolesData] = await Promise.all([
        api.users.getById(userId),
        api.users.getRoles(),
      ]);
      user = userData;
      roles = rolesData;
      name = user.name || '';
      email = user.email;
      phone = user.phone || '';
      roleId = user.roleId;
      loadActivity();
    } catch (e) {
      console.error(e);
      error = 'Failed to load user';
    } finally {
      loading = false;
    }
  });

  async function loadActivity() {
    try {
      activity = await api.users.getActivity(userId);
    } catch (e) { console.error(e); }
  }

  async function handleSave() {
    error = '';
    if (!email) { error = 'Email is required'; return; }
    saving = true;
    try {
      await api.users.update(userId, {
        name: name || undefined,
        email,
        phone: phone || undefined,
        roleId,
      });
      user = await api.users.getById(userId);
    } catch (e: any) {
      error = e.message || 'Failed to update';
    } finally {
      saving = false;
    }
  }

  async function handleSuspend() {
    try {
      await api.users.suspend(userId);
      user = await api.users.getById(userId);
    } catch (e: any) {
      error = e.message || 'Failed to suspend/reactivate';
    }
  }

  async function handleDelete() {
    if (confirm('Are you sure you want to permanently delete this admin user?')) {
      try {
        await api.users.delete(userId);
        goto('/admin-users');
      } catch (e: any) {
        error = e.message || 'Failed to delete';
      }
    }
  }
</script>

<div class="max-w-3xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <button onclick={() => goto('/admin-users')} class="p-2 rounded-lg hover:bg-muted transition-colors">
        <ArrowLeft class="w-4 h-4 text-muted-foreground" />
      </button>
      <div>
        <h1 class="text-xl font-bold text-foreground">{loading ? 'Loading...' : user?.name || 'Edit User'}</h1>
        <p class="text-sm text-muted-foreground">{user?.email || ''}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button
        onclick={handleSuspend}
        disabled={saving}
        class="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-input text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
      >
        {#if user?.status === 'SUSPENDED'}
          <ShieldCheck class="w-4 h-4 text-emerald-500" /> Reactivate
        {:else}
          <ShieldAlert class="w-4 h-4 text-amber-500" /> Suspend
        {/if}
      </button>
      <button
        onclick={handleDelete}
        disabled={saving}
        class="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
      >
        <Trash2 class="w-4 h-4" /> Delete
      </button>
    </div>
  </div>

  {#if error}
    <div class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
      {error}
    </div>
  {/if}

  {#if loading}
    <LoadingSkeleton count={6} />
  {:else if user}
    <div class="rounded-xl border border-border p-6 space-y-4">
      <div class="flex items-center gap-4 pb-4 border-b border-border">
        <div class="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-lg font-bold text-indigo-700 dark:text-indigo-300 flex-shrink-0">
          {(user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">{user.name || 'Unnamed'}</h2>
          <div class="flex items-center gap-2 mt-1">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {ROLE_COLORS[user.role?.name as keyof typeof ROLE_COLORS] || 'bg-zinc-100 text-zinc-700'}">{ROLE_LABELS[user.role?.name as keyof typeof ROLE_LABELS] || user.role?.name}</span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {USER_STATUS_COLORS[user.status]}">{USER_STATUS_LABELS[user.status]}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
          <input type="text" bind:value={name} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <input type="email" bind:value={email} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Phone</label>
          <input type="tel" bind:value={phone} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Role</label>
          <select bind:value={roleId} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {#each roles as role}
              <option value={role.id}>{ROLE_LABELS[role.name as keyof typeof ROLE_LABELS] || role.name}</option>
            {/each}
          </select>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4 pt-2">
        <div class="p-3 rounded-lg bg-muted/50">
          <p class="text-xs text-muted-foreground">Created</p>
          <p class="text-sm font-medium text-foreground mt-0.5">{formatDate(user.createdAt)}</p>
        </div>
        <div class="p-3 rounded-lg bg-muted/50">
          <p class="text-xs text-muted-foreground">Last Login</p>
          <p class="text-sm font-medium text-foreground mt-0.5">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</p>
        </div>
        <div class="p-3 rounded-lg bg-muted/50">
          <p class="text-xs text-muted-foreground">Email Verified</p>
          <p class="text-sm font-medium text-foreground mt-0.5">{user.emailVerifiedAt ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <button
        onclick={() => goto('/admin-users')}
        class="px-4 h-10 rounded-xl border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        Cancel
      </button>
      <button
        onclick={handleSave}
        disabled={saving}
        class="inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {#if saving}<Loader2 class="w-4 h-4 animate-spin" />{/if}
        <Save class="w-4 h-4" /> Save Changes
      </button>
    </div>

    <div class="rounded-xl border border-border p-6">
      <div class="flex items-center gap-2 mb-4">
        <History class="w-4 h-4 text-muted-foreground" />
        <h3 class="text-base font-semibold text-foreground">Activity Log</h3>
      </div>
      {#if activity.length === 0}
        <p class="text-sm text-muted-foreground">No activity recorded yet.</p>
      {:else}
        <div class="space-y-2">
          {#each activity as log}
            <div class="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
              <div>
                <p class="text-sm font-medium text-foreground">{log.action}</p>
                {#if log.entity}
                  <p class="text-xs text-muted-foreground">{log.entity}{log.entityId ? ` (${log.entityId})` : ''}</p>
                {/if}
              </div>
              <span class="text-xs text-muted-foreground">{formatRelativeTime(log.createdAt)}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

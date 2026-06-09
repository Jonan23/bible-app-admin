<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api/real-client';
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import SearchBar from '$lib/components/shared/SearchBar.svelte';
  import { ADMIN_USER_COLUMNS, ROLES, USER_STATUSES, USER_STATUS_LABELS, ROLE_LABELS } from '$lib/utils/constants';
  import type { User, Role } from '$lib/types';
  import { Plus, Edit, Trash2, ShieldAlert, ShieldCheck } from 'lucide-svelte';

  let users = $state<User[]>([]);
  let loading = $state(true);
  let search = $state('');
  let roleFilter = $state('');
  let statusFilter = $state('');
  let page = $state(1);
  let totalPages = $state(1);
  let total = $state(0);
  let selected = $state<string[]>([]);
  let sortBy = $state('createdAt');
  let sortOrder = $state<'asc' | 'desc'>('desc');

  onMount(async () => {
    await loadUsers();
  });

  async function loadUsers() {
    loading = true;
    try {
      const res = await api.users.list({
        page, limit: 10,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      users = res.data;
      totalPages = res.meta.totalPages;
      total = res.meta.total;
    } catch (e) { console.error(e); }
    finally { loading = false; }
  }

  function handleSearch(val: string) {
    search = val;
    page = 1;
    loadUsers();
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this admin user?')) {
      api.users.delete(id).then(() => loadUsers());
    }
  }

  function handleSuspend(id: string) {
    api.users.suspend(id).then(() => loadUsers());
  }

  function handleBulkDelete() {
    if (selected.length === 0) return;
    if (confirm(`Delete ${selected.length} admin users?`)) {
      Promise.all(selected.map((id) => api.users.delete(id))).then(() => {
        selected = [];
        loadUsers();
      });
    }
  }

  let columns = ADMIN_USER_COLUMNS;
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Admin Users</h1>
      <p class="text-sm text-muted-foreground mt-1">Manage admin dashboard users and their roles</p>
    </div>
    <button
      onclick={() => goto('/admin-users/new')}
      class="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
    >
      <Plus class="w-4 h-4" />
      New Admin User
    </button>
  </div>

  <div class="flex items-center gap-3">
    <div class="flex-1 max-w-sm">
      <SearchBar value={search} onchange={handleSearch} placeholder="Search admin users..." />
    </div>
    <select
      bind:value={roleFilter}
      onchange={() => { page = 1; loadUsers(); }}
      class="h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">All Roles</option>
      {#each ROLES as role}
        <option value={role}>{ROLE_LABELS[role]}</option>
      {/each}
    </select>
    <select
      bind:value={statusFilter}
      onchange={() => { page = 1; loadUsers(); }}
      class="h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">All Statuses</option>
      {#each USER_STATUSES as status}
        <option value={status}>{USER_STATUS_LABELS[status]}</option>
      {/each}
    </select>
    {#if selected.length > 0}
      <button
        onclick={handleBulkDelete}
        class="inline-flex items-center gap-1.5 px-3 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
      >
        <Trash2 class="w-4 h-4" />
        Delete ({selected.length})
      </button>
    {/if}
  </div>

  <DataTable
    tableData={users}
    {columns}
    {page}
    {totalPages}
    {total}
    {loading}
    {sortBy}
    {sortOrder}
    selectable
    selected={selected}
    onselect={(ids) => selected = ids}
    onsort={(key) => { sortBy = key; sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; loadUsers(); }}
    onpage={(p) => { page = p; loadUsers(); }}
    onrowclick={(u) => goto(`/admin-users/${u.id}`)}
    emptyTitle="No admin users found"
    emptyDescription="Create your first admin user to get started"
  >
    {#snippet children(item: User)}
      <div class="flex items-center gap-1">
        <button onclick={() => goto(`/admin-users/${item.id}`)} class="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <Edit class="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onclick={() => handleSuspend(item.id)} class="p-1.5 rounded-lg hover:bg-muted transition-colors" title={item.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}>
          {#if item.status === 'SUSPENDED'}
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
          {:else}
            <ShieldAlert class="w-3.5 h-3.5 text-amber-500" />
          {/if}
        </button>
        <button onclick={() => handleDelete(item.id)} class="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <Trash2 class="w-3.5 h-3.5 text-red-500" />
        </button>
      </div>
    {/snippet}
  </DataTable>
</div>

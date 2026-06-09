<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api/real-client';
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import SearchBar from '$lib/components/shared/SearchBar.svelte';
  import { DAILY_CONTENT_COLUMNS } from '$lib/utils/constants';
  import type { DailyContent } from '$lib/types';
  import { Plus, Edit, Trash2 } from 'lucide-svelte';

  let items = $state<DailyContent[]>([]);
  let loading = $state(true);
  let search = $state('');
  let typeFilter = $state('');
  let activeFilter = $state('');
  let page = $state(1);
  let totalPages = $state(1);
  let total = $state(0);
  let selected = $state<string[]>([]);
  let sortBy = $state('date');
  let sortOrder = $state<'asc' | 'desc'>('asc');

  onMount(async () => {
    await loadItems();
  });

  async function loadItems() {
    loading = true;
    try {
      const params: any = { page, limit: 10 };
      if (typeFilter) params.type = typeFilter;
      if (activeFilter === 'true') params.isActive = true;
      else if (activeFilter === 'false') params.isActive = false;
      const res = await api.dailyContent.list(params);
      items = res.data;
      totalPages = res.meta.totalPages;
      total = res.meta.total;
    } catch (e) { console.error(e); }
    finally { loading = false; }
  }

  function handleSearch(val: string) { search = val; page = 1; loadItems(); }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      api.dailyContent.delete(id).then(() => loadItems());
    }
  }

  function handleBulkDelete() {
    if (selected.length === 0) return;
    if (confirm(`Delete ${selected.length} items?`)) {
      Promise.all(selected.map((id) => api.dailyContent.delete(id))).then(() => {
        selected = [];
        loadItems();
      });
    }
  }

  let columns = DAILY_CONTENT_COLUMNS;
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Daily Content</h1>
      <p class="text-sm text-muted-foreground mt-1">Manage daily Bible verses and inspirational quotes</p>
    </div>
    <button
      onclick={() => goto('/daily-content/new')}
      class="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
    >
      <Plus class="w-4 h-4" />
      New Content
    </button>
  </div>

  <div class="flex items-center gap-3">
    <div class="flex-1 max-w-sm">
      <SearchBar value={search} onchange={handleSearch} placeholder="Search content..." />
    </div>
    <select
      bind:value={typeFilter}
      onchange={() => { page = 1; loadItems(); }}
      class="h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">All Types</option>
      <option value="verse">Verses</option>
      <option value="quote">Quotes</option>
    </select>
    <select
      bind:value={activeFilter}
      onchange={() => { page = 1; loadItems(); }}
      class="h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">All Status</option>
      <option value="true">Active</option>
      <option value="false">Inactive</option>
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
    tableData={items}
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
    onsort={(key) => { sortBy = key; sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; loadItems(); }}
    onpage={(p) => { page = p; loadItems(); }}
    onrowclick={(c) => goto(`/daily-content/${c.id}`)}
    emptyTitle="No daily content found"
    emptyDescription="Add your first Bible verse or quote to get started"
  >
    {#snippet children(item: DailyContent)}
      <div class="flex items-center gap-1">
        <button onclick={() => goto(`/daily-content/${item.id}`)} class="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <Edit class="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onclick={() => handleDelete(item.id)} class="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <Trash2 class="w-3.5 h-3.5 text-red-500" />
        </button>
      </div>
    {/snippet}
  </DataTable>
</div>

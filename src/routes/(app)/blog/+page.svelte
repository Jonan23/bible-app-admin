<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api/real-client';
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import StatusBadge from '$lib/components/shared/StatusBadge.svelte';
  import SearchBar from '$lib/components/shared/SearchBar.svelte';
  import { BLOG_COLUMNS, POST_STATUSES, POST_STATUS_LABELS } from '$lib/utils/constants';
  import type { BlogPost } from '$lib/types';
  import { Plus, Edit, Trash2 } from 'lucide-svelte';

  let posts = $state<BlogPost[]>([]);
  let loading = $state(true);
  let search = $state('');
  let statusFilter = $state('');
  let page = $state(1);
  let totalPages = $state(1);
  let total = $state(0);
  let selected = $state<string[]>([]);
  let sortBy = $state('createdAt');
  let sortOrder = $state<'asc' | 'desc'>('desc');

  onMount(async () => {
    await loadPosts();
  });

  async function loadPosts() {
    loading = true;
    try {
      const res = await api.blog.list({ page, limit: 10, search, status: statusFilter || undefined });
      posts = res.data;
      totalPages = res.meta.totalPages;
      total = res.meta.total;
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  function handleSearch(val: string) {
    search = val;
    page = 1;
    loadPosts();
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this post?')) {
      api.blog.delete(id).then(() => loadPosts());
    }
  }

  function handleBulkDelete() {
    if (selected.length === 0) return;
    if (confirm(`Delete ${selected.length} posts?`)) {
      Promise.all(selected.map((id) => api.blog.delete(id))).then(() => {
        selected = [];
        loadPosts();
      });
    }
  }

  let columns = BLOG_COLUMNS;
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Blog Posts</h1>
      <p class="text-sm text-muted-foreground mt-1">Manage your blog content</p>
    </div>
    <button
      onclick={() => goto('/blog/new')}
      class="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium
             hover:bg-indigo-700 transition-colors"
    >
      <Plus class="w-4 h-4" />
      New Post
    </button>
  </div>

  <div class="flex items-center gap-3">
    <div class="flex-1 max-w-sm">
      <SearchBar value={search} onchange={handleSearch} placeholder="Search posts..." />
    </div>
    <select
      bind:value={statusFilter}
      onchange={() => { page = 1; loadPosts(); }}
      class="h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground
             focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">All Statuses</option>
      {#each POST_STATUSES as s}
        <option value={s}>{POST_STATUS_LABELS[s]}</option>
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
    tableData={posts}
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
    onsort={(key) => { sortBy = key; sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; loadPosts(); }}
    onpage={(p) => { page = p; loadPosts(); }}
    onrowclick={(p) => goto(`/blog/${p.id}`)}
    emptyTitle="No blog posts found"
    emptyDescription="Create your first blog post to get started"
  >
    {#snippet children(item: BlogPost)}
      <div class="flex items-center gap-1">
        <button onclick={() => goto(`/blog/${item.id}`)} class="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <Edit class="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <button onclick={() => handleDelete(item.id)} class="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <Trash2 class="w-3.5 h-3.5 text-red-500" />
        </button>
      </div>
    {/snippet}
  </DataTable>
</div>

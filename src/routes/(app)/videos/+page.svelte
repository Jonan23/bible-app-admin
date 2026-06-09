<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api/real-client';
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import SearchBar from '$lib/components/shared/SearchBar.svelte';
  import { VIDEO_COLUMNS } from '$lib/utils/constants';
  import type { Video } from '$lib/types';
  import { Plus, Edit, Trash2 } from 'lucide-svelte';

  let videos = $state<Video[]>([]);
  let loading = $state(true);
  let search = $state('');
  let page = $state(1);
  let totalPages = $state(1);
  let total = $state(0);
  let selected = $state<string[]>([]);
  let featuredFilter = $state('');

  onMount(async () => { await loadVideos(); });

  async function loadVideos() {
    loading = true;
    try {
      const res = await api.videos.list({
        page, limit: 10, search,
        featured: featuredFilter ? featuredFilter === 'true' : undefined,
      });
      videos = res.data;
      totalPages = res.meta.totalPages;
      total = res.meta.total;
    } catch (e) { console.error(e); }
    finally { loading = false; }
  }

  function handleSearch(val: string) { search = val; page = 1; loadVideos(); }
  function handleDelete(id: string) { if (confirm('Delete this video?')) api.videos.delete(id).then(() => loadVideos()); }

  let columns = VIDEO_COLUMNS;
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Videos</h1>
      <p class="text-sm text-muted-foreground mt-1">Manage sermon videos and content</p>
    </div>
    <button onclick={() => goto('/videos/new')}
      class="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
      <Plus class="w-4 h-4" /> Add Video
    </button>
  </div>

  <div class="flex items-center gap-3">
    <div class="flex-1 max-w-sm"><SearchBar value={search} onchange={handleSearch} placeholder="Search videos..." /></div>
    <select bind:value={featuredFilter} onchange={() => { page = 1; loadVideos(); }}
      class="h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
      <option value="">All Videos</option>
      <option value="true">Featured</option>
      <option value="false">Not Featured</option>
    </select>
  </div>

  <DataTable tableData={videos} {columns} {page} {totalPages} {total} {loading} selectable selected={selected} onselect={(ids) => selected = ids}
    onsort={(k) => {}}
    onpage={(p) => { page = p; loadVideos(); }}
    onrowclick={(v) => goto(`/videos/${v.id}`)}
    emptyTitle="No videos found" emptyDescription="Upload your first sermon video"
  >
    {#snippet children(item: Video)}
      <div class="flex items-center gap-1">
        <button onclick={() => goto(`/videos/${item.id}`)} class="p-1.5 rounded-lg hover:bg-muted"><Edit class="w-3.5 h-3.5 text-muted-foreground" /></button>
        <button onclick={() => handleDelete(item.id)} class="p-1.5 rounded-lg hover:bg-muted"><Trash2 class="w-3.5 h-3.5 text-red-500" /></button>
      </div>
    {/snippet}
  </DataTable>
</div>

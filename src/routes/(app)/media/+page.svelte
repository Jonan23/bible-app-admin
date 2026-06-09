<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api/real-client';
  import { cn } from '$lib/utils/cn';
  import { formatBytes, formatDate, formatRelativeTime } from '$lib/utils/format';
  import { MEDIA_TYPES, MEDIA_TYPE_LABELS, MEDIA_TYPE_COLORS } from '$lib/utils/constants';
  import type { Media } from '$lib/types';
  import { Upload, Search, Trash2, Image, FileText, Music, Video, ExternalLink, HardDrive } from 'lucide-svelte';

  const mediaIconMap: Record<string, any> = { IMAGE: Image, DOCUMENT: FileText, AUDIO: Music, VIDEO: Video };

  let mediaItems = $state<Media[]>([]);
  let loading = $state(true);
  let search = $state('');
  let typeFilter = $state('');
  let page = $state(1);
  let totalPages = $state(1);
  let total = $state(0);
  let storageStats = $state<any>(null);

  let previewMedia = $state<Media | null>(null);
  let showPreview = $state(false);
  let isDragging = $state(false);

  onMount(async () => { await loadMedia(); });

  async function loadMedia() {
    loading = true;
    try {
      const [res, stats] = await Promise.all([
        api.media.list({ page, limit: 20, type: typeFilter || undefined, search: search || undefined }),
        api.media.getStats(),
      ]);
      mediaItems = res.data;
      totalPages = res.meta.totalPages;
      total = res.meta.total;
      storageStats = stats;
    } catch (e) { console.error(e); }
    finally { loading = false; }
  }

  async function handleUpload(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) continue;
      await api.media.upload(file);
    }
    loadMedia();
  }

  function handleDelete(id: string) {
    if (confirm('Delete this file?')) api.media.delete(id).then(() => loadMedia());
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Media Library</h1>
      <p class="text-sm text-muted-foreground mt-1">Upload and manage your media files</p>
    </div>
  </div>

  {#if storageStats}
    <div class="rounded-xl border border-border p-5">
      <div class="flex items-center gap-3 mb-3">
        <HardDrive class="w-4 h-4 text-muted-foreground" />
        <span class="text-sm font-medium text-foreground">Storage</span>
      </div>
      <div class="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div class="h-full rounded-full bg-indigo-500 transition-all" style="width: {(storageStats.used / storageStats.total) * 100}%"></div>
      </div>
      <p class="text-xs text-muted-foreground mt-2">
        {formatBytes(storageStats.used)} of {formatBytes(storageStats.total)} used ({(storageStats.used / storageStats.total * 100).toFixed(1)}%)
      </p>
    </div>
  {/if}

  <div class="flex items-center gap-3">
    <div class="flex-1 max-w-sm relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input type="text" placeholder="Search files..." bind:value={search}
        oninput={() => { page = 1; loadMedia(); }}
        class="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
    <select bind:value={typeFilter} onchange={() => { page = 1; loadMedia(); }}
      class="h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
      <option value="">All Types</option>
      {#each MEDIA_TYPES as mt}
        <option value={mt}>{MEDIA_TYPE_LABELS[mt]}</option>
      {/each}
    </select>
  </div>

  <div
    class={cn('relative rounded-xl border-2 border-dashed p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer', isDragging ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-input')}
    ondragover={(e) => { e.preventDefault(); isDragging = true; }}
    ondragleave={() => isDragging = false}
    ondrop={(e) => { e.preventDefault(); isDragging = false; handleUpload((e.dataTransfer?.files) ?? null); }}
    onclick={() => document.getElementById('file-upload')?.click()}
  >
    <Upload class="w-8 h-8 text-muted-foreground mx-auto mb-2" />
    <p class="text-sm text-muted-foreground">Drop files here or click to upload</p>
    <p class="text-xs text-muted-foreground mt-1">Max file size: 10MB</p>
    <input id="file-upload" type="file" multiple class="hidden" onchange={(e) => handleUpload((e.target as HTMLInputElement).files)} accept="image/*,video/*,audio/*,.pdf" />
  </div>

  {#if totalPages > 1}
  <div class="flex items-center justify-between">
    <p class="text-xs text-muted-foreground">Showing {total} files</p>
  </div>
  {/if}

  {#if loading}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {#each Array(10) as _}
        <div class="rounded-xl border border-border overflow-hidden animate-pulse">
          <div class="aspect-square bg-muted"></div>
          <div class="p-3"><div class="h-3 bg-muted rounded w-3/4"></div></div>
        </div>
      {/each}
    </div>
  {:else if mediaItems.length === 0}
    <div class="text-center py-16">
      <Image class="w-12 h-12 text-muted-foreground mx-auto mb-3" />
      <p class="text-sm font-medium text-foreground">No media files</p>
      <p class="text-xs text-muted-foreground">Upload your first file to get started</p>
    </div>
  {:else}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {#each mediaItems as item}
        <div class="rounded-xl border border-border overflow-hidden group hover:shadow-md transition-all cursor-pointer"
          onclick={() => { previewMedia = item; showPreview = true; }}>
          <div class="aspect-square bg-muted relative overflow-hidden">
            {#if item.thumbnailUrl}
              <img src={item.thumbnailUrl} alt={item.originalName} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            {:else}
              <div class="w-full h-full flex items-center justify-center">
                <svelte:component this={mediaIconMap[item.type] || FileText} class="w-8 h-8 text-muted-foreground" />
              </div>
            {/if}
            <div class="absolute top-2 left-2">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/50 text-white {MEDIA_TYPE_COLORS[item.type]}">{item.type}</span>
            </div>
            <button onclick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
              class="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80">
              <Trash2 class="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <div class="p-3">
            <p class="text-xs font-medium text-foreground truncate">{item.originalName}</p>
            <p class="text-[10px] text-muted-foreground mt-0.5">{formatBytes(item.size)}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showPreview && previewMedia}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4" onclick={() => showPreview = false}>
    <div class="fixed inset-0 bg-black/70"></div>
    <div class="relative max-w-3xl w-full bg-card rounded-2xl shadow-2xl overflow-hidden animate-scale-in" onclick={(e) => e.stopPropagation()}>
      {#if previewMedia.type === 'IMAGE' && previewMedia.url}
        <img src={previewMedia.url} alt={previewMedia.originalName} class="w-full max-h-[70vh] object-contain bg-black/5" />
      {:else}
        <div class="h-64 flex items-center justify-center bg-muted">
          <svelte:component this={mediaIconMap[previewMedia.type] || FileText} class="w-16 h-16 text-muted-foreground" />
        </div>
      {/if}
      <div class="p-6">
        <h3 class="text-base font-semibold text-foreground">{previewMedia.originalName}</h3>
        <div class="grid grid-cols-2 gap-4 mt-3 text-sm">
          <div><span class="text-xs text-muted-foreground">Type</span><p class="font-medium text-foreground">{previewMedia.mimeType}</p></div>
          <div><span class="text-xs text-muted-foreground">Size</span><p class="font-medium text-foreground">{formatBytes(previewMedia.size)}</p></div>
          <div><span class="text-xs text-muted-foreground">Uploaded by</span><p class="font-medium text-foreground">{previewMedia.uploadedBy.name || 'Unknown'}</p></div>
          <div><span class="text-xs text-muted-foreground">Date</span><p class="font-medium text-foreground">{formatDate(previewMedia.createdAt)}</p></div>
        </div>
      </div>
    </div>
  </div>
{/if}

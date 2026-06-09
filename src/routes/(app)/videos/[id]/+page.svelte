<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { api } from '$lib/api/real-client';
  import UploadButton from '$lib/components/shared/UploadButton.svelte';
  import type { Video, Category, Speaker } from '$lib/types';
  import { ArrowLeft, Save, Loader2, ExternalLink } from 'lucide-svelte';

  let videoId = $derived($page.params.id!);

  let title = $state('');
  let description = $state('');
  let youtubeUrl = $state('');
  let thumbnail = $state('');
  let speakerId = $state('');
  let duration = $state(0);
  let categoryId = $state('');
  let featured = $state(false);

  let categories = $state<Category[]>([]);
  let speakers = $state<Speaker[]>([]);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');

  onMount(async () => {
    try {
      const [cats, sp] = await Promise.all([api.categories.list('VIDEO'), api.speakers.list()]);
      categories = cats; speakers = sp;
      const video = await api.videos.getById(videoId);
      title = video.title; description = video.description || ''; youtubeUrl = video.youtubeUrl;
      thumbnail = video.thumbnail || ''; speakerId = video.speakerId || ''; duration = video.duration || 0;
      categoryId = video.categoryId || ''; featured = video.featured;
    } catch (e) { console.error(e); }
    finally { loading = false; }
  });

  async function handleSave() {
    error = '';
    if (!title) { error = 'Title is required'; return; }
    saving = true;
    try {
      await api.videos.update(videoId, { title, description, youtubeUrl, thumbnail: thumbnail || undefined, speakerId: speakerId || undefined, duration: duration || undefined, categoryId: categoryId || undefined, featured });
      goto('/videos');
    } catch (e: any) { error = e.message || 'Failed to save'; }
    finally { saving = false; }
  }
</script>

<div class="max-w-2xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <button onclick={() => goto('/videos')} class="p-2 rounded-lg hover:bg-muted"><ArrowLeft class="w-4 h-4 text-muted-foreground" /></button>
      <div><h1 class="text-xl font-bold text-foreground">Edit Video</h1></div>
    </div>
    <div class="flex items-center gap-2">
      <a href={youtubeUrl} target="_blank" class="inline-flex items-center gap-1.5 px-3 h-10 rounded-xl border border-input text-sm text-muted-foreground hover:bg-muted transition-colors">
        <ExternalLink class="w-4 h-4" /> Open on YouTube
      </a>
      <button onclick={handleSave} disabled={saving}
        class="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
        {#if saving}<Loader2 class="w-4 h-4 animate-spin" />{/if} Update
      </button>
    </div>
  </div>

  {#if error}<div class="p-3 rounded-lg bg-red-50/..."><p class="text-sm text-red-700">{error}</p></div>{/if}

  {#if loading}
    <div class="space-y-4">{#each Array(6) as _}<div class="h-10 rounded-xl bg-muted animate-pulse" />{/each}</div>
  {:else}
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Title</label>
        <input type="text" bind:value={title} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Speaker</label>
          <select bind:value={speakerId} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select speaker</option>
            {#each speakers as s}<option value={s.id}>{s.name}</option>{/each}
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Category</label>
          <select bind:value={categoryId} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select category</option>
            {#each categories as c}<option value={c.id}>{c.name}</option>{/each}
          </select>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">YouTube URL</label>
        <input type="url" bind:value={youtubeUrl} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Thumbnail</label>
        <div class="flex gap-2">
          <input type="url" bind:value={thumbnail} class="flex-1 h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <UploadButton bind:value={thumbnail} label="Upload" accept="image/*" />
        </div>
        {#if thumbnail}<img src={thumbnail} alt="preview" class="mt-2 h-24 w-auto rounded-lg object-cover border border-border" />{/if}
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Duration (seconds)</label>
          <input type="number" bind:value={duration} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Description</label>
        <textarea bind:value={description} rows="3" class="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"></textarea>
      </div>
      <label class="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg hover:bg-muted">
        <input type="checkbox" bind:checked={featured} class="rounded border-border text-indigo-600 focus:ring-indigo-500" />
        <span class="text-sm font-medium text-foreground">Featured video</span>
      </label>
    </div>
  {/if}
</div>

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { api } from '$lib/api/real-client';
  import LoadingSkeleton from '$lib/components/shared/LoadingSkeleton.svelte';
  import { formatDate } from '$lib/utils/format';
  import type { DailyContent } from '$lib/types';
  import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-svelte';

  let itemId = $state('');
  let item = $state<DailyContent | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');

  let type = $state<'verse' | 'quote'>('verse');
  let content = $state('');
  let book = $state('');
  let chapter = $state<number | null>(null);
  let verse = $state<number | null>(null);
  let reference = $state('');
  let author = $state('');
  let date = $state('');
  let isActive = $state(true);

  onMount(async () => {
    itemId = $page.params.id || '';
    try {
      const data = await api.dailyContent.getById(itemId);
      item = data;
      type = data.type;
      content = data.content;
      book = data.book || '';
      chapter = data.chapter;
      verse = data.verse;
      reference = data.reference || '';
      author = data.author || '';
      date = data.date ? data.date.split('T')[0] : '';
      isActive = data.isActive;
    } catch (e) { console.error(e); error = 'Failed to load'; }
    finally { loading = false; }
  });

  function autoReference() {
    if (type === 'verse' && book && chapter && verse) {
      const parts = book.split(' ');
      const last = parts.pop() || '';
      const first = parts.join(' ');
      reference = first ? `${first} ${last} ${chapter}:${verse}` : `${last} ${chapter}:${verse}`;
    }
  }

  async function handleSave() {
    error = '';
    if (!content) { error = 'Content is required'; return; }
    saving = true;
    try {
      const payload: any = { type, content, isActive };
      if (type === 'verse') {
        payload.book = book || null;
        payload.chapter = chapter || null;
        payload.verse = verse || null;
        payload.reference = reference || null;
      } else {
        payload.author = author || null;
      }
      payload.date = date || null;
      await api.dailyContent.update(itemId, payload as any);
      goto('/daily-content');
    } catch (e: any) {
      error = e.message || 'Failed to save';
    } finally { saving = false; }
  }

  async function handleDelete() {
    if (confirm('Delete this item permanently?')) {
      try {
        await api.dailyContent.delete(itemId);
        goto('/daily-content');
      } catch (e: any) { error = e.message || 'Failed to delete'; }
    }
  }
</script>

<div class="max-w-2xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <button onclick={() => goto('/daily-content')} class="p-2 rounded-lg hover:bg-muted transition-colors">
        <ArrowLeft class="w-4 h-4 text-muted-foreground" />
      </button>
      <div>
        <h1 class="text-xl font-bold text-foreground">{loading ? 'Loading...' : 'Edit Content'}</h1>
        <p class="text-sm text-muted-foreground">{type === 'verse' ? 'Edit Bible verse' : 'Edit quote'}</p>
      </div>
    </div>
    <button
      onclick={handleDelete}
      class="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
    >
      <Trash2 class="w-4 h-4" /> Delete
    </button>
  </div>

  {#if error}
    <div class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">{error}</div>
  {/if}

  {#if loading}
    <LoadingSkeleton count={6} />
  {:else}
    <div class="rounded-xl border border-border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Type</label>
        <div class="flex gap-2">
          <button
            onclick={() => type = 'verse'}
            class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border {type === 'verse' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-input text-foreground hover:bg-muted'}"
          >Bible Verse</button>
          <button
            onclick={() => type = 'quote'}
            class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border {type === 'quote' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-input text-foreground hover:bg-muted'}"
          >Quote</button>
        </div>
      </div>

      {#if type === 'verse'}
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">Book</label>
            <input type="text" bind:value={book} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" oninput={autoReference} />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">Chapter</label>
            <input type="number" bind:value={chapter} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" oninput={autoReference} />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">Verse</label>
            <input type="number" bind:value={verse} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" oninput={autoReference} />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Reference</label>
          <input type="text" bind:value={reference} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      {:else}
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Author</label>
          <input type="text" bind:value={author} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      {/if}

      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Content</label>
        <textarea bind:value={content} rows="3" class="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
      </div>

      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Scheduled Date (optional)</label>
        <input type="date" bind:value={date} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <label class="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg hover:bg-muted">
        <input type="checkbox" bind:checked={isActive} class="rounded border-border text-indigo-600 focus:ring-indigo-500" />
        <span class="text-sm font-medium text-foreground">Active</span>
      </label>

      {#if item}
        <div class="grid grid-cols-2 gap-4 pt-2">
          <div class="p-3 rounded-lg bg-muted/50">
            <p class="text-xs text-muted-foreground">Created</p>
            <p class="text-sm font-medium text-foreground mt-0.5">{formatDate(item.createdAt)}</p>
          </div>
          <div class="p-3 rounded-lg bg-muted/50">
            <p class="text-xs text-muted-foreground">Updated</p>
            <p class="text-sm font-medium text-foreground mt-0.5">{formatDate(item.updatedAt)}</p>
          </div>
        </div>
      {/if}
    </div>

    <div class="flex justify-end gap-2">
      <button
        onclick={() => goto('/daily-content')}
        class="px-4 h-10 rounded-xl border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >Cancel</button>
      <button
        onclick={handleSave}
        disabled={saving}
        class="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {#if saving}<Loader2 class="w-4 h-4 animate-spin" />{/if}
        <Save class="w-4 h-4" /> Save Changes
      </button>
    </div>
  {/if}
</div>

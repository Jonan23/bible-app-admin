<script lang="ts">
  import { goto } from '$app/navigation';
  import { api } from '$lib/api/real-client';
  import { ArrowLeft, Save, Loader2 } from 'lucide-svelte';

  let type = $state<'verse' | 'quote'>('verse');
  let content = $state('');
  let book = $state('');
  let chapter = $state<number | null>(null);
  let verse = $state<number | null>(null);
  let reference = $state('');
  let author = $state('');
  let date = $state('');
  let isActive = $state(true);
  let saving = $state(false);
  let error = $state('');

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
    if (type === 'verse' && !book) { error = 'Book is required for verses'; return; }
    saving = true;
    try {
      const payload: any = { type, content, isActive };
      if (type === 'verse') {
        payload.book = book || null;
        payload.chapter = chapter || null;
        payload.verse = verse || null;
        payload.reference = reference || autoReference() || null;
      } else {
        payload.author = author || null;
      }
      payload.date = date || null;
      await api.dailyContent.create(payload as any);
      goto('/daily-content');
    } catch (e: any) {
      error = e.message || 'Failed to save';
    } finally {
      saving = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto space-y-6">
  <div class="flex items-center gap-3">
    <button onclick={() => goto('/daily-content')} class="p-2 rounded-lg hover:bg-muted transition-colors">
      <ArrowLeft class="w-4 h-4 text-muted-foreground" />
    </button>
    <div>
      <h1 class="text-xl font-bold text-foreground">New Daily Content</h1>
      <p class="text-sm text-muted-foreground">Add a Bible verse or inspirational quote</p>
    </div>
  </div>

  {#if error}
    <div class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">{error}</div>
  {/if}

  <div class="rounded-xl border border-border p-6 space-y-4">
    <div>
      <label class="block text-sm font-medium text-foreground mb-1.5">Type</label>
      <div class="flex gap-2">
        <button
          onclick={() => type = 'verse'}
          class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border {type === 'verse' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-input text-foreground hover:bg-muted'}"
        >
          Bible Verse
        </button>
        <button
          onclick={() => type = 'quote'}
          class="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border {type === 'quote' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-input text-foreground hover:bg-muted'}"
        >
          Quote
        </button>
      </div>
    </div>

    {#if type === 'verse'}
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Book *</label>
          <input type="text" bind:value={book} placeholder="John" class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" oninput={autoReference} />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Chapter</label>
          <input type="number" bind:value={chapter} placeholder="3" class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" oninput={autoReference} />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Verse</label>
          <input type="number" bind:value={verse} placeholder="16" class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" oninput={autoReference} />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Reference</label>
        <input type="text" bind:value={reference} placeholder="John 3:16" class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    {:else}
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Author</label>
        <input type="text" bind:value={author} placeholder="C.S. Lewis" class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    {/if}

    <div>
      <label class="block text-sm font-medium text-foreground mb-1.5">Content *</label>
      <textarea bind:value={content} rows="3" placeholder={type === 'verse' ? 'For God so loved the world...' : 'Faith is not the absence of fear...'} class="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
    </div>

    <div>
      <label class="block text-sm font-medium text-foreground mb-1.5">Scheduled Date (optional)</label>
      <input type="date" bind:value={date} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      <p class="text-xs text-muted-foreground mt-1">Leave blank for unscheduled content (will be used as fallback)</p>
    </div>

    <label class="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg hover:bg-muted">
      <input type="checkbox" bind:checked={isActive} class="rounded border-border text-indigo-600 focus:ring-indigo-500" />
      <span class="text-sm font-medium text-foreground">Active</span>
    </label>
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
      <Save class="w-4 h-4" /> Save
    </button>
  </div>
</div>

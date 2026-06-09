<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api/real-client';
  import UploadButton from '$lib/components/shared/UploadButton.svelte';
  import type { Category, User } from '$lib/types';
  import { ArrowLeft, Save, Loader2 } from 'lucide-svelte';

  let title = $state('');
  let description = $state('');
  let startDate = $state('');
  let endDate = $state('');
  let location = $state('');
  let bannerImage = $state('');
  let registrationLink = $state('');

  let loading = $state(false);
  let saving = $state(false);
  let error = $state('');

  async function handleSave() {
    error = ''; if (!title) { error = 'Title is required'; return; }
    saving = true;
    try {
      await api.events.create({
        title, description: description || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        location: location || undefined,
        bannerImage: bannerImage || undefined,
        registrationLink: registrationLink || undefined,
        status: 'UPCOMING',
      });
      goto('/events');
    } catch (e: any) { error = e.message || 'Failed to save'; }
    finally { saving = false; }
  }
</script>

<div class="max-w-2xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <button onclick={() => goto('/events')} class="p-2 rounded-lg hover:bg-muted"><ArrowLeft class="w-4 h-4 text-muted-foreground" /></button>
      <div><h1 class="text-xl font-bold text-foreground">New Event</h1><p class="text-sm text-muted-foreground">Create a new ministry event or trip</p></div>
    </div>
    <button onclick={handleSave} disabled={saving}
      class="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
      {#if saving}<Loader2 class="w-4 h-4 animate-spin" />{/if} Create
    </button>
  </div>

  {#if error}<div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"><p class="text-sm text-red-700">{error}</p></div>{/if}

  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-foreground mb-1.5">Title</label>
      <input type="text" bind:value={title} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
    <div>
      <label class="block text-sm font-medium text-foreground mb-1.5">Description</label>
      <textarea bind:value={description} rows="4" class="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"></textarea>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
        <input type="date" bind:value={startDate} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">End Date</label>
        <input type="date" bind:value={endDate} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
    </div>
    <div>
      <label class="block text-sm font-medium text-foreground mb-1.5">Location</label>
      <input type="text" bind:value={location} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
    <div>
      <label class="block text-sm font-medium text-foreground mb-1.5">Registration Link</label>
      <input type="url" bind:value={registrationLink} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
    <div>
      <label class="block text-sm font-medium text-foreground mb-1.5">Banner Image</label>
      <div class="flex gap-2">
        <input type="url" bind:value={bannerImage} class="flex-1 h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        <UploadButton bind:value={bannerImage} label="Upload" accept="image/*" />
      </div>
      {#if bannerImage}<img src={bannerImage} alt="preview" class="mt-2 h-32 w-full rounded-lg object-cover border border-border" />{/if}
    </div>
  </div>
</div>

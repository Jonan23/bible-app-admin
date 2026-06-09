<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { api } from '$lib/api/real-client';
  import UploadButton from '$lib/components/shared/UploadButton.svelte';
  import type { Event, User } from '$lib/types';
  import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-svelte';
  import { formatDate, formatDateTime } from '$lib/utils/format';

  let eventId = $derived($page.params.id!);

  let title = $state('');
  let description = $state('');
  let startDate = $state('');
  let endDate = $state('');
  let location = $state('');
  let bannerImage = $state('');
  let registrationLink = $state('');
  let status = $state('UPCOMING');

  let registrations = $state<any[]>([]);
  let organizer = $state<User | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');

  onMount(async () => {
    try {
      const evt = await api.events.getById(eventId);
      title = evt.title; description = evt.description || ''; startDate = evt.startDate.split('T')[0];
      endDate = evt.endDate ? evt.endDate.split('T')[0] : ''; location = evt.location || '';
      bannerImage = evt.bannerImage || ''; registrationLink = evt.registrationLink || ''; status = evt.status;
      organizer = evt.organizer;
      registrations = await api.events.getRegistrations(eventId);
    } catch (e) { console.error(e); }
    finally { loading = false; }
  });

  async function handleSave() {
    error = ''; if (!title) { error = 'Title is required'; return; }
    saving = true;
    try {
      await api.events.update(eventId, { title, description: description || undefined, startDate: startDate ? new Date(startDate).toISOString() : undefined, endDate: endDate ? new Date(endDate).toISOString() : undefined, location: location || undefined, bannerImage: bannerImage || undefined, registrationLink: registrationLink || undefined, status: status as any });
      goto('/events');
    } catch (e: any) { error = e.message || 'Failed to save'; }
    finally { saving = false; }
  }
</script>

<div class="max-w-3xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <button onclick={() => goto('/events')} class="p-2 rounded-lg hover:bg-muted"><ArrowLeft class="w-4 h-4 text-muted-foreground" /></button>
      <div><h1 class="text-xl font-bold text-foreground">Edit Event</h1></div>
    </div>
    <button onclick={handleSave} disabled={saving}
      class="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
      {#if saving}<Loader2 class="w-4 h-4 animate-spin" />{/if} Update
    </button>
  </div>

  {#if error}<div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"><p class="text-sm text-red-700">{error}</p></div>{/if}

  {#if loading}
    <div class="space-y-4">{#each Array(8) as _}<div class="h-10 rounded-xl bg-muted animate-pulse" />{/each}</div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4 lg:col-span-2">
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Title</label>
          <input type="text" bind:value={title} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Description</label>
          <textarea bind:value={description} rows="4" class="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"></textarea>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
        <input type="date" bind:value={startDate} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">End Date</label>
        <input type="date" bind:value={endDate} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Location</label>
        <input type="text" bind:value={location} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Status</label>
        <select bind:value={status} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="UPCOMING">Upcoming</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Registration Link</label>
        <input type="url" bind:value={registrationLink} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="lg:col-span-2">
        <label class="block text-sm font-medium text-foreground mb-1.5">Banner Image</label>
        <div class="flex gap-2">
          <input type="url" bind:value={bannerImage} class="flex-1 h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <UploadButton bind:value={bannerImage} label="Upload" accept="image/*" />
        </div>
        {#if bannerImage}<img src={bannerImage} alt="banner" class="mt-2 h-32 w-full rounded-lg object-cover border border-border" />{/if}
      </div>
    </div>

    {#if registrations.length > 0}
      <div class="rounded-xl border border-border overflow-hidden">
        <div class="px-6 py-4 border-b border-border bg-muted/30">
          <h3 class="text-sm font-semibold text-foreground">Registrations ({registrations.length})</h3>
        </div>
        <div class="divide-y divide-border">
          {#each registrations as reg}
            <div class="px-6 py-3 flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-foreground">{reg.name}</p>
                <p class="text-xs text-muted-foreground">{reg.email}</p>
              </div>
              <span class="text-xs text-muted-foreground">{formatDateTime(reg.createdAt)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api/real-client';
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import StatusBadge from '$lib/components/shared/StatusBadge.svelte';
  import SearchBar from '$lib/components/shared/SearchBar.svelte';
  import { EVENT_COLUMNS, EVENT_STATUSES, EVENT_STATUS_LABELS, EVENT_STATUS_VARIANTS } from '$lib/utils/constants';
  import type { Event } from '$lib/types';
  import { Plus, Edit, Trash2, CalendarDays } from 'lucide-svelte';

  let events = $state<Event[]>([]);
  let loading = $state(true);
  let statusFilter = $state('');
  let upcomingFilter = $state(false);
  let page = $state(1);
  let totalPages = $state(1);
  let total = $state(0);
  let viewMode = $state<'table' | 'calendar'>('table');

  onMount(async () => { await loadEvents(); });

  async function loadEvents() {
    loading = true;
    try {
      const res = await api.events.list({
        page, limit: 10, status: statusFilter || undefined, upcoming: upcomingFilter || undefined,
      });
      events = res.data;
      totalPages = res.meta.totalPages;
      total = res.meta.total;
    } catch (e) { console.error(e); }
    finally { loading = false; }
  }

  function handleDelete(id: string) { if (confirm('Delete this event?')) api.events.delete(id).then(() => loadEvents()); }

  let columns = EVENT_COLUMNS;
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Events & Trips</h1>
      <p class="text-sm text-muted-foreground mt-1">Manage your ministry events and trips</p>
    </div>
    <div class="flex items-center gap-2">
      <button onclick={() => viewMode = viewMode === 'table' ? 'calendar' : 'table'}
        class="inline-flex items-center gap-2 px-3 h-10 rounded-xl border border-input text-sm text-muted-foreground hover:bg-muted transition-colors">
        <CalendarDays class="w-4 h-4" /> {viewMode === 'table' ? 'Calendar' : 'Table'}
      </button>
      <button onclick={() => goto('/events/new')}
        class="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
        <Plus class="w-4 h-4" /> New Event
      </button>
    </div>
  </div>

  <div class="flex items-center gap-3">
    <select bind:value={statusFilter} onchange={() => { page = 1; loadEvents(); }}
      class="h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
      <option value="">All Statuses</option>
      {#each EVENT_STATUSES as s}
        <option value={s}>{EVENT_STATUS_LABELS[s]}</option>
      {/each}
    </select>
    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" bind:checked={upcomingFilter} onchange={() => { page = 1; loadEvents(); }}
        class="rounded border-border text-indigo-600 focus:ring-indigo-500" />
      <span class="text-sm text-muted-foreground">Upcoming only</span>
    </label>
  </div>

  {#if viewMode === 'table'}
    <DataTable tableData={events} {columns} {page} {totalPages} {total} {loading}
      onpage={(p) => { page = p; loadEvents(); }}
      onrowclick={(e) => goto(`/events/${e.id}`)}
      emptyTitle="No events found" emptyDescription="Create your first event"
    >
      {#snippet children(item: Event)}
        <div class="flex items-center gap-1">
          <button onclick={() => goto(`/events/${item.id}`)} class="p-1.5 rounded-lg hover:bg-muted"><Edit class="w-3.5 h-3.5 text-muted-foreground" /></button>
          <button onclick={() => handleDelete(item.id)} class="p-1.5 rounded-lg hover:bg-muted"><Trash2 class="w-3.5 h-3.5 text-red-500" /></button>
        </div>
      {/snippet}
    </DataTable>
  {:else}
    <div class="rounded-xl border border-border p-6">
      <p class="text-sm text-muted-foreground text-center py-8">Calendar view — coming soon</p>
    </div>
  {/if}
</div>

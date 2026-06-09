<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api/real-client';
  import DataTable from '$lib/components/shared/DataTable.svelte';
  import { NOTIFICATION_COLUMNS, NOTIFICATION_TYPES, NOTIFICATION_TYPE_LABELS } from '$lib/utils/constants';
  import type { NotificationHistoryItem, NotificationTemplate } from '$lib/types';
  import { Send, CheckCircle2, Loader2, Megaphone } from 'lucide-svelte';

  let title = $state('');
  let body = $state('');
  let type = $state<'BROADCAST' | 'SCHEDULED' | 'TOPIC' | 'INDIVIDUAL'>('BROADCAST');
  let topic = $state('');
  let scheduledAt = $state('');

  let history = $state<NotificationHistoryItem[]>([]);
  let templates = $state<NotificationTemplate[]>([]);
  let loading = $state(true);
  let sending = $state(false);
  let error = $state('');
  let success = $state('');
  let page = $state(1);
  let totalPages = $state(1);
  let total = $state(0);
  let stats = $state<any>(null);

  onMount(async () => {
    try {
      const [res, t, s] = await Promise.all([
        api.notifications.list({ page, limit: 10 }),
        api.notifications.getTemplates(),
        api.notifications.getStats(),
      ]);
      history = res.data;
      totalPages = res.meta.totalPages;
      total = res.meta.total;
      templates = t;
      stats = s;
    } catch (e) { console.error(e); }
    finally { loading = false; }
  });

  async function handleSend() {
    error = ''; success = '';
    if (!title) { error = 'Title is required'; return; }
    sending = true;
    try {
      if (type === 'BROADCAST' || type === 'SCHEDULED') {
        await api.notifications.broadcast({ title, body, topic: topic || undefined, scheduledAt: scheduledAt || undefined });
      } else {
        await api.notifications.send({ title, body, type, topic: topic || undefined, scheduledAt: scheduledAt || undefined });
      }
      success = 'Notification sent successfully!';
      title = ''; body = ''; topic = ''; scheduledAt = '';
      const res = await api.notifications.list({ page: 1, limit: 10 });
      history = res.data;
    } catch (e: any) { error = e.message || 'Failed to send'; }
    finally { sending = false; }
  }

  function applyTemplate(tmpl: NotificationTemplate) {
    title = tmpl.title.replace(/\{title\}/g, 'New Content').replace(/\{event\}/g, 'Event').replace(/\{date\}/g, 'June 1').replace(/\{speaker\}/g, 'Speaker');
    body = tmpl.body.replace(/\{title\}/g, 'New Content').replace(/\{event\}/g, 'Event').replace(/\{date\}/g, 'June 1').replace(/\{speaker\}/g, 'Speaker');
    type = tmpl.type as any;
  }

  let columns = NOTIFICATION_COLUMNS;
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Notifications</h1>
      <p class="text-sm text-muted-foreground mt-1">Send and manage push notifications</p>
    </div>
  </div>

  {#if stats}
    <div class="grid grid-cols-4 gap-4">
      <div class="rounded-xl border border-border p-4">
        <p class="text-xs text-muted-foreground uppercase tracking-wider">Total Sent</p>
        <p class="text-xl font-bold text-foreground mt-1">{stats.sent}</p>
      </div>
      <div class="rounded-xl border border-border p-4">
        <p class="text-xs text-muted-foreground uppercase tracking-wider">Scheduled</p>
        <p class="text-xl font-bold text-foreground mt-1">{stats.scheduled}</p>
      </div>
      <div class="rounded-xl border border-border p-4">
        <p class="text-xs text-muted-foreground uppercase tracking-wider">Read</p>
        <p class="text-xl font-bold text-foreground mt-1">{stats.read}</p>
      </div>
      <div class="rounded-xl border border-border p-4">
        <p class="text-xs text-muted-foreground uppercase tracking-wider">Templates</p>
        <p class="text-xl font-bold text-foreground mt-1">{templates.length}</p>
      </div>
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
    <div class="lg:col-span-3 rounded-xl border border-border p-6">
      <h3 class="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Megaphone class="w-4 h-4" /> Compose Notification
      </h3>

      {#if error}<div class="p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"><p class="text-sm text-red-700">{error}</p></div>{/if}
      {#if success}<div class="p-3 mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2"><CheckCircle2 class="w-4 h-4 text-emerald-600" /><p class="text-sm text-emerald-700">{success}</p></div>{/if}

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Title *</label>
          <input type="text" bind:value={title} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Message</label>
          <textarea bind:value={body} rows="3" class="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">Type</label>
            <select bind:value={type} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              {#each NOTIFICATION_TYPES as t}
                <option value={t}>{NOTIFICATION_TYPE_LABELS[t]}</option>
              {/each}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">Topic / Audience</label>
            <input type="text" bind:value={topic} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Schedule (optional)</label>
          <input type="datetime-local" bind:value={scheduledAt} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <button onclick={handleSend} disabled={sending}
          class="w-full h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          {#if sending}<Loader2 class="w-4 h-4 animate-spin" />{/if}
          <Send class="w-4 h-4" /> Send Notification
        </button>
      </div>
    </div>

    <div class="lg:col-span-2 rounded-xl border border-border p-6">
      <h3 class="text-sm font-semibold text-foreground mb-4">Templates</h3>
      <div class="space-y-2">
        {#each templates as tmpl}
          <button onclick={() => applyTemplate(tmpl)}
            class="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border">
            <p class="text-sm font-medium text-foreground">{tmpl.name}</p>
            <p class="text-xs text-muted-foreground mt-0.5 truncate">{tmpl.title}</p>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div>
    <h3 class="text-sm font-semibold text-foreground mb-4">Notification History</h3>
    <DataTable tableData={history} {columns} {page} {totalPages} {total} loading={false}
      onpage={(p) => { page = p; }}
      emptyTitle="No notifications sent" emptyDescription="Send your first notification"
    />
  </div>
</div>

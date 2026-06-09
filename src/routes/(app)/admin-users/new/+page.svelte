<script lang="ts">
  import { goto } from '$app/navigation';
  import { api } from '$lib/api/real-client';
  import { ArrowLeft, Send, Loader2, Mail } from 'lucide-svelte';

  let name = $state('');
  let email = $state('');
  let saving = $state(false);
  let success = $state(false);
  let error = $state('');

  async function handleInvite() {
    error = '';
    if (!name.trim()) { error = 'Name is required'; return; }
    if (!email.trim()) { error = 'Email is required'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { error = 'Invalid email address'; return; }
    saving = true;
    try {
      await api.auth.invite({ email: email.trim(), name: name.trim() });
      success = true;
    } catch (e: any) {
      error = e.message || 'Failed to send invitation';
    } finally {
      saving = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto space-y-6">
  <div class="flex items-center gap-3">
    <button onclick={() => goto('/admin-users')} class="p-2 rounded-lg hover:bg-muted transition-colors">
      <ArrowLeft class="w-4 h-4 text-muted-foreground" />
    </button>
    <div>
      <h1 class="text-xl font-bold text-foreground">Invite Admin User</h1>
      <p class="text-sm text-muted-foreground">Send an invitation email to a new dashboard administrator</p>
    </div>
  </div>

  {#if success}
    <div class="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-6 text-center space-y-3">
      <div class="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center mx-auto">
        <Mail class="w-6 h-6 text-emerald-600" />
      </div>
      <h3 class="text-lg font-semibold text-foreground">Invitation Sent!</h3>
      <p class="text-sm text-muted-foreground">
        An invitation email has been sent to <strong>{email}</strong>. They will receive instructions to set up their account.
      </p>
      <div class="flex justify-center gap-2 pt-2">
        <button
          onclick={() => { name = ''; email = ''; success = false; error = ''; }}
          class="px-4 h-10 rounded-xl border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Send Another
        </button>
        <button
          onclick={() => goto('/admin-users')}
          class="px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          View Admin Users
        </button>
      </div>
    </div>
  {:else}
    {#if error}
      <div class="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
        {error}
      </div>
    {/if}

    <div class="rounded-xl border border-border p-6 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
          <input type="text" bind:value={name} placeholder="John Doe" class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Email Address *</label>
          <input type="email" bind:value={email} placeholder="john@example.com" class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>
      <div class="rounded-lg bg-muted/50 p-4">
        <p class="text-sm text-muted-foreground">
          An invitation email will be sent to the address above. The recipient will set their own password when they first log in.
        </p>
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <button
        onclick={() => goto('/admin-users')}
        class="px-4 h-10 rounded-xl border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        Cancel
      </button>
      <button
        onclick={handleInvite}
        disabled={saving}
        class="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {#if saving}<Loader2 class="w-4 h-4 animate-spin" />{/if}
        <Send class="w-4 h-4" /> Send Invitation
      </button>
    </div>
  {/if}
</div>

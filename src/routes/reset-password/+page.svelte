<script lang="ts">
  import { resetPasswordSchema } from '$lib/schemas/auth';
  import { api } from '$lib/api/real-client';
  import { page } from '$app/stores';
  import { BookOpen, Eye, EyeOff, CheckCircle2 } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  let password = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);
  let error = $state('');
  let loading = $state(false);
  let success = $state(false);

  let token = $derived($page.url.searchParams.get('token') || '');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    if (!token) { error = 'Invalid reset link. No token found.'; return; }
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      error = result.error.errors[0].message;
      return;
    }
    loading = true;
    try {
      await api.auth.resetPassword(token, password);
      success = true;
    } catch (err: any) {
      error = err.message || 'Something went wrong';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-background flex items-center justify-center px-6 py-12">
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 mb-4">
        <BookOpen class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h2 class="text-2xl font-bold text-foreground mb-1">Reset password</h2>
      <p class="text-sm text-muted-foreground">Enter your new password below</p>
    </div>

    {#if success}
      <div class="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-3">
          <CheckCircle2 class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 class="text-sm font-semibold text-emerald-800 dark:text-emerald-400 mb-1">Password reset successful</h3>
        <p class="text-xs text-emerald-600 dark:text-emerald-500 mb-4">
          Your password has been changed successfully
        </p>
        <button
          onclick={() => goto('/login')}
          class="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Back to login
        </button>
      </div>
    {:else}
      {#if error}
        <div class="p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p class="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      {/if}

      <form onsubmit={handleSubmit} class="space-y-4">
        <div>
          <label for="password" class="block text-sm font-medium text-foreground mb-1.5">New Password</label>
          <div class="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              placeholder="Min. 8 characters"
              class="w-full h-11 pl-4 pr-11 rounded-xl border border-input bg-background text-sm text-foreground
                     placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                     transition-all"
            />
            <button
              type="button"
              onclick={() => showPassword = !showPassword}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {#if showPassword}<EyeOff class="w-4 h-4" />{:else}<Eye class="w-4 h-4" />{/if}
            </button>
          </div>
        </div>
        <div>
          <label for="confirm" class="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
          <input
            id="confirm"
            type="password"
            bind:value={confirmPassword}
            placeholder="Repeat your password"
            class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground
                   placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                   transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          class="w-full h-11 rounded-xl bg-indigo-600 text-white text-sm font-semibold
                 hover:bg-indigo-700 disabled:opacity-50 transition-all"
        >
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    {/if}
  </div>
</div>

<script lang="ts">
  import { forgotPasswordSchema } from '$lib/schemas/auth';
  import { api } from '$lib/api/real-client';
  import { BookOpen, ArrowLeft, CheckCircle2 } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  let email = $state('');
  let error = $state('');
  let loading = $state(false);
  let success = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      error = result.error.errors[0].message;
      return;
    }
    loading = true;
    try {
      await api.auth.forgotPassword(email);
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
      <h2 class="text-2xl font-bold text-foreground mb-1">Forgot password?</h2>
      <p class="text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
    </div>

    {#if success}
      <div class="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-3">
          <CheckCircle2 class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 class="text-sm font-semibold text-emerald-800 dark:text-emerald-400 mb-1">Check your email</h3>
        <p class="text-xs text-emerald-600 dark:text-emerald-500 mb-4">
          We've sent a password reset link to {email}
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
          <label for="email" class="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="you@example.com"
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
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <button
        onclick={() => goto('/login')}
        class="mt-6 flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        Back to login
      </button>
    {/if}
  </div>
</div>

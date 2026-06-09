<script lang="ts">
  import { loginSchema } from '$lib/schemas/auth';
  import { authStore } from '$lib/stores/auth.svelte';
  import { page } from '$app/stores';
  import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  let email = $state($page.url.searchParams.get('email') || '');
  let password = $state('');
  let showPassword = $state(false);
  let rememberMe = $state(true);
  let error = $state('');
  let loading = $state(false);

  let isAuthenticated = $derived($authStore?.isAuthenticated ?? false);

  $effect(() => {
    if (isAuthenticated) {
      goto('/dashboard');
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      error = result.error.errors[0].message;
      return;
    }
    loading = true;
    try {
      await authStore.login(email, password, rememberMe);
      goto('/dashboard');
    } catch (err: any) {
      error = err.message || 'Login failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-background flex">
  <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 relative overflow-hidden">
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
    </div>
    <div class="relative z-10 flex flex-col justify-center px-16">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <BookOpen class="w-5 h-5 text-white" />
        </div>
        <span class="text-xl font-bold text-white">Bible Teaching</span>
      </div>
      <h1 class="text-4xl font-bold text-white leading-tight mb-4">
        Admin Dashboard
      </h1>
      <p class="text-lg text-indigo-200 max-w-md">
        Manage your ministry content, users, and analytics from one central control panel.
      </p>
      <div class="mt-12 space-y-4">
        <div class="flex items-center gap-3 text-indigo-200">
          <div class="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
          <span class="text-sm">Blog & sermon content management</span>
        </div>
        <div class="flex items-center gap-3 text-indigo-200">
          <div class="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
          <span class="text-sm">Event planning & registration tracking</span>
        </div>
        <div class="flex items-center gap-3 text-indigo-200">
          <div class="w-1.5 h-1.5 rounded-full bg-indigo-300"></div>
          <span class="text-sm">User management with role-based access</span>
        </div>
      </div>
    </div>
  </div>

  <div class="flex-1 flex items-center justify-center px-6 py-12">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8 lg:hidden">
        <div class="inline-flex items-center gap-2 mb-4">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <BookOpen class="w-4 h-4 text-white" />
          </div>
          <span class="text-lg font-bold text-foreground">Bible Teaching</span>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
      <p class="text-sm text-muted-foreground mb-8">Sign in to your admin account</p>

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
            placeholder="admin@bibleteaching.org"
            class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground
                   placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                   transition-all"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-foreground mb-1.5">Password</label>
          <div class="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              placeholder="Enter your password"
              class="w-full h-11 pl-4 pr-11 rounded-xl border border-input bg-background text-sm text-foreground
                     placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                     transition-all"
            />
            <button
              type="button"
              onclick={() => showPassword = !showPassword}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {#if showPassword}
                <EyeOff class="w-4 h-4" />
              {:else}
                <Eye class="w-4 h-4" />
              {/if}
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" bind:checked={rememberMe} class="rounded border-border text-indigo-600 focus:ring-indigo-500" />
            <span class="text-sm text-muted-foreground">Remember me</span>
          </label>
          <a href="/forgot-password" class="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium transition-colors">
            Forgot password?
          </a>
        </div>
        <button
          type="submit"
          disabled={loading}
          class="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold
                 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-950"
        >
          {#if loading}
            <Loader2 class="w-4 h-4 animate-spin" />
            Signing in...
          {:else}
            Sign in
          {/if}
        </button>
      </form>

      <p class="mt-6 text-center text-xs text-muted-foreground">
        Powered by Supabase Auth
      </p>
    </div>
  </div>
</div>

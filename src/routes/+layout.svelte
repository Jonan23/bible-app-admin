<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import { authStore } from '$lib/stores/auth.svelte';

  let { children } = $props();
  let ready = $state(false);

  onMount(() => {
    authStore.init().then(() => { ready = true; });
    const unsub = themeStore.subscribe((t) => {
      document.documentElement.classList.toggle('dark', t === 'dark');
    });
    return unsub;
  });
</script>

{#if ready}
  {@render children()}
{:else}
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div class="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
{/if}

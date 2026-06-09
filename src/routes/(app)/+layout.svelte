<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import Navbar from '$lib/components/layout/Navbar.svelte';
  import MainLayout from '$lib/components/layout/MainLayout.svelte';

  let {
    children,
  }: {
    children?: import('svelte').Snippet;
  } = $props();

  let isAuthenticated = $derived($authStore?.isAuthenticated ?? false);
  let isLoading = $derived($authStore?.isLoading ?? true);

  $effect(() => {
    if (!isLoading && !isAuthenticated) {
      goto('/login');
    }
  });
</script>

{#if isAuthenticated}
  <MainLayout>
    {#snippet sidebar()}
      <Sidebar />
    {/snippet}
    {#snippet navbar()}
      <Navbar />
    {/snippet}
    {#if children}{@render children()}{/if}
  </MainLayout>
{:else}
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div class="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
{/if}

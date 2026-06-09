<script lang="ts">
  import { sidebarCollapsed } from '$lib/stores/sidebar.svelte';
  import { onMount } from 'svelte';

  let collapsed = $state(false);

  sidebarCollapsed.subscribe(v => collapsed = v);

  onMount(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') sidebarCollapsed.set(true);
  });
</script>

<svelte:window on:resize={() => {
  if (window.innerWidth < 1024) {
    sidebarCollapsed.set(false);
  }
}} />

<div
  class="min-h-screen bg-background"
  style="--sidebar-width: {collapsed ? '68px' : '16rem'}"
>
  <div class="flex">
    <slot name="sidebar" />

    <main
      class="flex-1 transition-all duration-300 ease-in-out"
      style="margin-left: var(--sidebar-width)"
    >
      <slot name="navbar" />

      <div class="pt-16 min-h-screen">
        <div class="p-4 lg:p-6 xl:p-8 animate-fade-in">
          <slot />
        </div>
      </div>
    </main>
  </div>
</div>

<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    count = 3,
    class: className = '',
  }: {
    count?: number;
    class?: string;
  } = $props();
</script>

{#each Array(count) as _, i}
  <div
    class={cn(
      'animate-pulse rounded-lg bg-muted',
      className || 'h-4 w-full',
    )}
    style="animation-delay: {i * 0.1}s"
  />
{/each}

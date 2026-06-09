<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Inbox } from 'lucide-svelte';

  let {
    title = 'No data found',
    description = '',
    icon = Inbox,
    action,
    class: className = '',
  }: {
    title?: string;
    description?: string;
    icon?: any;
    action?: import('svelte').Snippet;
    class?: string;
  } = $props();
</script>

<div class={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
  <div class="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
    <svelte:component this={icon} class="w-7 h-7 text-muted-foreground" />
  </div>
  <h3 class="text-sm font-semibold text-foreground mb-1">{title}</h3>
  {#if description}
    <p class="text-sm text-muted-foreground text-center max-w-sm">{description}</p>
  {/if}
  {#if action}
    <div class="mt-4">
      {@render action()}
    </div>
  {/if}
</div>

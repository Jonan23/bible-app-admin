<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { STATUS_BADGE_VARIANTS } from '$lib/utils/constants';

  let {
    variant = 'default',
    size = 'sm',
    class: className = '',
    children,
  }: {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
    size?: 'sm' | 'md';
    class?: string;
    children?: import('svelte').Snippet;
  } = $props();
</script>

<span
  class={cn(
    'inline-flex items-center font-medium rounded-full',
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
    STATUS_BADGE_VARIANTS[variant],
    className,
  )}
>
  {#if children}
    {@render children()}
  {/if}
</span>

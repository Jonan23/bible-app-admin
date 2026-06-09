<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { X } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  import { DRAWER_SIZES } from '$lib/utils/constants';

  let {
    open = false,
    title = '',
    position = 'right',
    size = 'md',
    onclose,
    children,
  }: {
    open?: boolean;
    title?: string;
    position?: 'right' | 'left';
    size?: 'sm' | 'md' | 'lg';
    onclose?: () => void;
    children?: import('svelte').Snippet;
  } = $props();
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex">
    <div class="fixed inset-0 bg-black/50" onclick={() => onclose?.()}></div>
    <div
      class={cn(
        'relative h-full w-full bg-card border-l border-border shadow-2xl overflow-y-auto',
        DRAWER_SIZES[size],
        position === 'right' ? 'ml-auto' : 'mr-auto',
      )}
      transition:slide={{ duration: 200 }}
    >
      {#if title}
        <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-card border-b border-border">
          <h2 class="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onclick={() => onclose?.()}
            class="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X class="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      {/if}
      <div class="p-6">
        {#if children}
          {@render children()}
        {/if}
      </div>
    </div>
  </div>
{/if}

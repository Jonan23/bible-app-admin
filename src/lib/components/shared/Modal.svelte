<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { X } from 'lucide-svelte';
  import { slide, fade } from 'svelte/transition';
  import { MODAL_SIZES } from '$lib/utils/constants';

  let {
    open = false,
    title = '',
    size = 'md',
    onclose,
    children,
  }: {
    open?: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    onclose?: () => void;
    children?: import('svelte').Snippet;
  } = $props();

  function close() {
    onclose?.();
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    transition:fade={{ duration: 150 }}
  >
    <div class="fixed inset-0 bg-black/50" onclick={close}></div>
    <div
      class={cn(
        'relative w-full bg-card border border-border rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden animate-scale-in',
        MODAL_SIZES[size],
      )}
      transition:slide={{ duration: 200 }}
    >
      {#if title}
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 class="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onclick={close}
            class="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X class="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      {/if}
      <div class="overflow-y-auto max-h-[calc(85vh-4rem)]">
        {#if children}
          {@render children()}
        {/if}
      </div>
    </div>
  </div>
{/if}

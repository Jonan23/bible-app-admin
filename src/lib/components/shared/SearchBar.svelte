<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Search } from 'lucide-svelte';

  let {
    value = '',
    placeholder = 'Search...',
    onchange,
    class: className = '',
  }: {
    value?: string;
    placeholder?: string;
    onchange?: (val: string) => void;
    class?: string;
  } = $props();
</script>

<div class={cn('relative', className)}>
  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
  <input
    type="text"
    placeholder={placeholder}
    bind:value
    oninput={() => onchange?.(value)}
    class="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm
           text-foreground placeholder:text-muted-foreground
           focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
           transition-all"
  />
</div>

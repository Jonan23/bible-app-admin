<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { onMount } from 'svelte';

  let {
    value = 0,
    duration = 800,
    suffix = '',
    prefix = '',
    decimals = 0,
  }: {
    value?: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
  } = $props();

  const display = tweened(0, { duration });

  onMount(() => {
    display.set(value);
  });

  $effect(() => {
    display.set(value);
  });
</script>

{prefix}{$display.toFixed(decimals)}{suffix}

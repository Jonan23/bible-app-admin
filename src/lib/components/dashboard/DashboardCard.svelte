<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { fly } from 'svelte/transition';
  import { DASHBOARD_CARD_TREND_COLORS, DASHBOARD_CARD_VARIANT_STYLES } from '$lib/utils/constants';

  let {
    title = '',
    value = '',
    subtitle = '',
    icon,
    trend,
    trendLabel = '',
    variant = 'default',
    class: className = '',
    children,
  }: {
    title?: string;
    value?: string;
    subtitle?: string;
    icon?: any;
    trend?: 'up' | 'down' | 'neutral';
    trendLabel?: string;
    variant?: 'default' | 'primary' | 'success' | 'warning';
    class?: string;
    children?: import('svelte').Snippet;
  } = $props();
</script>

<div
  class={cn(
    'rounded-xl border p-5 transition-all duration-200 hover:shadow-md',
    DASHBOARD_CARD_VARIANT_STYLES[variant],
    className,
  )}
  transition:fly={{ y: 10, duration: 300 }}
>
  <div class="flex items-start justify-between mb-3">
    <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
    {#if icon}
      <div class="w-9 h-9 rounded-xl bg-background dark:bg-white/5 flex items-center justify-center">
        <svelte:component this={icon} class="w-4.5 h-4.5 text-muted-foreground" />
      </div>
    {/if}
  </div>
  <div class="flex items-end justify-between">
    <div>
      <p class="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      {#if subtitle}
        <p class="text-xs text-muted-foreground mt-1">{subtitle}</p>
      {/if}
    </div>
    {#if trend}
      <div class="flex items-center gap-1">
        {#if trend === 'up'}
          <svg class="w-3.5 h-3.5 {DASHBOARD_CARD_TREND_COLORS[trend]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        {:else if trend === 'down'}
          <svg class="w-3.5 h-3.5 {DASHBOARD_CARD_TREND_COLORS[trend]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        {/if}
        <span class="text-xs font-medium {DASHBOARD_CARD_TREND_COLORS[trend]}">{trendLabel}</span>
      </div>
    {/if}
  </div>
  {#if children}
    <div class="mt-3">
      {@render children()}
    </div>
  {/if}
</div>

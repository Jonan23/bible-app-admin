<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { formatDate } from '$lib/utils/format';

  let {
    data = [] as { date: string; posts: number; videos: number }[],
    height = 200,
    class: className = '',
  }: {
    data?: { date: string; posts: number; videos: number }[];
    height?: number;
    class?: string;
  } = $props();

  let svgEl = $state<SVGSVGElement | null>(null);
  let hovered = $state<{ index: number; series: 'posts' | 'videos' } | null>(null);
  let tooltipPos = $state({ x: 0, y: 0 });

  let max = $derived(Math.max(...data.flatMap((d) => [d.posts, d.videos]), 1));
  let min = $derived(0);
  let range = $derived(max - min || 1);
  let w = 800;
  let pad = { top: 20, right: 20, bottom: 40, left: 40 };
  let cw = $derived(w - pad.left - pad.right);
  let ch = $derived(height - pad.top - pad.bottom);
  let barWidth = $derived(Math.max(4, (cw / data.length - 4) / 2));

  let yTicks = $derived(
    Array.from({ length: 5 }, (_, i) => {
      const val = min + (range * i) / 4;
      return { y: pad.top + ch - ((val - min) / range) * ch, label: val.toFixed(0) };
    })
  );

  function handlePointerEnter(index: number, series: 'posts' | 'videos') {
    hovered = { index, series };
  }

  function handlePointerLeave() {
    hovered = null;
  }

  function handlePointerMove(e: PointerEvent) {
    const svg = svgEl;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    tooltipPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function abbreviateDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
</script>

<div class={cn('relative w-full', className)}>
  {#if data.length > 0}
    <svg bind:this={svgEl} viewBox="0 0 {w} {height}" class="w-full" role="img" aria-label="Bar chart" onpointermove={handlePointerMove}>
      {#each yTicks as tick}
        <line
          x1={pad.left} y1={tick.y}
          x2={pad.left + cw} y2={tick.y}
          stroke="currentColor"
          class="text-border"
          stroke-width="1"
          stroke-dasharray="4 4"
        />
        <text x={pad.left - 8} y={tick.y + 4} text-anchor="end" class="fill-muted-foreground text-[10px]">
          {tick.label}
        </text>
      {/each}

      {#each data as d, i}
        {@const x = pad.left + (i / data.length) * cw + (cw / data.length - barWidth * 2) / 2}
        {@const postsH = (d.posts / max) * ch}
        {@const videosH = (d.videos / max) * ch}
        {@const postsY = pad.top + ch - postsH}
        {@const videosY = pad.top + ch - videosH}

        <rect
          x={x} y={postsY}
          width={barWidth}
          height={Math.max(postsH, 0)}
          class={cn(
            'fill-indigo-500 rounded-sm transition-opacity duration-150 cursor-pointer',
            hovered && (hovered.index !== i || hovered.series !== 'posts') && 'opacity-40',
          )}
          rx="2"
          role="graphics-symbol"
          aria-label="Posts: {d.posts}"
          onpointerenter={() => handlePointerEnter(i, 'posts')}
          onpointerleave={handlePointerLeave}
        />
        <rect
          x={x + barWidth + 2} y={videosY}
          width={barWidth}
          height={Math.max(videosH, 0)}
          class={cn(
            'fill-emerald-500 rounded-sm transition-opacity duration-150 cursor-pointer',
            hovered && (hovered.index !== i || hovered.series !== 'videos') && 'opacity-40',
          )}
          rx="2"
          role="graphics-symbol"
          aria-label="Videos: {d.videos}"
          onpointerenter={() => handlePointerEnter(i, 'videos')}
          onpointerleave={handlePointerLeave}
        />

        <text
          x={x + barWidth}
          y={pad.top + ch + 16}
          text-anchor="middle"
          class="fill-muted-foreground text-[9px]"
        >
          {abbreviateDate(d.date)}
        </text>
      {/each}
    </svg>

    {#if hovered !== null && data[hovered.index]}
      {@const d = data[hovered.index]}
      {@const val = d[hovered.series]}
      <div
        class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full -mt-2"
        style="left: {tooltipPos.x}px; top: {tooltipPos.y}px"
      >
        <div class="bg-foreground text-background text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
          <div>{abbreviateDate(d.date)}</div>
          <div class="font-bold">{hovered.series === 'posts' ? 'Posts' : 'Videos'}: {val}</div>
        </div>
      </div>
    {/if}
  {:else}
    <div class="flex items-center justify-center" style="height: {height}px">
      <span class="text-xs text-muted-foreground">No data available</span>
    </div>
  {/if}
</div>

<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    data = [] as { label: string; value: number; color: string }[],
    size = 200,
    class: className = '',
  }: {
    data?: { label: string; value: number; color: string }[];
    size?: number;
    class?: string;
  } = $props();

  let svgEl = $state<SVGSVGElement | null>(null);
  let hoveredIndex = $state<number | null>(null);
  let tooltipPos = $state({ x: 0, y: 0 });

  let total = $derived(data.reduce((s, d) => s + d.value, 0));
  let center = $derived(size / 2);
  let radius = $derived(size / 2 - 20);

  let slices = $derived.by(() => {
    let cumulative = 0;
    return data.map((d) => {
      const startAngle = total > 0 ? (cumulative / total) * 360 : 0;
      cumulative += d.value;
      const endAngle = total > 0 ? (cumulative / total) * 360 : 0;
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;
      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);
      const largeArc = endAngle - startAngle > 180 ? 1 : 0;
      const path = total > 0 ? `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z` : '';
      return { ...d, path, percentage: total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0' };
    });
  });

  function handlePointerEnter(i: number) {
    hoveredIndex = i;
  }

  function handlePointerLeave() {
    hoveredIndex = null;
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
</script>

<div class={cn('relative flex items-center gap-6', className)}>
  {#if data.length > 0}
    <div class="flex-shrink-0">
      <svg bind:this={svgEl} width={size} height={size} role="img" aria-label="Pie chart" onpointermove={handlePointerMove}>
        {#each slices as slice, i}
          <path
            d={slice.path}
            fill={slice.color}
            stroke="white"
            stroke-width="2"
            role="graphics-symbol"
            aria-label="{slice.label}: {slice.percentage}%"
            class="cursor-pointer transition-opacity duration-150"
            class:opacity-70={hoveredIndex !== null && hoveredIndex !== i}
            class:opacity-100={hoveredIndex === null || hoveredIndex === i}
            onpointerenter={() => handlePointerEnter(i)}
            onpointerleave={handlePointerLeave}
          />
        {/each}
        <circle cx={center} cy={center} r={radius * 0.5} class="fill-background" />
        <text x={center} y={center} text-anchor="middle" dominant-baseline="middle" class="fill-foreground text-lg font-bold">
          {total}
        </text>
      </svg>
    </div>
    <div class="space-y-2">
      {#each slices as slice, i}
        <div
          class="flex items-center gap-2 cursor-pointer transition-opacity duration-150"
          class:opacity-70={hoveredIndex !== null && hoveredIndex !== i}
          class:opacity-100={hoveredIndex === null || hoveredIndex === i}
          role="button"
          tabindex="-1"
          onpointerenter={() => handlePointerEnter(i)}
          onpointerleave={handlePointerLeave}
        >
          <div class="w-3 h-3 rounded-full" style="background-color: {slice.color}"></div>
          <span class="text-xs text-muted-foreground">{slice.label}</span>
          <span class="text-xs font-semibold text-foreground">{slice.percentage}%</span>
        </div>
      {/each}
    </div>

    {#if hoveredIndex !== null && slices[hoveredIndex]}
      {@const s = slices[hoveredIndex]}
      <div
        class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full -mt-2"
        style="left: {tooltipPos.x}px; top: {tooltipPos.y}px"
      >
        <div class="bg-foreground text-background text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
          <div>{s.label}</div>
          <div class="font-bold">{s.value} ({s.percentage}%)</div>
        </div>
      </div>
    {/if}
  {:else}
    <div class="text-sm text-muted-foreground">No data available</div>
  {/if}
</div>

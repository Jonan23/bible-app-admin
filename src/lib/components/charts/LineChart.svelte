<script lang="ts">
  import { cn } from '$lib/utils/cn';

  let {
    data = [] as { date: string; value: number }[],
    height = 200,
    color = 'stroke-indigo-500',
    fillColor = 'fill-indigo-500/10',
    showGrid = true,
    showDots = true,
    hideAxes = false,
    class: className = '',
  }: {
    data?: { date: string; value: number }[];
    height?: number;
    color?: string;
    fillColor?: string;
    showGrid?: boolean;
    showDots?: boolean;
    hideAxes?: boolean;
    class?: string;
  } = $props();

  let svgEl = $state<SVGSVGElement | null>(null);
  let hoveredIndex = $state<number | null>(null);
  let tooltipPos = $state({ x: 0, y: 0 });

  let values = $derived(data.map((d) => d.value));
  let max = $derived(Math.max(...values, 1));
  let min = $derived(Math.min(...values, 0));
  let range = $derived(max - min || 1);
  let width = $derived(800);
  let padding = { top: 20, right: 20, bottom: 30, left: 40 };
  let chartWidth = $derived(width - padding.left - padding.right);
  let chartHeight = $derived(height - padding.top - padding.bottom);

  let points = $derived(
    data.map((d, i) => {
      const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.value - min) / range) * chartHeight;
      return { x, y, ...d };
    })
  );

  let pathD = $derived(
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  );

  let areaD = $derived(
    pathD + ` L ${points[points.length - 1]?.x || 0} ${padding.top + chartHeight} L ${points[0]?.x || 0} ${padding.top + chartHeight} Z`
  );

  let yTicks = $derived(
    Array.from({ length: 5 }, (_, i) => {
      const val = min + (range * i) / 4;
      return { y: padding.top + chartHeight - (val - min) / range * chartHeight, label: val.toFixed(0) };
    })
  );

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

<div class={cn('relative w-full', className)}>
  {#if data.length > 0}
    <svg bind:this={svgEl} viewBox="0 0 {width} {height}" class="w-full" role="img" aria-label="Line chart" onpointermove={handlePointerMove}>
      {#if showGrid && !hideAxes}
        {#each yTicks as tick}
          <line
            x1={padding.left} y1={tick.y}
            x2={padding.left + chartWidth} y2={tick.y}
            stroke="currentColor"
            class="text-border"
            stroke-width="1"
            stroke-dasharray="4 4"
          />
          <text x={padding.left - 8} y={tick.y + 4} text-anchor="end" class="fill-muted-foreground text-[10px]">
            {tick.label}
          </text>
        {/each}
      {/if}

      <g>
        <path d={areaD} class={fillColor} />
        <path d={pathD} class={cn(color, 'fill-none')} stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      </g>

      {#if showDots}
        {#each points as p, i}
          <circle
            cx={p.x} cy={p.y}
            r={hoveredIndex === i ? 6 : 4}
            class={cn(
              color.replace('stroke', 'fill'),
              'stroke-background cursor-pointer transition-all duration-150',
              hoveredIndex === i ? 'stroke-2' : 'stroke-1',
            )}
            stroke-width="2"
            role="graphics-symbol"
            aria-label="Data point: {p.date}, {p.value}"
            onpointerenter={() => handlePointerEnter(i)}
            onpointerleave={handlePointerLeave}
          />
        {/each}
      {/if}
    </svg>

    {#if hoveredIndex !== null && points[hoveredIndex]}
      {@const p = points[hoveredIndex]}
      <div
        class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full -mt-2"
        style="left: {tooltipPos.x}px; top: {tooltipPos.y}px"
      >
        <div class="bg-foreground text-background text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
          <div>{p.date}</div>
          <div class="font-bold">{p.value.toLocaleString()}</div>
        </div>
      </div>
    {/if}
  {:else}
    <div class="flex items-center justify-center" style="height: {height}px">
      <span class="text-xs text-muted-foreground">No data available</span>
    </div>
  {/if}
</div>

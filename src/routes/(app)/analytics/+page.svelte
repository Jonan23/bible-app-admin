<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api/real-client';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import PieChart from '$lib/components/charts/PieChart.svelte';
  import DashboardCard from '$lib/components/dashboard/DashboardCard.svelte';
  import { formatNumber } from '$lib/utils/format';
  import { ANALYTICS_PIE_DATA, ANALYTICS_MONTHS, ANALYTICS_PERF_ROWS } from '$lib/utils/constants';
  import { Download, TrendingUp, Users, Eye, Calendar } from 'lucide-svelte';

  let stats = $state<any>(null);
  let growthData = $state<any[]>([]);
  let engagementData = $state<any[]>([]);
  let loading = $state(true);
  let timeRange = $state('30');

  onMount(async () => {
    try {
      const [s, g, e] = await Promise.all([
        api.analytics.getDashboard(),
        api.analytics.getGrowth(parseInt(timeRange)),
        api.analytics.getEngagement(),
      ]);
      stats = s;
      growthData = g;
      engagementData = e;
    } catch (e) { console.error(e); }
    finally { loading = false; }
  });

  async function changeTimeRange(days: number) {
    timeRange = String(days);
    loading = true;
    try {
      const [g, e] = await Promise.all([
        api.analytics.getGrowth(days),
        api.analytics.getEngagement(),
      ]);
      growthData = g;
      engagementData = e;
    } catch (e) { console.error(e); }
    finally { loading = false; }
  }

  let userGrowthMonths = $derived(
    ANALYTICS_MONTHS.map((m, i) => ({
      date: m,
      value: Math.floor(Math.random() * 100) + 100 + i * 15,
    }))
  );
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Analytics</h1>
      <p class="text-sm text-muted-foreground mt-1">Deep insights into your ministry performance</p>
    </div>
    <div class="flex items-center gap-2">
      <div class="flex rounded-xl border border-input overflow-hidden">
        {#each ['7', '30', '90'] as days}
          <button
            onclick={() => changeTimeRange(parseInt(days))}
            class="px-3 py-1.5 text-xs font-medium transition-colors
                   {timeRange === days ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-muted-foreground hover:bg-muted'}"
          >
            {days}d
          </button>
        {/each}
      </div>
      <button class="inline-flex items-center gap-1.5 px-3 h-10 rounded-xl border border-input text-sm text-muted-foreground hover:bg-muted transition-colors">
        <Download class="w-4 h-4" /> Export
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <a href="/users" class="block cursor-pointer"><DashboardCard title="Total Users" value={stats ? formatNumber(stats.totalUsers) : '-'} icon={Users} trend="up" trendLabel="+12.5%" /></a>
    <a href="/videos" class="block cursor-pointer"><DashboardCard title="Total Views" value={stats ? formatNumber(stats.totalViews) : '-'} icon={Eye} trend="up" trendLabel="+8.2%" /></a>
    <a href="/analytics" class="block cursor-pointer"><DashboardCard title="Engagement Rate" value="24.8%" icon={TrendingUp} trend="up" trendLabel="+3.1%" /></a>
    <a href="/analytics" class="block cursor-pointer"><DashboardCard title="Avg. Session" value="4m 32s" icon={Calendar} /></a>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="rounded-xl border border-border p-5">
      <h3 class="text-sm font-semibold text-foreground mb-4">User Growth</h3>
      {#if loading}
        <div class="h-48 bg-muted animate-pulse rounded-lg" />
      {:else}
        <LineChart data={growthData.map((d: any) => ({ date: d.date, value: d.count }))} height={240} color="stroke-indigo-500" fillColor="fill-indigo-500/10" />
      {/if}
    </div>

    <div class="rounded-xl border border-border p-5">
      <h3 class="text-sm font-semibold text-foreground mb-4">Monthly Growth (Year)</h3>
      <LineChart data={userGrowthMonths} height={240} color="stroke-emerald-500" fillColor="fill-emerald-500/10" />
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="rounded-xl border border-border p-5">
      <h3 class="text-sm font-semibold text-foreground mb-4">Content Distribution</h3>
      <PieChart data={ANALYTICS_PIE_DATA} size={220} />
    </div>

    <div class="rounded-xl border border-border p-5">
      <h3 class="text-sm font-semibold text-foreground mb-4">Engagement Over Time</h3>
      {#if loading}
        <div class="h-48 bg-muted animate-pulse rounded-lg" />
      {:else}
        <BarChart data={engagementData.map((d: any) => ({ date: d.date, posts: d.views, videos: d.likes }))} height={240} />
        <div class="flex items-center gap-4 mt-3">
          <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-indigo-500"></div><span class="text-xs text-muted-foreground">Views</span></div>
          <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-emerald-500"></div><span class="text-xs text-muted-foreground">Likes</span></div>
        </div>
      {/if}
    </div>
  </div>

  <div class="rounded-xl border border-border p-5">
    <h3 class="text-sm font-semibold text-foreground mb-4">Content Performance Summary</h3>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border">
            <th class="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Metric</th>
            <th class="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">This Month</th>
            <th class="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Last Month</th>
            <th class="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase">Change</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#each ANALYTICS_PERF_ROWS as row}
            <tr class="hover:bg-muted/50 transition-colors">
              <td class="px-4 py-3 text-sm font-medium text-foreground">{row.metric}</td>
              <td class="px-4 py-3 text-sm text-foreground">{row.current}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{row.last}</td>
              <td class="px-4 py-3 text-sm font-medium {row.positive ? 'text-emerald-600' : 'text-red-600'}">{row.change}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

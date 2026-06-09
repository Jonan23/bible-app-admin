<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api/real-client';
  import { formatRelativeTime, formatNumber } from '$lib/utils/format';
  import { DASHBOARD_QUICK_ACTIONS, ENGAGEMENT_LEGENDS, CONTENT_GROWTH_LEGENDS } from '$lib/utils/constants';
  import DashboardCard from '$lib/components/dashboard/DashboardCard.svelte';
  import AnimatedCounter from '$lib/components/dashboard/AnimatedCounter.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import StatusBadge from '$lib/components/shared/StatusBadge.svelte';
  import LoadingSkeleton from '$lib/components/shared/LoadingSkeleton.svelte';
  import {
    Users, FileText, Video, Calendar, Bell, ArrowUpRight,
    Activity, Upload, UserPlus, Megaphone, BarChart3, ArrowUpRight as ArrowUpRightIcon,
  } from 'lucide-svelte';

  const quickActionIcons: Record<string, any> = {
    FileText, Upload, Calendar, Megaphone,
  };

  let stats = $state<any>(null);
  let loading = $state(true);

  onMount(async () => {
    try {
      stats = await api.analytics.getDashboard();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  });
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Dashboard</h1>
      <p class="text-sm text-muted-foreground mt-1">Overview of your ministry analytics</p>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-xs text-muted-foreground">Last 30 days</span>
    </div>
  </div>

  {#if loading}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each Array(4) as _}
        <div class="rounded-xl border border-border p-5">
          <LoadingSkeleton count={3} class="h-4 mb-2" />
        </div>
      {/each}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="rounded-xl border border-border p-5 h-64"><LoadingSkeleton count={6} class="h-4 mb-2" /></div>
      <div class="rounded-xl border border-border p-5 h-64"><LoadingSkeleton count={6} class="h-4 mb-2" /></div>
    </div>
  {:else if stats}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <a href="/users" class="block cursor-pointer">
        <DashboardCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          subtitle={stats.activeUsers + ' active'}
          icon={Users}
          trend="up"
          trendLabel={`+${stats.userGrowth}%`}
        />
      </a>
      <a href="/blog" class="block cursor-pointer">
        <DashboardCard
          title="Blog Posts"
          value={formatNumber(stats.totalBlogPosts)}
          subtitle={stats.postGrowth + '% increase'}
          icon={FileText}
          trend="up"
          trendLabel={`+${stats.postGrowth}%`}
        />
      </a>
      <a href="/videos" class="block cursor-pointer">
        <DashboardCard
          title="Sermons"
          value={formatNumber(stats.totalSermons)}
          subtitle={stats.sermonGrowth + '% growth'}
          icon={Video}
          trend="up"
          trendLabel={`+${stats.sermonGrowth}%`}
        />
      </a>
      <a href="/events" class="block cursor-pointer">
        <DashboardCard
          title="Upcoming Events"
          value={String(stats.upcomingEvents)}
          subtitle={stats.totalNotifications + ' notifications'}
          icon={Calendar}
          variant="primary"
        />
      </a>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 rounded-xl border border-border p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-foreground">User Growth</h3>
          <span class="text-xs text-muted-foreground">+{stats.userGrowth}% this month</span>
        </div>
        <LineChart
          data={stats.userGrowthData.map((d: any) => ({ date: d.date, value: d.count }))}
          height={220}
          color="stroke-indigo-500"
          fillColor="fill-indigo-500/10"
        />
      </div>

      <div class="rounded-xl border border-border p-5">
        <h3 class="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
        <div class="space-y-2">
          {#each DASHBOARD_QUICK_ACTIONS as action}
            {@const Icon = quickActionIcons[action.icon]}
            <a
              href={action.href}
              class="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div class="w-9 h-9 rounded-xl bg-background dark:bg-white/5 flex items-center justify-center">
                <svelte:component this={Icon} class="w-4 h-4 {action.color}" />
              </div>
              <span class="text-sm font-medium text-foreground flex-1">{action.label}</span>
              <ArrowUpRightIcon class="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          {/each}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="rounded-xl border border-border p-5">
        <h3 class="text-sm font-semibold text-foreground mb-4">Content Published (Last 30 Days)</h3>
        <BarChart data={stats.contentGrowthData} height={200} />
        <div class="flex items-center gap-4 mt-3">
          {#each CONTENT_GROWTH_LEGENDS as legend}
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded-sm {legend.color}"></div>
              <span class="text-xs text-muted-foreground">{legend.label}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="rounded-xl border border-border p-5">
        <h3 class="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
        <div class="space-y-3">
          {#each stats.recentActivity.slice(0, 6) as log}
            <div class="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
              <div class="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <Activity class="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm text-foreground truncate">
                  <span class="font-medium">{log.user.name}</span>
                  {' '}{log.action.replace(/_/g, ' ')}
                </p>
                <p class="text-xs text-muted-foreground mt-0.5">
                  {formatRelativeTime(log.createdAt)}
                </p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-border p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-foreground">Engagement Overview</h3>
        <div class="flex items-center gap-3">
          {#each ENGAGEMENT_LEGENDS as legend}
            <div class="flex items-center gap-1.5">
              <div class="w-2.5 h-2.5 rounded-full {legend.color}"></div>
              <span class="text-xs text-muted-foreground">{legend.label}</span>
            </div>
          {/each}
        </div>
      </div>
      <div class="relative h-64">
        <LineChart
          data={stats.engagementData.map((d: any) => ({ date: d.date, value: d.views }))}
          height={220}
          color="stroke-indigo-500"
          fillColor="fill-indigo-500/10"
          showDots={false}
          class="absolute inset-0"
        />
        <LineChart
          data={stats.engagementData.map((d: any) => ({ date: d.date, value: d.likes }))}
          height={220}
          color="stroke-emerald-500"
          fillColor="fill-emerald-500/10"
          showDots={false}
          hideAxes={true}
          showGrid={false}
          class="absolute inset-0"
        />
        <LineChart
          data={stats.engagementData.map((d: any) => ({ date: d.date, value: d.comments }))}
          height={220}
          color="stroke-amber-500"
          fillColor="fill-amber-500/10"
          showDots={false}
          hideAxes={true}
          showGrid={false}
          class="absolute inset-0"
        />
      </div>
    </div>
  {/if}
</div>

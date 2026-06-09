<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-svelte';

  interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (item: T) => string;
  }

  let {
    tableData = [],
    columns = [] as Column<any>[],
    page = 1,
    totalPages = 1,
    total = 0,
    limit = 10,
    sortBy = '',
    sortOrder = 'asc' as 'asc' | 'desc',
    loading = false,
    selectable = false,
    selected = [] as string[],
    onsort,
    onpage,
    onselect,
    onrowclick,
    children,
    emptyTitle = 'No data found',
    emptyDescription = '',
    class: className = '',
  }: {
    tableData?: any[];
    columns?: Column<any>[];
    page?: number;
    totalPages?: number;
    total?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    loading?: boolean;
    selectable?: boolean;
    selected?: string[];
    onsort?: (key: string) => void;
    onpage?: (page: number) => void;
    onselect?: (ids: string[]) => void;
    onrowclick?: (item: any) => void;
    children?: import('svelte').Snippet<[any]>;
    emptyTitle?: string;
    emptyDescription?: string;
    class?: string;
  } = $props();

  function toggleSort(key: string) {
    if (sortBy === key) {
      onsort?.(key);
    } else {
      onsort?.(key);
    }
  }

  function toggleSelectAll() {
    if (selected.length === tableData.length) {
      onselect?.([]);
    } else {
      onselect?.(tableData.map((d: any) => d.id));
    }
  }

  function toggleSelect(id: string) {
    if (selected.includes(id)) {
      onselect?.(selected.filter((s) => s !== id));
    } else {
      onselect?.([...selected, id]);
    }
  }

  function getSortIcon(key: string) {
    if (sortBy !== key) return ChevronsUpDown;
    return sortOrder === 'asc' ? ChevronUp : ChevronDown;
  }
</script>

<div class={cn('w-full overflow-hidden', className)}>
  <div class="overflow-x-auto rounded-xl border border-border">
    <table class="w-full">
      <thead>
        <tr class="border-b border-border bg-muted/50">
          {#if selectable}
            <th class="px-4 py-3 text-left w-10">
              <input
                type="checkbox"
                checked={selected.length === tableData.length && tableData.length > 0}
                onchange={toggleSelectAll}
                class="rounded border-border text-indigo-600 focus:ring-indigo-500"
              />
            </th>
          {/if}
          {#each columns as col}
            <th
              class={cn(
                'px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                col.sortable && 'cursor-pointer hover:text-foreground select-none',
              )}
              style={col.width ? `width: ${col.width}` : ''}
              onclick={col.sortable ? () => toggleSort(col.key) : undefined}
            >
              <div class="flex items-center gap-1">
                {col.label}
                {#if col.sortable}
                  <svelte:component this={getSortIcon(col.key)} class="w-3.5 h-3.5" />
                {/if}
              </div>
            </th>
          {/each}
          {#if children}
            <th class="px-4 py-3 text-right w-16">
              <span class="text-xs font-semibold text-muted-foreground uppercase">Actions</span>
            </th>
          {/if}
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        {#if loading}
          {#each Array(5) as _, i}
            <tr>
              {#if selectable}<td class="px-4 py-3"><div class="h-4 w-4 rounded bg-muted animate-pulse"></div></td>{/if}
              {#each columns as col}
                <td class="px-4 py-3">
                  <div class="h-4 bg-muted rounded animate-pulse" style="width: {Math.random() * 40 + 20}%"></div>
                </td>
              {/each}
              {#if children}<td class="px-4 py-3"><div class="h-4 w-8 bg-muted rounded animate-pulse ml-auto"></div></td>{/if}
            </tr>
          {/each}
        {:else if tableData.length === 0}
          <tr>
            <td colspan={columns.length + (selectable ? 1 : 0) + (children ? 1 : 0)}>
              <div class="flex flex-col items-center justify-center py-12">
                <div class="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p class="text-sm font-medium text-foreground">{emptyTitle}</p>
                {#if emptyDescription}
                  <p class="text-xs text-muted-foreground mt-1">{emptyDescription}</p>
                {/if}
              </div>
            </td>
          </tr>
        {:else}
          {#each tableData as item, i}
            <tr
              class={cn(
                'hover:bg-muted/50 transition-colors',
                onrowclick && 'cursor-pointer',
              )}
              onclick={onrowclick ? () => onrowclick(item) : undefined}
            >
              {#if selectable}
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onchange={() => toggleSelect(item.id)}
                    class="rounded border-border text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
              {/if}
              {#each columns as col}
                <td class="px-4 py-3 text-sm text-foreground">
                  {#if col.render}
                    {@html col.render(item)}
                  {:else}
                    {item[col.key] ?? '-'}
                  {/if}
                </td>
              {/each}
              {#if children}
                <td class="px-4 py-3 text-right">
                  {@render children(item)}
                </td>
              {/if}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  {#if totalPages > 1}
    <div class="flex items-center justify-between px-4 py-3 border-t border-border mt-0.5">
      <p class="text-xs text-muted-foreground">
        Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total}
      </p>
      <div class="flex items-center gap-1">
        <button
          onclick={() => onpage?.(page - 1)}
          disabled={page <= 1}
          class="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft class="w-4 h-4"></ChevronLeft>
        </button>
        {#each Array(totalPages) as _, i}
          <button
            onclick={() => onpage?.(i + 1)}
            class={cn(
              'w-8 h-8 rounded-lg text-xs font-medium transition-colors',
              page === i + 1
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {i + 1}
          </button>
        {/each}
        <button
          onclick={() => onpage?.(page + 1)}
          disabled={page >= totalPages}
          class="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight class="w-4 h-4"></ChevronRight>
        </button>
      </div>
    </div>
  {/if}
</div>

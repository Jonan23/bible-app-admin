<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { getInitials } from '$lib/utils/format';
  import { AVATAR_SIZES } from '$lib/utils/constants';

  let {
    src = null,
    name = 'User',
    size = 'md',
    class: className = '',
  }: {
    src?: string | null;
    name?: string;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  } = $props();
</script>

{#if src}
  <img
    src={src}
    alt={name}
    class={cn('rounded-full object-cover', AVATAR_SIZES[size], className)}
  />
{:else}
  <div class={cn('rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-medium text-indigo-700 dark:text-indigo-300', AVATAR_SIZES[size], className)}>
    {getInitials(name)}
  </div>
{/if}

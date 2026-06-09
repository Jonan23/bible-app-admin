<script lang="ts">
  import { api } from '$lib/api/real-client';
  import { Upload, Loader2 } from 'lucide-svelte';

  let { value = $bindable(''), label = 'Upload', accept = 'image/*' }: {
    value?: string;
    label?: string;
    accept?: string;
  } = $props();

  let uploading = $state(false);
  let inputRef: HTMLInputElement | undefined = $state();

  async function handleFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploading = true;
    try {
      const media = await api.media.upload(file);
      value = media.url;
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      uploading = false;
      if (inputRef) inputRef.value = '';
    }
  }
</script>

<div class="flex items-center gap-2">
  <input
    type="file"
    accept={accept}
    bind:this={inputRef}
    onchange={handleFile}
    class="hidden"
  />
  <button
    type="button"
    onclick={() => inputRef?.click()}
    disabled={uploading}
    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
           border border-input bg-background text-foreground hover:bg-muted
           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    {#if uploading}
      <Loader2 class="w-3.5 h-3.5 animate-spin" />
      Uploading...
    {:else}
      <Upload class="w-3.5 h-3.5" />
      {label}
    {/if}
  </button>
  {#if value}
    <span class="text-xs text-muted-foreground truncate max-w-[200px]">Uploaded</span>
  {/if}
</div>

<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Bold, Italic, List, Heading1, Heading2, Quote, Code } from 'lucide-svelte';

  let {
    value = $bindable(''),
    placeholder = 'Write your content here...',
    onchange,
    class: className = '',
  }: {
    value?: string;
    placeholder?: string;
    onchange?: (val: string) => void;
    class?: string;
  } = $props();

  function wrapText(prefix: string, suffix: string) {
    const textarea = document.querySelector('#editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const newText = value.substring(0, start) + prefix + selected + suffix + value.substring(end);
    value = newText;
    onchange?.(value);
  }

  function insertBlock(block: string) {
    value = value + '\n\n' + block + ' ';
    onchange?.(value);
  }
</script>

<div class={cn('rounded-xl border border-input overflow-hidden', className)}>
  <div class="flex items-center gap-0.5 px-2 py-1.5 border-b border-input bg-muted/30">
    <button
      onclick={() => wrapText('**', '**')}
      class="p-1.5 rounded hover:bg-muted transition-colors"
      title="Bold"
    >
      <Bold class="w-4 h-4 text-muted-foreground" />
    </button>
    <button
      onclick={() => wrapText('*', '*')}
      class="p-1.5 rounded hover:bg-muted transition-colors"
      title="Italic"
    >
      <Italic class="w-4 h-4 text-muted-foreground" />
    </button>
    <span class="w-px h-5 bg-border mx-1"></span>
    <button
      onclick={() => insertBlock('## ')}
      class="p-1.5 rounded hover:bg-muted transition-colors"
      title="Heading 2"
    >
      <Heading2 class="w-4 h-4 text-muted-foreground" />
    </button>
    <button
      onclick={() => insertBlock('# ')}
      class="p-1.5 rounded hover:bg-muted transition-colors"
      title="Heading 1"
    >
      <Heading1 class="w-4 h-4 text-muted-foreground" />
    </button>
    <span class="w-px h-5 bg-border mx-1"></span>
    <button
      onclick={() => insertBlock('- ')}
      class="p-1.5 rounded hover:bg-muted transition-colors"
      title="List"
    >
      <List class="w-4 h-4 text-muted-foreground" />
    </button>
    <button
      onclick={() => insertBlock('> ')}
      class="p-1.5 rounded hover:bg-muted transition-colors"
      title="Blockquote"
    >
      <Quote class="w-4 h-4 text-muted-foreground" />
    </button>
    <button
      onclick={() => wrapText('`', '`')}
      class="p-1.5 rounded hover:bg-muted transition-colors"
      title="Code"
    >
      <Code class="w-4 h-4 text-muted-foreground" />
    </button>
  </div>
  <textarea
    id="editor-textarea"
    bind:value
    oninput={() => onchange?.(value)}
    placeholder={placeholder}
    class="w-full min-h-[300px] p-4 text-sm text-foreground bg-background
           placeholder:text-muted-foreground resize-y
           focus:outline-none"
  ></textarea>
</div>

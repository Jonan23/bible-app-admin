<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { api } from '$lib/api/real-client';
  import RichTextEditor from '$lib/components/forms/RichTextEditor.svelte';
  import UploadButton from '$lib/components/shared/UploadButton.svelte';
  import { slugify } from '$lib/utils/format';
  import type { Category, Tag } from '$lib/types';
  import { ArrowLeft, Send, Loader2 } from 'lucide-svelte';

  let title = $state('');
  let slug = $state('');
  let content = $state('');
  let excerpt = $state('');
  let featuredImage = $state('');
  let categoryId = $state('');
  let featured = $state(false);
  let selectedTags = $state<string[]>([]);

  let categories = $state<Category[]>([]);
  let tags = $state<Tag[]>([]);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');

  onMount(async () => {
    try {
      const [cats, t] = await Promise.all([
        api.categories.list('BLOG'),
        api.tags.list(),
      ]);
      categories = cats;
      tags = t;
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  });

  function autoSlug() {
    if (title) slug = slugify(title);
  }

  async function handleSave(publish: boolean) {
    error = '';
    if (!title || title.length < 5) { error = 'Title must be at least 5 characters'; return; }
    if (!content || content.length < 50) { error = 'Content must be at least 50 characters'; return; }
    saving = true;
    try {
      await api.blog.create({
        title, slug: slug || slugify(title), content,
        excerpt: excerpt || undefined,
        featuredImage: featuredImage || undefined,
        categoryId: categoryId || undefined,
        tags: selectedTags, status: publish ? 'PUBLISHED' : 'DRAFT', featured,
      });
      goto('/blog');
    } catch (e: any) {
      error = e.message || 'Failed to save';
    } finally {
      saving = false;
    }
  }

  function toggleTag(tagId: string) {
    if (selectedTags.includes(tagId)) selectedTags = selectedTags.filter((t) => t !== tagId);
    else selectedTags = [...selectedTags, tagId];
  }
</script>

<div class="max-w-3xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <button onclick={() => goto('/blog')} class="p-2 rounded-lg hover:bg-muted transition-colors">
        <ArrowLeft class="w-4 h-4 text-muted-foreground" />
      </button>
      <div>
        <h1 class="text-xl font-bold text-foreground">New Blog Post</h1>
        <p class="text-sm text-muted-foreground">Create a new blog post for your ministry</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button
        onclick={() => handleSave(false)}
        disabled={saving}
        class="inline-flex items-center gap-2 px-4 h-10 rounded-xl border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >{saving ? 'Saving...' : 'Save Draft'}</button>
      <button
        onclick={() => handleSave(true)}
        disabled={saving}
        class="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        {#if saving}<Loader2 class="w-4 h-4 animate-spin" />{:else}<Send class="w-4 h-4" />{/if}
        Publish
      </button>
    </div>
  </div>

  {#if error}
    <div class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <p class="text-sm text-red-700 dark:text-red-400">{error}</p>
    </div>
  {/if}

  {#if loading}
    <div class="space-y-4">{#each Array(5) as _}<div class="h-10 rounded-xl bg-muted animate-pulse" />{/each}</div>
  {:else}
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Title</label>
        <input type="text" bind:value={title} oninput={autoSlug} placeholder="Enter post title"
          class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Slug</label>
          <input type="text" bind:value={slug} placeholder="post-url-slug"
            class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1.5">Category</label>
          <select bind:value={categoryId}
            class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select category</option>
            {#each categories as cat}<option value={cat.id}>{cat.name}</option>{/each}
          </select>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Excerpt</label>
        <textarea bind:value={excerpt} placeholder="Brief description of the post..." rows="2"
          class="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Featured Image</label>
        <div class="flex gap-2">
          <input type="url" bind:value={featuredImage} placeholder="https://images.unsplash.com/photo-..."
            class="flex-1 h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <UploadButton bind:value={featuredImage} label="Upload" accept="image/*" />
        </div>
        {#if featuredImage}<img src={featuredImage} alt="preview" class="mt-2 h-32 w-auto rounded-lg object-cover border border-border" />{/if}
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-1.5">Content</label>
        <RichTextEditor bind:value={content} onchange={(v) => content = v} />
      </div>
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">Tags</label>
        <div class="flex flex-wrap gap-2">
          {#each tags as tag}
            <button onclick={() => toggleTag(tag.id)}
              class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                     {selectedTags.includes(tag.id)
                       ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800'
                       : 'bg-background text-muted-foreground border-input hover:border-indigo-300'}">
              {tag.name}
            </button>
          {/each}
        </div>
      </div>
      <label class="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg hover:bg-muted transition-colors">
        <input type="checkbox" bind:checked={featured} class="rounded border-border text-indigo-600 focus:ring-indigo-500" />
        <div>
          <span class="text-sm font-medium text-foreground">Featured post</span>
          <p class="text-xs text-muted-foreground">Featured posts appear at the top of the blog listing</p>
        </div>
      </label>
    </div>
  {/if}
</div>

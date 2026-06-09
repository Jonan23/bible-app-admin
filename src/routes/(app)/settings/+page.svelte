<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api/real-client';
  import { cn } from '$lib/utils/cn';
  import { SETTINGS_TABS, SETTINGS_DEFAULTS, SETTINGS_KEY_MAP } from '$lib/utils/constants';
  import { Save, Loader2, CheckCircle2, Upload } from 'lucide-svelte';

  let loading = $state(true);
  let activeTab = $state('branding');

  let branding = $state({ ...SETTINGS_DEFAULTS.branding });
  let contact = $state({ ...SETTINGS_DEFAULTS.contact });
  let social = $state({ ...SETTINGS_DEFAULTS.social });
  let themeSettings = $state({ ...SETTINGS_DEFAULTS.theme });
  let notifPrefs = $state({ ...SETTINGS_DEFAULTS.notifPrefs });
  let featureFlags = $state<Record<string, boolean>>({ ...SETTINGS_DEFAULTS.featureFlags });

  let saving = $state(false);
  let saved = $state(false);

  onMount(async () => {
    try {
      const all = await api.settings.getAll() as Record<string, any>;
      if (all.app_branding) branding = { ...branding, ...all.app_branding };
      if (all.contact_details) contact = { ...contact, ...all.contact_details };
      if (all.social_media) social = { ...social, ...all.social_media };
      if (all.theme_settings) themeSettings = { ...themeSettings, ...all.theme_settings };
      if (all.notification_preferences) notifPrefs = { ...notifPrefs, ...all.notification_preferences };
      if (all.feature_flags) featureFlags = { ...featureFlags, ...all.feature_flags };
    } catch (e) { console.error(e); }
    finally { loading = false; }
  });

  async function handleSave() {
    saving = true; saved = false;
    try {
      const stateMap: Record<string, any> = { branding, contact, social, theme: themeSettings, notifications: notifPrefs, featureFlags };
      for (const [tab, stateVal] of Object.entries(stateMap)) {
        const [key] = SETTINGS_KEY_MAP[tab];
        await api.settings.update(key, stateVal as any);
      }
      saved = true;
      setTimeout(() => saved = false, 3000);
    } catch (e) { console.error(e); }
    finally { saving = false; }
  }
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-foreground">Settings</h1>
      <p class="text-sm text-muted-foreground mt-1">Manage your app configuration</p>
    </div>
    <div class="flex items-center gap-2">
      {#if saved}
        <span class="inline-flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 class="w-4 h-4" /> Saved
        </span>
      {/if}
      <button onclick={handleSave} disabled={saving}
        class="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
        {#if saving}<Loader2 class="w-4 h-4 animate-spin" />{/if}
        <Save class="w-4 h-4" /> Save Changes
      </button>
    </div>
  </div>

  <div class="flex gap-1 rounded-xl border border-input p-1 bg-muted/30">
    {#each SETTINGS_TABS as tab}
      <button
        onclick={() => activeTab = tab.id}
        class={cn(
          'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          activeTab === tab.id
            ? 'bg-card text-foreground shadow-sm border border-border'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  {#if loading}
    <div class="space-y-4">{#each Array(6) as _}<div class="h-10 rounded-xl bg-muted animate-pulse" />{/each}</div>
  {:else}
    <div class="rounded-xl border border-border p-6">
      {#if activeTab === 'branding'}
        <div class="space-y-4">
          <h3 class="text-base font-semibold text-foreground">App Branding</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">App Name</label>
              <input type="text" bind:value={branding.appName} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Primary Color</label>
              <div class="flex items-center gap-2">
                <input type="color" bind:value={branding.primaryColor} class="w-11 h-11 rounded-xl border border-input cursor-pointer" />
                <input type="text" bind:value={branding.primaryColor} class="flex-1 h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">Tagline</label>
            <input type="text" bind:value={branding.appTagline} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">Logo URL</label>
            <input type="url" bind:value={branding.logo} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            {#if branding.logo}<img src={branding.logo} alt="logo" class="mt-2 h-16 w-auto" />{/if}
          </div>
        </div>

      {:else if activeTab === 'contact'}
        <div class="space-y-4">
          <h3 class="text-base font-semibold text-foreground">Contact Details</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input type="email" bind:value={contact.email} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Phone</label>
              <input type="tel" bind:value={contact.phone} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">Address</label>
            <input type="text" bind:value={contact.address} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">Website</label>
            <input type="url" bind:value={contact.website} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

      {:else if activeTab === 'social'}
        <div class="space-y-4">
          <h3 class="text-base font-semibold text-foreground">Social Media Links</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Facebook</label>
              <input type="url" bind:value={social.facebook} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Instagram</label>
              <input type="url" bind:value={social.instagram} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">YouTube</label>
              <input type="url" bind:value={social.youtube} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Twitter/X</label>
              <input type="url" bind:value={social.twitter} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        </div>

      {:else if activeTab === 'theme'}
        <div class="space-y-4">
          <h3 class="text-base font-semibold text-foreground">Theme Settings</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Default Theme</label>
              <select bind:value={themeSettings.defaultTheme} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Primary Font</label>
              <select bind:value={themeSettings.primaryFont} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="Inter">Inter</option>
                <option value="System">System</option>
              </select>
            </div>
          </div>
          <label class="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg hover:bg-muted">
            <input type="checkbox" bind:checked={themeSettings.allowUserThemeToggle} class="rounded border-border text-indigo-600 focus:ring-indigo-500" />
            <span class="text-sm font-medium text-foreground">Allow users to toggle theme</span>
          </label>
        </div>

      {:else if activeTab === 'notifications'}
        <div class="space-y-4">
          <h3 class="text-base font-semibold text-foreground">Notification Preferences</h3>
          <div class="space-y-3">
            <label class="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg hover:bg-muted">
              <input type="checkbox" bind:checked={notifPrefs.pushEnabled} class="rounded border-border text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm font-medium text-foreground">Push notifications enabled</span>
            </label>
            <label class="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg hover:bg-muted">
              <input type="checkbox" bind:checked={notifPrefs.emailEnabled} class="rounded border-border text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm font-medium text-foreground">Email notifications enabled</span>
            </label>
            <label class="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg hover:bg-muted">
              <input type="checkbox" bind:checked={notifPrefs.smsEnabled} class="rounded border-border text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm font-medium text-foreground">SMS notifications enabled</span>
            </label>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Quiet Hours Start</label>
              <input type="time" bind:value={notifPrefs.quietHoursStart} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-1.5">Quiet Hours End</label>
              <input type="time" bind:value={notifPrefs.quietHoursEnd} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1.5">Max Notifications Per Day</label>
            <input type="number" bind:value={notifPrefs.maxNotificationsPerDay} class="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

      {:else if activeTab === 'featureFlags'}
        <div class="space-y-4">
          <h3 class="text-base font-semibold text-foreground">Feature Flags</h3>
          <p class="text-sm text-muted-foreground">Enable or disable application features</p>
          <div class="space-y-3">
            {#each [
              { key: 'enableLiveStreaming', label: 'Live Streaming' },
              { key: 'enableComments', label: 'Comments' },
              { key: 'enableDonations', label: 'Donations' },
              { key: 'enableEventRegistration', label: 'Event Registration' },
              { key: 'enableBibleReadingPlan', label: 'Bible Reading Plan' },
            ] as flag}
              <label class="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg hover:bg-muted">
                <input
                  type="checkbox"
                  checked={featureFlags[flag.key]}
                  onchange={() => featureFlags[flag.key] = !featureFlags[flag.key]}
                  class="rounded border-border text-indigo-600 focus:ring-indigo-500"
                />
                <span class="text-sm font-medium text-foreground">{flag.label}</span>
              </label>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

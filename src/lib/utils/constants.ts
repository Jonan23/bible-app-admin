import { formatDate, formatDuration, formatNumber, truncate } from './format';

export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  MODERATOR: 'Moderator',
};

export const ROLE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  ADMIN: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  EDITOR: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  MODERATOR: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

export const USER_STATUSES = ['ACTIVE', 'SUSPENDED', 'BANNED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  BANNED: 'Banned',
};

export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  SUSPENDED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  BANNED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const APP_USER_STATUSES = ['ACTIVE', 'SUSPENDED', 'INACTIVE'] as const;
export type AppUserStatus = (typeof APP_USER_STATUSES)[number];

export const APP_USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  INACTIVE: 'Inactive',
};

export const APP_USER_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  SUSPENDED: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  INACTIVE: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

export const POST_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export const POST_STATUS_COLORS: Record<PostStatus, string> = {
  DRAFT: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
  PUBLISHED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  ARCHIVED: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500',
};

export const EVENT_STATUSES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  UPCOMING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  ONGOING: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  COMPLETED: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const EVENT_STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  UPCOMING: 'info',
  ONGOING: 'success',
  COMPLETED: 'default',
  CANCELLED: 'danger',
};

export const NOTIFICATION_TYPES = ['BROADCAST', 'SCHEDULED', 'TOPIC', 'INDIVIDUAL'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  BROADCAST: 'Broadcast (All Users)',
  SCHEDULED: 'Scheduled',
  TOPIC: 'Topic',
  INDIVIDUAL: 'Individual',
};

export const NOTIFICATION_TYPE_COLORS: Record<string, string> = {
  BROADCAST: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  TOPIC: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  INDIVIDUAL: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export const MEDIA_TYPES = ['IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const MEDIA_TYPE_LABELS: Record<string, string> = {
  IMAGE: 'Images',
  VIDEO: 'Videos',
  AUDIO: 'Audio',
  DOCUMENT: 'Documents',
};

export const MEDIA_TYPE_COLORS: Record<string, string> = {
  IMAGE: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  VIDEO: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  AUDIO: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  DOCUMENT: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export const MEDIA_TYPE_ICONS: Record<string, string> = {
  IMAGE: 'Image',
  VIDEO: 'Video',
  AUDIO: 'Music',
  DOCUMENT: 'FileText',
};

export const CATEGORY_TYPES = ['BLOG', 'VIDEO', 'EVENT'] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export const INTERACTION_VERBS: Record<string, string> = {
  view: 'Viewed',
  like: 'Liked',
  comment: 'Commented on',
  share: 'Shared',
  download: 'Downloaded',
};

export const INTERACTION_ICONS: Record<string, string> = {
  view: 'Eye',
  like: 'Heart',
  comment: 'MessageSquare',
  share: 'Share2',
  download: 'Download',
};

export const INTERACTION_COLORS: Record<string, string> = {
  view: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
  like: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  comment: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
  share: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  download: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
};

export const DEVICE_LABELS: Record<string, string> = {
  ios: 'iPhone',
  android: 'Android',
  web: 'Web',
};

export const DEVICE_ICONS: Record<string, string> = {
  ios: 'Smartphone',
  android: 'Tablet',
};

export const SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Blog Posts', href: '/blog', icon: 'FileText' },
  { label: 'Videos', href: '/videos', icon: 'Video' },
  { label: 'Events & Trips', href: '/events', icon: 'Calendar' },
  { label: 'Notifications', href: '/notifications', icon: 'Bell' },
  { label: 'Daily Content', href: '/daily-content', icon: 'BookOpen' },
  { label: 'App Users', href: '/users', icon: 'Users' },
  { label: 'Admin Users', href: '/admin-users', icon: 'Shield' },
  { label: 'Media Library', href: '/media', icon: 'Image' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const;

export const DASHBOARD_QUICK_ACTIONS = [
  { label: 'New Blog Post', icon: 'FileText', href: '/blog/new', color: 'text-indigo-600' },
  { label: 'Upload Video', icon: 'Upload', href: '/videos/new', color: 'text-emerald-600' },
  { label: 'Create Event', icon: 'Calendar', href: '/events/new', color: 'text-amber-600' },
  { label: 'Send Notification', icon: 'Megaphone', href: '/notifications', color: 'text-purple-600' },
] as const;

export const ENGAGEMENT_LEGENDS = [
  { label: 'Views', color: 'bg-indigo-500' },
  { label: 'Likes', color: 'bg-emerald-500' },
  { label: 'Comments', color: 'bg-amber-500' },
] as const;

export const CONTENT_GROWTH_LEGENDS = [
  { label: 'Posts', color: 'bg-indigo-500' },
  { label: 'Videos', color: 'bg-emerald-500' },
] as const;

export const SETTINGS_TABS = [
  { id: 'branding', label: 'Branding', icon: 'Palette' },
  { id: 'contact', label: 'Contact', icon: 'Mail' },
  { id: 'social', label: 'Social Media', icon: 'Share2' },
  { id: 'theme', label: 'Theme', icon: 'Sun' },
  { id: 'notifications', label: 'Notifications', icon: 'Bell' },
  { id: 'featureFlags', label: 'Feature Flags', icon: 'Flag' },
] as const;

export const SETTINGS_DEFAULTS = {
  branding: { appName: '', appTagline: '', primaryColor: '#4F46E5', logo: '' },
  contact: { email: '', phone: '', address: '', website: '' },
  social: { facebook: '', instagram: '', youtube: '', twitter: '', tiktok: '' },
  theme: { defaultTheme: 'light', allowUserThemeToggle: true, primaryFont: 'Inter', borderRadius: '0.75rem' },
  notifPrefs: { pushEnabled: true, emailEnabled: true, smsEnabled: false, quietHoursStart: '22:00', quietHoursEnd: '07:00', maxNotificationsPerDay: 5 },
  featureFlags: {
    enableLiveStreaming: false,
    enableComments: true,
    enableDonations: false,
    enableEventRegistration: true,
    enableBibleReadingPlan: true,
  },
};

export const SETTINGS_KEY_MAP: Record<string, [string, string]> = {
  branding: ['app_branding', 'branding'],
  contact: ['contact_details', 'contact'],
  social: ['social_media', 'social'],
  theme: ['theme_settings', 'themeSettings'],
  notifications: ['notification_preferences', 'notifPrefs'],
  featureFlags: ['feature_flags', 'featureFlags'],
};

export const ANALYTICS_PIE_DATA = [
  { label: 'Blog Views', value: 45, color: '#6366F1' },
  { label: 'Video Views', value: 30, color: '#10B981' },
  { label: 'Event Signups', value: 15, color: '#F59E0B' },
  { label: 'Other', value: 10, color: '#8B5CF6' },
];

export const ANALYTICS_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ANALYTICS_PERF_ROWS = [
  { metric: 'Blog Posts', current: '12', last: '9', change: '+33%', positive: true },
  { metric: 'Video Uploads', current: '8', last: '6', change: '+33%', positive: true },
  { metric: 'Event Registrations', current: '45', last: '52', change: '-13%', positive: false },
  { metric: 'Notification Clicks', current: '892', last: '756', change: '+18%', positive: true },
  { metric: 'New Users', current: '124', last: '98', change: '+27%', positive: true },
  { metric: 'Avg. Watch Time', current: '4:32', last: '4:15', change: '+7%', positive: true },
];

export const STATUS_BADGE_VARIANTS: Record<string, string> = {
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

export const DASHBOARD_CARD_TREND_COLORS: Record<string, string> = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-muted-foreground',
};

export const DASHBOARD_CARD_VARIANT_STYLES: Record<string, string> = {
  default: 'bg-card border-border',
  primary: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900',
  success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900',
  warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900',
};

export const MODAL_SIZES: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[90vw]',
};

export const DRAWER_SIZES: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export const AVATAR_SIZES: Record<string, string> = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

export const BLOG_COLUMNS: any[] = [
  {
    key: 'title', label: 'Title', sortable: true,
    render: (p: any) => truncate(p.title, 60),
  },
  {
    key: 'status', label: 'Status',
    render: (p: any) => `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${POST_STATUS_COLORS[p.status as PostStatus]}">${POST_STATUS_LABELS[p.status as PostStatus]}</span>`,
  },
  {
    key: 'author', label: 'Author',
    render: (p: any) => p.author?.name || 'Unknown',
  },
  {
    key: 'category', label: 'Category',
    render: (p: any) => p.category?.name || '-',
  },
  {
    key: 'publishedAt', label: 'Published', sortable: true,
    render: (p: any) => p.publishedAt ? formatDate(p.publishedAt) : '-',
  },
];

export const VIDEO_COLUMNS: any[] = [
  {
    key: 'title', label: 'Title', sortable: true,
    render: (v: any) => `<div class="flex items-center gap-3"><div class="w-12 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">${v.thumbnail ? `<img src="${v.thumbnail}" class="w-full h-full object-cover" />` : '<svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'}</div><span class="truncate max-w-[200px]">${v.title}</span></div>`,
  },
  {
    key: 'speaker', label: 'Speaker',
    render: (v: any) => v.speaker?.name || '-',
  },
  {
    key: 'duration', label: 'Duration',
    render: (v: any) => formatDuration(v.duration),
  },
  {
    key: 'viewCount', label: 'Views', sortable: true,
    render: (v: any) => formatNumber(v.viewCount),
  },
  {
    key: 'createdAt', label: 'Added', sortable: true,
    render: (v: any) => formatDate(v.createdAt),
  },
];

export const EVENT_COLUMNS: any[] = [
  { key: 'title', label: 'Title', sortable: true },
  {
    key: 'status', label: 'Status',
    render: (e: any) => `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${EVENT_STATUS_COLORS[e.status as EventStatus]}">${EVENT_STATUS_LABELS[e.status as EventStatus]}</span>`,
  },
  {
    key: 'location', label: 'Location',
    render: (e: any) => e.location || 'Online',
  },
  {
    key: 'startDate', label: 'Start Date', sortable: true,
    render: (e: any) => formatDate(e.startDate),
  },
  {
    key: 'registrations', label: 'Registrations',
    render: (e: any) => String(e.registrations?.length ?? 0),
  },
];

export const NOTIFICATION_COLUMNS: any[] = [
  { key: 'title', label: 'Title', sortable: true },
  {
    key: 'type', label: 'Type',
    render: (n: any) => `<span class="text-xs font-medium uppercase">${n.type}</span>`,
  },
  {
    key: 'createdAt', label: 'Sent', sortable: true,
    render: (n: any) => n.createdAt ? formatDate(n.createdAt) : '-',
  },
  {
    key: 'readAt', label: 'Read',
    render: (n: any) => n.readAt ? formatDate(n.readAt) : '<span class="text-muted-foreground">Unread</span>',
  },
];

export const APP_USER_COLUMNS: any[] = [
  {
    key: 'name', label: 'User',
    render: (u: any) => {
      const initials = (u.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
      return `<div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-medium text-indigo-700 dark:text-indigo-300 flex-shrink-0">${initials}</div><div><p class="text-sm font-medium text-foreground">${u.name}</p><p class="text-xs text-muted-foreground">${u.email}</p></div></div>`;
    },
  },
  { key: 'email', label: 'Email' },
  {
    key: 'platform', label: 'Device',
    render: (u: any) => `<div class="text-sm text-foreground">${DEVICE_LABELS[u.platform] || u.platform}</div>`,
  },
  {
    key: 'createdAt', label: 'Join Date',
    render: (u: any) => `<span class="text-sm text-foreground">${formatDate(u.createdAt)}</span>`,
  },
  {
    key: 'lastActive', label: 'Last Active',
    render: (u: any) => `<span class="text-sm text-foreground">${u.lastActive ? formatDate(u.lastActive) : 'Never'}</span>`,
  },
  {
    key: 'notificationsEnabled', label: 'Notifications',
    render: (u: any) => `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.notificationsEnabled ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}">${u.notificationsEnabled ? 'On' : 'Off'}</span>`,
  },
  {
    key: 'status', label: 'Status',
    render: (u: any) => `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${APP_USER_STATUS_COLORS[(u.status || '').toUpperCase()]}">${APP_USER_STATUS_LABELS[(u.status || '').toUpperCase()]}</span>`,
  },
];

export const ADMIN_USER_COLUMNS: any[] = [
  {
    key: 'name', label: 'Name',
    render: (u: any) => {
      const initials = (u.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
      return `<div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-medium text-indigo-700 dark:text-indigo-300 flex-shrink-0">${initials}</div><span class="text-sm font-medium text-foreground">${u.name || 'Unnamed'}</span></div>`;
    },
  },
  { key: 'email', label: 'Email' },
  {
    key: 'role', label: 'Role',
    render: (u: any) => `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role?.name as Role] || 'bg-zinc-100 text-zinc-700'}">${ROLE_LABELS[u.role?.name as Role] || u.role?.name || '-'}</span>`,
  },
  {
    key: 'status', label: 'Status',
    render: (u: any) => `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${USER_STATUS_COLORS[u.status as UserStatus]}">${USER_STATUS_LABELS[u.status as UserStatus]}</span>`,
  },
  {
    key: 'lastLoginAt', label: 'Last Login',
    render: (u: any) => `<span class="text-sm">${u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never'}</span>`,
  },
  {
    key: 'createdAt', label: 'Created',
    render: (u: any) => `<span class="text-sm">${formatDate(u.createdAt)}</span>`,
  },
];

export const DAILY_CONTENT_COLUMNS: any[] = [
  {
    key: 'type', label: 'Type',
    render: (c: any) => c.type === 'verse'
      ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Verse</span>'
      : '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Quote</span>',
  },
  {
    key: 'content', label: 'Content',
    render: (c: any) => `<span class="text-sm text-foreground">${truncate(c.content, 80)}</span>`,
  },
  {
    key: 'reference', label: 'Reference / Author',
    render: (c: any) => {
      if (c.type === 'verse') return `<span class="text-sm font-medium text-indigo-600 dark:text-indigo-400">${c.reference || '-'}</span>`;
      return `<span class="text-sm italic text-muted-foreground">— ${c.author || 'Unknown'}</span>`;
    },
  },
  {
    key: 'date', label: 'Scheduled Date',
    render: (c: any) => `<span class="text-sm">${c.date ? formatDate(c.date) : '—'}</span>`,
  },
  {
    key: 'isActive', label: 'Active',
    render: (c: any) => c.isActive
      ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>'
      : '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">Inactive</span>',
  },
];

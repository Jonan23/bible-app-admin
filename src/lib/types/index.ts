export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  profileImage: string | null;
  roleId: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  lastLoginAt: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  readTime: number | null;
  categoryId: string | null;
  category: Category | null;
  authorId: string;
  author: User;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  publishedAt: string | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'BLOG' | 'VIDEO' | 'EVENT';
  parentId: string | null;
  parent: Category | null;
  children: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Speaker {
  id: string;
  name: string;
  bio: string | null;
  image: string | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  thumbnail: string | null;
  speakerId: string | null;
  speaker: Speaker | null;
  duration: number | null;
  categoryId: string | null;
  category: Category | null;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  bannerImage: string | null;
  organizerId: string;
  organizer: User;
  registrationLink: string | null;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  registrations: EventRegistration[];
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: 'BROADCAST' | 'SCHEDULED' | 'TOPIC' | 'INDIVIDUAL';
  topic: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  senderId: string | null;
  sender: User | null;
  recipients: UserNotification[];
  createdAt: string;
}

export interface UserNotification {
  id: string;
  notificationId: string;
  userId: string;
  readAt: string | null;
  createdAt: string;
}

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: string;
  createdAt: string;
}

export interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string | null;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';
  uploadedById: string;
  uploadedBy: User;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  user: User;
  action: string;
  entity: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  eventType: string;
  userId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AppSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ScriptureRef {
  book: string;
  chapter: number;
  verse: number;
  reference: string;
}

export interface Interaction {
  id: string;
  type: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  platform: 'ios' | 'android' | 'web';
  status: 'active' | 'inactive' | 'blocked';
  notificationsEnabled: boolean;
  lastActive: string;
  interactionCount?: number;
  interactions?: Interaction[];
  createdAt: string;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: string;
  tags?: string[];
  status?: 'DRAFT' | 'PUBLISHED';
  featured?: boolean;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  userGrowth: number;
  totalBlogPosts: number;
  postGrowth: number;
  totalSermons: number;
  sermonGrowth: number;
  upcomingEvents: number;
  totalNotifications: number;
  userGrowthData: { date: string; count: number }[];
  contentGrowthData: { date: string; posts: number; videos: number }[];
  engagementData: { date: string; views: number; likes: number; comments: number }[];
  recentActivity: ActivityLog[];
}

export interface DailyContent {
  id: string;
  type: 'verse' | 'quote';
  content: string;
  book: string | null;
  chapter: number | null;
  verse: number | null;
  reference: string | null;
  author: string | null;
  date: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string | null;
  type: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  type: 'BROADCAST' | 'SCHEDULED' | 'TOPIC' | 'INDIVIDUAL';
}


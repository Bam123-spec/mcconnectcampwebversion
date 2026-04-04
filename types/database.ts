export type Role = "student" | "president" | "admin";

export type Profile = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  org_id?: string | null;
  club_id?: string | null;
  officer_title?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  xp?: number;
  updated_at?: string;
  major?: string | null;
  year?: string | null;
  bio?: string | null;
  interests?: string[] | null;
  // Customization
  avatar_type?: 'photo' | 'preset';
  avatar_preset?: string | null;
  frame_style?: string | null;
  flair?: string | null;
  theme_style?: string | null;
  avatar_config?: any | null; // JSONB
};



export type Friend = {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  friend?: Profile; // For joined queries
};

export type Follow = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  following?: Profile; // For joined queries
};

export type ClubFollower = {
  id: string;
  user_id: string;
  club_id: string;
  created_at: string;
};

export type ClubProfile = {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: Role;
  club_id: string | null;
};

export type Club = {
  id: string;
  name: string;
  description?: string | null;
  cover_image_url?: string | null;
  meeting_time?: string | null;
  updated_at?: string;
  member_count?: number | null;
};

export type ClubMemberStatus = "pending" | "approved" | "rejected";

export type ClubMember = {
  id: string;
  club_id: string;
  user_id?: string;
  profile_id: string;
  status: ClubMemberStatus;
  joined_at?: string;
  profiles?: ClubProfile | null;
};

export type Officer = {
  id: string;
  club_id: string;
  user_id: string;
  role: string;
  email?: string;
  created_at?: string;
  clubs?: Club; // For joined queries
};

export type ClubPost = {
  id: string;
  club_id: string;
  user_id: string;
  text: string; // Legacy, might be 'content' in DB?
  image_url?: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
};

export type Post = {
  id: string;
  club_id: string;
  user_id?: string;
  author_id?: string;
  content: string;
  image_url?: string | null;
  created_at: string;
};

export type ClubEvent = {
  id: string;
  club_id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  start_at: string;
  end_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Event = {
  id: string;
  name: string;
  description?: string | null;
  date: string | null;
  day: string | null;
  time?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location: string;
  cover_image_url?: string | null;
  image_url?: string | null;
  category?: string | null;
  club_id?: string | null;
  created_at?: string;
  // Computed
  is_registered?: boolean;
  is_saved?: boolean;
};

export type EventRegistration = {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
};

export type EventSaved = {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
};

export type EventAttendance = {
  id: string;
  event_id: string;
  user_id: string;
  qr_secret: string;
  status: 'registered' | 'checked_in';
  created_at: string;
};

// --- Forum Types ---

export type ForumPost = {
  id: string;
  author_id: string;
  category: string;
  title: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  updated_at?: string;
  // Relations
  author?: Profile;
  reactions?: ForumReaction[];
  saved?: ForumSavedPost[];
  views?: ForumView[];
  // Computed
  likes_count?: number;
  comments_count?: number;
  views_count?: number;
  user_reaction?: string | null; // 'like', 'love', etc.
  is_saved?: boolean;
};

export type ForumComment = {
  id: string;
  post_id: string;
  author_id: string;
  parent_id?: string | null;
  content: string;
  created_at: string;
  // Relations
  author?: Profile;
  replies?: ForumComment[]; // For client-side nesting
};

export type ForumReaction = {
  id: string;
  post_id: string;
  user_id: string;
  reaction: string; // 'like', 'love', 'laugh', 'insightful', 'support'
  created_at: string;
};

export type ForumSavedPost = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  post?: ForumPost;
};

export type ForumView = {
  id: string;
  post_id: string;
  user_id: string;
  viewed_at: string;
};

// --- Chat Types ---

export type ChatRoom = {
  id: string;
  type: 'group' | 'dm' | 'class';
  user1?: string; // For DMs
  user2?: string; // For DMs
  name?: string;
  image_url?: string;
  club_id?: string;
  class_name?: string;
  class_section?: string;
  semester?: string;
  created_at: string;
  // Computed for UI
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  member_count?: number;
  last_message_is_officer?: boolean;
  other_user?: Profile; // For DMs
};

export type ChatMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  image_url?: string;
  replied_to?: string;
  created_at: string;
  // Relations
  sender?: Profile;
};

export type ChatMember = {
  id: string;
  room_id: string;
  user_id: string;
  created_at: string;
};

export type ChatMessageRead = {
  message_id: string;
  user_id: string;
  read_at: string;
};

export type AdminConversation = {
  id: string;
  org_id: string;
  campus_id?: string | null;
  club_id?: string | null;
  prospect_id?: string | null;
  type: string;
  subject?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string | null;
  member_role?: string | null;
  club?: Club | null;
  last_message?: string | null;
  unread_count?: number;
};

export type AdminConversationMember = {
  id: string;
  conversation_id: string;
  org_id: string;
  user_id: string;
  role: string;
  club_id?: string | null;
  joined_at: string;
  profile?: Profile | null;
};

export type AdminMessage = {
  id: string;
  conversation_id: string;
  org_id: string;
  sender_id: string;
  sender_role: string;
  body: string;
  created_at: string;
  edited_at?: string | null;
  sender?: Profile | null;
};

export type AdminMessageRead = {
  id: string;
  conversation_id: string;
  org_id: string;
  user_id: string;
  last_read_at: string;
};

export type ChatAnalytics = {
  messages_count: number;
  active_users: number; // distinct senders in last 7 days
  last_message_at: string;
};

// --- Achievement Types ---

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'Clubs' | 'Events' | 'Social' | 'Chat' | 'Campus' | 'Special';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  color: string;
  bg_color: string;
  requirements: any; // JSONB
  created_at: string;
};

export type UserAchievement = {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress?: any; // JSONB
  achievement?: Achievement; // For joined queries
};

export type PersonalEvent = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  day: string;
  start_time: string;
  end_time: string;
  alarms?: number[]; // Array of minutes before event
  created_at: string;
};

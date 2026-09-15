export interface Profile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string;
  author_id: string;
  status: 'published' | 'draft';
  featured_image_url: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
  comment_count?: number;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  author?: Profile;
}

export type PostWithRelations = Post & {
  author: Profile;
  comment_count: number;
};

export const CATEGORIES = [
  'Technology',
  'Programming',
  'Java',
  'Web Development',
  'AI',
  'Career',
  'Education',
  'Lifestyle',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  'Technology': 'bg-blue-100 text-blue-700',
  'Programming': 'bg-purple-100 text-purple-700',
  'Java': 'bg-orange-100 text-orange-700',
  'Web Development': 'bg-cyan-100 text-cyan-700',
  'AI': 'bg-pink-100 text-pink-700',
  'Career': 'bg-green-100 text-green-700',
  'Education': 'bg-indigo-100 text-indigo-700',
  'Lifestyle': 'bg-rose-100 text-rose-700',
};

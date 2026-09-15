import { supabase } from '@/lib/supabase';
import type { Post, Comment, Profile, PostWithRelations } from '@/types';

// ─── Posts ───────────────────────────────────────────────────────────

export async function fetchPosts(options?: {
  category?: string;
  search?: string;
  sort?: 'latest' | 'oldest' | 'most_commented';
  limit?: number;
  status?: 'published' | 'draft';
}): Promise<PostWithRelations[]> {
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `, { count: 'exact' });

  if (options?.status) {
    query = query.eq('status', options.status);
  } else {
    query = query.eq('status', 'published');
  }

  if (options?.category && options.category !== 'All') {
    query = query.eq('category', options.category);
  }

  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`);
  }

  if (options?.sort === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else if (options?.sort === 'most_commented') {
    query = query.order('comment_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];

  const posts = data as unknown as Post[];

  // Fetch comment counts
  const postIds = posts.map((p) => p.id);
  let commentCounts: Record<string, number> = {};
  if (postIds.length > 0) {
    const { data: counts } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);
    if (counts) {
      commentCounts = counts.reduce((acc, row) => {
        acc[row.post_id] = (acc[row.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }
  }

  return posts.map((p) => ({
    ...p,
    author: p.author as Profile,
    comment_count: commentCounts[p.id] || 0,
  })) as PostWithRelations[];
}

export async function fetchPostById(id: string): Promise<PostWithRelations | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const post = data as unknown as Post;
  const { count } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', id);

  return {
    ...post,
    author: post.author as Profile,
    comment_count: count || 0,
  } as PostWithRelations;
}

export async function fetchMyPosts(userId: string): Promise<PostWithRelations[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const posts = data as unknown as Post[];
  const postIds = posts.map((p) => p.id);
  let commentCounts: Record<string, number> = {};
  if (postIds.length > 0) {
    const { data: counts } = await supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds);
    if (counts) {
      commentCounts = counts.reduce((acc, row) => {
        acc[row.post_id] = (acc[row.post_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }
  }

  return posts.map((p) => ({
    ...p,
    author: p.author as Profile,
    comment_count: commentCounts[p.id] || 0,
  })) as PostWithRelations[];
}

export async function fetchUserPosts(userId: string): Promise<PostWithRelations[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(*)
    `)
    .eq('author_id', userId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  const posts = data as unknown as Post[];
  return posts.map((p) => ({
    ...p,
    author: p.author as Profile,
    comment_count: 0,
  })) as PostWithRelations[];
}

export async function createPost(post: {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  status: 'published' | 'draft';
  featured_image_url?: string;
  tags?: string[];
}): Promise<Post> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('You must be logged in to create a post.');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || post.content.slice(0, 150),
      category: post.category,
      status: post.status,
      featured_image_url: post.featured_image_url || null,
      tags: post.tags || [],
      author_id: userData.user.id,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Post;
}

export async function updatePost(
  id: string,
  updates: {
    title?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    status?: 'published' | 'draft';
    featured_image_url?: string;
    tags?: string[];
  }
): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Post;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
}

// ─── Comments ────────────────────────────────────────────────────────

export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!comments_user_id_fkey(*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];
  return data as unknown as Comment[];
}

export async function createComment(postId: string, content: string): Promise<Comment> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('You must be logged in to comment.');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      user_id: userData.user.id,
    })
    .select(`
      *,
      author:profiles!comments_user_id_fkey(*)
    `)
    .single();

  if (error) throw error;
  return data as unknown as Comment;
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw error;
}

// ─── Stats ────────────────────────────────────────────────────────────

export async function getUserStats(userId: string): Promise<{
  totalPosts: number;
  totalComments: number;
  publishedPosts: number;
}> {
  const [postsResult, publishedResult, commentsResult] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', userId),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', userId).eq('status', 'published'),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  return {
    totalPosts: postsResult.count || 0,
    publishedPosts: publishedResult.count || 0,
    totalComments: commentsResult.count || 0,
  };
}

export async function getUserCommentCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count || 0;
}

// ─── Profile ──────────────────────────────────────────────────────────

export async function fetchProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(
  userId: string,
  updates: { full_name?: string; bio?: string; avatar_url?: string }
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data as Profile;
}

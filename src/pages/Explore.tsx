import { useEffect, useState, useCallback } from 'react';
import { Search, Loader2, SlidersHorizontal } from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import BlogCardSkeleton from '@/components/BlogCardSkeleton';
import { fetchPosts } from '@/lib/api';
import { CATEGORIES } from '@/types';
import type { PostWithRelations } from '@/types';

type SortOption = 'latest' | 'oldest' | 'most_commented';

export default function Explore() {
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortOption>('latest');
  const [showFilters, setShowFilters] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPosts({
        search: search || undefined,
        category: category === 'All' ? undefined : category,
        sort,
      });
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadPosts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-navy-900">Explore Blogs</h1>
        <p className="text-slate-500 mt-2">Discover stories from our community of writers.</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, content, or author..."
            className="input-field pl-11"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden btn-outline px-4 py-3 flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className={`input-field md:w-48 cursor-pointer ${showFilters ? '' : 'hidden md:block'}`}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="most_commented">Most Commented</option>
        </select>
      </div>

      {/* Category pills */}
      <div className={`flex flex-wrap gap-2 mb-8 ${showFilters ? '' : 'hidden md:flex'}`}>
        <button
          onClick={() => setCategory('All')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            category === 'All'
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              category === cat
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">No posts found. Try a different search or filter.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">{posts.length} {posts.length === 1 ? 'post' : 'posts'} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

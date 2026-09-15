import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { fetchPosts } from '@/lib/api';
import { CATEGORIES, CATEGORY_COLORS } from '@/types';
import type { PostWithRelations } from '@/types';

export default function Categories() {
  const [allPosts, setAllPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts()
      .then(setAllPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = allPosts.filter((p) => p.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const categoryGradients: Record<string, string> = {
    'Technology': 'from-blue-500 to-cyan-500',
    'Programming': 'from-purple-500 to-pink-500',
    'Java': 'from-orange-500 to-coral-500',
    'Web Development': 'from-cyan-500 to-blue-500',
    'AI': 'from-pink-500 to-purple-500',
    'Career': 'from-green-500 to-cyan-500',
    'Education': 'from-indigo-500 to-purple-500',
    'Lifestyle': 'from-rose-500 to-pink-500',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-navy-900">Browse by Category</h1>
        <p className="text-slate-500 mt-2">Find stories that match your interests.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat) => {
            const posts = allPosts.filter((p) => p.category === cat).slice(0, 3);
            return (
              <div key={cat} className="card overflow-hidden group">
                <div className={`h-24 bg-gradient-to-br ${categoryGradients[cat]} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-display font-bold text-lg text-white">{cat}</h3>
                    <p className="text-xs text-white/80">{categoryCounts[cat]} {categoryCounts[cat] === 1 ? 'post' : 'posts'}</p>
                  </div>
                </div>
                <div className="p-4">
                  {posts.length === 0 ? (
                    <p className="text-sm text-slate-400 py-3">No posts yet in this category.</p>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {posts.map((post) => (
                        <Link
                          key={post.id}
                          to={`/post/${post.id}`}
                          className="block text-sm text-slate-600 hover:text-purple-600 transition-colors line-clamp-1"
                        >
                          {post.title}
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link
                    to={`/explore?category=${encodeURIComponent(cat)}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:gap-2 transition-all"
                  >
                    Explore {cat} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

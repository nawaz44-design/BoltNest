import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PenLine, Compass, TrendingUp, Users, MessageCircle, Sparkles } from 'lucide-react';
import BlogCard from '@/components/BlogCard';
import BlogCardSkeleton from '@/components/BlogCardSkeleton';
import { fetchPosts } from '@/lib/api';
import type { PostWithRelations } from '@/types';

export default function Home() {
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts({ limit: 6 })
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-purple-900 to-navy-900">
        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-purple-200">Welcome to the future of blogging</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white leading-tight mb-6 animate-fade-in-up">
              Share Your Ideas.
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Inspire The World.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed animate-fade-in-up">
              Write, discover and connect through meaningful stories.
              Join a community of passionate writers and readers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
              <Link
                to="/create-post"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all"
              >
                <PenLine className="w-5 h-5" />
                Start Writing
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
              >
                <Compass className="w-5 h-5" />
                Explore Blogs
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative">
          <svg className="w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-slate-50 -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: TrendingUp, label: 'Stories Published', value: '10K+', color: 'from-purple-500 to-pink-500' },
              { icon: Users, label: 'Active Writers', value: '5K+', color: 'from-cyan-500 to-blue-500' },
              { icon: MessageCircle, label: 'Comments', value: '50K+', color: 'from-coral-500 to-pink-500' },
              { icon: Sparkles, label: 'Categories', value: '8', color: 'from-purple-500 to-cyan-500' },
            ].map((stat, i) => (
              <div key={i} className="card p-5 text-center">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-display font-bold text-2xl text-navy-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-3xl text-navy-900">Latest Stories</h2>
            <p className="text-slate-500 mt-2">Fresh perspectives from our community</p>
          </div>
          <Link
            to="/explore"
            className="hidden sm:inline-flex items-center gap-1 text-purple-600 font-semibold hover:gap-2 transition-all"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No posts yet. Be the first to share your story!</p>
            <Link to="/create-post" className="btn-gradient inline-flex items-center gap-2 px-6 py-3 mt-4">
              <PenLine className="w-5 h-5" /> Write the first post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link to="/explore" className="inline-flex items-center gap-1 text-purple-600 font-semibold">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-500 to-coral-500 p-10 md:p-16 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Ready to Share Your Story?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of writers who are already sharing their ideas with the world.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-bold rounded-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

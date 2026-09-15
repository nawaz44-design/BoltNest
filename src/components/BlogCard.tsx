import { Link } from 'react-router-dom';
import { MessageCircle, Calendar, User } from 'lucide-react';
import type { PostWithRelations } from '@/types';
import { CATEGORY_COLORS } from '@/types';

interface BlogCardProps {
  post: PostWithRelations;
}

export default function BlogCard({ post }: BlogCardProps) {
  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-slate-100 text-slate-700';
  const dateStr = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link to={`/post/${post.id}`} className="card group block overflow-hidden">
      {/* Featured image or gradient header */}
      <div className="h-40 relative overflow-hidden rounded-t-2xl">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 flex items-center justify-center">
            <span className="font-display font-bold text-3xl text-white/30">
              {post.category.charAt(0)}
            </span>
          </div>
        )}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${categoryColor} backdrop-blur-sm`}>
          {post.category}
        </div>
        {post.status === 'draft' && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 backdrop-blur-sm">
            Draft
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-navy-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {post.excerpt || post.content.slice(0, 120)}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {post.author?.full_name || 'Unknown'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {dateStr}
            </span>
          </div>
          <span className="flex items-center gap-1 text-purple-500 font-medium">
            <MessageCircle className="w-3.5 h-3.5" />
            {post.comment_count || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

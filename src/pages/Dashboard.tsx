import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageCircle, CheckCircle, Plus, Edit2, Trash2, Eye, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchMyPosts, deletePost, getUserStats } from '@/lib/api';
import { showToast } from '@/components/Toast';
import type { PostWithRelations } from '@/types';
import { CATEGORY_COLORS } from '@/types';

export default function Dashboard() {
  const { profile, session } = useAuth();
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalComments: 0, publishedPosts: 0 });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    Promise.all([
      fetchMyPosts(session.user.id),
      getUserStats(session.user.id),
    ])
      .then(([postData, statData]) => {
        setPosts(postData);
        setStats(statData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setStats((prev) => ({
        ...prev,
        totalPosts: prev.totalPosts - 1,
        publishedPosts: prev.publishedPosts - 1,
      }));
      showToast('Post deleted successfully', 'success');
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const statCards = [
    {
      label: 'Total Posts',
      value: stats.totalPosts,
      icon: FileText,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Total Comments',
      value: stats.totalComments,
      icon: MessageCircle,
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      label: 'Published Posts',
      value: stats.publishedPosts,
      icon: CheckCircle,
      gradient: 'from-coral-500 to-pink-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-navy-900">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Writer'}!
        </h1>
        <p className="text-slate-500 mt-2">Here's what's happening with your blog.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="card p-6 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-5 rounded-full blur-2xl`} />
            <div className="relative">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <p className="font-display font-bold text-3xl text-navy-900">{card.value}</p>
              <p className="text-sm text-slate-500 mt-1">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create button + My Posts */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-2xl text-navy-900">My Posts</h2>
        <Link to="/create-post" className="btn-gradient inline-flex items-center gap-2 px-5 py-2.5 text-sm">
          <Plus className="w-4 h-4" /> Create New Post
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="font-display font-semibold text-lg text-navy-900 mb-2">No posts yet</h3>
          <p className="text-slate-500 mb-4">Start sharing your ideas with the world.</p>
          <Link to="/create-post" className="btn-gradient inline-flex items-center gap-2 px-6 py-3">
            <Plus className="w-4 h-4" /> Write Your First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="card p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[post.category] || 'bg-slate-100 text-slate-700'}`}>
                    {post.category}
                  </span>
                  {post.status === 'draft' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                      Draft
                    </span>
                  )}
                </div>
                <Link to={`/post/${post.id}`}>
                  <h3 className="font-display font-semibold text-navy-900 hover:text-purple-600 transition-colors truncate">
                    {post.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {post.comment_count || 0} comments
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/post/${post.id}`}
                  className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  to={`/edit-post/${post.id}`}
                  className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  disabled={deletingId === post.id}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === post.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

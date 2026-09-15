import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Calendar, MessageCircle, Tag, Edit2, Trash2, Loader2, Send, ArrowLeft,
} from 'lucide-react';
import { fetchPostById, fetchComments, createComment, deleteComment, deletePost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/Toast';
import { CATEGORY_COLORS } from '@/types';
import type { PostWithRelations, Comment } from '@/types';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [post, setPost] = useState<PostWithRelations | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetchPostById(id),
      fetchComments(id),
    ])
      .then(([postData, commentData]) => {
        if (!postData) {
          setNotFound(true);
        } else {
          setPost(postData);
        }
        setComments(commentData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleComment = async () => {
    if (!newComment.trim()) {
      showToast('Comment cannot be empty', 'error');
      return;
    }
    if (!session) {
      showToast('Please login to comment', 'info');
      navigate('/login');
      return;
    }

    setCommentLoading(true);
    try {
      const comment = await createComment(id!, newComment.trim());
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
      setPost((prev) => prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev);
      showToast('Comment posted!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong', 'error');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    setDeletingCommentId(commentId);
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setPost((prev) => prev ? { ...prev, comment_count: prev.comment_count - 1 } : prev);
      showToast('Comment deleted', 'success');
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display font-bold text-3xl text-navy-900 mb-4">Post Not Found</h1>
        <p className="text-slate-500 mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Link to="/explore" className="btn-gradient inline-flex px-6 py-3">Explore Blogs</Link>
      </div>
    );
  }

  const isAuthor = session?.user?.id === post.author_id;
  const categoryColor = CATEGORY_COLORS[post.category] || 'bg-slate-100 text-slate-700';
  const dateStr = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-slate-500 hover:text-purple-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Article header */}
      <article>
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${categoryColor}`}>
            {post.category}
          </span>
          {post.status === 'draft' && (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
              Draft
            </span>
          )}
        </div>

        <h1 className="font-display font-bold text-3xl md:text-4xl text-navy-900 mb-4 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
          <Link to={`/user/${post.author?.id}`} className="flex items-center gap-2 hover:text-purple-600 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
              {post.author?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="font-medium">{post.author?.full_name || 'Unknown'}</span>
          </Link>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {dateStr}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" /> {post.comment_count} comments
          </span>
          {isAuthor && (
            <div className="flex items-center gap-2 ml-auto">
              <Link
                to={`/edit-post/${post.id}`}
                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
              >
                <Edit2 className="w-4 h-4" />
              </Link>
              <button
                onClick={async () => {
                  if (confirm('Delete this post?')) {
                    try {
                      await deletePost(post.id);
                      showToast('Post deleted successfully', 'success');
                      navigate('/dashboard');
                    } catch {
                      showToast('Something went wrong', 'error');
                    }
                  }
                }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Featured image */}
        {post.featured_image_url && (
          <div className="rounded-2xl overflow-hidden mb-8 max-h-96">
            <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div
          className="blog-content text-base leading-relaxed mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-100 mb-8">
            <Tag className="w-4 h-4 text-slate-400" />
            {post.tags.map((tag, i) => (
              <span key={i} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Comments section */}
      <section className="mt-8">
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-cyan-50 p-6 md:p-8">
          <h2 className="font-display font-bold text-2xl text-navy-900 mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            Comments ({comments.length})
          </h2>

          {/* Comment form */}
          {session ? (
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="input-field min-h-[100px] resize-y"
                disabled={commentLoading}
              />
              <button
                onClick={handleComment}
                disabled={commentLoading}
                className="btn-gradient mt-3 px-6 py-2.5 flex items-center gap-2 text-sm disabled:opacity-60"
              >
                {commentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post Comment
              </button>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl bg-white/60 text-center">
              <p className="text-slate-600 mb-2">Please login to leave a comment.</p>
              <Link to="/login" className="text-purple-600 font-semibold hover:text-purple-700">
                Login to comment
              </Link>
            </div>
          )}

          {/* Comments list */}
          {comments.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-xl p-4 shadow-sm animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      {comment.author?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <Link
                            to={`/user/${comment.author?.id}`}
                            className="font-semibold text-navy-900 hover:text-purple-600 transition-colors text-sm"
                          >
                            {comment.author?.full_name || 'Unknown'}
                          </Link>
                          <p className="text-xs text-slate-400">
                            {new Date(comment.created_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {session?.user?.id === comment.user_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingCommentId === comment.id}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            {deletingCommentId === comment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, FileCheck, X, Loader2, Tag } from 'lucide-react';
import { fetchPostById, updatePost } from '@/lib/api';
import { showToast } from '@/components/Toast';
import { CATEGORIES } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchPostById(id)
      .then((post) => {
        if (!post) {
          setError('Post not found.');
          setLoading(false);
          return;
        }
        if (post.author_id !== session?.user?.id) {
          setError('You can only edit your own posts.');
          setLoading(false);
          return;
        }
        setTitle(post.title);
        setContent(post.content);
        setExcerpt(post.excerpt || '');
        setCategory(post.category);
        setTags(post.tags?.join(', ') || '');
        setFeaturedImageUrl(post.featured_image_url || '');
        setStatus(post.status);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load post.');
        setLoading(false);
      });
  }, [id, session?.user?.id]);

  const handleSave = async (newStatus: 'published' | 'draft') => {
    setError('');
    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }
    if (!content.trim()) {
      setError('Please enter some content.');
      return;
    }

    setSaving(true);
    try {
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      await updatePost(id!, {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        category,
        status: newStatus,
        featured_image_url: featuredImageUrl.trim() || undefined,
        tags: tagArray,
      });
      showToast('Post updated successfully!', 'success');
      navigate(`/post/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-gradient px-6 py-3">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-navy-900">Edit Post</h1>
        <p className="text-slate-500 mt-2">Update your blog post.</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
          {error}
        </div>
      )}

      <div className="card p-6 md:p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field text-lg font-display font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Featured Image URL (optional)</label>
            <input
              type="url"
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Short Description (optional)</label>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="input-field"
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field min-h-[300px] resize-y font-mono text-sm leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (optional)</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="technology, programming (comma-separated)"
              className="input-field pl-11"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="btn-gradient flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCheck className="w-5 h-5" />}
            {status === 'published' ? 'Update Post' : 'Publish Post'}
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="btn-outline flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save as Draft
          </button>
          <button
            onClick={() => navigate(`/post/${id}`)}
            disabled={saving}
            className="px-6 py-3 text-slate-600 font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

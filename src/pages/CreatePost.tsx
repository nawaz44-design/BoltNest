import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, FileCheck, X, Loader2, Tag } from 'lucide-react';
import { createPost } from '@/lib/api';
import { showToast } from '@/components/Toast';
import { CATEGORIES } from '@/types';

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (status: 'published' | 'draft') => {
    setError('');

    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }
    if (!content.trim()) {
      setError('Please enter some content.');
      return;
    }

    setLoading(true);
    try {
      const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const post = await createPost({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        category,
        status,
        featured_image_url: featuredImageUrl.trim() || undefined,
        tags: tagArray.length > 0 ? tagArray : undefined,
      });
      showToast(status === 'published' ? 'Post published successfully!' : 'Draft saved!', 'success');
      navigate(`/post/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-navy-900">Create New Post</h1>
        <p className="text-slate-500 mt-2">Share your ideas with the world.</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
          {error}
        </div>
      )}

      <div className="card p-6 md:p-8 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your blog title..."
            className="input-field text-lg font-display font-semibold"
          />
        </div>

        {/* Category + Featured Image */}
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
              placeholder="https://example.com/image.jpg"
              className="input-field"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Short Description (optional)</label>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A brief summary of your post..."
            className="input-field"
            maxLength={200}
          />
          <p className="text-xs text-slate-400 mt-1">{excerpt.length}/200 characters</p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog content here... You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;blockquote&gt; for formatting."
            className="input-field min-h-[300px] resize-y font-mono text-sm leading-relaxed"
          />
          <p className="text-xs text-slate-400 mt-1">{content.length} characters</p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (optional)</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="technology, programming, web (comma-separated)"
              className="input-field pl-11"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => handleSubmit('published')}
            disabled={loading}
            className="btn-gradient flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCheck className="w-5 h-5" />}
            Publish Post
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="btn-outline flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Draft
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            disabled={loading}
            className="px-6 py-3 text-slate-600 font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

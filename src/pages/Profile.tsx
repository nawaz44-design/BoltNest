import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Mail, FileText, MessageCircle, Edit2, Save, X, Loader2, Calendar } from 'lucide-react';
import { fetchProfileById, updateProfile, fetchUserPosts, getUserCommentCount } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/components/Toast';
import BlogCard from '@/components/BlogCard';
import type { Profile as ProfileType, PostWithRelations } from '@/types';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { profile: currentUser, session, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  const targetId = id || session?.user?.id;
  const isOwnProfile = !id || id === session?.user?.id;

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    Promise.all([
      fetchProfileById(targetId),
      fetchUserPosts(targetId),
      getUserCommentCount(targetId),
    ])
      .then(([profileData, postData, count]) => {
        setProfile(profileData);
        setPosts(postData);
        setCommentCount(count);
        setEditName(profileData?.full_name || '');
        setEditBio(profileData?.bio || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [targetId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(targetId!, {
        full_name: editName.trim(),
        bio: editBio.trim(),
      });
      setProfile(updated);
      await refreshProfile();
      setEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
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

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display font-bold text-2xl text-navy-900 mb-4">Profile Not Found</h1>
        <Link to="/explore" className="btn-gradient inline-flex px-6 py-3">Explore Blogs</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="card overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {editing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field text-xl font-display font-bold"
                />
              ) : (
                <h1 className="font-display font-bold text-2xl text-navy-900">{profile.full_name}</h1>
              )}
              <p className="text-slate-500">@{profile.username}</p>
            </div>
            {isOwnProfile && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-outline px-4 py-2 flex items-center gap-2 text-sm"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}
            {editing && (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-gradient px-4 py-2 flex items-center gap-2 text-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditName(profile.full_name);
                    setEditBio(profile.bio || '');
                  }}
                  className="px-4 py-2 text-slate-600 font-semibold rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="mt-4">
            {editing ? (
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Write a short bio about yourself..."
                className="input-field min-h-[80px] resize-y"
                maxLength={300}
              />
            ) : (
              <p className="text-slate-600 leading-relaxed">
                {profile.bio || (isOwnProfile ? 'Add a bio to tell people about yourself.' : 'No bio yet.')}
              </p>
            )}
          </div>

          {/* Info row */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> {profile.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="rounded-xl bg-purple-50 p-4 text-center">
              <FileText className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="font-display font-bold text-xl text-navy-900">{posts.length}</p>
              <p className="text-xs text-slate-500">Posts</p>
            </div>
            <div className="rounded-xl bg-cyan-50 p-4 text-center">
              <MessageCircle className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <p className="font-display font-bold text-xl text-navy-900">{commentCount}</p>
              <p className="text-xs text-slate-500">Comments</p>
            </div>
          </div>
        </div>
      </div>

      {/* User's posts */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-navy-900 mb-4">
          {isOwnProfile ? 'My Posts' : `${profile.full_name.split(' ')[0]}'s Posts`}
        </h2>
        {posts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-slate-400">
              {isOwnProfile ? "You haven't published any posts yet." : "No published posts yet."}
            </p>
            {isOwnProfile && (
              <Link to="/create-post" className="btn-gradient inline-flex mt-4 px-6 py-3">
                Write Your First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

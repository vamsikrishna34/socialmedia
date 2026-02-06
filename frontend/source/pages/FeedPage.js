import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Post from '../components/Post';

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts/feed');
      setPosts(res.data.posts);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      const res = await api.post('/posts', { content: content.trim() });
      setPosts([res.data.post, ...posts]);
      setContent('');
    } catch (err) {
      alert('Failed to create post. Please try again.');
      console.error('Post creation failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-5">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-md p-5 mb-6">
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
            maxLength="280"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={!content.trim() || submitting}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition ${
                (!content.trim() || submitting) && 'opacity-50 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No posts yet. Be the first to share something!
        </div>
      ) : (
        posts.map(post => (
          <Post 
            key={post._id} 
            post={post} 
            onLike={fetchPosts} 
          />
        ))
      )}
    </div>
  );
}
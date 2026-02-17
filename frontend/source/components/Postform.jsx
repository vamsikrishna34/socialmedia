import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import mockAPI from '../services/mockAPI';

export default function PostForm({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content');
      return;
    }
    
    if (content.trim().length > 280) {
      setError('Post cannot exceed 280 characters');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const newPost = await mockAPI.createPost(content.trim(), user.id);
      setContent('');
      onPostCreated?.(newPost);
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-100">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center font-bold text-white flex-shrink-0">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError('');
              }}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="3"
              maxLength="280"
              disabled={loading}
            />
            
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {content.length}/280
              </p>
              
              <button
                type="submit"
                disabled={!content.trim() || loading}
                className={`px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition ${
                  (!content.trim() || loading) && 'opacity-50 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  </span>
                ) : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
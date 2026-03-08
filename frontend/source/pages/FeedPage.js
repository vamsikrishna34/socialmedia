import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInView } from 'react-intersection-observer';
import Navbar from '../components/Navbar';

// Single Post Component
const Post = ({ post, onLike }) => {
  const { user } = useAuth();
  const isLiked = post.likes.includes(user?.id);
  const likeCount = post.likes.length;

  const handleLike = () => {
    if (user) {
      onLike(post.id);
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-5 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white mr-3 flex-shrink-0">
          {post.author.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{post.author.username}</p>
              <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
        {post.content}
      </p>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button 
          onClick={handleLike}
          disabled={!user}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition ${
            isLiked 
              ? 'bg-red-50 text-red-600' 
              : 'text-gray-600 hover:bg-gray-50'
          } ${!user && 'opacity-50 cursor-not-allowed'}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`w-5 h-5 ${isLiked ? 'fill-current' : 'stroke-current'}`} 
            viewBox="0 0 24 24" 
            strokeWidth={isLiked ? 0 : 2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.216 1.412-.645 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span className="font-medium">{likeCount}</span>
        </button>
      </div>
    </div>
  );
};

// Post Form Component
const PostForm = ({ onCreatePost }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || content.trim().length > 280) return;
    
    setIsSubmitting(true);
    onCreatePost(content);
    setContent('');
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-100">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white flex-shrink-0">
            U
          </div>
          
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
              maxLength="280"
              disabled={isSubmitting}
            />
            
            <div className="mt-3 flex items-center justify-between">
              <p className={`text-sm ${content.length > 280 ? 'text-red-500' : 'text-gray-500'}`}>
                {content.length}/280
              </p>
              
              <button
                type="submit"
                disabled={!content.trim() || content.trim().length > 280 || isSubmitting}
                className={`px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition ${
                  (!content.trim() || content.trim().length > 280 || isSubmitting) && 'opacity-50 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
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
};

export default function FeedPage() {
  const { user, feedPosts, createPost, likePost } = useAuth();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Infinite scroll setup
  const { ref, inView } = useInView({
    threshold: 0.5,
    delay: 300
  });

  // Load more posts when scrolled near bottom
  const loadMorePosts = useCallback(() => {
    if (inView && hasMore && !loadingMore) {
      setLoadingMore(true);
      
      // Simulate API delay
      setTimeout(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        
        // No more posts after page 3 (mock data limitation)
        if (nextPage >= 3) {
          setHasMore(false);
        }
        
        setLoadingMore(false);
      }, 800);
    }
  }, [inView, hasMore, page]);

  const [loadingMore, setLoadingMore] = useState(false);
  
  // Trigger load when inView changes
  React.useEffect(() => {
    loadMorePosts();
  }, [inView, loadMorePosts]);

  if (!user) return null;

  // Paginate posts (10 per page)
  const paginatedPosts = feedPosts.slice(0, page * 10);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {user.username} 👋
          </h1>
          <p className="text-gray-600 mt-1">Share what's on your mind</p>
        </div>
        
        <PostForm onCreatePost={createPost} />
        
        {paginatedPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="text-6xl mb-4">💭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 mb-4">
              Be the first to share something!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedPosts.map(post => (
                <Post 
                  key={post.id} 
                  post={post} 
                  onLike={likePost} 
                />
              ))}
            </div>
            
            {/* Infinite scroll trigger */}
            {hasMore && (
              <div 
                ref={ref} 
                className="mt-6 py-4 text-center text-gray-500"
              >
                {loadingMore ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  'Scroll to load more...'
                )}
              </div>
            )}
            
            {!hasMore && paginatedPosts.length >= 10 && (
              <div className="mt-6 py-4 text-center text-gray-500 border-t border-gray-200">
                You've reached the end of your feed
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
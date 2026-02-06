import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Post({ post, onLike }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes.length);

  const handleLike = async () => {
    if (!user) return;
    
    try {
      if (liked) {
        await api.post(`/posts/${post._id}/unlike`);
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await api.post(`/posts/${post._id}/like`);
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
      onLike?.();
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const author = typeof post.author === 'string' ? { username: 'User' } : post.author;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-5">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-medium mr-3">
          {author.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{author.username}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      
      <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      
      <div className="mt-4 flex items-center">
        <button 
          onClick={handleLike}
          className={`flex items-center mr-4 ${
            liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          {likeCount}
        </button>
      </div>
    </div>
  );
}
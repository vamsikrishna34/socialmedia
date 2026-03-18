import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const { user, feedPosts, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();

  if (!user) return null;

  // Filter user's posts
  const userPosts = feedPosts.filter(post => post.author.id === user.id);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-2xl text-white mx-auto mb-4">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.username}</h1>
          <p className="text-gray-600 mb-4">{user.email}</p>
          
          <div className="flex justify-center space-x-6 mt-4">
            <div className="text-center">
              <div className="font-bold text-xl text-gray-900">{userPosts.length}</div>
              <div className="text-gray-600">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl text-gray-900">0</div>
              <div className="text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl text-gray-900">0</div>
              <div className="text-gray-600">Following</div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="mt-6 px-4 py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('posts')}
                className={`${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Your Posts
              </button>
              <button
                onClick={() => setActiveTab('liked')}
                className={`${
                  activeTab === 'liked'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Liked Posts
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'posts' ? (
              userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map(post => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(post.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  You haven't created any posts yet
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                Posts you've liked will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
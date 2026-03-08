import React, { createContext, useState, useContext, useEffect } from 'react';
import { useWebSocket } from './WebSocketContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedPosts, setFeedPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { socket, isConnected } = useWebSocket();

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      
      // Initialize with mock posts if no real data
      if (localStorage.getItem('posts')) {
        setFeedPosts(JSON.parse(localStorage.getItem('posts')));
      } else {
        const mockPosts = [
          {
            id: '1',
            content: 'Welcome to our social media platform! 🎉',
            author: { id: '1', username: 'admin' },
            likes: [],
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            content: 'This is a sample post to get you started. Try creating your own!',
            author: { id: '2', username: 'friend' },
            likes: ['1'],
            createdAt: new Date(Date.now() - 60000).toISOString()
          }
        ];
        setFeedPosts(mockPosts);
        localStorage.setItem('posts', JSON.stringify(mockPosts));
      }
    }
    setLoading(false);
  }, []);

  // WebSocket event listeners
  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    // Listen for new posts
    socket.on('new_post', (newPost) => {
      setFeedPosts(prev => [newPost, ...prev]);
      
      // Show notification if not own post
      if (newPost.author.id !== user.id) {
        addNotification({
          id: Date.now().toString(),
          type: 'post',
          message: `${newPost.author.username} posted: "${newPost.content.substring(0, 30)}..."`,
          read: false,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Listen for likes
    socket.on('post_liked', ({ postId, userId, username }) => {
      if (userId === user.id) return; // Don't notify self
      
      setFeedPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, likes: [...post.likes, userId] } 
            : post
        )
      );
      
      addNotification({
        id: Date.now().toString(),
        type: 'like',
        message: `${username} liked your post`,
        read: false,
        timestamp: new Date().toISOString()
      });
    });

    return () => {
      socket.off('new_post');
      socket.off('post_liked');
    };
  }, [socket, isConnected, user]);

  const login = (username, email) => {
    const newUser = { id: Date.now().toString(), username, email };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('posts');
    setUser(null);
    setFeedPosts([]);
    setNotifications([]);
  };

  const createPost = (content) => {
    if (!user || !content.trim()) return;
    
    const newPost = {
      id: Date.now().toString(),
      content: content.trim(),
      author: { id: user.id, username: user.username },
      likes: [],
      createdAt: new Date().toISOString()
    };
    
    // Update local state immediately (optimistic UI)
    setFeedPosts(prev => [newPost, ...prev]);
    localStorage.setItem('posts', JSON.stringify([newPost, ...feedPosts]));
    
    // Emit to WebSocket if available
    if (socket && isConnected) {
      socket.emit('create_post', newPost);
    } else {
      // Fallback: Simulate real-time for mock mode
      setTimeout(() => {
        // Notify other "users" in mock mode
        setFeedPosts(prev => [newPost, ...prev.filter(p => p.id !== newPost.id)]);
      }, 500);
    }
    
    return newPost;
  };

  const likePost = (postId) => {
    if (!user) return;
    
    setFeedPosts(prev => 
      prev.map(post => 
        post.id === postId && !post.likes.includes(user.id)
          ? { ...post, likes: [...post.likes, user.id] }
          : post
      )
    );
    
    // Save to localStorage
    const updatedPosts = feedPosts.map(post => 
      post.id === postId && !post.likes.includes(user.id)
        ? { ...post, likes: [...post.likes, user.id] }
        : post
    );
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    
    // Emit to WebSocket
    if (socket && isConnected) {
      socket.emit('like_post', { postId, userId: user.id, username: user.username });
    }
    
    return true;
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        loading,
        feedPosts,
        createPost,
        likePost,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
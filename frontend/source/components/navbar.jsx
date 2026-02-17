import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/feed" className="text-2xl font-bold text-primary-600">
            Social<span className="text-gray-700">Hub</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-6">
              <Link 
                to="/feed" 
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                Feed
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-medium text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-700 font-medium hidden md:block">
                  {user.username}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-primary-600 font-medium"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
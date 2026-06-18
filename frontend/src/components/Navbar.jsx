import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">🛡️ BlackNode</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="hover:text-blue-400 transition">
              Dashboard
            </Link>
            <Link to="/applications" className="hover:text-blue-400 transition">
              Applications
            </Link>
            <Link to="/events" className="hover:text-blue-400 transition">
              Events
            </Link>
            <div className="flex items-center space-x-4">
              {user && <span>{user.username}</span>}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

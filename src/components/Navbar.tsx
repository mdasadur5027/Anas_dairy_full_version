import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Milk, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Milk className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">RUET Milk</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Milk className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">RUET Milk</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700">Welcome, {user?.name}</span>
                {user?.role === 'client' ? (
                  <Link
                    to="/client/dashboard"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/admin/dashboard"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {!location.pathname.includes('/auth') && (
                  <>
                    <Link
                      to="/client/auth"
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Sign In
                    </Link>
                    {/* Discrete admin access - small settings icon */}
                    <Link
                      to="/admin/auth"
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                      title="Admin Access"
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
// src/components/auth/AuthButton.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CircleUser, LogOut, User } from 'lucide-react';

interface AuthButtonProps {
  onLoginSuccess: () => void;
  className?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({ onLoginSuccess, className = "" }) => {
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setShowDropdown(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
    setLoading(false);
  };

  if (currentUser) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${className}`}
        >
          <User size={18} />
          <span className="hidden sm:inline">
            {currentUser.displayName || currentUser.email}
          </span>
        </button>

        {showDropdown && (
          <>
            {/* Backdrop to close dropdown */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                <div className="font-medium">
                  {currentUser.displayName || 'User'}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">
                  {currentUser.email}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <LogOut size={16} />
                {loading ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onLoginSuccess}
      className={`flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${className}`}
    >
      <CircleUser size={18} />
      Sign In
    </button>
  );
};

export default AuthButton;
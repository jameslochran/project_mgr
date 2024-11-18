import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-blue-600 font-semibold">
            <LayoutDashboard size={24} />
            <span>Project Management</span>
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <Link 
                to="/profile" 
                className="text-gray-600 hover:text-gray-900"
              >
                {user.displayName || user.email}
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
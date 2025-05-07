import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, BarChart4, LogIn, LogOut, PlusCircle, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-primary-500" />
            <span className="text-xl font-bold text-gray-800">CivicPulse</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-primary-500 transition">Home</Link>
            <Link to="/leaderboard" className="text-gray-600 hover:text-primary-500 transition">Leaderboard</Link>
            {user ? (
              <>
                <Link to="/submit" className="flex items-center space-x-1 text-primary-500 hover:text-primary-600 transition">
                  <PlusCircle className="h-4 w-4" />
                  <span>Report Issue</span>
                </Link>
                {isAdmin() && (
                  <Link to="/admin" className="text-gray-600 hover:text-primary-500 transition">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    {profile?.name || user.email}
                    <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                      {profile?.points || 0} pts
                    </span>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-gray-600 hover:text-danger-500 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-1 text-primary-500 hover:text-primary-600 transition"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-3">
            <Link 
              to="/" 
              className="block py-2 text-gray-600 hover:text-primary-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/leaderboard" 
              className="block py-2 text-gray-600 hover:text-primary-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Leaderboard
            </Link>
            {user ? (
              <>
                <Link 
                  to="/submit" 
                  className="block py-2 text-primary-500 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Report Issue
                </Link>
                {isAdmin() && (
                  <Link 
                    to="/admin" 
                    className="block py-2 text-gray-600 hover:text-primary-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <div className="py-2 text-sm text-gray-600">
                  {profile?.name || user.email}
                  <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                    {profile?.points || 0} pts
                  </span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="block py-2 text-gray-600 hover:text-danger-500"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="block py-2 text-primary-500 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface NavbarProps {
  setView?: (view: 'dashboard' | 'users') => void;
  activeView?: 'dashboard' | 'users';
}

const Navbar: React.FC<NavbarProps> = ({ setView, activeView }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === Role.Admin;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-soc-navy shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
             <div className="text-soc-gold p-2 bg-white/10 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-9-5.747h18" /></svg>
             </div>
            <span className="text-white text-xl font-bold">SMANESI Olympiad Club (SOC)</span>
          </div>

          <div className="flex items-center gap-6">
            {isAdmin && setView && (
              <div className="hidden md:flex items-center space-x-2 bg-black/20 p-1 rounded-lg">
                <button onClick={() => setView('dashboard')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeView === 'dashboard' ? 'bg-soc-gold text-soc-navy' : 'text-white hover:bg-white/10'}`}>
                  Dashboard
                </button>
                <button onClick={() => setView('users')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeView === 'users' ? 'bg-soc-gold text-soc-navy' : 'text-white hover:bg-white/10'}`}>
                  User Management
                </button>
              </div>
            )}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-white hover:text-soc-gold transition-colors"
              >
                <span className="hidden md:inline">{user?.full_name}</span>
                <div className="w-10 h-10 rounded-full bg-soc-gold text-soc-navy flex items-center justify-center font-bold">
                  {user?.full_name?.charAt(0)}
                </div>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 py-1">
                  <div className="px-4 py-2 text-sm text-soc-navy border-b">
                      <p className="font-semibold">{user?.full_name}</p>
                      <p className="text-xs text-soc-gray">{user?.role}</p>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                    className="block px-4 py-2 text-sm text-soc-navy hover:bg-gray-100"
                  >
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

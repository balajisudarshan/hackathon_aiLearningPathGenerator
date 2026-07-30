import React, { useState, useRef, useEffect } from 'react';
import { Menu, GraduationCap, Bell, ChevronDown, Sun, Moon, LogOut, Target } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Topbar = ({ onToggleSidebar, user, onLogout, onOpenOnboarding }) => {
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName[0] + '.' : ''}`
    : (user?.email ? user.email.split('@')[0] : 'User');

  const fullEmail = user?.email || '';
  const avatar = user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 w-full flex items-center justify-between border-b border-[#ebebeb] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f] px-5 shrink-0 relative">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#888] hover:text-[#333] dark:hover:text-[#ccc] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#5438dc] rounded-lg flex items-center justify-center">
            <GraduationCap size={15} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-[#111] dark:text-[#e5e5e5] tracking-tight">
            AI LearnPath
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 relative" ref={dropdownRef}>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#888] hover:text-[#333] dark:hover:text-[#ccc] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <button
          className="w-8 h-8 relative flex items-center justify-center rounded-md text-[#888] hover:text-[#333] dark:hover:text-[#ccc] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#5438dc]" />
        </button>

        <button
          type="button"
          onClick={() => setShowDropdown(prev => !prev)}
          className="ml-2 flex items-center gap-2 cursor-pointer pl-2 border-l border-[#ebebeb] dark:border-[#1c1c1c] hover:opacity-80 transition-opacity focus:outline-none"
        >
          <img
            src={avatar}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover bg-slate-200 dark:bg-slate-800"
          />
          <span className="hidden md:block text-xs font-semibold text-[#333] dark:text-[#ccc] capitalize">
            {displayName}
          </span>
          <ChevronDown size={14} className={`text-[#999] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 top-12 w-56 bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#222] rounded-xl shadow-xl py-2 z-50">
            <div className="px-4 py-2 border-b border-[#ebebeb] dark:border-[#1e1e1e]">
              <p className="text-xs font-semibold text-[#111] dark:text-[#e5e5e5] capitalize truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : displayName}
              </p>
              <p className="text-[11px] text-[#888] dark:text-[#666] truncate mt-0.5">
                {fullEmail}
              </p>
            </div>

            <div className="p-1 space-y-0.5 border-b border-[#ebebeb] dark:border-[#1e1e1e]">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  if (onOpenOnboarding) onOpenOnboarding();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#333] dark:text-[#ccc] hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] rounded-lg transition-colors text-left"
              >
                <Target size={14} className="text-[#5438dc]" />
                <span>Learning Goals</span>
              </button>
            </div>

            <div className="p-1">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors text-left"
              >
                <LogOut size={14} />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;

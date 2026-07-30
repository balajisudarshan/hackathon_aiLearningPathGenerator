import React from 'react';
import { Menu, GraduationCap, Bell, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Topbar = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 w-full flex items-center justify-between border-b border-[#ebebeb] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f] px-5 shrink-0">
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

      <div className="flex items-center gap-1">
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

        <div className="ml-2 flex items-center gap-2 cursor-pointer pl-2 border-l border-[#ebebeb] dark:border-[#1c1c1c]">
          <img
            src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=64&fit=crop"
            alt="Profile"
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="hidden md:block text-xs font-semibold text-[#333] dark:text-[#ccc]">John D.</span>
          <ChevronDown size={14} className="text-[#999]" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;

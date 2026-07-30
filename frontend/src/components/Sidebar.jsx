import React from 'react';
import {
  Home, Network, BookOpen, HelpCircle, BarChart2,
  Calendar, Sparkles, Settings, LogOut, X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, activeTab = 'Dashboard', setActiveTab }) => {
  const mainNavItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: Home },
    { id: 'Learning Path', label: 'Learning Path', icon: Network },
    { id: 'Materials', label: 'Materials', icon: BookOpen },
    { id: 'Quizzes', label: 'Quizzes', icon: HelpCircle },
    { id: 'Performance', label: 'Performance', icon: BarChart2 },
    { id: 'Schedule', label: 'Schedule', icon: Calendar },
    { id: 'AI Assistant', label: 'AI Assistant', icon: Sparkles },
  ];

  const bottomNavItems = [
    { id: 'Settings', label: 'Settings', icon: Settings },
    { id: 'Logout', label: 'Logout', icon: LogOut },
  ];

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        onClick={() => {
          if (setActiveTab) setActiveTab(item.id);
          if (window.innerWidth < 1024) onClose();
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
          isActive
            ? 'bg-[#5438dc]/10 dark:bg-[#5438dc]/15 text-[#5438dc] dark:text-[#7c64f0]'
            : 'text-[#666] dark:text-[#666] hover:text-[#111] dark:hover:text-[#ccc] hover:bg-[#f5f5f5] dark:hover:bg-[#161616]'
        }`}
      >
        <Icon size={16} className={isActive ? 'text-[#5438dc] dark:text-[#7c64f0]' : 'text-[#999] dark:text-[#555]'} />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 w-56 flex flex-col justify-between border-r border-[#ebebeb] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f] py-4 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-1 px-3">
          <div className="flex items-center justify-between mb-3 lg:hidden">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#bbb] dark:text-[#444]">Menu</span>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-[#999] hover:text-[#555] dark:hover:text-[#ccc]">
              <X size={14} />
            </button>
          </div>

          <div className="mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#bbb] dark:text-[#444] px-3">Navigation</span>
          </div>

          {mainNavItems.map(item => <NavItem key={item.id} item={item} />)}
        </div>

        <div className="px-3 pt-3 border-t border-[#ebebeb] dark:border-[#1c1c1c]">
          <div className="mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#bbb] dark:text-[#444] px-3">Account</span>
          </div>
          {bottomNavItems.map(item => <NavItem key={item.id} item={item} />)}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

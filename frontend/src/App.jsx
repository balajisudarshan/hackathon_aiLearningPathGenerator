import React, { useState } from 'react';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const handleLoginSuccess = () => setCurrentPage('dashboard');
  const handleLogout = () => { setCurrentPage('login'); setActiveTab('Dashboard'); };

  if (currentPage === 'login' || currentPage === 'register') {
    return (
      <div className="relative">
        {/* Dev switcher */}
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full bg-[#111] dark:bg-[#1a1a1a] border border-[#333] p-1 text-[11px] font-medium shadow-xl">
          {['login', 'register', 'dashboard'].map(p => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`rounded-full px-3 py-1 capitalize transition-all ${
                currentPage === p ? 'bg-[#5438dc] text-white' : 'text-[#888] hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        {currentPage === 'login'
          ? <Login onLoginSuccess={handleLoginSuccess} />
          : <Register onRegisterSuccess={handleLoginSuccess} />
        }
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
      {/* Dev switcher */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full bg-[#111] dark:bg-[#1a1a1a] border border-[#333] p-1 text-[11px] font-medium shadow-xl">
        {['login', 'register', 'dashboard'].map(p => (
          <button
            key={p}
            onClick={() => setCurrentPage(p)}
            className={`rounded-full px-3 py-1 capitalize transition-all ${
              currentPage === p ? 'bg-[#5438dc] text-white' : 'text-[#888] hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <Topbar onToggleSidebar={() => setIsSidebarOpen(p => !p)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'Logout') handleLogout();
            else setActiveTab(tab);
          }}
        />

        <main className="flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'Dashboard' ? (
              <Dashboard />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl border border-[#ebebeb] dark:border-[#1e1e1e] bg-white dark:bg-[#141414]">
                <div className="text-center">
                  <h2 className="text-base font-semibold text-[#333] dark:text-[#ccc]">{activeTab}</h2>
                  <p className="mt-1 text-sm text-[#aaa] dark:text-[#555]">Coming soon.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
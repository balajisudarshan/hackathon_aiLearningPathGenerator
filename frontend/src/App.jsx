import React, { useState } from 'react';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

const App = () => {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState('login'); // 'login' | 'register'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Session loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <Loader2 size={28} className="animate-spin text-[#5438dc]" />
      </div>
    );
  }

  // Not logged in → show auth pages
  if (!user) {
    return page === 'login'
      ? <Login onLoginSuccess={() => {}} onGoToRegister={() => setPage('register')} />
      : <Register onRegisterSuccess={() => {}} onGoToLogin={() => setPage('login')} />;
  }

  // Logged in → show dashboard
  return (
    <div className="flex flex-col h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
      <Topbar
        onToggleSidebar={() => setIsSidebarOpen(p => !p)}
        user={user}
        onLogout={logout}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'Logout') {
              logout();
            } else {
              setActiveTab(tab);
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-6xl mx-auto h-full">
            {activeTab === 'Dashboard' ? (
              <Dashboard user={user} />
            ) : activeTab === 'AI Assistant' ? (
              <AIAssistant user={user} />
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
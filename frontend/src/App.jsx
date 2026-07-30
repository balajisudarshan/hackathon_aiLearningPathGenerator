import React, { useState, useEffect } from 'react';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import OnboardingModal from './components/OnboardingModal';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import Roadmap from './pages/Roadmap';
import Materials from './pages/Materials';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

const App = () => {
  const { user, loading, logout, refreshUser, updateUser } = useAuth();
  const [page, setPage] = useState('landing'); // 'landing' | 'login' | 'register'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  // For chat → roadmap deep-link
  const [activeRoadmapId, setActiveRoadmapId] = useState(null);

  // Auto-open onboarding if user has not completed or skipped it
  useEffect(() => {
    if (user) {
      const pref = user.preferences || {};
      if (!pref.onboardingCompleted && !pref.onboardingSkipped) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    }
  }, [user]);

  // Navigate to a specific roadmap from chat
  const navigateToRoadmap = (roadmapId) => {
    setActiveRoadmapId(roadmapId);
    setActiveTab('Learning Path');
  };

  // Session loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <Loader2 size={28} className="animate-spin text-[#5438dc]" />
      </div>
    );
  }

  // Not logged in → show landing or auth pages
  if (!user) {
    if (page === 'landing') return <Landing onLogin={() => setPage('login')} onRegister={() => setPage('register')} />;
    if (page === 'login') return <Login onLoginSuccess={() => {}} onGoToRegister={() => setPage('register')} />;
    if (page === 'register') return <Register onRegisterSuccess={() => {}} onGoToLogin={() => setPage('login')} />;
  }

  // Logged in → show dashboard
  return (
    <div className="flex flex-col h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
      <Topbar
        onToggleSidebar={() => setIsSidebarOpen(p => !p)}
        user={user}
        onLogout={logout}
        onOpenOnboarding={() => setShowOnboarding(true)}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={(data) => {
          setShowOnboarding(false);
          if (data?.user) {
            updateUser(data.user);
          }
          refreshUser();
        }}
        initialUser={user}
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
              // Reset roadmap deep-link when navigating away
              if (tab !== 'Learning Path') setActiveRoadmapId(null);
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-6xl mx-auto h-full">
            {activeTab === 'Dashboard' ? (
              <Dashboard user={user} onOpenOnboarding={() => setShowOnboarding(true)} />
            ) : activeTab === 'AI Assistant' ? (
              <AIAssistant user={user} onNavigateToRoadmap={navigateToRoadmap} />
            ) : activeTab === 'Learning Path' ? (
              <Roadmap
                user={user}
                initialRoadmapId={activeRoadmapId}
                onNavigateToChat={() => setActiveTab('AI Assistant')}
              />
            ) : activeTab === 'Materials' ? (
              <Materials user={user} />
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
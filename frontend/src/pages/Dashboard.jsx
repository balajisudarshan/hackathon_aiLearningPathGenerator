import React, { useState, useEffect } from 'react';
import { TrendingUp, BookCheck, Flame, AlertCircle, CheckCircle2, Sparkles, ArrowRight, Target, ShieldAlert, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { performanceApi } from '../services/api';
import LearningProgressModal from '../components/LearningProgressModal';

const StatCard = ({ title, value, sub, accent }) => (
  <div className="bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-xl p-5 shadow-xs">
    <p className="text-xs font-semibold text-[#999] dark:text-[#555] uppercase tracking-wider mb-3">{title}</p>
    <p className="text-2xl font-bold text-[#111] dark:text-[#e5e5e5] tracking-tight">{value}</p>
    {sub && <p className="text-xs text-[#aaa] dark:text-[#555] mt-1">{sub}</p>}
  </div>
);

const Dashboard = ({ user, onNavigateToRoadmap }) => {
  const name = user?.firstName || (user?.email ? user.email.split('@')[0] : 'User');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const res = await performanceApi.getPerformance();
      if (res.success && res.performance) {
        setData(res.performance);
      }
    } catch (err) {
      console.error('Failed to load performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const progress = data?.overallProgress || 0;
  const circumference = 2 * Math.PI * 36;
  const totalTopics = data?.totalTopics || 0;
  const completedTopics = data?.completedTopics || 0;
  const remainingTopics = data?.remainingTopics || 0;
  const topicBreakdown = data?.topicBreakdown || [];
  const suggestions = data?.suggestions || [];

  return (
    <div className="space-y-6 pb-6">
      {/* Learning Progress Modal */}
      <LearningProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        onNavigateToRoadmap={onNavigateToRoadmap}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#111] dark:text-[#e5e5e5] tracking-tight capitalize">
            Good day, {name} 👋
          </h1>
          <p className="text-sm text-[#999] dark:text-[#555] mt-0.5">
            Here is your personal topic performance breakdown and study recommendations.
          </p>
        </div>

        <button
          onClick={fetchPerformance}
          disabled={loading}
          className="p-2 rounded-lg bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#1e1e1e] text-[#555] dark:text-[#aaa] hover:text-[#5438dc] transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-[#5438dc]" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Overall Performance" value={`${progress}%`} sub={progress > 50 ? "On Track" : "Needs Review"} />
        <StatCard title="Topics Completed" value={`${completedTopics} / ${totalTopics}`} sub={`${remainingTopics} remaining`} />
        <StatCard title="Target Role" value={user?.preferences?.targetRole || "Software Engineer"} sub="Active Goal" />
        <StatCard title="Experience Level" value={user?.preferences?.experienceLevel || "Intermediate"} sub="Personalized" />
      </div>

      {/* Overview & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">

        {/* Progress ring card (Clickable to open modal) */}
        <div 
          onClick={() => setShowProgressModal(true)}
          className="bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#1e1e1e] hover:border-[#5438dc]/40 rounded-xl p-6 flex flex-col justify-between shadow-xs cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold text-[#999] dark:text-[#555] uppercase tracking-wider">Learning Progress</p>
            <span className="text-xs font-semibold text-[#5438dc] group-hover:underline flex items-center gap-1">
              View Breakdown <ExternalLink size={12} />
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="#f0f0f0" className="dark:[stroke:#1e1e1e]" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="36"
                  fill="none"
                  stroke="#5438dc"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#111] dark:text-[#e5e5e5]">{progress}%</span>
                <span className="text-[11px] text-[#aaa] dark:text-[#555] font-medium">Mastery</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-3 gap-2 text-center mt-2">
              <div className="rounded-lg bg-[#f8f8f8] dark:bg-[#1a1a1a] py-2.5">
                <p className="text-sm font-bold text-[#111] dark:text-[#ddd]">{completedTopics}</p>
                <p className="text-[10px] text-[#bbb] dark:text-[#555] font-medium mt-0.5">Done</p>
              </div>
              <div className="rounded-lg bg-[#f8f8f8] dark:bg-[#1a1a1a] py-2.5">
                <p className="text-sm font-bold text-[#111] dark:text-[#ddd]">{remainingTopics}</p>
                <p className="text-[10px] text-[#bbb] dark:text-[#555] font-medium mt-0.5">Pending</p>
              </div>
              <div className="rounded-lg bg-[#f8f8f8] dark:bg-[#1a1a1a] py-2.5">
                <p className="text-sm font-bold text-[#111] dark:text-[#ddd]">{topicBreakdown.length}</p>
                <p className="text-[10px] text-[#bbb] dark:text-[#555] font-medium mt-0.5">Roadmaps</p>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Fix Suggestions */}
        <div className="bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-xl p-6 flex flex-col shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={16} className="text-[#5438dc]" />
            <p className="text-xs font-semibold text-[#999] dark:text-[#555] uppercase tracking-wider">Where to Fix & Focus</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[220px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-32 text-[#888]">
                <Loader2 size={24} className="animate-spin text-[#5438dc] mb-2" />
                <p className="text-xs">Analyzing performance gaps...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#fafafa] dark:bg-[#181818] text-center text-xs text-[#888]">
                No critical gaps detected! Keep practicing and generate new roadmaps to expand your skills.
              </div>
            ) : (
              suggestions.map((s) => (
                <div 
                  key={s.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                    s.severity === 'high'
                      ? 'bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-300'
                      : s.severity === 'medium'
                      ? 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-300'
                      : 'bg-[#5438dc]/5 border-[#5438dc]/20 text-[#5438dc] dark:text-[#7c64f0]'
                  }`}
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold mb-0.5">{s.title}</h4>
                    <p className="text-[11px] leading-relaxed opacity-90">{s.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Topic Performance Breakdown Grid */}
      <div className="bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-[#5438dc]" />
            <h2 className="text-sm font-bold text-[#111] dark:text-[#e5e5e5]">Topic Performance Breakdown</h2>
          </div>
          <span className="text-xs text-[#888]">Based on roadmap completion</span>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 size={24} className="animate-spin text-[#5438dc]" />
          </div>
        ) : topicBreakdown.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#888]">
            No topic performance data available yet. Generate a roadmap in the Learning Path section to start tracking.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicBreakdown.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-[#fafafa] dark:bg-[#1a1a1a] border border-[#ebebeb] dark:border-[#222] flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#111] dark:text-[#e5e5e5] capitalize">{item.topic}</h3>
                    <p className="text-[10px] text-[#888] capitalize">Level: {item.level}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                    item.percentage >= 80
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : item.percentage >= 40
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {item.proficiency}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] text-[#777] mb-1 font-medium">
                    <span>{item.completedTopics} of {item.totalTopics} topics</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#ebebeb] dark:bg-[#252525] overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.percentage >= 80 ? 'bg-emerald-500' : item.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
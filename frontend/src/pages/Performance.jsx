import React, { useState, useEffect } from 'react';
import { BarChart2, ShieldAlert, Target, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Loader2, RefreshCw, BookOpen, Award, TrendingUp } from 'lucide-react';
import { performanceApi } from '../services/api';

const Performance = ({ user, onNavigateToRoadmap }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'mastered' | 'review'

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
      console.error('Failed to fetch performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const progress = data?.overallProgress || 0;
  const totalTopics = data?.totalTopics || 0;
  const completedTopics = data?.completedTopics || 0;
  const remainingTopics = data?.remainingTopics || 0;
  const topicBreakdown = data?.topicBreakdown || [];
  const suggestions = data?.suggestions || [];

  const filteredTopics = topicBreakdown.filter(item => {
    if (filter === 'mastered') return item.percentage >= 80;
    if (filter === 'review') return item.percentage < 60;
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] rounded-xl border border-[#ebebeb] dark:border-[#1c1c1c] bg-[#fafafa] dark:bg-[#0a0a0a] overflow-hidden">
      
      {/* Header */}
      <div className="shrink-0 p-5 border-b border-[#ebebeb] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5438dc]/10 dark:bg-[#5438dc]/20 flex items-center justify-center">
            <BarChart2 size={20} className="text-[#5438dc] dark:text-[#7c64f0]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#111] dark:text-[#e5e5e5]">Performance & Diagnostics</h1>
            <p className="text-xs text-[#888] dark:text-[#666]">Track topic mastery levels and actionable diagnostic fix suggestions.</p>
          </div>
        </div>

        <button 
          onClick={fetchPerformance}
          disabled={loading}
          className="p-2 rounded-lg bg-[#f5f5f5] dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#222] text-[#555] dark:text-[#aaa] hover:text-[#5438dc] transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-[#5438dc]" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#111] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#999] dark:text-[#555] uppercase tracking-wider">Overall Proficiency</span>
              <TrendingUp size={16} className="text-[#5438dc]" />
            </div>
            <p className="text-3xl font-extrabold text-[#111] dark:text-[#e5e5e5]">{progress}%</p>
            <div className="w-full bg-[#f0f0f0] dark:bg-[#222] h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#5438dc] h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="bg-white dark:bg-[#111] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#999] dark:text-[#555] uppercase tracking-wider">Completed Topics</span>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <p className="text-3xl font-extrabold text-[#111] dark:text-[#e5e5e5]">{completedTopics} <span className="text-base font-normal text-[#888]">/ {totalTopics}</span></p>
            <p className="text-xs text-[#888] mt-2">{remainingTopics} topics remaining</p>
          </div>

          <div className="bg-white dark:bg-[#111] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#999] dark:text-[#555] uppercase tracking-wider">Active Roadmaps</span>
              <BookOpen size={16} className="text-amber-500" />
            </div>
            <p className="text-3xl font-extrabold text-[#111] dark:text-[#e5e5e5]">{topicBreakdown.length}</p>
            <p className="text-xs text-[#888] mt-2">Personalized learning paths</p>
          </div>

          <div className="bg-white dark:bg-[#111] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#999] dark:text-[#555] uppercase tracking-wider">Diagnostic Alerts</span>
              <ShieldAlert size={16} className="text-red-500" />
            </div>
            <p className="text-3xl font-extrabold text-[#111] dark:text-[#e5e5e5]">{suggestions.filter(s => s.severity === 'high' || s.severity === 'medium').length}</p>
            <p className="text-xs text-[#888] mt-2">Gaps to fix</p>
          </div>
        </div>

        {/* Where to Fix & Focus (Diagnostic Suggestions) */}
        <div className="bg-white dark:bg-[#111] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={18} className="text-[#5438dc]" />
            <h2 className="text-base font-bold text-[#111] dark:text-[#e5e5e5]">Where to Fix & Focus (AI Diagnostics)</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-36 text-[#888]">
              <Loader2 size={24} className="animate-spin text-[#5438dc] mb-2" />
              <p className="text-xs">Analyzing learning progress & topic gaps...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-5 rounded-xl bg-[#fafafa] dark:bg-[#161616] text-center text-xs text-[#888]">
              No diagnostic issues found! Your progress across all roadmaps is strong.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((s) => (
                <div 
                  key={s.id}
                  className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                    s.severity === 'high'
                      ? 'bg-red-500/5 border-red-500/20 text-red-700 dark:text-red-300'
                      : s.severity === 'medium'
                      ? 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-300'
                      : 'bg-[#5438dc]/5 border-[#5438dc]/20 text-[#5438dc] dark:text-[#7c64f0]'
                  }`}
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold">{s.title}</h4>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-current/10">
                        {s.severity} Priority
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90 mb-3">{s.description}</p>
                    
                    {s.targetTopic && (
                      <button 
                        onClick={() => onNavigateToRoadmap && onNavigateToRoadmap()}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5438dc] dark:text-[#7c64f0] hover:underline"
                      >
                        Go to Roadmap <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Topic Breakdown Grid with Filter Tabs */}
        <div className="bg-white dark:bg-[#111] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-[#5438dc]" />
              <h2 className="text-base font-bold text-[#111] dark:text-[#e5e5e5]">Topic & Domain Performance</h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#f5f5f5] dark:bg-[#1a1a1a] p-1 rounded-lg self-start sm:self-auto">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  filter === 'all' ? 'bg-white dark:bg-[#2a2a2a] text-[#5438dc] shadow-xs' : 'text-[#888]'
                }`}
              >
                All ({topicBreakdown.length})
              </button>
              <button
                onClick={() => setFilter('mastered')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  filter === 'mastered' ? 'bg-white dark:bg-[#2a2a2a] text-emerald-600 shadow-xs' : 'text-[#888]'
                }`}
              >
                Mastered
              </button>
              <button
                onClick={() => setFilter('review')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  filter === 'review' ? 'bg-white dark:bg-[#2a2a2a] text-red-600 shadow-xs' : 'text-[#888]'
                }`}
              >
                Needs Review
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 size={28} className="animate-spin text-[#5438dc]" />
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#888]">
              No topics match the selected filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-xl bg-[#fafafa] dark:bg-[#161616] border border-[#ebebeb] dark:border-[#222] flex flex-col justify-between space-y-4 hover:border-[#5438dc]/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#111] dark:text-[#e5e5e5] capitalize">{item.topic}</h3>
                      <p className="text-[11px] text-[#888] capitalize">Level: {item.level}</p>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      item.percentage >= 80
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : item.percentage >= 40
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                    }`}>
                      {item.proficiency}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-[#666] dark:text-[#aaa] mb-1.5 font-medium">
                      <span>{item.completedTopics} of {item.totalTopics} topics</span>
                      <span className="font-bold">{item.percentage}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#ebebeb] dark:bg-[#252525] overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.percentage >= 80 ? 'bg-emerald-500' : item.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#ebebeb] dark:border-[#222] flex justify-between items-center">
                    <span className="text-[10px] text-[#888]">Status: {item.percentage === 100 ? 'Fully Mastered' : item.percentage > 0 ? 'In Progress' : 'Not Started'}</span>
                    <button 
                      onClick={() => onNavigateToRoadmap && onNavigateToRoadmap(item.roadmapId)}
                      className="text-xs font-semibold text-[#5438dc] dark:text-[#7c64f0] hover:underline flex items-center gap-1"
                    >
                      View Path <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Performance;

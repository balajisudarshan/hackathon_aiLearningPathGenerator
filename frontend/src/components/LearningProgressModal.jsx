import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Map, CheckCircle2, ArrowRight, Loader2, BookOpen, Clock, Award } from 'lucide-react';
import { progressApi } from '../services/api';

const LEVEL_BADGES = {
  beginner: { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  intermediate: { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  advanced: { bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

const LearningProgressModal = ({ isOpen, onClose, onNavigateToRoadmap }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchProgress();
    }
  }, [isOpen]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await progressApi.getProgress();
      if (res.success && res.progress) {
        setData(res.progress);
      }
    } catch (err) {
      console.error('Failed to load learning progress:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const overallProgress = data?.overallProgress || 0;
  const roadmapList = data?.roadmapProgressList || [];
  const totalRoadmaps = data?.totalRoadmaps || 0;
  const completedRoadmaps = data?.completedRoadmaps || 0;
  const totalTopics = data?.totalTopics || 0;
  const completedTopics = data?.completedTopics || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111] border border-[#ebebeb] dark:border-[#222] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ebebeb] dark:border-[#1e1e1e] bg-[#fafafa] dark:bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5438dc]/10 flex items-center justify-center text-[#5438dc]">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111] dark:text-white">Learning Progress by Roadmap</h2>
              <p className="text-xs text-[#888]">Detailed completion status across all your learning paths.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#aaa] hover:text-[#333] dark:hover:text-white hover:bg-[#f0f0f0] dark:hover:bg-[#222] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#5438dc]/10 via-[#5438dc]/5 to-transparent border border-[#5438dc]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" className="dark:stroke-[#222]" strokeWidth="4" />
                  <circle
                    cx="20" cy="20" r="16"
                    fill="none"
                    stroke="#5438dc"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 16}
                    strokeDashoffset={2 * Math.PI * 16 * (1 - overallProgress / 100)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#111] dark:text-white">
                  {overallProgress}%
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#111] dark:text-white">Total Completion Rate</h3>
                <p className="text-xs text-[#666] dark:text-[#888] mt-0.5">
                  {completedTopics} of {totalTopics} topics completed across {totalRoadmaps} roadmaps.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-white dark:bg-[#1a1a1a] border border-[#ebebeb] dark:border-[#222] text-[#5438dc] shrink-0">
              <Award size={14} />
              <span>{completedRoadmaps} Mastered</span>
            </div>
          </div>

          {/* Roadmaps Completion List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#999] dark:text-[#555] mb-3">
              Roadmap Progress Breakdown
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 text-[#888]">
                <Loader2 size={24} className="animate-spin text-[#5438dc] mb-2" />
                <p className="text-xs">Calculating roadmap completion rates...</p>
              </div>
            ) : roadmapList.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#888] bg-[#fafafa] dark:bg-[#161616] rounded-xl border border-[#ebebeb] dark:border-[#222]">
                <Map size={28} className="mx-auto mb-2 opacity-30" />
                No roadmaps generated yet. Create your first roadmap to track completion!
              </div>
            ) : (
              <div className="space-y-3">
                {roadmapList.map((rm) => {
                  const badge = LEVEL_BADGES[rm.level] || LEVEL_BADGES.beginner;
                  return (
                    <div
                      key={rm.id}
                      className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#202020] hover:border-[#5438dc]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-[#111] dark:text-white truncate">{rm.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize ${badge.bg}`}>
                            {rm.level}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#888]">
                          <span className="flex items-center gap-1">
                            <BookOpen size={12} /> {rm.completedTopics} / {rm.totalTopics} topics
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {rm.estimatedWeeks} weeks
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#f0f0f0] dark:bg-[#222] h-2 rounded-full mt-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              rm.completionPercentage === 100
                                ? 'bg-emerald-500'
                                : rm.completionPercentage > 40
                                ? 'bg-[#5438dc]'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${rm.completionPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Percentage & View Action */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#f0f0f0] dark:border-[#1e1e1e]">
                        <span className="text-lg font-extrabold text-[#111] dark:text-white">
                          {rm.completionPercentage}%
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onNavigateToRoadmap) onNavigateToRoadmap(rm.id);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5438dc] dark:text-[#7c64f0] hover:underline cursor-pointer"
                        >
                          <span>View Roadmap</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#ebebeb] dark:border-[#1e1e1e] bg-[#fafafa] dark:bg-[#141414] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-[#111] dark:bg-white text-white dark:text-[#111] rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default LearningProgressModal;

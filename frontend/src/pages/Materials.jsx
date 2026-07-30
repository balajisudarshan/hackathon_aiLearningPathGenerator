import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Video, FileText, Sparkles, ExternalLink, 
  Search, Filter, Loader2, Book, Code, Globe, PlayCircle 
} from 'lucide-react';
import { resourceApi } from '../services/api';

const RESOURCE_ICONS = {
  video: PlayCircle,
  article: FileText,
  course: BookOpen,
  documentation: Book,
  github: Code,
  practice: Globe
};

const DIFFICULTY_COLORS = {
  beginner: { bg: '#dcfce7', text: '#15803d', border: '#22c55e' },
  intermediate: { bg: '#fef3c7', text: '#b45309', border: '#f59e0b' },
  advanced: { bg: '#fee2e2', text: '#b91c1c', border: '#ef4444' },
};

const Materials = ({ user }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchInitialRecommendations();
  }, []);

  const fetchInitialRecommendations = async () => {
    try {
      setLoading(true);
      
      const pref = user?.preferences || {};
      const interests = pref.interests || [];
      const expLevel = pref.experienceLevel || 'all';

      // If user has interests, use the first one as primary technology for recommendation
      if (interests.length > 0) {
        const primaryTech = interests[0];
        const res = await resourceApi.recommend({
          technology: primaryTech,
          tags: interests,
          difficulty: expLevel
        });
        
        if (res.success && res.resources?.length > 0) {
          setResources(res.resources);
          setLoading(false);
          return;
        }
      }

      // Fallback: fetch all resources if no recommendations found or no interests
      await handleSearch();

    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      // Fallback to normal search
      await handleSearch();
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSearching(true);
      
      const params = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (difficultyFilter !== 'all') params.difficulty = difficultyFilter;

      const res = await resourceApi.search(params);
      if (res.success) {
        setResources(res.resources || []);
      }
    } catch (err) {
      console.error('Failed to search resources:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResourceClick = async (resource) => {
    // Optionally track view in background
    try {
      resourceApi.incrementViews(resource._id || resource.id);
    } catch (e) {
      // ignore
    }
    window.open(resource.url, '_blank');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] rounded-xl border border-[#ebebeb] dark:border-[#1c1c1c] bg-[#fafafa] dark:bg-[#0a0a0a] overflow-hidden">
      
      {/* Header & Search Bar */}
      <div className="shrink-0 p-5 border-b border-[#ebebeb] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#5438dc]/10 dark:bg-[#5438dc]/20 flex items-center justify-center">
            <BookOpen size={20} className="text-[#5438dc] dark:text-[#7c64f0]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#111] dark:text-[#e5e5e5]">Learning Materials</h1>
            <p className="text-xs text-[#888] dark:text-[#666]">Curated resources based on your goals and learning path.</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
            <input
              type="text"
              placeholder="Search for Python, React, System Design..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#f5f5f5] dark:bg-[#141414] border border-[#e5e7eb] dark:border-[#222] rounded-lg text-[#111] dark:text-[#e5e5e5] placeholder:text-[#aaa] outline-none focus:border-[#5438dc] focus:ring-1 focus:ring-[#5438dc]/20 transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="pl-8 pr-8 py-2 text-sm bg-[#f5f5f5] dark:bg-[#141414] border border-[#e5e7eb] dark:border-[#222] rounded-lg text-[#333] dark:text-[#ccc] outline-none focus:border-[#5438dc] transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2 bg-[#5438dc] hover:bg-[#452bc4] text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Resource Grid */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-[#888]">
            <Loader2 size={32} className="animate-spin text-[#5438dc] mb-4" />
            <p className="text-sm">Curating best materials for you...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#888] max-w-md mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-[#aaa]" />
            </div>
            <h3 className="text-base font-semibold text-[#333] dark:text-[#ccc] mb-2">No resources found</h3>
            <p className="text-xs text-[#888]">Try adjusting your search query or filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((res) => {
              const Icon = RESOURCE_ICONS[res.type] || BookOpen;
              const diffColors = DIFFICULTY_COLORS[res.difficulty] || DIFFICULTY_COLORS.beginner;
              
              return (
                <div 
                  key={res._id || res.id} 
                  onClick={() => handleResourceClick(res)}
                  className="group flex flex-col bg-white dark:bg-[#111] border border-[#e5e7eb] dark:border-[#1e1e1e] hover:border-[#5438dc]/50 dark:hover:border-[#5438dc]/50 rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] dark:bg-[#1a1a1a] group-hover:bg-[#5438dc]/10 dark:group-hover:bg-[#5438dc]/20 flex items-center justify-center transition-colors">
                      <Icon size={18} className="text-[#555] dark:text-[#aaa] group-hover:text-[#5438dc] dark:group-hover:text-[#7c64f0]" />
                    </div>
                    <span 
                      className="text-[10px] px-2 py-1 rounded-md font-medium capitalize border"
                      style={{ backgroundColor: diffColors.bg, color: diffColors.text, borderColor: diffColors.border }}
                    >
                      {res.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-[#111] dark:text-[#e5e5e5] mb-1.5 line-clamp-2 group-hover:text-[#5438dc] dark:group-hover:text-[#7c64f0] transition-colors">
                    {res.title}
                  </h3>
                  
                  <p className="text-xs text-[#666] dark:text-[#888] line-clamp-3 mb-4 flex-1 leading-relaxed">
                    {res.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f0f0f0] dark:border-[#1c1c1c]">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#555] dark:text-[#aaa] font-medium capitalize">
                        {res.type}
                      </span>
                      {res.technology && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0f0f0] dark:bg-[#1a1a1a] text-[#555] dark:text-[#aaa] font-medium">
                          {res.technology}
                        </span>
                      )}
                    </div>
                    <ExternalLink size={14} className="text-[#aaa] group-hover:text-[#5438dc] transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Materials;

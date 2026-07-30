import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Search,
  ChevronDown
} from 'lucide-react';
import { userApi } from '../services/api';

const ALL_TARGET_ROLES = [
  // Computer Science & IT
  "Full Stack Web Developer",
  "AI / Machine Learning Engineer",
  "Frontend Developer (React / Vue / Angular)",
  "Backend Developer (Node.js / Python / Java / Go)",
  "Data Scientist & AI Researcher",
  "Data Engineer & Big Data Analytics",
  "Mobile App Developer (iOS / Android / Flutter)",
  "Cloud & DevOps Engineer (AWS / Azure / Docker)",
  "Cybersecurity & Ethical Hacking",
  "UI/UX & Product Designer",
  "Game Developer (Unity / Unreal Engine)",
  "Embedded Systems & IoT Engineer",
  "Software Architect",
  "Product Manager",

  // Core Engineering & Non-CS Majors
  "Mechanical Engineering (CAD / Thermal / Design)",
  "Electrical & Electronics Engineering (EEE)",
  "Electronics & Communication Engineering (ECE)",
  "Aeronautical & Aerospace Engineering",
  "Civil & Structural Engineering",
  "Chemical & Materials Engineering",
  "Robotics & Automation Engineer",
  "Mechatronics Engineering",
  "Automobile & Automotive Engineering",
  "Biomedical Engineering & BioTech",
  "Industrial & Production Engineering",
  "Physics / Mathematics / Applied Sciences",
  "Business Administration & Finance"
];

const CURRENT_ROLE_OPTIONS = [
  "Student (High School / University)",
  "Computer Science / IT Major",
  "Mechanical / Aeronautical Engineering Student",
  "Electrical / Electronics (EEE/ECE) Student",
  "Civil / Chemical / Core Engineering Student",
  "Self-Taught Learner",
  "Junior Engineer / Developer",
  "Mid / Senior Professional",
  "Career Switcher",
  "Freelancer / Independent Developer",
  "Researcher / Academic",
  "Other"
];

const POPULAR_TOPICS = [
  "Python", "React", "Data Structures", "Machine Learning",
  "CAD & SolidWorks", "MATLAB & Simulink", "Circuit Analysis",
  "Control Systems", "Thermodynamics", "Robotics & ROS",
  "System Design", "SQL & Databases", "Embedded C / C++",
  "Fluid Mechanics", "Cloud (AWS)", "Git & GitHub"
];

const OnboardingModal = ({ isOpen, onClose, onComplete, initialUser }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [currentRole, setCurrentRole] = useState(initialUser?.preferences?.currentRole || CURRENT_ROLE_OPTIONS[0]);
  const [targetRole, setTargetRole] = useState(initialUser?.preferences?.targetRole || '');
  const [roleSearchQuery, setRoleSearchQuery] = useState(initialUser?.preferences?.targetRole || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState(initialUser?.preferences?.experienceLevel || 'beginner');
  const [learningStyle, setLearningStyle] = useState(initialUser?.preferences?.learningStyle || 'hands-on');
  const [weeklyHoursAvailable, setWeeklyHoursAvailable] = useState(initialUser?.preferences?.weeklyHoursAvailable || 10);
  const [selectedTopics, setSelectedTopics] = useState(initialUser?.preferences?.interests || []);

  const dropdownRef = useRef(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const filteredRoles = ALL_TARGET_ROLES.filter(r =>
    r.toLowerCase().includes(roleSearchQuery.toLowerCase())
  );

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      await userApi.skipOnboarding();
      onClose();
      if (onComplete) onComplete({ skipped: true });
    } catch (err) {
      console.error("Error skipping onboarding:", err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const chosenRole = targetRole || roleSearchQuery.trim();
      const payload = {
        currentRole,
        targetRole: chosenRole,
        experienceLevel,
        learningStyle,
        weeklyHoursAvailable: Number(weeklyHoursAvailable),
        interests: selectedTopics,
        goals: chosenRole ? [`Become a ${chosenRole}`] : []
      };

      const res = await userApi.updateProfile(payload);
      onClose();
      if (onComplete) onComplete({ completed: true, user: res?.user });
    } catch (err) {
      console.error("Error saving onboarding preferences:", err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#121212] border border-[#ebebeb] dark:border-[#222] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#ebebeb] dark:border-[#1e1e1e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5438dc]/10 dark:bg-[#5438dc]/20 flex items-center justify-center">
              <Sparkles size={16} className="text-[#5438dc] dark:text-[#7c64f0]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111] dark:text-[#e5e5e5] tracking-tight">
                Personalize Your Learning
              </h2>
              <p className="text-[11px] text-[#888] dark:text-[#666]">
                Step {step} of 2
              </p>
            </div>
          </div>

          <button
            onClick={handleSkip}
            disabled={loading}
            className="text-xs font-semibold text-[#888] hover:text-[#333] dark:hover:text-[#ccc] px-2.5 py-1 rounded-md hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a] transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {step === 1 ? (
            /* STEP 1: Role Search & Background */
            <div className="space-y-5">
              
              {/* Target Role Searchable Combobox */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-semibold text-[#444] dark:text-[#999] uppercase tracking-wider mb-1.5">
                  Target Goal / Major / Role
                </label>
                <div className="relative flex items-center">
                  <Search size={14} className="absolute left-3.5 text-[#aaa] pointer-events-none" />
                  <input
                    type="text"
                    value={roleSearchQuery}
                    onChange={(e) => {
                      setRoleSearchQuery(e.target.value);
                      setTargetRole(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Search or type your target goal (e.g. AI Engineer)..."
                    className="w-full h-10 pl-9 pr-8 text-xs rounded-lg bg-[#f5f5f5] dark:bg-[#161616] border border-[#e0e0e0] dark:border-[#222] text-[#111] dark:text-[#e5e5e5] placeholder:text-[#aaa] dark:placeholder:text-[#555] outline-none focus:border-[#5438dc]"
                  />
                  <ChevronDown size={14} className="absolute right-3 text-[#aaa] pointer-events-none" />
                </div>

                {/* Dropdown Results */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-[#161616] border border-[#ebebeb] dark:border-[#262626] rounded-xl shadow-xl z-30 py-1">
                    {filteredRoles.length > 0 ? (
                      filteredRoles.map(role => (
                        <div
                          key={role}
                          onClick={() => {
                            setTargetRole(role);
                            setRoleSearchQuery(role);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-3.5 py-2 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                            targetRole === role
                              ? 'bg-[#5438dc]/10 text-[#5438dc] dark:text-[#7c64f0] font-semibold'
                              : 'text-[#333] dark:text-[#ccc] hover:bg-[#f5f5f5] dark:hover:bg-[#202020]'
                          }`}
                        >
                          <span>{role}</span>
                          {targetRole === role && <Check size={13} />}
                        </div>
                      ))
                    ) : (
                      <div className="px-3.5 py-2 text-xs text-[#888] dark:text-[#555]">
                        Use custom goal: <span className="font-semibold text-[#111] dark:text-[#eee]">"{roleSearchQuery}"</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Current Role Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-[#444] dark:text-[#999] uppercase tracking-wider mb-1.5">
                  Current Status / Role
                </label>
                <div className="relative">
                  <select
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    className="w-full h-10 px-3.5 pr-8 text-xs rounded-lg bg-[#f5f5f5] dark:bg-[#161616] border border-[#e0e0e0] dark:border-[#222] text-[#111] dark:text-[#e5e5e5] outline-none focus:border-[#5438dc] appearance-none cursor-pointer"
                  >
                    {CURRENT_ROLE_OPTIONS.map(opt => (
                      <option key={opt} value={opt} className="bg-white dark:bg-[#161616] text-[#111] dark:text-[#e5e5e5]">
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] pointer-events-none" />
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-semibold text-[#444] dark:text-[#999] uppercase tracking-wider mb-2">
                  Your Current Experience Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'beginner', label: 'Beginner', desc: 'Starting from scratch' },
                    { id: 'intermediate', label: 'Intermediate', desc: 'Know basics & syntax' },
                    { id: 'advanced', label: 'Advanced', desc: 'Building complex apps' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.id)}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        experienceLevel === lvl.id
                          ? 'border-[#5438dc] bg-[#5438dc]/10 text-[#5438dc] dark:text-[#7c64f0] font-semibold'
                          : 'border-[#ebebeb] dark:border-[#222] bg-[#fafafa] dark:bg-[#161616] text-[#444] dark:text-[#ccc]'
                      }`}
                    >
                      <p className="text-xs font-bold">{lvl.label}</p>
                      <p className="text-[10px] text-[#888] dark:text-[#666] mt-0.5">{lvl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: Preferences & Topics */
            <div className="space-y-5">
              {/* Learning Style */}
              <div>
                <label className="block text-xs font-semibold text-[#444] dark:text-[#999] uppercase tracking-wider mb-2">
                  Preferred Learning Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'hands-on', label: '🛠️ Hands-on Projects' },
                    { id: 'visual', label: '📊 Visual Diagrams & Maps' },
                    { id: 'reading', label: '📚 Reading Docs & Articles' },
                    { id: 'mixed', label: '⚡ Balanced Mix' }
                  ].map(style => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setLearningStyle(style.id)}
                      className={`p-2.5 text-left text-xs font-medium rounded-lg border transition-all ${
                        learningStyle === style.id
                          ? 'border-[#5438dc] bg-[#5438dc]/10 text-[#5438dc] dark:text-[#7c64f0] font-semibold'
                          : 'border-[#ebebeb] dark:border-[#222] bg-[#fafafa] dark:bg-[#161616] text-[#444] dark:text-[#ccc]'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Time */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-[#444] dark:text-[#999] uppercase tracking-wider">
                    Weekly Time Commitment
                  </label>
                  <span className="text-xs font-bold text-[#5438dc] dark:text-[#7c64f0]">
                    {weeklyHoursAvailable} hours / week
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="2"
                  value={weeklyHoursAvailable}
                  onChange={(e) => setWeeklyHoursAvailable(e.target.value)}
                  className="w-full accent-[#5438dc] cursor-pointer"
                />
              </div>

              {/* Topic Interests */}
              <div>
                <label className="block text-xs font-semibold text-[#444] dark:text-[#999] uppercase tracking-wider mb-2">
                  Topics You Want to Learn
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_TOPICS.map(topic => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-[#5438dc] bg-[#5438dc] text-white'
                            : 'border-[#ebebeb] dark:border-[#222] bg-[#fafafa] dark:bg-[#161616] text-[#444] dark:text-[#ccc] hover:bg-[#f0f0f0]'
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{topic}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#ebebeb] dark:border-[#1e1e1e] bg-[#fafafa] dark:bg-[#141414] flex items-center justify-between shrink-0">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#666] hover:text-[#111] dark:hover:text-[#ccc] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={handleSkip}
              disabled={loading}
              className="text-xs font-medium text-[#888] hover:text-[#333] dark:hover:text-[#ccc]"
            >
              Skip
            </button>
          )}

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#5438dc] hover:bg-[#452bc4] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <span>Next</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#5438dc] hover:bg-[#452bc4] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              <span>{loading ? 'Saving...' : 'Complete Setup'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;

import React from 'react';
import { TrendingUp, BookCheck, Flame, Clock, CheckCircle2, Sparkles } from 'lucide-react';

const StatCard = ({ title, value, sub, accent }) => (
  <div className="bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-xl p-5">
    <p className="text-xs font-semibold text-[#999] dark:text-[#555] uppercase tracking-wider mb-3">{title}</p>
    <p className="text-2xl font-bold text-[#111] dark:text-[#e5e5e5] tracking-tight">{value}</p>
    {sub && <p className="text-xs text-[#aaa] dark:text-[#555] mt-1">{sub}</p>}
  </div>
);

const Dashboard = ({ user }) => {
  const name = user?.firstName || (user?.email ? user.email.split('@')[0] : 'User');

  const activities = [
    { id: 1, label: 'Completed Data Structures Basics', time: '2h ago', done: true },
    { id: 2, label: 'Quiz Score: 85%', time: '5h ago', done: true },
    { id: 3, label: 'Started Arrays & Linked Lists', time: '1d ago', done: false },
    { id: 4, label: 'AI Recommendation Updated', time: '1d ago', ai: true },
  ];

  const progress = 65;
  const circumference = 2 * Math.PI * 36;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#111] dark:text-[#e5e5e5] tracking-tight capitalize">Good morning, {name} 👋</h1>
        <p className="text-sm text-[#999] dark:text-[#555] mt-0.5">Here's where you left off.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Overall Progress" value="65%" sub="↑ 4% this week" />
        <StatCard title="Topics Done" value="18 / 30" sub="12 remaining" />
        <StatCard title="Quizzes" value="24" sub="Avg score 82%" />
        <StatCard title="Streak" value="7 days" sub="Personal best!" />
      </div>

      {/* Bottom two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">

        {/* Progress ring */}
        <div className="bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-xl p-6 flex flex-col">
          <p className="text-xs font-semibold text-[#999] dark:text-[#555] uppercase tracking-wider mb-5">Learning Path</p>

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
                <span className="text-[11px] text-[#aaa] dark:text-[#555] font-medium">On Track</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-3 gap-2 text-center">
              {[['Done', '18'], ['Active', '4'], ['Left', '8']].map(([label, val]) => (
                <div key={label} className="rounded-lg bg-[#f8f8f8] dark:bg-[#1a1a1a] py-2.5">
                  <p className="text-sm font-bold text-[#111] dark:text-[#ddd]">{val}</p>
                  <p className="text-[10px] text-[#bbb] dark:text-[#555] font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold text-[#999] dark:text-[#555] uppercase tracking-wider">Recent Activity</p>
            <button className="text-[11px] font-semibold text-[#5438dc] hover:opacity-70 transition-opacity">View all</button>
          </div>

          <div className="flex flex-col gap-1">
            {activities.map(a => (
              <div key={a.id} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-[#f8f8f8] dark:hover:bg-[#1a1a1a] transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    a.ai ? 'bg-[#5438dc]' : a.done ? 'bg-emerald-500' : 'bg-amber-400'
                  }`} />
                  <span className="text-sm text-[#444] dark:text-[#aaa] truncate">{a.label}</span>
                </div>
                <span className="text-[11px] text-[#ccc] dark:text-[#444] shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
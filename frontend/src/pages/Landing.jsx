import React, { useRef } from 'react';
import { Sparkles, Map, MessageSquare, BookOpen, Zap, GraduationCap, ArrowRight, CheckCircle2, Award, Layers, Compass } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: <Map className="text-[#5438dc]" size={24} />,
    title: "Dynamic AI Roadmaps",
    description: "Generate personalized, node-based learning paths tailored to your exact career goals and current skill level."
  },
  {
    icon: <MessageSquare className="text-[#5438dc]" size={24} />,
    title: "Smart AI Assistant",
    description: "Chat with an AI mentor that understands your context, answers complex questions, and guides your progress."
  },
  {
    icon: <BookOpen className="text-[#5438dc]" size={24} />,
    title: "Curated Materials",
    description: "Get hyper-relevant resource recommendations—from top courses to official docs—matched perfectly to your roadmap."
  }
];

const GRAPH_STEPS = [
  {
    level: "Level 01",
    title: "Core Foundations",
    topics: ["Syntax & Fundamentals", "Data Structures", "Control Flow"],
    status: "Completed",
    color: "from-[#22c55e] to-[#16a34a]"
  },
  {
    level: "Level 02",
    title: "Advanced Architecture",
    topics: ["System Patterns", "API Integration", "State Management"],
    status: "In Progress",
    color: "from-[#5438dc] to-[#7c64f0]"
  },
  {
    level: "Level 03",
    title: "Specialized Mastery",
    topics: ["Performance Optimization", "Scalability", "Deployment"],
    status: "Next Goal",
    color: "from-[#f59e0b] to-[#d97706]"
  }
];

const Landing = ({ onLogin, onRegister }) => {
  const container = useRef(null);

  useGSAP(() => {
    // 1. Hero Entrance
    const tl = gsap.timeline();
    tl.fromTo('.hero-pill', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
      .fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .fromTo('.hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .fromTo('.hero-container', { opacity: 0, y: 50, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out' }, '-=0.3');

    // 2. 3D Tilt Effect on Hero Mockup Container when scrolling
    gsap.fromTo('.hero-container',
      { rotateX: 12, rotateY: -4, scale: 0.96 },
      {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      }
    );

    // 3. SCROLL GRAPH PROGRESS ANIMATION
    // Draws connecting path & lights up graph node cards on scroll
    const graphTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.graph-progress-section',
        start: 'top 70%',
        end: 'bottom 40%',
        scrub: 1
      }
    });

    graphTl
      // Draw progress line
      .to('.scroll-path-fill', { strokeDashoffset: 0, ease: 'none' }, 0)
      // Reveal node cards step-by-step
      .fromTo('.graph-node-card-1', { opacity: 0.3, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 0)
      .fromTo('.graph-node-card-2', { opacity: 0.3, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 0.3)
      .fromTo('.graph-node-card-3', { opacity: 0.3, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 0.6)
      // Animate percentage text on scroll
      .to('.progress-counter', { textContent: '100%', duration: 1, snap: { textContent: 1 } }, 0);

    // 4. Scroll Reveal for Features
    gsap.fromTo('.feature-card', 
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 80%',
        }
      }
    );

    // 5. Scroll Reveal for CTA
    gsap.fromTo('.bottom-cta',
      { opacity: 0, y: 30, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.bottom-cta-section',
          start: 'top 85%',
        }
      }
    );

  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-[#111] dark:text-[#f5f5f5] font-sans selection:bg-[#5438dc]/20 overflow-x-hidden">
      
      {/* ─── NAVBAR ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#ebebeb] dark:border-[#1c1c1c]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5438dc] to-[#7c64f0] flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">LearnPath AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onLogin} className="text-sm font-medium text-[#555] dark:text-[#aaa] hover:text-[#111] dark:hover:text-white transition-colors cursor-pointer">
            Log in
          </button>
          <button onClick={onRegister} className="px-4 py-2 text-sm font-semibold text-white bg-[#111] dark:bg-white dark:text-[#111] rounded-full hover:bg-[#333] dark:hover:bg-[#e5e5e5] transition-colors shadow-sm cursor-pointer">
            Get Started
          </button>
        </div>
      </nav>

      {/* ─── HERO SECTION ───────────────────────────────────────────────────── */}
      <section className="hero-section relative pt-32 pb-16 lg:pt-44 lg:pb-24 px-6 flex flex-col items-center text-center">
        {/* Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5438dc]/15 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="hero-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1a1a1a] border border-[#ebebeb] dark:border-[#222] shadow-sm mb-8">
          <Sparkles size={14} className="text-[#5438dc]" />
          <span className="text-xs font-semibold text-[#333] dark:text-[#ccc]">AI-Powered Learning Graph</span>
        </div>

        <h1 className="hero-title text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6 text-[#111] dark:text-[#f5f5f5]">
          Master any skill with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5438dc] to-[#9d8af5]">AI-generated</span> roadmaps.
        </h1>
        
        <p className="hero-subtitle text-lg md:text-xl text-[#666] dark:text-[#888] max-w-2xl mb-10 leading-relaxed">
          Tell us what you want to learn. We build a personalized, interactive graph learning path and provide the best resources to get you there.
        </p>

        <div className="hero-cta flex flex-col sm:flex-row items-center gap-4">
          <button onClick={onRegister} className="group flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#5438dc] hover:bg-[#452bc4] rounded-full transition-all shadow-lg hover:shadow-[#5438dc]/25 cursor-pointer">
            Start Your Journey
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3D GRAPH HERO CONTAINER */}
        <div 
          className="hero-container mt-16 w-full max-w-5xl rounded-2xl border border-[#ebebeb] dark:border-[#1c1c1c] bg-white dark:bg-[#111] shadow-2xl p-4 relative overflow-hidden transition-all duration-300"
          style={{ perspective: '1200px' }}
        >
          <div className="rounded-xl border border-[#ebebeb] dark:border-[#1c1c1c] bg-[#fafafa] dark:bg-[#0a0a0a] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#5438dc 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
            
            {/* 3D Interactive Node Network Mockup */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 max-w-3xl mx-auto">
              
              {/* Node 1 */}
              <div className="flex flex-col items-center text-center p-5 bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#222] rounded-2xl shadow-md w-full md:w-56 transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 text-[#22c55e] font-bold flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#111] dark:text-white mb-1">01. Foundations</h4>
                <p className="text-xs text-[#888]">Core concepts & fundamentals unlocked</p>
                <span className="mt-3 text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] font-semibold">100% Completed</span>
              </div>

              {/* Connecting 3D Pulsing Line */}
              <div className="hidden md:block flex-1 h-1 bg-gradient-to-r from-[#22c55e] via-[#5438dc] to-[#5438dc] rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-white/40 animate-pulse" />
              </div>

              {/* Node 2 (Active 3D Glow Node) */}
              <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-[#5438dc] to-[#452bc4] text-white rounded-2xl shadow-xl shadow-[#5438dc]/30 w-full md:w-60 transform scale-105 hover:scale-110 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-white/20 text-white font-bold flex items-center justify-center mb-3 shadow-inner">
                  <Zap size={28} className="animate-bounce" />
                </div>
                <h4 className="text-base font-bold mb-1">02. AI Generator</h4>
                <p className="text-xs text-white/80">Interactive graph with node levels & resource links</p>
                <span className="mt-3 text-[10px] px-2.5 py-0.5 rounded-full bg-white/20 text-white font-semibold">In Progress</span>
              </div>

              {/* Connecting Line */}
              <div className="hidden md:block flex-1 h-1 bg-[#ebebeb] dark:bg-[#222] rounded-full" />

              {/* Node 3 */}
              <div className="flex flex-col items-center text-center p-5 bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#222] rounded-2xl shadow-md w-full md:w-56 transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#5438dc]/10 text-[#5438dc] font-bold flex items-center justify-center mb-3">
                  <Award size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#111] dark:text-white mb-1">03. Mastery</h4>
                <p className="text-xs text-[#888]">Advanced specialization & project building</p>
                <span className="mt-3 text-[10px] px-2 py-0.5 rounded-full bg-[#f0f0f0] dark:bg-[#222] text-[#888] font-semibold">Upcoming</span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── SCROLL GRAPH PROGRESS SECTION ──────────────────────────────────── */}
      <section className="graph-progress-section py-24 px-6 bg-white dark:bg-[#0f0f0f] border-t border-[#ebebeb] dark:border-[#1c1c1c] relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5438dc]/10 text-[#5438dc] text-xs font-semibold mb-3">
              <Compass size={14} />
              Scroll-Driven Graph Progress
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#111] dark:text-white">
              Watch your learning path unfold as you scroll
            </h2>
            <p className="text-[#666] dark:text-[#888] max-w-2xl mx-auto text-sm md:text-base">
              As you progress through topics, your interactive node tree automatically tracks achievements, unlocks advanced nodes, and measures total skill progress.
            </p>
          </div>

          {/* Graph Nodes Grid with SVG Connecting Path */}
          <div className="relative max-w-4xl mx-auto py-8">
            
            {/* SVG Scroll Progress Path */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" viewBox="0 0 800 600" fill="none">
              {/* Background Path */}
              <path
                d="M 150 100 Q 400 150 650 300 T 150 500"
                stroke="currentColor"
                className="text-[#ebebeb] dark:text-[#222]"
                strokeWidth="4"
                fill="none"
              />
              {/* Active Animated Fill Path */}
              <path
                className="scroll-path-fill text-[#5438dc]"
                d="M 150 100 Q 400 150 650 300 T 150 500"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                strokeDasharray="1200"
                strokeDashoffset="1200"
                strokeLinecap="round"
              />
            </svg>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {GRAPH_STEPS.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`graph-node-card-${idx + 1} flex flex-col p-6 rounded-2xl bg-[#fafafa] dark:bg-[#141414] border border-[#ebebeb] dark:border-[#222] shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#5438dc]/10 text-[#5438dc]">
                      {step.level}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${step.color}`}>
                      {step.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#111] dark:text-white mb-3">{step.title}</h3>

                  <ul className="space-y-2 text-xs text-[#666] dark:text-[#888] mb-6">
                    {step.topics.map((t, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-[#5438dc] shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4 border-t border-[#ebebeb] dark:border-[#222] flex items-center justify-between text-xs font-medium text-[#888]">
                    <span>Node Progress</span>
                    <span className="text-[#5438dc] font-bold">{idx === 0 ? "100%" : idx === 1 ? "65%" : "0%"}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ───────────────────────────────────────────────── */}
      <section className="features-section py-24 px-6 bg-[#fafafa] dark:bg-[#0a0a0a] border-t border-[#ebebeb] dark:border-[#1c1c1c]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#111] dark:text-white">
              Everything you need to succeed
            </h2>
            <p className="text-[#666] dark:text-[#888] max-w-2xl mx-auto text-sm md:text-base">
              We combine advanced AI models with beautifully designed interfaces to make learning completely frictionless.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, idx) => (
              <div key={idx} className="feature-card flex flex-col items-center text-center p-8 rounded-2xl bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#222] shadow-sm">
                <div className="w-14 h-14 rounded-xl bg-[#5438dc]/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#111] dark:text-white">{feature.title}</h3>
                <p className="text-[#666] dark:text-[#888] leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA SECTION ─────────────────────────────────────────────── */}
      <section className="bottom-cta-section py-24 px-6 relative overflow-hidden">
        <div className="bottom-cta max-w-4xl mx-auto bg-gradient-to-br from-[#111] to-[#222] dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-3xl p-10 md:p-14 text-center border border-[#333] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5438dc]/30 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3" />
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">
            Ready to unlock your potential?
          </h2>
          <p className="text-[#aaa] mb-8 max-w-xl mx-auto text-sm md:text-base relative z-10">
            Join thousands of students and engineers using LearnPath AI to accelerate their career growth.
          </p>
          
          <button onClick={onRegister} className="relative z-10 px-8 py-4 text-base font-bold text-[#111] bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg cursor-pointer">
            Create Free Account
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="py-8 text-center border-t border-[#ebebeb] dark:border-[#1c1c1c] bg-white dark:bg-[#0a0a0a]">
        <p className="text-xs text-[#888]">&copy; {new Date().getFullYear()} LearnPath AI. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Landing;
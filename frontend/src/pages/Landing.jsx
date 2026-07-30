import React, { useRef } from 'react';
import { Sparkles, Map, MessageSquare, BookOpen, ChevronRight, Zap, GraduationCap, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: <Map className="text-[#5438dc]" size={24} />,
    title: "Dynamic AI Roadmaps",
    description: "Generate personalized, node-based learning paths tailored to your exact career goals and current skill level."
  },
  {
    icon: <MessageSquare className="text-[#5438dc]" size={24} />,
    title: "Smart Assistant",
    description: "Chat with an AI mentor that understands your context, answers complex questions, and guides your progress."
  },
  {
    icon: <BookOpen className="text-[#5438dc]" size={24} />,
    title: "Curated Materials",
    description: "Get hyper-relevant resource recommendations—from top courses to official docs—matched perfectly to your roadmap."
  }
];

const Landing = ({ onLogin, onRegister }) => {
  const container = useRef(null);

  useGSAP(() => {
    // 1. Hero Animations (On Load)
    const tl = gsap.timeline();
    
    tl.fromTo('.hero-pill', 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    )
    .fromTo('.hero-title',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      "-=0.6"
    )
    .fromTo('.hero-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      "-=0.6"
    )
    .fromTo('.hero-cta',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      "-=0.6"
    )
    .fromTo('.hero-image',
      { opacity: 0, scale: 0.95, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power4.out' },
      "-=0.4"
    );

    // 2. Features Scroll Animation
    gsap.fromTo('.feature-card', 
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );

    // 3. CTA Banner Scroll Animation
    gsap.fromTo('.bottom-cta',
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1,
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
    <div ref={container} className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-[#111] dark:text-[#f5f5f5] font-sans selection:bg-[#5438dc]/20">
      
      {/* ─── NAVBAR ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#ebebeb] dark:border-[#1c1c1c]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5438dc] to-[#7c64f0] flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">LearnPath AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onLogin} className="text-sm font-medium text-[#555] dark:text-[#aaa] hover:text-[#111] dark:hover:text-white transition-colors">
            Log in
          </button>
          <button onClick={onRegister} className="px-4 py-2 text-sm font-semibold text-white bg-[#111] dark:bg-white dark:text-[#111] rounded-full hover:bg-[#333] dark:hover:bg-[#e5e5e5] transition-colors shadow-sm">
            Get Started
          </button>
        </div>
      </nav>

      {/* ─── HERO SECTION ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden flex flex-col items-center text-center">
        {/* Abstract Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5438dc]/20 dark:bg-[#5438dc]/15 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="hero-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#1a1a1a] border border-[#ebebeb] dark:border-[#222] shadow-sm mb-8">
          <Sparkles size={14} className="text-[#5438dc]" />
          <span className="text-xs font-semibold text-[#333] dark:text-[#ccc]">Learn Smarter, Not Harder</span>
        </div>

        <h1 className="hero-title text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Master any skill with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5438dc] to-[#9d8af5]">AI-generated</span> roadmaps.
        </h1>
        
        <p className="hero-subtitle text-lg md:text-xl text-[#666] dark:text-[#888] max-w-2xl mb-10 leading-relaxed">
          Tell us what you want to learn. We build a personalized, interactive learning path and provide the best resources to get you there.
        </p>

        <div className="hero-cta flex flex-col sm:flex-row items-center gap-4">
          <button onClick={onRegister} className="group flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#5438dc] hover:bg-[#452bc4] rounded-full transition-all shadow-lg hover:shadow-[#5438dc]/25">
            Start Your Journey
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Hero Image / UI Mockup */}
        <div className="hero-image mt-20 w-full max-w-5xl rounded-2xl border border-[#ebebeb] dark:border-[#1c1c1c] bg-white dark:bg-[#111] shadow-2xl p-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent dark:from-[#0a0a0a] dark:via-transparent z-10 pointer-events-none h-full" />
          <div className="rounded-xl border border-[#ebebeb] dark:border-[#1c1c1c] bg-[#fafafa] dark:bg-[#0a0a0a] overflow-hidden aspect-[16/9] flex items-center justify-center relative">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#5438dc 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
             {/* Mockup nodes */}
             <div className="relative z-10 flex gap-12 items-center">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#ebebeb] dark:border-[#333] shadow-lg flex items-center justify-center">
                  <span className="text-lg font-bold">1</span>
                </div>
                <div className="h-1 w-24 bg-gradient-to-r from-[#5438dc] to-[#9d8af5] rounded-full"></div>
                <div className="w-16 h-16 rounded-2xl bg-[#5438dc] text-white shadow-lg shadow-[#5438dc]/30 flex items-center justify-center scale-110">
                  <Zap size={24} />
                </div>
                <div className="h-1 w-24 bg-[#ebebeb] dark:bg-[#333] rounded-full"></div>
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#ebebeb] dark:border-[#333] shadow-lg flex items-center justify-center opacity-50">
                  <span className="text-lg font-bold">3</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ───────────────────────────────────────────────── */}
      <section className="features-section py-24 px-6 bg-white dark:bg-[#0f0f0f] border-t border-[#ebebeb] dark:border-[#1c1c1c]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to succeed</h2>
            <p className="text-[#666] dark:text-[#888] max-w-2xl mx-auto">We combine advanced AI models with beautifully designed interfaces to make learning completely frictionless.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, idx) => (
              <div key={idx} className="feature-card flex flex-col items-center text-center p-8 rounded-2xl bg-[#fafafa] dark:bg-[#141414] border border-[#ebebeb] dark:border-[#222]">
                <div className="w-14 h-14 rounded-xl bg-[#5438dc]/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-[#666] dark:text-[#888] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─────────────────────────────────────────────────────── */}
      <section className="bottom-cta-section py-24 px-6 relative overflow-hidden">
        <div className="bottom-cta max-w-4xl mx-auto bg-gradient-to-br from-[#111] to-[#222] dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-3xl p-12 text-center border border-[#333] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5438dc]/30 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3" />
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">Ready to unlock your potential?</h2>
          <p className="text-[#aaa] mb-10 max-w-xl mx-auto relative z-10">Join thousands of learners who are already using LearnPath AI to accelerate their career growth.</p>
          
          <button onClick={onRegister} className="relative z-10 px-8 py-4 text-base font-bold text-[#111] bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg">
            Create Free Account
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="py-8 text-center border-t border-[#ebebeb] dark:border-[#1c1c1c] bg-white dark:bg-[#0a0a0a]">
        <p className="text-sm text-[#888]">&copy; {new Date().getFullYear()} LearnPath AI. Built for the Hackathon.</p>
      </footer>

    </div>
  );
};

export default Landing;

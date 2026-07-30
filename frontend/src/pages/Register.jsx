import React, { useState } from "react";
import { GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

const Register = ({ onRegisterSuccess, onGoToLogin }) => {
    const { register } = useAuth();
    const { signIn: googleSignIn } = useGoogleAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            await register(firstName, lastName, email, password);
            if (onRegisterSuccess) onRegisterSuccess();
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setGoogleLoading(true);
        try {
            await googleSignIn();
        } catch (err) {
            setError(err.message || 'Google sign-in failed.');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-[#0a0a0a]">
            {/* Left Panel - Brand */}
            <div className="hidden md:flex md:w-[42%] bg-[#5438dc] flex-col justify-between p-10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white translate-x-24 -translate-y-24" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white -translate-x-16 translate-y-16" />
                </div>

                <div className="relative z-10 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <GraduationCap size={18} className="text-white" />
                    </div>
                    <span className="text-white font-semibold text-base tracking-tight">AI LearnPath</span>
                </div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-white leading-[1.1] mb-4">
                        Start your journey<br />today.
                    </h1>
                    <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                        Join thousands of learners building real skills with AI-guided personalized paths.
                    </p>
                </div>

                <div className="relative z-10 flex gap-3 flex-wrap">
                    {['Python', 'ML', 'Web Dev', 'Data Science'].map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-white/10 text-white/70 text-xs rounded-md font-medium border border-white/10">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20">
                <div className="w-full max-w-sm mx-auto">
                    <div className="flex items-center gap-2 mb-10 md:hidden">
                        <div className="w-7 h-7 bg-[#5438dc] rounded-lg flex items-center justify-center">
                            <GraduationCap size={16} className="text-white" />
                        </div>
                        <span className="font-semibold text-sm text-[#111] dark:text-white">AI LearnPath</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#111] dark:text-[#e5e5e5] mb-1.5 tracking-tight">Create account</h2>
                        <p className="text-sm text-[#888] dark:text-[#666]">Free forever. No credit card required.</p>
                    </div>

                    {error && (
                        <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-[#444] dark:text-[#999] mb-2 uppercase tracking-wider">First</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="John"
                                    required
                                    disabled={loading}
                                    className="w-full h-10 px-3.5 text-sm rounded-lg bg-[#f5f5f5] dark:bg-[#141414] border border-[#e0e0e0] dark:border-[#222] text-[#111] dark:text-[#e5e5e5] placeholder:text-[#bbb] dark:placeholder:text-[#444] outline-none focus:border-[#5438dc] focus:ring-2 focus:ring-[#5438dc]/10 transition-all disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#444] dark:text-[#999] mb-2 uppercase tracking-wider">Last</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                    required
                                    disabled={loading}
                                    className="w-full h-10 px-3.5 text-sm rounded-lg bg-[#f5f5f5] dark:bg-[#141414] border border-[#e0e0e0] dark:border-[#222] text-[#111] dark:text-[#e5e5e5] placeholder:text-[#bbb] dark:placeholder:text-[#444] outline-none focus:border-[#5438dc] focus:ring-2 focus:ring-[#5438dc]/10 transition-all disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#444] dark:text-[#999] mb-2 uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={loading}
                                className="w-full h-10 px-3.5 text-sm rounded-lg bg-[#f5f5f5] dark:bg-[#141414] border border-[#e0e0e0] dark:border-[#222] text-[#111] dark:text-[#e5e5e5] placeholder:text-[#bbb] dark:placeholder:text-[#444] outline-none focus:border-[#5438dc] focus:ring-2 focus:ring-[#5438dc]/10 transition-all disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#444] dark:text-[#999] mb-2 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    required
                                    disabled={loading}
                                    className="w-full h-10 px-3.5 pr-10 text-sm rounded-lg bg-[#f5f5f5] dark:bg-[#141414] border border-[#e0e0e0] dark:border-[#222] text-[#111] dark:text-[#e5e5e5] placeholder:text-[#bbb] dark:placeholder:text-[#444] outline-none focus:border-[#5438dc] focus:ring-2 focus:ring-[#5438dc]/10 transition-all disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555] dark:hover:text-[#999] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 bg-[#5438dc] hover:bg-[#4a30cc] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors mt-2 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={15} className="animate-spin" />}
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-[#ebebeb] dark:bg-[#1e1e1e]" />
                        <span className="text-[11px] text-[#bbb] dark:text-[#444] font-medium">OR</span>
                        <div className="flex-1 h-px bg-[#ebebeb] dark:bg-[#1e1e1e]" />
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading || googleLoading}
                        className="w-full h-10 flex items-center justify-center gap-2.5 rounded-lg border border-[#e0e0e0] dark:border-[#222] bg-white dark:bg-[#141414] text-[#333] dark:text-[#ccc] text-sm font-medium hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
                    >
                        {googleLoading ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                        )}
                        {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
                    </button>

                    <p className="text-center mt-8 text-[13px] text-[#888] dark:text-[#555]">
                        Already have an account?{" "}
                        <button onClick={onGoToLogin} className="text-[#5438dc] font-semibold hover:opacity-70 transition-opacity">
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
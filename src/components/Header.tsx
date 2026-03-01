import React, { useState } from 'react';
import { Brain, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { AppView } from '../types';
import AuthModal from './AuthModal';

interface HeaderProps {
    view: AppView;
    setView: (view: AppView) => void;
    isLoggedIn: boolean;
    onLogin: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ view, setView, isLoggedIn, onLogin, onLogout }) => {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const openAuth = (mode: 'login' | 'signup') => {
        setAuthMode(mode);
        setIsAuthOpen(true);
    };

    return (
        <>
            <header className="fixed w-full top-0 z-50 transition-all duration-300 bg-white/30 backdrop-blur-xl border-b border-white/40 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => setView('home')}
                    >
                        <div className="bg-indigo-500 p-1.5 rounded-xl group-hover:bg-indigo-600 transition-colors">
                            <Brain size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-semibold text-slate-900 group-hover:text-indigo-500 transition-colors">
                            LingoLeap
                        </span>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {view === 'dashboard' && (
                            <button
                                onClick={() => setView('home')}
                                className="hidden md:block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-2"
                            >
                                New Topic
                            </button>
                        )}

                        {/* Always show My Learning button, regardless of auth state */}
                        <button
                            onClick={() => setView('learner')}
                            className={`text-sm font-medium transition-colors px-3 py-2 ${view === 'learner' ? 'text-indigo-500' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            My Learning
                        </button>

                        {isLoggedIn ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-xl border border-white/30 hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                        <User size={14} strokeWidth={2.5} />
                                    </div>
                                    <ChevronDown size={14} strokeWidth={2.5} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Profile Dropdown */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 glass-card rounded-xl shadow-lg py-1 z-50">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <p className="text-sm font-semibold text-slate-900">John Doe</p>
                                            <p className="text-xs text-slate-500 truncate">john@example.com</p>
                                        </div>
                                        <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-white/30 flex items-center gap-2">
                                            <Settings size={16} />
                                            Settings
                                        </button>
                                        <button
                                            onClick={() => { onLogout(); setIsProfileOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-white/30 flex items-center gap-2"
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => openAuth('login')}
                                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => openAuth('signup')}
                                    className="text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-xl transition-colors"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialMode={authMode}
                onLogin={onLogin}
            />
        </>
    );
};

export default Header;

import React, { useState } from 'react';
import { Envelope, LockKey, X, Sparkle, Spinner } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'signup';
    onLogin: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login', onLogin }) => {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Prevent body scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setMode(initialMode); // Reset mode when modal opens
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, initialMode]);

    // Handle ESC key to close modal
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    // Reset form when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
            setError(null);
            setLoading(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setEmail('');
        setPassword('');
        setError(null);
        setLoading(false);
        document.body.style.overflow = 'auto'; // Ensure body scroll is restored
        onClose();
    };

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (mode === 'login') {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                });

                if (error) throw error;

                // Successfully logged in
                setLoading(false);
                onLogin();
                handleClose();
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email: email.trim(),
                    password,
                });

                if (error) throw error;

                // Check if email confirmation is needed
                if (data.user && !data.session) {
                    // Email confirmation required
                    setLoading(false);
                    setSuccessMessage('Account created! Please check your email to verify your account, then log in.');
                    setMode('login');
                    setEmail('');
                    setPassword('');
                } else if (data.session) {
                    // Email confirmation not required, user is logged in
                    setLoading(false);
                    onLogin();
                    handleClose();
                }
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#F7F9FC]/90 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
                <div className="p-8 pt-10">
                    <div className="flex justify-center mb-6">
                        <div className="bg-slate-900 text-white p-2 rounded-lg">
                            <Sparkle size={24} weight="fill" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-medium text-center text-slate-900 mb-2">
                        {mode === 'login' ? 'Sign in to LingoLeap' : 'Join LingoLeap'}
                    </h2>
                    <p className="text-center text-slate-500 text-sm mb-8">
                        {mode === 'login' ? 'Continue your learning journey.' : 'Start your language mastery today.'}
                    </p>

                    {successMessage && (
                        <div className="mb-6 p-3 bg-green-50 border border-green-100 text-green-600 rounded-lg text-sm font-medium text-center">
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleAuth}>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/20 focus:border-[#5850EC] transition-all"
                                placeholder="name@company.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5850EC]/20 focus:border-[#5850EC] transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-[#5850EC] hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5850EC] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6 shadow-sm"
                        >
                            {loading ? (
                                <Spinner className="animate-spin" size={20} />
                            ) : (
                                mode === 'login' ? 'Sign in' : 'Create account'
                            )}
                        </button>
                    </form>

                    {mode === 'signup' && (
                        <div className="mt-8 text-center pt-6 border-t border-slate-100">
                            <p className="text-sm text-slate-500">
                                Already have an account?{' '}
                                <button
                                    onClick={() => setMode('login')}
                                    className="font-medium text-[#5850EC] hover:text-[#4338CA] transition-colors"
                                >
                                    Log in
                                </button>
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default AuthModal;

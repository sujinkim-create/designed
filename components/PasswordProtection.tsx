import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight } from '@phosphor-icons/react';

interface PasswordProtectionProps {
    onAuthenticated: () => void;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ onAuthenticated }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const sitePassword = import.meta.env.VITE_SITE_PASSWORD;

        if (password === sitePassword) {
            onAuthenticated();
        } else {
            setError(true);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} weight="fill" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Protected Content</h1>
                <p className="text-slate-500 mb-8">Please enter the password to access this site.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className={`relative transition-transform ${shake ? 'animate-shake' : ''}`}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                            }}
                            placeholder="Enter password"
                            className={`w-full px-5 py-3 rounded-xl border ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200'} focus:border-indigo-500 focus:ring-4 outline-none transition-all`}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm font-medium animate-fade-in">
                            Incorrect password. Please try again.
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        Access Site
                        <ArrowRight size={18} weight="bold" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PasswordProtection;

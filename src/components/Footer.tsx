import React from 'react';
import { Brain } from 'lucide-react';
import { GithubLogo, LinkedinLogo, TwitterLogo, Heart, EnvelopeSimple } from '@phosphor-icons/react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-900 text-white py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-indigo-500 p-1.5 rounded-xl">
                                <Brain size={18} className="text-white" />
                            </div>
                            <h4 className="font-semibold text-white text-base">LingoLeap</h4>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            AI-powered English learning platform that creates personalized content just for you.
                        </p>
                    </div>

                    {/* Features */}
                    <div>
                        <h4 className="font-semibold mb-4 text-white text-base">Features</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li className="hover:text-white transition-colors cursor-pointer">Adaptive Reading</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Smart Flashcards</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Interactive Quizzes</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Grammar Practice</li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold mb-4 text-white text-base">Resources</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li className="hover:text-white transition-colors cursor-pointer">CEFR Levels Guide</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Learning Tips</li>
                            <li className="hover:text-white transition-colors cursor-pointer">FAQ</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Support</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4 text-white text-base">Connect</h4>
                        <div className="flex flex-col gap-4">
                            <a href="mailto:sujinkim@mytopiceng.com" className="text-sm text-slate-400 hover:text-white transition-colors">
                                sujinkim@mytopiceng.com
                            </a>
                            <div className="flex gap-3">
                                <a href="#" className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-indigo-500 transition-colors">
                                    <TwitterLogo size={16} />
                                </a>
                                <a href="#" className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-indigo-500 transition-colors">
                                    <LinkedinLogo size={16} />
                                </a>
                                <a href="#" className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-indigo-500 transition-colors">
                                    <GithubLogo size={16} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © 2024 LingoLeap. All rights reserved.
                    </p>
                    <p className="text-slate-500 text-sm flex items-center gap-1">
                        Made with <Heart size={14} weight="fill" className="text-red-500" /> for language learners
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

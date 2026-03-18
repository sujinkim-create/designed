import React, { useState } from 'react';
import { CollocationItem } from '../types';
import { Puzzle, BookOpen, Sparkles, Pencil, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { evaluateSentence } from '../services/geminiClient';
import LessonLayout from './ui/LessonLayout';
import SectionHeader from './ui/SectionHeader';
import PracticeCard from './ui/PracticeCard';

interface CollocationPracticeProps {
    collocations: CollocationItem[];
}

interface FeedbackState {
    [key: number]: {
        isCorrect: boolean;
        feedback: string;
        suggestion?: string;
    } | null;
}

const CollocationPractice: React.FC<CollocationPracticeProps> = ({ collocations }) => {
    const [inputs, setInputs] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
    const [feedbacks, setFeedbacks] = useState<FeedbackState>({});

    const handleCheck = async (index: number, phrase: string) => {
        const sentence = inputs[index];
        if (!sentence?.trim()) return;

        setLoading(prev => ({ ...prev, [index]: true }));
        try {
            const result = await evaluateSentence(sentence, phrase);
            setFeedbacks(prev => ({ ...prev, [index]: result }));
        } catch (error) {
            console.error("Evaluation failed", error);
        } finally {
            setLoading(prev => ({ ...prev, [index]: false }));
        }
    };

    return (
        <LessonLayout>
            <SectionHeader
                icon={<Puzzle size={24} />}
                title="Collocations"
                subtitle="Master word partnerships to sound more natural."
                iconWrapperClassName="bg-indigo-50 text-indigo-500"
            />

            <div className="grid gap-6">
                {collocations.map((item, index) => (
                    <PracticeCard key={index} className="p-6 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 group">
                        <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-500 transition-colors flex items-center gap-2">
                                    {item.phrase}
                                    <Sparkles size={16} className="text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h3>
                                <p className="text-slate-600 mb-4 leading-relaxed">{item.definition}</p>

                                <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-50">
                                    <div className="flex gap-3">
                                        <BookOpen size={20} className="text-indigo-400 shrink-0 mt-0.5" />
                                        <p className="text-slate-700 italic">"{item.example}"</p>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-slate-400 font-bold text-sm shrink-0 group-hover:bg-indigo-50/50 group-hover:text-indigo-500 transition-colors">
                                {index + 1}
                            </div>
                        </div>

                        {/* Practice Section */}
                        <div className="border-t border-slate-100 pt-6">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Pencil size={16} />
                                Practice
                            </p>
                            <div className="relative">
                                <textarea
                                    value={inputs[index] || ''}
                                    onChange={(e) => setInputs(prev => ({ ...prev, [index]: e.target.value }))}
                                    placeholder={`Write a sentence using "${item.phrase}"...`}
                                    className="w-full p-4 pr-14 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 outline-none transition-all resize-none text-slate-700"
                                    rows={2}
                                />
                                <button
                                    onClick={() => handleCheck(index, item.phrase)}
                                    disabled={!inputs[index]?.trim() || loading[index]}
                                    className="absolute bottom-3 right-3 p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-100"
                                    title="Check Answer"
                                >
                                    {loading[index] ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Send size={20} />
                                    )}
                                </button>
                            </div>

                            {/* Feedback Section */}
                            {feedbacks[index] && (
                                <div className={`mt-4 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 ${feedbacks[index]?.isCorrect
                                    ? 'bg-teal-50 border-teal-200 text-teal-800'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}>
                                    <div className="flex gap-3 items-start">
                                        {feedbacks[index]?.isCorrect ? (
                                            <CheckCircle size={24} className="text-teal-600 shrink-0" />
                                        ) : (
                                            <AlertCircle size={24} className="text-indigo-500 shrink-0" />
                                        )}
                                        <div>
                                            <p className={`font-bold mb-1 ${feedbacks[index]?.isCorrect ? 'text-teal-700' : 'text-slate-800'}`}>
                                                {feedbacks[index]?.isCorrect ? 'Great job!' : 'Keep practicing!'}
                                            </p>
                                            <p className={`text-sm leading-relaxed ${feedbacks[index]?.isCorrect ? 'text-teal-600' : 'text-slate-600'}`}>
                                                {feedbacks[index]?.feedback}
                                            </p>
                                            {feedbacks[index]?.suggestion && (
                                                <div className="mt-3 pt-3 border-t border-slate-200">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">Suggestion</p>
                                                    <p className="text-sm font-medium text-slate-700">{feedbacks[index]?.suggestion}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </PracticeCard>
                ))}
            </div>
        </LessonLayout>
    );
};

export default CollocationPractice;

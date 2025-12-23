import React, { useState } from 'react';
import { GrammarPoint } from '../types';
import { GraduationCap, Lightbulb, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import LessonLayout from './ui/LessonLayout';
import SectionHeader from './ui/SectionHeader';
import PracticeCard from './ui/PracticeCard';

interface GrammarPracticeProps {
    grammarPoints: GrammarPoint[];
}

const GrammarPractice: React.FC<GrammarPracticeProps> = ({ grammarPoints }) => {
    const [answers, setAnswers] = useState<Record<string, string>>({}); // key: "pointIdx-qIdx", value: option
    const [submitted, setSubmitted] = useState<Record<string, boolean>>({}); // key: "pointIdx-qIdx", value: true

    const handleSelect = (pointIdx: number, qIdx: number, option: string) => {
        const key = `${pointIdx}-${qIdx}`;
        if (submitted[key]) return;
        setAnswers(prev => ({ ...prev, [key]: option }));
    };

    const handleSubmit = (pointIdx: number, qIdx: number) => {
        const key = `${pointIdx}-${qIdx}`;
        if (!answers[key]) return;
        setSubmitted(prev => ({ ...prev, [key]: true }));
    };

    return (
        <LessonLayout>
            <SectionHeader
                icon={<GraduationCap size={24} />}
                title="Grammar Focus"
                subtitle="Key grammar points from the article explained."
                iconWrapperClassName="bg-white text-indigo-500"
            />

            <div className="space-y-12">
                {grammarPoints.map((point, index) => (
                    <div key={index} className="space-y-6">
                        <PracticeCard className="overflow-hidden">
                            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                    </span>
                                    {point.rule}
                                </h3>
                            </div>

                            <div className="p-8">
                                <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-50 mb-6">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 mt-1">
                                            <CheckCircle size={24} className="text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-indigo-900 mb-2">Example from Text</h4>
                                            <p className="text-indigo-800 font-medium text-lg">"{point.example}"</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="shrink-0 mt-1">
                                        <Lightbulb size={24} className="text-indigo-300" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700 mb-2">Explanation</h4>
                                        <p className="text-slate-600 leading-relaxed">{point.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        </PracticeCard>

                        {/* Practice Questions for this Grammar Point */}
                        {point.practice && point.practice.length > 0 && (
                            <div className="pl-4 md:pl-8 border-l-2 border-indigo-50 space-y-6">
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <GraduationCap size={16} />
                                    Practice Exercises
                                </h4>
                                {point.practice.map((q, qIdx) => {
                                    const key = `${index}-${qIdx}`;
                                    const isSubmitted = submitted[key];
                                    const selected = answers[key];
                                    const isCorrect = isSubmitted && selected === q.correctAnswer;
                                    const isWrong = isSubmitted && selected !== q.correctAnswer;

                                    return (
                                        <PracticeCard key={q.id} className="p-6">
                                            <p className="font-medium text-slate-800 mb-4">
                                                <span className="font-bold text-indigo-500 mr-2">{qIdx + 1}.</span>
                                                {q.question}
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                                {q.options.map((opt, optIdx) => {
                                                    let btnClass = "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50";

                                                    if (isSubmitted) {
                                                        if (opt === q.correctAnswer) {
                                                            btnClass = "bg-teal-50 border-teal-400 text-teal-700";
                                                        } else if (selected === opt) {
                                                            btnClass = "bg-rose-50 border-rose-300 text-rose-600 animate-shake";
                                                        } else {
                                                            btnClass = "opacity-40 border-slate-100";
                                                        }
                                                    } else if (selected === opt) {
                                                        btnClass = "bg-indigo-50 border-indigo-400 text-indigo-700 shadow-md shadow-indigo-100";
                                                    }

                                                    return (
                                                        <button
                                                            key={optIdx}
                                                            onClick={() => handleSelect(index, qIdx, opt)}
                                                            disabled={isSubmitted}
                                                            className={`px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all duration-200 ${btnClass}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {!isSubmitted ? (
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleSubmit(index, qIdx)}
                                                        disabled={!selected}
                                                        className="px-6 py-2 bg-indigo-500 text-white rounded-lg font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-100"
                                                    >
                                                        Check
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={`mt-4 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-indigo-50/50 border-indigo-50'}`}>
                                                    <div className="flex gap-3 items-start">
                                                        {isCorrect ? (
                                                            <CheckCircle size={20} className="text-green-600 shrink-0" />
                                                        ) : (
                                                            <AlertCircle size={20} className="text-indigo-500 shrink-0" />
                                                        )}
                                                        <div>
                                                            <p className={`font-bold text-sm mb-1 ${isCorrect ? 'text-green-800' : 'text-indigo-800'}`}>
                                                                {isCorrect ? 'Correct!' : 'Explanation'}
                                                            </p>
                                                            <p className={`text-sm leading-relaxed ${isCorrect ? 'text-green-700' : 'text-indigo-700'}`}>
                                                                {q.explanation}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </PracticeCard>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </LessonLayout>
    );
};

export default GrammarPractice;

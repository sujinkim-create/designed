import React, { useState, useEffect } from 'react';
import { GrammarPoint, GrammarFocusData, GrammarFocusRule } from '../types';
import { GraduationCap, Lightbulb, CheckCircle, XCircle, AlertCircle, Database, BookOpen, Loader } from 'lucide-react';
import LessonLayout from './ui/LessonLayout';
import SectionHeader from './ui/SectionHeader';
import PracticeCard from './ui/PracticeCard';

import { GrammarQuiz } from './GrammarQuiz';
import { checkGrammar, LTResponse } from '../services/languageToolService';
import { AlertTriangle, Check, RefreshCw } from 'lucide-react';

interface GrammarPracticeProps {
    grammarPoints: GrammarPoint[];
    articleText: string;
    learningHistory: any[];
}

const GrammarPractice: React.FC<GrammarPracticeProps> = ({ grammarPoints, articleText, learningHistory }) => {
    // DB-based Grammar Focus state
    const [dbGrammarData, setDbGrammarData] = useState<GrammarFocusData | null>(null);
    const [isLoadingDB, setIsLoadingDB] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);

    // Quiz answer state for DB-based quizzes
    const [dbAnswers, setDbAnswers] = useState<Record<number, number | null>>({});
    const [dbSubmitted, setDbSubmitted] = useState<Record<number, boolean>>({});

    // LanguageTool State
    const [ltResult, setLtResult] = useState<LTResponse | null>(null);
    const [isLtLoading, setIsLtLoading] = useState(false);
    const [ltError, setLtError] = useState<string | null>(null);

    // Fetch Grammar Focus from DB on mount
    useEffect(() => {
        const fetchDBGrammar = async () => {
            if (!articleText) return;

            setIsLoadingDB(true);
            setDbError(null);

            try {
                const response = await fetch('/api/grammar-focus', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ articleText }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to load grammar focus");
                }

                const data: GrammarFocusData = await response.json();
                setDbGrammarData(data);
            } catch (err: any) {
                console.error("Error fetching DB grammar:", err);
                setDbError(err.message);
            } finally {
                setIsLoadingDB(false);
            }
        };

        fetchDBGrammar();
    }, [articleText]);

    const handleDBAnswer = (ruleIndex: number, optionIdx: number) => {
        if (dbSubmitted[ruleIndex]) return;
        setDbAnswers(prev => ({ ...prev, [ruleIndex]: optionIdx }));
    };

    const handleDBSubmit = (ruleIndex: number) => {
        if (dbAnswers[ruleIndex] === null || dbAnswers[ruleIndex] === undefined) return;
        setDbSubmitted(prev => ({ ...prev, [ruleIndex]: true }));
    };

    const handleCheckGrammar = async () => {
        if (!articleText) return;
        setIsLtLoading(true);
        setLtError(null);
        try {
            const result = await checkGrammar(articleText);
            setLtResult(result);
        } catch (err) {
            console.error("LanguageTool error:", err);
            setLtError("Could not connect to LanguageTool server. Make sure Docker is running.");
        } finally {
            setIsLtLoading(false);
        }
    };

    return (
        <LessonLayout>
            <SectionHeader
                icon={<GraduationCap size={24} />}
                title="Key Grammar Points"
                subtitle="Important grammar patterns identified in this article."
                iconWrapperClassName="bg-white text-indigo-500"
            />

            {/* DB-Based Grammar Focus Section */}
            <div className="space-y-12">
                {isLoadingDB ? (
                    <div className="flex flex-col items-center justify-center py-16 glass-card rounded-2xl">
                        <Loader className="animate-spin text-indigo-500 mb-4" size={36} />
                        <p className="text-slate-600 font-medium">문법 규칙을 분석 중...</p>
                        <p className="text-slate-400 text-sm mt-1">아티클에서 주요 문법 패턴을 추출하고 있습니다</p>
                    </div>
                ) : dbError ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
                        <p className="text-red-700 font-medium">{dbError}</p>
                    </div>
                ) : dbGrammarData?.message && dbGrammarData.matchedRules.length === 0 ? (
                    <div className="glass-panel border-amber-200/50 rounded-xl p-8 text-center">
                        <Database size={40} className="text-amber-500 mx-auto mb-4" />
                        <p className="text-amber-800 font-medium text-lg mb-2">문법 패턴 발견되지 않음</p>
                        <p className="text-amber-700">{dbGrammarData.message}</p>
                    </div>
                ) : dbGrammarData && dbGrammarData.matchedRules.length > 0 ? (
                    <>
                        {/* DB Source Badge */}
                        <div className="flex items-center gap-2 px-4 py-2 glass border-green-200/50 rounded-lg w-fit">
                            <Database size={16} className="text-green-600" />
                            <span className="text-green-700 text-sm font-medium">
                                AI가 {dbGrammarData.matchedRules.length}개의 문법 규칙을 발견했습니다
                            </span>
                        </div>

                        {dbGrammarData.matchedRules.map((rule, index) => (
                            <div key={index} className="space-y-6">
                                <PracticeCard className="overflow-hidden">
                                    {/* Header with DB Rule Pattern */}
                                    <div className="glass-panel p-6 border-b border-white/20">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">
                                                    {index + 1}
                                                </span>
                                                {rule.dbRule.pattern}
                                            </h3>
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                                                <Database size={12} />
                                                AI 추출
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        {/* Grammar Explanation from DB (scenario) */}
                                        <div className="glass border border-white/40 rounded-xl p-6">
                                            <div className="flex gap-4">
                                                <div className="shrink-0 mt-1">
                                                    <Lightbulb size={24} className="text-amber-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-700 mb-2">문법 설명</h4>
                                                    <p className="text-slate-600 leading-relaxed">{rule.dbRule.scenario}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Matched Sentence from Article */}
                                        <div className="glass-panel rounded-xl p-6 border border-indigo-100/30">
                                            <div className="flex gap-4">
                                                <div className="shrink-0 mt-1">
                                                    <BookOpen size={24} className="text-indigo-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-indigo-900 mb-2">아티클에서 매칭된 문장</h4>
                                                    <p className="text-indigo-800 font-medium text-lg">"{rule.matchedSentence}"</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quiz based on DB pattern */}
                                        <div className="glass rounded-xl p-6 border border-white/20">
                                            <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <GraduationCap size={20} className="text-indigo-500" />
                                                Practice Quiz
                                            </h4>

                                            <p className="font-medium text-slate-800 mb-4">{rule.quiz.question}</p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                                {rule.quiz.options.map((option, optIdx) => {
                                                    const isSubmitted = dbSubmitted[index];
                                                    const selected = dbAnswers[index];
                                                    const isCorrect = isSubmitted && optIdx === rule.quiz.correctAnswer;
                                                    const isWrong = isSubmitted && selected === optIdx && optIdx !== rule.quiz.correctAnswer;

                                                    let btnClass = "glass border-white/40 text-slate-600 hover:bg-indigo-500/10 hover:border-indigo-300";

                                                    if (isSubmitted) {
                                                        if (isCorrect) {
                                                            btnClass = "bg-green-50 border-green-400 text-green-700";
                                                        } else if (isWrong) {
                                                            btnClass = "bg-red-50 border-red-300 text-red-600";
                                                        } else {
                                                            btnClass = "opacity-50 border-white/20 bg-white/10";
                                                        }
                                                    } else if (selected === optIdx) {
                                                        btnClass = "bg-indigo-500/20 border-indigo-400 text-indigo-700";
                                                    }

                                                    return (
                                                        <button
                                                            key={optIdx}
                                                            onClick={() => handleDBAnswer(index, optIdx)}
                                                            disabled={isSubmitted}
                                                            className={`px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-all duration-200 flex items-center justify-between ${btnClass}`}
                                                        >
                                                            <span>{option}</span>
                                                            {isCorrect && <CheckCircle size={18} className="text-green-500" />}
                                                            {isWrong && <XCircle size={18} className="text-red-500" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {!dbSubmitted[index] ? (
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleDBSubmit(index)}
                                                        disabled={dbAnswers[index] === null || dbAnswers[index] === undefined}
                                                        className="px-6 py-2 bg-indigo-500 text-white rounded-lg font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        Check Answer
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={`mt-4 p-4 rounded-xl border ${dbAnswers[index] === rule.quiz.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-indigo-50 border-indigo-200'}`}>
                                                    <div className="flex gap-3 items-start">
                                                        {dbAnswers[index] === rule.quiz.correctAnswer ? (
                                                            <CheckCircle size={20} className="text-green-600 shrink-0" />
                                                        ) : (
                                                            <AlertCircle size={20} className="text-indigo-500 shrink-0" />
                                                        )}
                                                        <div>
                                                            <p className={`font-bold text-sm mb-1 ${dbAnswers[index] === rule.quiz.correctAnswer ? 'text-green-800' : 'text-indigo-800'}`}>
                                                                {dbAnswers[index] === rule.quiz.correctAnswer ? 'Correct!' : 'Explanation'}
                                                            </p>
                                                            <p className={`text-sm leading-relaxed ${dbAnswers[index] === rule.quiz.correctAnswer ? 'text-green-700' : 'text-indigo-700'}`}>
                                                                {rule.quiz.explanation}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </PracticeCard>
                            </div>
                        ))}
                    </>
                ) : null}
            </div>



            {/* LanguageTool Grammar Check Section */}
            <div className="mt-12 pt-10 border-t border-slate-200">
                <SectionHeader
                    icon={<AlertTriangle size={24} />}
                    title="Deep Grammar Check"
                    subtitle="Analyze the article for advanced grammar issues using LanguageTool."
                    iconWrapperClassName="bg-amber-100 text-amber-600"
                />

                <div className="glass-card rounded-xl p-6 mt-6">
                    {!ltResult && !isLtLoading && !ltError && (
                        <div className="text-center py-8">
                            <p className="text-slate-600 mb-4">Run a deep analysis to find grammar mistakes and stylistic improvements.</p>
                            <button
                                onClick={handleCheckGrammar}
                                className="px-6 py-3 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors flex items-center gap-2 mx-auto"
                            >
                                <RefreshCw size={20} />
                                Run Grammar Check
                            </button>
                        </div>
                    )}

                    {isLtLoading && (
                        <div className="text-center py-12">
                            <Loader className="animate-spin text-amber-500 mx-auto mb-4" size={32} />
                            <p className="text-slate-600">Analyzing text...</p>
                        </div>
                    )}

                    {ltError && (
                        <div className="text-center py-8 text-red-600 bg-red-50 rounded-lg">
                            <AlertCircle className="mx-auto mb-2" size={32} />
                            <p>{ltError}</p>
                            <button
                                onClick={handleCheckGrammar}
                                className="mt-4 px-4 py-2 border border-red-200 bg-white rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {ltResult && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-800">
                                    Found {ltResult.matches.length} issues
                                </h4>
                                <button
                                    onClick={handleCheckGrammar}
                                    className="text-amber-600 text-sm font-medium hover:text-amber-700 flex items-center gap-1"
                                >
                                    <RefreshCw size={14} /> Re-run
                                </button>
                            </div>

                            {ltResult.matches.length === 0 ? (
                                <div className="text-center py-8 bg-green-50 rounded-lg text-green-700">
                                    <CheckCircle className="mx-auto mb-2" size={32} />
                                    <p className="font-medium">No grammar issues found!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {ltResult.matches.map((match, i) => (
                                        <div key={i} className="p-4 glass rounded-lg border border-white/30">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-1" />
                                                <div>
                                                    <p className="text-sm text-slate-500 font-mono mb-1">{match.rule.id}</p>
                                                    <p className="font-medium text-slate-800 mb-2">{match.message}</p>

                                                    <div className="glass p-3 rounded border border-white/30 text-sm mb-2">
                                                        <span className="text-slate-400">...</span>
                                                        <span>{match.context.text.substring(0, match.context.offset)}</span>
                                                        <span className="bg-red-100 text-red-700 px-1 rounded mx-0.5 border-b-2 border-red-300">
                                                            {match.context.text.substring(match.context.offset, match.context.offset + match.context.length)}
                                                        </span>
                                                        <span>{match.context.text.substring(match.context.offset + match.context.length)}</span>
                                                        <span className="text-slate-400">...</span>
                                                    </div>

                                                    {match.replacements && match.replacements.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 text-sm">
                                                            <span className="text-slate-500">Suggestions:</span>
                                                            {match.replacements.slice(0, 3).map((rep, idx) => (
                                                                <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                                                    {rep.value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Personalized Challenge Section (existing GrammarQuiz) */}
            <div className="mt-16 pt-10 border-t border-slate-200">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                        <GraduationCap className="text-indigo-500" />
                        Personalized Challenge
                    </h3>
                    <p className="text-slate-600">
                        Take a comprehensive quiz that combines this article's grammar with your previous learning history.
                    </p>
                </div>
                <GrammarQuiz articleText={articleText} learningHistory={learningHistory} />
            </div>
        </LessonLayout >
    );
};

export default GrammarPractice;

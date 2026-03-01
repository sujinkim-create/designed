import React, { useState } from 'react';
import { Sparkle, CheckCircle, XCircle, X } from '@phosphor-icons/react';
import { Spinner } from '@phosphor-icons/react';

interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface QuizData {
    questions: Question[];
}

interface GrammarQuizProps {
    articleText: string;
}

export const GrammarQuiz: React.FC<GrammarQuizProps> = ({ articleText }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [quizComplete, setQuizComplete] = useState(false);

    const startQuiz = async () => {
        setIsOpen(true);
        if (!quizData) {
            setLoading(true);
            try {
                const response = await fetch('/api/generate-grammar-quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ articleText }),
                });

                if (!response.ok) throw new Error("Failed to load quiz");

                const data = await response.json();
                setQuizData(data);
            } catch (err) {
                console.error(err);
                alert("Failed to generate quiz. Please try again.");
                setIsOpen(false);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAnswer = (optionIdx: number) => {
        if (selectedOption !== null || showResult) return;

        setSelectedOption(optionIdx);
        setShowResult(true);

        if (optionIdx === quizData?.questions[currentQuestionIdx].correctAnswer) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (!quizData) return;

        if (currentQuestionIdx < quizData.questions.length - 1) {
            setCurrentQuestionIdx(curr => curr + 1);
            setSelectedOption(null);
            setShowResult(false);
        } else {
            setQuizComplete(true);
        }
    };

    const resetQuiz = () => {
        setQuizData(null);
        setCurrentQuestionIdx(0);
        setSelectedOption(null);
        setScore(0);
        setShowResult(false);
        setQuizComplete(false);
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={startQuiz}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
            >
                <Sparkle weight="fill" size={20} />
                <span>Take Grammar Quiz</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkle className="text-purple-600" weight="fill" />
                        Grammar Challenge
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <Spinner className="animate-spin mx-auto text-purple-600 mb-4" size={40} />
                            <p className="text-slate-600">Generating questions from the article...</p>
                        </div>
                    ) : quizComplete ? (
                        <div className="text-center py-8">
                            <div className="mb-6">
                                <div className="text-6xl text-purple-600 font-bold mb-2">{Math.round((score / (quizData?.questions.length || 1)) * 100)}%</div>
                                <p className="text-slate-600">You scored {score} out of {quizData?.questions.length}</p>
                            </div>
                            <button
                                onClick={resetQuiz}
                                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    ) : quizData ? (
                        <div>
                            {/* Progress */}
                            <div className="mb-6 flex justify-between text-sm text-slate-500 font-medium">
                                <span>Question {currentQuestionIdx + 1} of {quizData.questions.length}</span>
                                <span>Score: {score}</span>
                            </div>

                            {/* Question */}
                            <h4 className="text-lg font-medium text-slate-900 mb-6">
                                {quizData.questions[currentQuestionIdx].question}
                            </h4>

                            {/* Options */}
                            <div className="space-y-3 mb-6">
                                {quizData.questions[currentQuestionIdx].options.map((option, idx) => {
                                    let buttonStyle = "border-slate-200 hover:border-purple-200 hover:bg-purple-50";

                                    if (showResult) {
                                        if (idx === quizData.questions[currentQuestionIdx].correctAnswer) {
                                            buttonStyle = "bg-green-50 border-green-500 text-green-700";
                                        } else if (idx === selectedOption) {
                                            buttonStyle = "bg-red-50 border-red-500 text-red-700";
                                        } else {
                                            buttonStyle = "opacity-50 border-slate-200";
                                        }
                                    } else if (selectedOption === idx) {
                                        buttonStyle = "border-purple-500 bg-purple-50";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(idx)}
                                            disabled={showResult}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${buttonStyle}`}
                                        >
                                            <span>{option}</span>
                                            {showResult && idx === quizData.questions[currentQuestionIdx].correctAnswer && (
                                                <CheckCircle size={20} weight="fill" className="text-green-500" />
                                            )}
                                            {showResult && idx === selectedOption && idx !== quizData.questions[currentQuestionIdx].correctAnswer && (
                                                <XCircle size={20} weight="fill" className="text-red-500" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback/Next */}
                            {showResult && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="bg-slate-50 p-4 rounded-lg mb-6 text-slate-700 text-sm">
                                        <span className="font-bold block mb-1">Explanation:</span>
                                        {quizData.questions[currentQuestionIdx].explanation}
                                    </div>
                                    <button
                                        onClick={nextQuestion}
                                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                                    >
                                        {currentQuestionIdx < quizData.questions.length - 1 ? 'Next Question' : 'See Results'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

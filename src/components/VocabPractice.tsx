import React, { useState, useEffect, useMemo } from 'react';
import { VocabItem } from '../types';
import { Cards, CheckCircle, PenNib, Shuffle, ArrowRight, ArrowLeft, ArrowsClockwise, ArrowCounterClockwise, Trophy, SpeakerHigh, Sparkle, XCircle } from '@phosphor-icons/react';
import LessonLayout from './ui/LessonLayout';
import SectionHeader from './ui/SectionHeader';
import PracticeCard from './ui/PracticeCard';

interface VocabPracticeProps {
    vocabulary: VocabItem[];
    onRegenerate?: () => void;
}

type PracticeMode = 'flashcards' | 'match' | 'cloze' | 'write';

const MODES: { id: PracticeMode; label: string; icon: any }[] = [
    { id: 'flashcards', label: 'Flashcards', icon: Cards },
    { id: 'match', label: 'Match', icon: Shuffle },
    { id: 'cloze', label: 'Fill Blanks', icon: PenNib },
    { id: 'write', label: 'Spelling', icon: CheckCircle },
];

const VocabPractice: React.FC<VocabPracticeProps> = ({ vocabulary, onRegenerate }) => {
    const [mode, setMode] = useState<PracticeMode>('flashcards');

    return (
        <LessonLayout>
            <SectionHeader
                icon={<Cards size={24} weight="duotone" />}
                title="Vocabulary Practice"
                subtitle="Master new words with interactive exercises."
                action={
                    <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                        <div className="glass p-1 rounded-xl flex">
                            {MODES.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setMode(m.id)}
                                    className={`px-3 py-2 rounded-lg font-bold text-xs transition-all duration-200 flex items-center gap-1.5
                                        ${mode === m.id
                                            ? 'bg-indigo-500 text-white shadow-md'
                                            : 'text-slate-600 hover:text-indigo-600 hover:bg-white/20'}
                                    `}
                                >
                                    <m.icon size={16} weight={mode === m.id ? "fill" : "duotone"} />
                                    <span className="hidden sm:inline">{m.label}</span>
                                </button>
                            ))}
                        </div>
                        {onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm"
                                title="Regenerate Vocabulary"
                            >
                                <ArrowsClockwise size={20} weight="duotone" />
                            </button>
                        )}
                    </div>
                }
            />

            <div className="min-h-[400px]">
                {mode === 'flashcards' && <FlashcardsMode vocabulary={vocabulary} />}
                {mode === 'match' && <MatchMode vocabulary={vocabulary} />}
                {mode === 'cloze' && <ClozeMode vocabulary={vocabulary} />}
                {mode === 'write' && <WriteMode vocabulary={vocabulary} />}
            </div>
        </LessonLayout>
    );
};

// --- Sub-components ---

const FlashcardsMode: React.FC<{ vocabulary: VocabItem[] }> = ({ vocabulary }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        window.speechSynthesis.cancel();
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev + 1) % vocabulary.length), 200);
    };

    const handlePrev = () => {
        window.speechSynthesis.cancel();
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => (prev - 1 + vocabulary.length) % vocabulary.length), 200);
    };

    const speakWord = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.speechSynthesis.cancel();
        const currentCard = vocabulary[currentIndex];
        const utterance = new SpeechSynthesisUtterance(currentCard.word);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const speakContent = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.speechSynthesis.cancel();
        const currentCard = vocabulary[currentIndex];
        const text = `${currentCard.definition}. Example: ${currentCard.example}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const currentCard = vocabulary[currentIndex];

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="w-full flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider px-2">
                <span>Card {currentIndex + 1} of {vocabulary.length}</span>
                <span>{isFlipped ? 'Definition' : 'Word'}</span>
            </div>

            <div
                className="relative w-full h-96 cursor-pointer group"
                style={{ perspective: '1000px' }}
                onClick={() => {
                    window.speechSynthesis.cancel();
                    setIsFlipped(!isFlipped);
                }}
            >
                <div
                    className="relative w-full h-full"
                    style={{
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.5s',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                >
                    {/* Front */}
                    <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
                        <PracticeCard className="h-full flex flex-col items-center justify-center p-8 text-center hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 relative group border-t-4 border-indigo-500/50 glass-card">
                            <h3 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">{currentCard.word}</h3>
                            <p className="text-indigo-400 text-sm font-medium flex items-center gap-2 animate-pulse">
                                <Sparkle size={14} weight="duotone" /> Tap to flip
                            </p>
                            <button
                                onClick={speakWord}
                                className="absolute top-6 right-6 p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 rounded-full transition-colors z-10"
                                title="Listen"
                            >
                                <SpeakerHigh size={24} weight="duotone" />
                            </button>
                        </PracticeCard>
                    </div>
                    {/* Back */}
                    <div
                        className="absolute w-full h-full"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <PracticeCard className="h-full flex flex-col items-center justify-center p-8 text-center glass-card border-t-4 border-fuchsia-400/50">
                            <p className="text-2xl font-bold text-slate-900 mb-1">{currentCard.koreanDefinition || '-'}</p>
                            <p className="text-sm text-slate-500 mb-5 leading-relaxed">{currentCard.definition}</p>
                            <div className="w-12 h-1 bg-indigo-200 rounded-full mb-5"></div>
                            <p className="text-base text-slate-500 italic font-serif">"{currentCard.example}"</p>
                            <button
                                onClick={speakContent}
                                className="absolute top-6 right-6 p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50/50 rounded-full transition-colors z-10"
                                title="Listen to Definition & Example"
                            >
                                <SpeakerHigh size={24} weight="duotone" />
                            </button>
                        </PracticeCard>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={handlePrev}
                    className="p-4 rounded-full glass border border-white/20 text-slate-500 hover:bg-white/20 hover:text-slate-700 transition-all shadow-sm hover:shadow-md"
                >
                    <ArrowLeft size={20} weight="bold" />
                </button>
                <button
                    onClick={handleNext}
                    className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5"
                >
                    <span>Next Card</span>
                    <ArrowRight size={18} weight="bold" />
                </button>
            </div >
        </div >
    );
};

const MatchMode: React.FC<{ vocabulary: VocabItem[] }> = ({ vocabulary }) => {
    const [items, setItems] = useState<{ id: string, type: 'word' | 'def', content: string, matched: boolean }[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [isComplete, setIsComplete] = useState(false);

    const initializeGame = () => {
        const subset = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, 10);
        const gameItems = [
            ...subset.map(v => ({ id: v.word, type: 'word' as const, content: v.word, matched: false })),
            ...subset.map(v => ({ id: v.word, type: 'def' as const, content: v.definition, matched: false }))
        ].sort(() => 0.5 - Math.random());
        setItems(gameItems);
        setIsComplete(false);
        setSelected(null);
    };

    useEffect(() => {
        initializeGame();
    }, [vocabulary]);

    const handleClick = (index: number) => {
        const item = items[index];
        if (item.matched) return;

        if (selected === null) {
            setSelected(index);
        } else {
            const firstIndex = selected;
            const firstItem = items[firstIndex];

            if (firstIndex === index) {
                setSelected(null);
                return;
            }

            if (firstItem.id === item.id && firstItem.type !== item.type) {
                // Match!
                const newItems = [...items];
                newItems[firstIndex].matched = true;
                newItems[index].matched = true;
                setItems(newItems);
                setSelected(null);

                if (newItems.every(i => i.matched)) {
                    setIsComplete(true);
                }
            } else {
                setSelected(null);
            }
        }
    };

    if (isComplete) {
        return (
            <PracticeCard className="flex flex-col items-center justify-center h-full text-center py-12 p-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <Trophy className="text-green-600 w-12 h-12" weight="duotone" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-2">Excellent!</h3>
                <p className="text-slate-500 mb-8 text-lg">You've matched all the definitions correctly.</p>
                <button
                    onClick={initializeGame}
                    className="px-8 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-100"
                >
                    <ArrowCounterClockwise size={20} weight="duotone" />
                    <span>Play Again</span>
                </button>
            </PracticeCard>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Match Definitions</h3>
                <button onClick={initializeGame} className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
                    <ArrowCounterClockwise size={18} weight="duotone" />
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleClick(idx)}
                        disabled={item.matched}
                        className={`
                            relative p-4 rounded-xl border text-sm font-medium transition-all duration-200 h-32 flex items-center justify-center text-center shadow-sm
                            ${item.matched
                                ? 'opacity-0 pointer-events-none scale-90'
                                : selected === idx
                                    ? 'bg-indigo-500/10 border-indigo-400 text-indigo-700 shadow-md scale-105'
                                    : 'glass border-white/20 text-slate-700 hover:bg-white/30 hover:shadow-md hover:-translate-y-1'}
                        `}
                    >
                        {item.content}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ClozeMode: React.FC<{ vocabulary: VocabItem[] }> = ({ vocabulary }) => {
    // Shuffle vocabulary on mount
    const shuffledVocab = useMemo(() => {
        return [...vocabulary].sort(() => Math.random() - 0.5);
    }, [vocabulary]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const currentItem = shuffledVocab[currentIndex];

    // Generate options when current item changes
    useEffect(() => {
        if (!currentItem) return;

        const otherWords = shuffledVocab
            .filter(v => v.word !== currentItem.word)
            .map(v => v.word);

        // Shuffle and pick 3 distractors
        const distractors = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3);

        // Combine with correct answer and shuffle
        const newOptions = [...distractors, currentItem.word].sort(() => 0.5 - Math.random());

        setOptions(newOptions);
        setSelectedOption(null);
        setIsCorrect(null);
        setIsSubmitted(false);
    }, [currentIndex, shuffledVocab, currentItem]);

    const clozeSentence = useMemo(() => {
        if (!currentItem) return "";
        const regex = new RegExp(currentItem.word, 'gi');
        return currentItem.example.replace(regex, '________');
    }, [currentItem]);

    const handleOptionClick = (option: string) => {
        if (isSubmitted) return; // Prevent changing answer after submission
        setSelectedOption(option);
    };

    const handleCheck = () => {
        if (!selectedOption) return;

        setIsSubmitted(true);
        if (selectedOption === currentItem.word) {
            setIsCorrect(true);
        } else {
            setIsCorrect(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < shuffledVocab.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsComplete(true);
        }
    };

    const handleReset = () => {
        setCurrentIndex(0);
        setIsComplete(false);
        setSelectedOption(null);
        setIsCorrect(null);
        setIsSubmitted(false);
    };

    if (isComplete) {
        return (
            <PracticeCard className="flex flex-col items-center justify-center h-full text-center py-12 p-8">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="text-indigo-500 w-12 h-12" weight="duotone" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-2">All Done!</h3>
                <p className="text-slate-500 mb-8 text-lg">You've completed the fill-in-the-blank exercises.</p>
                <button
                    onClick={handleReset}
                    className="px-8 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-100"
                >
                    <ArrowCounterClockwise size={20} weight="duotone" />
                    <span>Start Over</span>
                </button>
            </PracticeCard>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold text-slate-500 uppercase tracking-wide">
                    <span>Question {currentIndex + 1} of {vocabulary.length}</span>
                    <span className="text-indigo-500">{Math.round(((currentIndex) / vocabulary.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-indigo-500 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentIndex) / vocabulary.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            <PracticeCard className="p-10 text-center relative border-t-4 border-indigo-500">
                <p className="text-2xl md:text-3xl text-slate-800 font-medium leading-relaxed mb-8">
                    {clozeSentence.split('________').map((part, i, arr) => (
                        <React.Fragment key={i}>
                            {part}
                            {i < arr.length - 1 && (
                                <span
                                    className={`border-b-2 border-solid min-w-[80px] inline-block text-center px-2 transition-colors duration-300 transform translate-y-1 ${selectedOption
                                        ? (isSubmitted
                                            ? (isCorrect ? 'text-teal-600 border-teal-500' : 'text-rose-500 border-rose-400')
                                            : 'text-indigo-600 border-indigo-500')
                                        : 'text-transparent border-slate-300'
                                        }`}
                                >{selectedOption || '________'}</span>
                            )}
                        </React.Fragment>
                    ))}
                </p>
                <div className="pt-6 border-t border-slate-100">
                    <p className="text-slate-400 text-xs uppercase tracking-wide font-bold mb-2">Hint</p>
                    <p className="text-slate-600 font-medium">{currentItem.definition}</p>
                </div>
            </PracticeCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((option, idx) => {
                    let btnClass = "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50";

                    if (selectedOption === option) {
                        if (isSubmitted) {
                            if (isCorrect) {
                                btnClass = "bg-teal-50 border-teal-400 text-teal-700";
                            } else {
                                btnClass = "bg-rose-50 border-rose-300 text-rose-600 animate-shake";
                            }
                        } else {
                            btnClass = "bg-indigo-50 border-indigo-400 text-indigo-700 shadow-md shadow-indigo-100";
                        }
                    } else if (isSubmitted && !isCorrect && option === currentItem.word) {
                        // Show correct answer if user was wrong
                        btnClass = "bg-teal-50 border-teal-400 text-teal-700";
                    } else if (isSubmitted) {
                        btnClass = "opacity-40 border-slate-100";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionClick(option)}
                            disabled={isSubmitted}
                            className={`p-4 rounded-xl border-2 font-bold text-lg transition-all duration-200 shadow-sm ${btnClass}`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 min-h-[80px]">
                {!isSubmitted ? (
                    <button
                        onClick={handleCheck}
                        disabled={!selectedOption}
                        className="px-10 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100"
                    >
                        Check Answer
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="px-10 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                    >
                        <span>{currentIndex === vocabulary.length - 1 ? 'Finish' : 'Next Sentence'}</span>
                        <ArrowRight size={18} weight="bold" />
                    </button>
                )}
            </div>
        </div>
    );
};

const WriteMode: React.FC<{ vocabulary: VocabItem[] }> = ({ vocabulary }) => {
    // Shuffle vocabulary on mount
    const shuffledVocab = useMemo(() => {
        return [...vocabulary].sort(() => Math.random() - 0.5);
    }, [vocabulary]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!feedback && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentIndex, feedback]);

    const currentItem = shuffledVocab[currentIndex];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (feedback === 'correct') {
            handleNext();
            return;
        }
        if (input.trim().toLowerCase() === currentItem.word.toLowerCase()) {
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
    };

    const handleNext = () => {
        if (currentIndex < shuffledVocab.length - 1) {
            setFeedback(null);
            setInput('');
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsComplete(true);
        }
    };

    const handleReset = () => {
        setCurrentIndex(0);
        setInput('');
        setFeedback(null);
        setIsComplete(false);
    };

    const handleTryAgain = () => {
        setFeedback(null);
        setInput('');
        inputRef.current?.focus();
    };

    if (isComplete) {
        return (
            <PracticeCard className="flex flex-col items-center justify-center h-full text-center py-12 p-8">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Trophy className="text-indigo-500 w-12 h-12" weight="duotone" />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-2">Spelling Master!</h3>
                <p className="text-slate-500 mb-8 text-lg">You've successfully spelled all the words.</p>
                <button
                    onClick={handleReset}
                    className="px-8 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-100"
                >
                    <ArrowCounterClockwise size={20} weight="duotone" />
                    <span>Practice Again</span>
                </button>
            </PracticeCard>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
                <h3 className="text-lg font-bold text-slate-800">Type the Word</h3>
                <span className="text-slate-400 font-bold text-sm">{currentIndex + 1} / {vocabulary.length}</span>
            </div>

            <PracticeCard className="p-8 text-center relative border-t-4 border-indigo-500">
                <p className="text-xl text-slate-800 font-medium mb-4">{currentItem.definition}</p>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 inline-block w-full max-w-2xl">
                    <p className="text-slate-600 text-lg leading-relaxed">
                        &ldquo;{currentItem.example.split(new RegExp(`(${currentItem.word})`, 'gi')).map((part, i) =>
                            part.toLowerCase() === currentItem.word.toLowerCase()
                                ? <span key={i} className="inline-block border-b-2 border-slate-400 min-w-[60px]">&nbsp;</span>
                                : part
                        )}&rdquo;
                    </p>
                </div>
            </PracticeCard>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            if (feedback === 'incorrect') setFeedback(null);
                        }}
                        disabled={feedback === 'correct'}
                        autoComplete="off"
                        className={`w-full text-center text-2xl font-medium py-4 px-6 rounded-lg border outline-none transition-all
                            ${feedback === 'correct'
                                ? 'bg-teal-50 border-teal-400 text-teal-700'
                                : feedback === 'incorrect'
                                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                                    : 'border-slate-300 bg-white focus:border-indigo-500 text-slate-800'}
                        `}
                        placeholder="Type the word..."
                    />
                    {feedback === 'correct' && (
                        <CheckCircle size={24} weight="duotone" className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-500" />
                    )}
                </div>

                <div>
                    {feedback === 'incorrect' && (
                        <div className="mb-6 animate-in fade-in slide-in-from-top-2 bg-red-50 p-4 rounded-xl border border-red-100">
                            <p className="text-red-500 font-bold text-center mb-2 flex items-center justify-center gap-2">
                                <XCircle size={20} weight="duotone" />
                                Incorrect
                            </p>
                            <p className="text-slate-600 text-center">
                                The correct answer is: <span className="font-bold text-indigo-500 text-xl ml-2">{currentItem.word}</span>
                            </p>
                        </div>
                    )}

                    {feedback === 'incorrect' ? (
                        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <button
                                type="button"
                                onClick={handleTryAgain}
                                className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-500 transition-all"
                            >
                                Try Again
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex-1 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
                            >
                                Next Word
                            </button>
                        </div>
                    ) : feedback === 'correct' ? (
                        <button
                            type="submit"
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 animate-in fade-in slide-in-from-bottom-2"
                        >
                            Next Word
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="w-full py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100"
                        >
                            Check Answer
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default VocabPractice;

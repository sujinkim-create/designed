import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { Sparkle, CheckCircle, Circle, ArrowRight, Target, Heart } from '@phosphor-icons/react';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (prefs: UserPreferences) => void;
}

const INTERESTS = [
    "Technology & AI", "Travel & Culture", "Business & Finance",
    "Health & Wellness", "Science & Space", "Arts & Literature",
    "History", "Environment", "Sports", "Entertainment"
];

const GOALS = [
    "Improve Vocabulary", "Fluent Speaking", "Better Grammar",
    "Exam Preparation (IELTS/TOEFL)", "Business English",
    "Travel Communication", "Academic Writing"
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onComplete }) => {
    const [step, setStep] = useState(1);
    const [interests, setInterests] = useState<string[]>([]);
    const [goals, setGoals] = useState<string[]>([]);

    if (!isOpen) return null;

    const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            if (list.length < 3) {
                setList([...list, item]);
            }
        }
    };

    const handleNext = () => {
        if (step === 1 && interests.length > 0) {
            setStep(2);
        } else if (step === 2 && goals.length > 0) {
            onComplete({ interests, goals });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#F7F9FC]/90 backdrop-blur-sm"></div>

            <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-slate-100">
                {/* Sidebar */}
                <div className="w-full md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-8 md:p-10 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-12">
                            <Sparkle size={24} weight="fill" className="text-[#5850EC]" />
                            <span className="font-bold text-lg text-slate-900">LingoLeap</span>
                        </div>

                        <div className="space-y-6">
                            <div className={`flex items-center gap-4 transition-colors ${step === 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${step === 1 ? 'bg-white border-slate-200 shadow-sm' : 'bg-transparent border-transparent'}`}>
                                    1
                                </div>
                                <span className="font-medium">Interests</span>
                            </div>
                            <div className={`flex items-center gap-4 transition-colors ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${step === 2 ? 'bg-white border-slate-200 shadow-sm' : 'bg-transparent border-transparent'}`}>
                                    2
                                </div>
                                <span className="font-medium">Goals</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block text-sm text-slate-400">
                        Step {step} of 2
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col">
                    <div className="flex-grow">
                        <h2 className="text-3xl font-medium text-slate-900 mb-2">
                            {step === 1 ? "What interests you?" : "What are your goals?"}
                        </h2>
                        <p className="text-slate-500 text-lg mb-10 font-light">
                            {step === 1
                                ? "Select up to 3 topics to personalize your reading."
                                : "Choose your primary learning objectives."}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(step === 1 ? INTERESTS : GOALS).map((item) => {
                                const isSelected = (step === 1 ? interests : goals).includes(item);
                                return (
                                    <button
                                        key={item}
                                        onClick={() => toggleSelection(item, step === 1 ? interests : goals, step === 1 ? setInterests : setGoals)}
                                        className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group
                                            ${isSelected
                                                ? 'border-[#5850EC] bg-[#5850EC]/5 text-[#5850EC]'
                                                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'}
                                        `}
                                    >
                                        <span className="font-medium">{item}</span>
                                        {isSelected && <CheckCircle size={20} weight="fill" className="text-[#5850EC]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end mt-10 pt-6 border-t border-slate-100">
                        <button
                            onClick={handleNext}
                            disabled={step === 1 ? interests.length === 0 : goals.length === 0}
                            className="px-8 py-3 bg-[#5850EC] text-white rounded-full font-medium hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
                        >
                            {step === 1 ? "Next Step" : "Complete Setup"}
                            <ArrowRight size={18} weight="bold" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;

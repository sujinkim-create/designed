import React, { useState } from 'react';
import { DiscussionItem } from '../types';
import { ChatTeardropText, CaretDown, Lightbulb, Microphone, PenNib, PaperPlaneRight, Spinner, Robot } from '@phosphor-icons/react';
import { evaluateDiscussionAnswer } from '../services/geminiClient';
import LessonLayout from './ui/LessonLayout';
import SectionHeader from './ui/SectionHeader';
import PracticeCard from './ui/PracticeCard';

interface DiscussionSectionProps {
  items: DiscussionItem[];
}

const DiscussionSection: React.FC<DiscussionSectionProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, { feedback: string; score: number; improvements: string } | null>>({});
  const [isEvaluating, setIsEvaluating] = useState<Record<number, boolean>>({});

  const [showModelAnswers, setShowModelAnswers] = useState<Record<number, boolean>>({});

  const toggleModelAnswer = (index: number) => {
    setShowModelAnswers(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleEvaluate = async (index: number, question: string) => {
    const answer = userAnswers[index];
    if (!answer?.trim()) return;

    setIsEvaluating(prev => ({ ...prev, [index]: true }));
    try {
      const result = await evaluateDiscussionAnswer(question, answer);
      setFeedback(prev => ({ ...prev, [index]: result }));
    } catch (error) {
      console.error("Failed to evaluate answer", error);
    } finally {
      setIsEvaluating(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <LessonLayout>
      <SectionHeader
        icon={<ChatTeardropText size={24} weight="duotone" />}
        title="Speaking & Writing Practice"
        subtitle="Use these questions to practice your speaking with a partner or write a short essay."
        action={
          <div className="flex gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
              <Microphone size={14} weight="duotone" /> Speaking
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
              <PenNib size={14} weight="duotone" /> Writing
            </div>
          </div>
        }
      />

      <div className="space-y-6">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          const currentFeedback = feedback[idx];
          const isProcessing = isEvaluating[idx];

          return (
            <PracticeCard key={idx} className={`transition-all duration-300 overflow-hidden ${isOpen ? 'shadow-lg shadow-indigo-50 border-indigo-100' : ''}`}>
              <div
                className="p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center font-bold rounded-xl text-sm transition-colors
                      ${isOpen ? 'bg-indigo-500 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-500'}
                    `}>
                      {idx + 1}
                    </span>
                    <h4 className={`text-lg font-bold pt-1.5 transition-colors ${isOpen ? 'text-violet-900' : 'text-slate-800'}`}>
                      {item.question}
                    </h4>
                  </div>
                  <button className={`mt-2 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`}>
                    <CaretDown size={24} weight="bold" />
                  </button>
                </div>
              </div>

              <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="px-6 pb-8 pt-2 space-y-6">
                    {/* User Input Section */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <PenNib size={16} weight="duotone" className="text-indigo-400" />
                        Your Answer <span className="text-xs font-normal text-indigo-300 normal-case ml-auto flex items-center gap-1"><Robot size={14} /> Get AI Feedback</span>
                      </label>
                      <div className="relative">
                        <textarea
                          value={userAnswers[idx] || ''}
                          onChange={(e) => setUserAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                          placeholder="Write your answer here to get feedback..."
                          className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none resize-none text-slate-700 leading-relaxed transition-all"
                        />
                        <button
                          onClick={() => handleEvaluate(idx, item.question)}
                          disabled={!userAnswers[idx]?.trim() || isProcessing}
                          className="absolute bottom-3 right-3 bg-indigo-500 text-white p-2 rounded-lg shadow-lg shadow-indigo-100 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                        >
                          {isProcessing ? <Spinner className="animate-spin" size={20} /> : <PaperPlaneRight size={20} weight="fill" />}
                        </button>
                      </div>
                    </div>

                    {/* AI Feedback Display */}
                    {currentFeedback && (
                      <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-50 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-bold text-violet-900 flex items-center gap-2">
                            <Robot size={20} weight="duotone" className="text-indigo-500" />
                            AI Feedback
                          </h5>
                          <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-sm font-bold border border-indigo-50 shadow-sm">
                            Score: {currentFeedback.score}/10
                          </span>
                        </div>
                        <div className="space-y-4 text-sm">
                          <div>
                            <p className="font-bold text-violet-800 mb-1">Analysis</p>
                            <p className="text-indigo-600 leading-relaxed">{currentFeedback.feedback}</p>
                          </div>
                          <div>
                            <p className="font-bold text-violet-800 mb-1">Improvements</p>
                            <p className="text-indigo-600 leading-relaxed">{currentFeedback.improvements}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border border-slate-100 relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-slate-400 font-bold text-sm uppercase tracking-wide">
                          <Lightbulb size={18} weight="duotone" className="mr-2" />
                          Model Answer
                        </div>
                        <button
                          onClick={() => toggleModelAnswer(idx)}
                          className="text-xs font-bold text-indigo-500 hover:text-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-50"
                        >
                          {showModelAnswers[idx] ? 'Hide Answer' : 'Show Answer'}
                        </button>
                      </div>

                      {showModelAnswers[idx] ? (
                        <p className="text-slate-600 leading-loose whitespace-pre-line font-medium animate-in fade-in slide-in-from-top-1 duration-300">
                          {item.modelAnswer}
                        </p>
                      ) : (
                        <div className="h-24 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 gap-2">
                          <p className="text-sm italic">The model answer is hidden</p>
                          <button
                            onClick={() => toggleModelAnswer(idx)}
                            className="text-xs font-bold text-slate-500 hover:text-indigo-500 underline decoration-slate-300 hover:decoration-indigo-200 underline-offset-4 transition-all"
                          >
                            Reveal Answer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </PracticeCard>
          );
        })}
      </div>
    </LessonLayout>
  );
};

export default DiscussionSection;

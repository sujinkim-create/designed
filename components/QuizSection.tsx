import React, { useState } from 'react';
import { QuestionMCQ, QuestionCloze } from '../types';
import { CheckCircle, XCircle, Circle, WarningCircle, Question, Medal, PenNib, ArrowCounterClockwise } from '@phosphor-icons/react';
import LessonLayout from './ui/LessonLayout';
import SectionHeader from './ui/SectionHeader';
import PracticeCard from './ui/PracticeCard';

interface QuizSectionProps {
  mcqs: QuestionMCQ[];
  clozes: QuestionCloze[];
}

const QuizSection: React.FC<QuizSectionProps> = ({ mcqs, clozes }) => {
  const [activeTab, setActiveTab] = useState<'mcq' | 'cloze'>('mcq');

  // MCQ State
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);

  // Cloze State
  const [clozeAnswers, setClozeAnswers] = useState<Record<number, string>>({});
  const [clozeSubmitted, setClozeSubmitted] = useState(false);

  // MCQ Handlers
  const handleMcqSelect = (idx: number, optionIdx: number) => {
    if (mcqSubmitted) return;
    setMcqAnswers(prev => ({ ...prev, [idx]: optionIdx }));
  };

  // Cloze Handlers
  const handleClozeSelect = (idx: number, value: string) => {
    if (clozeSubmitted) return;
    setClozeAnswers(prev => ({ ...prev, [idx]: value }));
  };

  // Scoring
  const getMcqScore = () => {
    let score = 0;
    mcqs.forEach((q, idx) => {
      if (mcqAnswers[idx] === q.correctIndex) score++;
    });
    return score;
  };

  const getClozeScore = () => {
    let score = 0;
    clozes.forEach((q, idx) => {
      if (clozeAnswers[idx] === q.answer) score++;
    });
    return score;
  };

  const mcqAnsweredCount = Object.keys(mcqAnswers).length;
  const clozeAnsweredCount = Object.keys(clozeAnswers).length;

  return (
    <LessonLayout>
      <SectionHeader
        icon={<Question size={24} weight="duotone" />}
        title="Comprehension Check"
        subtitle="Test your understanding of the article."
        action={
          <div className="flex space-x-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            <button
              onClick={() => setActiveTab('mcq')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2
                ${activeTab === 'mcq'
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50'}
              `}
            >
              <Question size={18} weight={activeTab === 'mcq' ? "duotone" : "regular"} />
              <span className="hidden sm:inline">Multiple Choice</span>
            </button>
            <button
              onClick={() => setActiveTab('cloze')}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2
                ${activeTab === 'cloze'
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-50'}
              `}
            >
              <PenNib size={18} weight={activeTab === 'cloze' ? "duotone" : "regular"} />
              <span className="hidden sm:inline">Fill Blanks</span>
            </button>
          </div>
        }
      />

      {activeTab === 'mcq' && (
        <div className="space-y-8">
          {mcqs.map((q, idx) => (
            <PracticeCard key={idx} className="p-8 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 relative group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-indigo-400 transition-colors duration-300"></div>
              <div className="flex items-start justify-between mb-6 pl-2">
                <h3 className="text-lg font-bold text-slate-800 leading-relaxed">
                  <span className="text-indigo-400 mr-3 text-xl">0{idx + 1}.</span>
                  {q.question}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 pl-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = mcqAnswers[idx] === optIdx;
                  const isCorrectAnswer = optIdx === q.correctIndex;

                  // Determine styles based on state
                  let containerClass = "border-slate-200 hover:bg-slate-50 hover:border-indigo-200";
                  let Icon = Circle;
                  let iconClass = "text-slate-300";

                  if (mcqSubmitted) {
                    if (isCorrectAnswer) {
                      containerClass = "bg-teal-50 border-teal-400 text-teal-700";
                      Icon = CheckCircle;
                      iconClass = "text-teal-600";
                    } else if (isSelected) {
                      containerClass = "bg-rose-50 border-rose-300 text-rose-600 animate-shake";
                      Icon = XCircle;
                      iconClass = "text-rose-500";
                    } else {
                      containerClass = "opacity-40 border-slate-100 bg-slate-50";
                    }
                  } else if (isSelected) {
                    containerClass = "bg-indigo-50 border-indigo-400 text-indigo-700 shadow-md shadow-indigo-100";
                    Icon = CheckCircle;
                    iconClass = "text-indigo-600";
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleMcqSelect(idx, optIdx)}
                      disabled={mcqSubmitted}
                      className={`relative w-full text-left px-5 py-4 border rounded-xl transition-all duration-200 flex items-center group ${containerClass}`}
                    >
                      <Icon size={20} weight="duotone" className={`mr-4 flex-shrink-0 transition-colors ${iconClass} ${!isSelected && !mcqSubmitted ? 'group-hover:text-indigo-300' : ''}`} />
                      <span className={`flex-grow font-medium ${mcqSubmitted && isCorrectAnswer ? 'text-teal-800' : mcqSubmitted && isSelected ? 'text-rose-700' : 'text-slate-700'}`}>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explicit feedback for incorrect answers */}
              {mcqSubmitted && mcqAnswers[idx] !== q.correctIndex && (
                <div className="mt-6 ml-2 p-4 bg-rose-50 rounded-xl text-sm text-rose-700 flex items-center border border-rose-100 animate-in fade-in slide-in-from-top-2">
                  <XCircle size={18} weight="duotone" className="mr-3 flex-shrink-0" />
                  <span>Correct answer: <span className="font-bold">{q.options[q.correctIndex]}</span></span>
                </div>
              )}
            </PracticeCard>
          ))}

          <div className="flex flex-col items-end pt-8 space-y-4 border-t border-slate-200">
            {!mcqSubmitted ? (
              <div className="flex flex-col items-end w-full sm:w-auto">
                <div className="text-sm text-slate-500 mb-3 font-bold uppercase tracking-wide">
                  Answered: <span className="text-indigo-500 text-lg">{mcqAnsweredCount}</span> / {mcqs.length}
                </div>
                <button
                  onClick={() => setMcqSubmitted(true)}
                  disabled={mcqAnsweredCount < mcqs.length}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white px-10 py-4 rounded-xl font-bold hover:from-indigo-600 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transform hover:-translate-y-0.5"
                >
                  Check Answers
                </button>
                {mcqAnsweredCount < mcqs.length && (
                  <p className="text-xs text-slate-400 mt-3 flex items-center font-medium">
                    <WarningCircle size={14} weight="duotone" className="mr-1.5" /> Answer all questions to submit
                  </p>
                )}
              </div>
            ) : (
              <div className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-50/50 rounded-full flex items-center justify-center border border-indigo-50">
                    <Medal className="text-indigo-500 w-8 h-8" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wide">Your Score</p>
                    <p className="text-3xl font-extrabold text-slate-900">
                      {getMcqScore()} <span className="text-lg text-slate-400 font-medium">/ {mcqs.length}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setMcqSubmitted(false); setMcqAnswers({}); }}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowCounterClockwise size={18} weight="bold" />
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'cloze' && (
        <div className="space-y-8">
          {clozes.map((q, idx) => {
            const isCorrect = clozeSubmitted && clozeAnswers[idx] === q.answer;
            const isWrong = clozeSubmitted && clozeAnswers[idx] !== q.answer;
            const currentAnswer = clozeAnswers[idx];

            return (
              <PracticeCard key={idx} className="p-8 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 relative">
                <p className="mb-8 text-xl text-slate-800 leading-relaxed font-medium">
                  <span className="text-indigo-500 font-bold mr-3 text-2xl">{idx + 1}.</span>
                  {q.sentencePart1}
                  <span
                    className={`border-b-2 border-solid min-w-[60px] inline-block text-center px-1 mx-1 transition-colors duration-300 transform translate-y-0.5 ${isCorrect
                        ? 'text-teal-600 border-teal-500'
                        : isWrong
                          ? 'text-rose-500 border-rose-400'
                          : currentAnswer
                            ? 'text-indigo-600 border-indigo-500'
                            : 'text-transparent border-slate-300'
                      }`}
                  >{currentAnswer || '______'}</span>
                  {q.sentencePart2}
                </p>

                <div className="flex flex-wrap gap-3">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleClozeSelect(idx, opt)}
                      disabled={clozeSubmitted}
                      className={`px-5 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all active:scale-95
                        ${currentAnswer === opt
                          ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-100'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-500 hover:bg-slate-50'
                        }
                        ${clozeSubmitted ? 'opacity-60 cursor-not-allowed' : ''}
                      `}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {isWrong && (
                  <div className="mt-6 p-4 bg-rose-50 rounded-xl text-sm text-rose-700 flex items-center border border-rose-100 animate-in fade-in slide-in-from-top-2">
                    <XCircle size={18} weight="duotone" className="mr-3 flex-shrink-0" />
                    <span>Correct answer: <span className="font-bold">{q.answer}</span></span>
                  </div>
                )}
                {isCorrect && (
                  <div className="mt-6 p-4 bg-green-50 rounded-xl text-sm text-green-700 flex items-center border border-green-100 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle size={18} weight="duotone" className="mr-3 flex-shrink-0" />
                    <span className="font-bold">Correct!</span>
                  </div>
                )}
              </PracticeCard>
            );
          })}

          <div className="flex flex-col items-end pt-8 space-y-4 border-t border-slate-200">
            {!clozeSubmitted ? (
              <div className="flex flex-col items-end w-full sm:w-auto">
                <div className="text-sm text-slate-500 mb-3 font-bold uppercase tracking-wide">
                  Answered: <span className="text-indigo-500 text-lg">{clozeAnsweredCount}</span> / {clozes.length}
                </div>
                <button
                  onClick={() => setClozeSubmitted(true)}
                  disabled={clozeAnsweredCount < clozes.length}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white px-10 py-4 rounded-xl font-bold hover:from-indigo-600 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transform hover:-translate-y-0.5"
                >
                  Check Answers
                </button>
                {clozeAnsweredCount < clozes.length && (
                  <p className="text-xs text-slate-400 mt-3 flex items-center font-medium">
                    <WarningCircle size={14} weight="duotone" className="mr-1.5" /> Fill all blanks to submit
                  </p>
                )}
              </div>
            ) : (
              <div className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-50/50 rounded-full flex items-center justify-center border border-indigo-50">
                    <Medal className="text-indigo-500 w-8 h-8" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wide">Your Score</p>
                    <p className="text-3xl font-extrabold text-slate-900">
                      {getClozeScore()} <span className="text-lg text-slate-400 font-medium">/ {clozes.length}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setClozeSubmitted(false); setClozeAnswers({}); }}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowCounterClockwise size={18} weight="bold" />
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </LessonLayout>
  );
};

export default QuizSection;

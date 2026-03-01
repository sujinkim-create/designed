import React, { useState } from 'react';
import { VocabItem } from '../types';
import { ChevronLeft, ChevronRight, RefreshCw, Volume2 } from 'lucide-react';

interface FlashcardsProps {
  vocabulary: VocabItem[];
}

const Flashcards: React.FC<FlashcardsProps> = ({ vocabulary }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [folded, setFolded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const flip = () => {
    setFolded(true);
    setTimeout(() => {
      setShowBack((prev) => !prev);
      setFolded(false);
    }, 180);
  };

  const handleNext = () => {
    setFolded(true);
    setTimeout(() => {
      setShowBack(false);
      setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
      setFolded(false);
    }, 180);
  };

  const handlePrev = () => {
    setFolded(true);
    setTimeout(() => {
      setShowBack(false);
      setCurrentIndex((prev) => (prev - 1 + vocabulary.length) % vocabulary.length);
      setFolded(false);
    }, 180);
  };

  const currentCard = vocabulary[currentIndex];

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Vocabulary Flashcards</h2>
        <span className="text-slate-500 font-medium">
          {currentIndex + 1} / {vocabulary.length}
        </span>
      </div>

      {/* Card Container */}
      <div
        className="relative w-full h-96 cursor-pointer"
        style={{
          transform: folded ? 'scaleX(0)' : 'scaleX(1)',
          transition: 'transform 0.18s ease-in-out',
        }}
        onClick={flip}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Front — Word */}
        {!showBack && (
          <div className="absolute w-full h-full bg-white rounded-xl shadow-xl border-2 border-slate-100 flex flex-col items-center justify-center p-8">
            <span className="text-sm text-indigo-400 font-bold tracking-widest uppercase mb-4">Word</span>
            <h3 className="text-5xl font-bold text-slate-800 mb-4 text-center">{currentCard.word}</h3>

            {/* Korean tooltip on hover */}
            <div
              className="absolute bottom-24 left-1/2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg z-50 max-w-xs text-center pointer-events-none"
              style={{
                transform: 'translateX(-50%)',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
            >
              <span className="text-indigo-200 text-xs mr-1">🇰🇷</span>
              {currentCard.koreanDefinition || '새 토픽을 생성해주세요'}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-indigo-600" />
            </div>

            <p className="text-slate-400 text-sm">Tap to flip · Hover for Korean</p>
            <button
              onClick={(e) => { e.stopPropagation(); speak(currentCard.word); }}
              className="mt-6 p-3 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-500 transition-colors"
            >
              <Volume2 size={24} />
            </button>
          </div>
        )}

        {/* Back — Definition */}
        {showBack && (
          <div className="absolute w-full h-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-xl shadow-xl flex flex-col items-center justify-center p-8 text-white">
            <span className="text-xs text-indigo-100 font-bold tracking-widest uppercase mb-2">뜻 (Korean)</span>
            <p className="text-2xl text-center font-bold mb-2">
              {currentCard.koreanDefinition || '-'}
            </p>
            <p className="text-sm text-center text-indigo-200 mb-5 leading-relaxed">
              {currentCard.definition}
            </p>

            <div className="w-16 h-1 bg-white/20 rounded-full mb-5" />

            <span className="text-xs text-indigo-100 font-bold tracking-widest uppercase mb-2">Example</span>
            <p className="text-base text-center font-light italic opacity-90 leading-relaxed">
              &ldquo;{currentCard.example}&rdquo;
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); speak(currentCard.example); }}
              className="mt-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Volume2 size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center space-x-6 mt-8">
        <button
          onClick={handlePrev}
          className="p-4 rounded-full bg-white border border-indigo-100 shadow-sm text-indigo-500 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={flip}
          className="flex items-center space-x-2 px-6 py-3 rounded-full bg-indigo-50/50 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
        >
          <RefreshCw size={18} />
          <span>Flip Card</span>
        </button>

        <button
          onClick={handleNext}
          className="p-4 rounded-full bg-white border border-indigo-100 shadow-sm text-indigo-500 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all active:scale-95"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Flashcards;

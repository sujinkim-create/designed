import React, { useState, useEffect, useRef } from 'react';
import { ArticleVariation } from '../types';
import { Volume2, Square, Clock, ChartBar } from 'lucide-react';
import { Spinner, Translate } from '@phosphor-icons/react';
import { translateText } from '../services/openaiService';

interface ArticleViewProps {
  articles: ArticleVariation[];
  currentLevelIndex: number;
  onLevelChange: (index: number) => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ articles, currentLevelIndex, onLevelChange }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const currentArticle = articles[currentLevelIndex];

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(currentArticle.content);
      utterance.lang = 'en-US';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Stop speaking if level changes or component unmounts
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentLevelIndex]);

  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Level Selector */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex space-x-1">
          {articles.map((article, idx) => (
            <button
              key={article.level}
              onClick={() => onLevelChange(idx)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${currentLevelIndex === idx
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'}
              `}
            >
              {article.level}
            </button>
          ))}
        </div>
      </div>

      {/* Article Card */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200 pb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{currentArticle.title}</h2>
              <div className="flex items-center space-x-4 text-sm font-medium text-slate-600">
                <span className="flex items-center">
                  <ChartBar size={16} className="mr-1.5" />
                  Level {currentArticle.level}
                </span>
                <span className="flex items-center">
                  <Clock size={16} className="mr-1.5" />
                  {Math.ceil(currentArticle.content.split(' ').length / 200)} min read
                </span>
              </div>
            </div>

            <button
              onClick={handleSpeak}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-colors border
                ${isSpeaking
                  ? 'bg-indigo-50/50 text-indigo-500 border-indigo-100 hover:bg-indigo-50'
                  : 'bg-white text-indigo-500 border-indigo-100 hover:bg-indigo-50/50'}
              `}
            >
              {isSpeaking ? <Square size={18} fill="currentColor" /> : <Volume2 size={18} />}
              <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
            </button>
          </div>

          <div
            ref={contentRef}
            className="prose prose-lg prose-slate max-w-none relative select-text"
          >
            {currentArticle.content
              .split(/\[PARAGRAPH\]|\n\n+|\n(?=[A-Z][a-z]+:)/)
              .map((paragraph, idx) => {
                // Clean up the paragraph text
                const cleanText = paragraph
                  .replace(/\\n/g, ' ')
                  .replace(/\*\*/g, '')
                  .replace(/\*/g, '')
                  .replace(/#/g, '')
                  .replace(/\[.*?\]/g, '')
                  .replace(/\s+/g, ' ')
                  .trim();

                if (!cleanText) return null;

                // Check if it's a conversation line (Name: dialogue)
                const isConversation = /^[A-Z][a-z]+:/.test(cleanText);

                return (
                  <p
                    key={idx}
                    className={`mb-4 leading-relaxed text-slate-700 select-text cursor-text ${isConversation ? 'pl-0' : ''}`}
                    style={{
                      textAlign: isConversation ? 'left' : 'justify',
                      textJustify: 'inter-word',
                      lineHeight: '1.75',
                    }}
                  >
                    {isConversation ? (
                      <>
                        <span className="font-semibold text-indigo-600">
                          {cleanText.split(':')[0]}:
                        </span>
                        {cleanText.substring(cleanText.indexOf(':') + 1)}
                      </>
                    ) : (
                      cleanText
                    )}
                  </p>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;

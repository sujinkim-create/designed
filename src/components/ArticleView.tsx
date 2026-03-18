import React, { useState, useEffect, useRef } from 'react';
import { ArticleVariation, ArticleSource } from '../types';
import { Volume2, Square, Clock, ChartBar } from 'lucide-react';
import { Spinner, Translate } from '@phosphor-icons/react';
import { translateText } from '../services/geminiClient';


interface ArticleViewProps {
  articles: ArticleVariation[];
  currentLevelIndex: number;
  onLevelChange: (index: number) => void;
  sources?: ArticleSource[];
}

const ArticleView: React.FC<ArticleViewProps> = ({ articles, currentLevelIndex, onLevelChange, sources }) => {
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
        <div className="glass p-1 rounded-lg inline-flex space-x-1">
          {articles.map((article, idx) => (
            <button
              key={article.level}
              onClick={() => onLevelChange(idx)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${currentLevelIndex === idx
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/20'}
              `}
            >
              {article.level}
            </button>
          ))}
        </div>
      </div>

      {/* Article Card */}
      <div className="glass-panel rounded-lg overflow-hidden">
        <div className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200/60 pb-6">
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
                  ? 'glass text-indigo-700 border-indigo-200 hover:bg-indigo-50/50'
                  : 'glass text-indigo-600 border-transparent hover:bg-white/40'}
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

          {sources && sources.length > 0 && (
            <div className="mt-10 pt-6 border-t border-slate-200/60">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">참고 출처</p>
              <ul className="space-y-2">
                {sources.map((src, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-slate-400 mt-0.5 shrink-0">{i + 1}.</span>
                    <a
                      href={src.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:text-indigo-700 hover:underline line-clamp-1"
                      title={src.snippet}
                    >
                      {src.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleView;

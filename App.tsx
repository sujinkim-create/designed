import React, { useState, useEffect } from 'react';
import { generateArticles, generateStudyPack, recommendTopics, translateText } from './services/geminiService';
import WordLookup from './components/WordLookup';
import TrendingTicker from './components/TrendingTicker';
import ArticleView from './components/ArticleView';
import VocabPractice from './components/VocabPractice';
import QuizSection from './components/QuizSection';
import DiscussionSection from './components/DiscussionSection';
import CollocationPractice from './components/CollocationPractice';
import GrammarPractice from './components/GrammarPractice';
import Header from './components/Header';
import Footer from './components/Footer';
import LearnerDashboard from './components/LearnerDashboard';
import OnboardingModal from './components/OnboardingModal';
// import PDFDownloadButton from './components/PDFDownloadButton';
// import PDFExportView from './components/PDFExportView';
import { GeneratedArticles, StudyPack, AppView, TabView, UserPreferences, TopicRecommendation, ContentType } from './types';
import { BookOpen, Cards, GraduationCap, ChatCircle, ArrowRight, Spinner, Sparkle, PuzzlePiece, ChalkboardTeacher, Lightbulb, Microphone, MagicWand, Translate } from '@phosphor-icons/react';
import { useAuth } from './contexts/AuthProvider';
import { fetchLearningHistory, addLearningRecord, LearningRecord } from './services/learningHistoryService';
import { saveArticleToCache, getArticleFromCache, updateCachedStudyData, CachedArticle, getLocalLearningHistory } from './services/articleCacheService';
import PasswordProtection from './components/PasswordProtection';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('site_authenticated') === 'true';
  });

  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, []);

  // Application State
  const [view, setView] = useState<AppView>('home');
  const [activeTab, setActiveTab] = useState<TabView>('read');
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState<ContentType>('article');
  const [targetLevel, setTargetLevel] = useState<string>('B1');

  // Data State
  const [articleData, setArticleData] = useState<GeneratedArticles | null>(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(2);
  const [studyData, setStudyData] = useState<StudyPack | null>(null);

  // Auth & Onboarding State (moved before useEffect that depends on user)
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [recommendations, setRecommendations] = useState<TopicRecommendation[]>([]);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);

  // Learning History State - persist to Supabase
  const [learningHistory, setLearningHistory] = useState<Array<{
    id: string;
    topic: string;
    level: string;
    date: string;
    wordsLearned: number;
    article_data?: any;
    study_data?: any;
  }>>([]);

  // Load learning history from Supabase (logged in) or localStorage (not logged in)
  useEffect(() => {
    const loadHistory = async () => {
      if (user?.id) {
        // Logged in: load from Supabase
        const history = await fetchLearningHistory(user.id);
        setLearningHistory(history.map(h => ({
          id: h.id,
          topic: h.topic,
          level: h.level,
          date: h.date,
          wordsLearned: h.words_learned,
          article_data: h.article_data,
          study_data: h.study_data
        })));
      } else {
        // Not logged in: load from localStorage cache
        const localHistory = getLocalLearningHistory();
        setLearningHistory(localHistory);
      }
    };
    loadHistory();
  }, [user]);

  // Loading States
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [isGeneratingStudy, setIsGeneratingStudy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loadingStage, setLoadingStage] = useState<'article' | 'study' | null>(null);

  const handleGenerate = async (selectedTopic?: string) => {
    const topicToUse = selectedTopic || topic;
    if (!topicToUse.trim()) return;

    if (selectedTopic) setTopic(selectedTopic);

    setIsGeneratingArticle(true);
    setLoadingStage('article');
    setError(null);
    try {
      // 1. Generate Articles
      const data = await generateArticles(topicToUse, contentType, targetLevel);
      setArticleData(data);

      // Select level (default B1 or index 0)
      const initialIndex = data.variations.length === 1 ? 0 : 2;
      setCurrentLevelIndex(initialIndex);

      // 2. Generate Study Pack immediately
      setLoadingStage('study');

      // Add a small delay for better UX (smooth transition)
      await new Promise(resolve => setTimeout(resolve, 500));

      const variation = data.variations[initialIndex];
      const studyPack = await generateStudyPack(variation.content, variation.level);
      setStudyData(studyPack);

      setView('dashboard');

      // 3. Save Data & History
      if (user?.id) {
        // Logged in: save to Supabase
        const newRecord = await addLearningRecord(
          user.id,
          topicToUse,
          variation.level,
          data,        // Save full Article Data
          studyPack    // Save full Study Data
        );
        if (newRecord) {
          saveArticleToCache(
            newRecord.id,
            data,
            studyPack,
            contentType,
            targetLevel
          );

          setLearningHistory(prev => {
            const filtered = prev.filter(item => item.topic !== topicToUse);
            return [{
              id: newRecord.id,
              topic: newRecord.topic,
              level: newRecord.level,
              date: newRecord.date,
              wordsLearned: newRecord.words_learned,
              article_data: data,
              study_data: studyPack
            }, ...filtered].slice(0, 10);
          });
        }
      } else {
        // Not logged in: save to localStorage
        const localId = `local_${Date.now()}`;
        saveArticleToCache(
          localId,
          data,
          studyPack, // Save with study data
          contentType,
          targetLevel
        );

        const localHistory = getLocalLearningHistory();
        setLearningHistory(localHistory);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate content. Please try again or check your API key.");
      console.error(e);
    } finally {
      setIsGeneratingArticle(false);
      setLoadingStage(null);
    }
  };

  // Restore a session from history (DB or Cache)
  const restoreSession = (record: any) => {
    // If record has full data (from Supabase), use it
    if (record.article_data && record.study_data) {
      setArticleData(record.article_data);
      setStudyData(record.study_data);
      setTopic(record.topic);
      if (record.article_data.variations && record.article_data.variations.length > 0) {
        // Try to find the level index that matches, or default to 0
        const levelIndex = record.article_data.variations.findIndex((v: any) => v.level === record.level);
        setCurrentLevelIndex(levelIndex >= 0 ? levelIndex : 0);
      }
      setView('dashboard');
      return;
    }

    // Fallback: Try cache for non-Supabase or old records
    const cached = getArticleFromCache(record.id);
    if (cached) {
      setArticleData(cached.articleData);
      setStudyData(cached.studyData);
      setTopic(cached.articleData.topic);
      setContentType(cached.contentType as ContentType);
      setTargetLevel(cached.targetLevel);
      const initialIndex = cached.articleData.variations.length === 1 ? 0 : 2;
      setCurrentLevelIndex(initialIndex);
      setView('dashboard');

      // If no studyData cached, regenerate it (legacy support)
      if (!cached.studyData) {
        const variation = cached.articleData.variations[initialIndex];
        generateStudyMaterial(variation.content, variation.level);
      }
    } else {
      // Last resort: Regenerate if we have topic (Simulate new generation)
      handleGenerate(record.topic);
    }
  };

  const generateStudyMaterial = async (text: string, level: string, excludeWords: string[] = []) => {
    setIsGeneratingStudy(true);
    setStudyData(null);

    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const [data] = await Promise.all([
        generateStudyPack(text, level, excludeWords),
        minLoadingTime
      ]);
      setStudyData(data);
    } catch (e) {
      console.error("Failed to generate study pack", e);
    } finally {
      setIsGeneratingStudy(false);
    }
  };

  useEffect(() => {
    if (view === 'dashboard' && articleData) {
      const variation = articleData.variations[currentLevelIndex];
      generateStudyMaterial(variation.content, variation.level);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevelIndex]);

  const handleLogin = () => {
    if (recommendations.length === 0) {
      // setShowOnboarding(true);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setView('home');
    setRecommendations([]);
  };

  const [recError, setRecError] = useState<string | null>(null);

  const handleOnboardingComplete = async (prefs: UserPreferences) => {
    console.log("Onboarding complete, prefs:", prefs);
    setShowOnboarding(false);
    setIsGeneratingRecs(true);
    setRecError(null);
    try {
      const recs = await recommendTopics(prefs);
      console.log("Recommendations received:", recs);
      if (recs && recs.length > 0) {
        setRecommendations(recs);
      } else {
        setRecError("No recommendations could be generated. Please try again.");
      }
    } catch (e) {
      console.error("Failed to get recommendations", e);
      setRecError("Failed to generate recommendations. Please try again.");
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  const CONTENT_TYPES: { id: ContentType; label: string; icon: any }[] = [
    { id: 'article', label: 'Article', icon: BookOpen },
    { id: 'speech', label: '3-Min Speech', icon: Microphone },
    { id: 'conversation', label: 'Conversation', icon: ChatCircle },
    { id: 'fairytale', label: 'Fairy Tale', icon: MagicWand },
  ];

  return (
    <>
      {!isAuthenticated ? (
        <PasswordProtection onAuthenticated={() => {
          sessionStorage.setItem('site_authenticated', 'true');
          setIsAuthenticated(true);
        }} />
      ) : (
        <div className="min-h-screen flex flex-col font-sans text-foreground bg-white">
          <Header
            view={view}
            setView={setView}
            isLoggedIn={isLoggedIn}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />

          {/* Main Content */}
          <main className="flex-grow flex flex-col">
            {view === 'home' ? (
              <>
                <div className="flex-grow flex flex-col items-center justify-center px-4 py-32">
                  <div className="max-w-3xl mx-auto text-center">

                    {/* Hero Section - Clean & Minimal */}
                    <h1 className="text-5xl md:text-7xl font-semibold text-slate-900 mb-10 tracking-tight leading-[1.1]">
                      English,<br />
                      <span className="text-indigo-500">Designed by You.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 mb-16 max-w-xl mx-auto leading-relaxed">
                      Create your own curriculum. Turn any interest into custom articles, flashcards, and quizzes instantly.
                    </p>

                    {/* Content Type Selector */}
                    <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-xl mx-auto">
                      {CONTENT_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setContentType(type.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${contentType === type.id
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                    `}
                        >
                          <type.icon size={16} weight={contentType === type.id ? "fill" : "regular"} />
                          {type.label}
                        </button>
                      ))}
                    </div>

                    {/* Level Selection */}
                    <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-xl mx-auto">
                      {['A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setTargetLevel(lvl)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${targetLevel === lvl
                              ? 'bg-slate-900 text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                      `}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>

                    {/* Search Input - Minimal Style */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-2 flex flex-col sm:flex-row items-center max-w-xl mx-auto shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
                      <input
                        type="text"
                        placeholder="Enter a topic to start..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        className="flex-grow w-full px-5 py-3 text-base bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-400 outline-none"
                      />
                      <button
                        onClick={() => handleGenerate()}
                        disabled={isGeneratingArticle || !topic}
                        className="w-full sm:w-auto sm:min-w-[140px] mt-2 sm:mt-0 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isGeneratingArticle ? (
                          <div className="flex items-center gap-2">
                            <Spinner className="animate-spin" size={20} weight="bold" />
                            <span>{loadingStage === 'study' ? "Creating Exercises..." : "Generating Article..."}</span>
                          </div>
                        ) : "Get Started"}
                      </button>
                    </div>

                    {/* Trending Topics Ticker */}
                    <TrendingTicker onSelectTopic={setTopic} />

                    {/* Recommendations Section */}
                    {(isGeneratingRecs || recommendations.length > 0 || recError) && (
                      <div className="mt-12">
                        <div className="flex items-center justify-center gap-2 mb-6">
                          <Sparkle size={18} weight="fill" className="text-indigo-500" />
                          <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wide">Recommended for You</h3>
                        </div>

                        {recError ? (
                          <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                            <p>{recError}</p>
                            <button
                              onClick={() => setShowOnboarding(true)}
                              className="mt-2 text-sm font-medium text-indigo-500 hover:text-indigo-600"
                            >
                              Try updating preferences
                            </button>
                          </div>
                        ) : isGeneratingRecs ? (
                          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-200">
                            <Spinner className="animate-spin text-indigo-500 mb-3" size={28} weight="bold" />
                            <p className="text-slate-500">Generating personalized topics...</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
                            {recommendations.map((rec, index) => (
                              <button
                                key={index}
                                onClick={() => handleGenerate(rec.topic)}
                                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group text-left"
                              >
                                <Lightbulb size={20} weight="fill" className="text-indigo-500 flex-shrink-0" />
                                <span className="font-medium text-slate-700 flex-grow text-sm">{rec.topic}</span>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {error && <p className="mt-6 text-red-500 font-medium">{error}</p>}



                    {/* How It Works Section */}
                    <div className="mt-24 max-w-4xl mx-auto">
                      <h2 className="text-center text-sm font-bold uppercase tracking-wide mb-2 animate-text-shimmer">How It Works</h2>
                      <p className="text-center text-2xl font-semibold text-slate-800 mb-10">Start learning in 3 simple steps</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                          { step: "01", title: "Choose a Topic", desc: "Enter any subject that interests you, from technology to travel.", tooltip: "관심있는 주제를 입력하세요" },
                          { step: "02", title: "Get Content", desc: "AI generates articles, vocabulary, and quizzes at your level.", tooltip: "AI가 맞춤형 콘텐츠를 생성합니다" },
                          { step: "03", title: "Practice & Learn", desc: "Interactive exercises help you master new words and grammar.", tooltip: "인터랙티브 연습으로 학습합니다" },
                        ].map((item, i) => (
                          <div key={i} className="text-center group relative cursor-pointer hover:-translate-y-2 transition-all duration-300">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-lg font-bold group-hover:bg-indigo-600 transition-colors">
                              {item.step}
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-slate-500 text-sm">{item.desc}</p>
                            {/* Custom Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-indigo-100 text-indigo-700 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              {item.tooltip}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features Section */}
                    <div className="mt-24 text-left max-w-4xl mx-auto">
                      <h2 className="text-center text-sm font-bold uppercase tracking-wide mb-2 animate-text-shimmer">Features</h2>
                      <p className="text-center text-2xl font-semibold text-slate-800 mb-10">Everything you need to master English</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { icon: <BookOpen size={24} weight="regular" className="text-indigo-500" />, title: "Adaptive Reading", desc: "Articles at CEFR levels A1-C1", tooltip: "레벨에 맞춘 맞춤형 아티클을 제공합니다" },
                          { icon: <Cards size={24} weight="regular" className="text-indigo-500" />, title: "Smart Flashcards", desc: "Context-aware vocabulary", tooltip: "문맥에 맞는 어휘를 학습합니다" },
                          { icon: <GraduationCap size={24} weight="regular" className="text-indigo-500" />, title: "Interactive Quizzes", desc: "Test your comprehension", tooltip: "독해력을 테스트합니다" },
                          { icon: <PuzzlePiece size={24} weight="regular" className="text-indigo-500" />, title: "Collocations", desc: "Natural word combinations", tooltip: "자연스러운 단어 조합을 학습합니다" },
                          { icon: <ChalkboardTeacher size={24} weight="regular" className="text-indigo-500" />, title: "Grammar Insights", desc: "Contextual explanations", tooltip: "문맥에 맞는 문법 설명을 제공합니다" },
                          { icon: <Translate size={24} weight="regular" className="text-indigo-500" />, title: "Instant Translation", desc: "Drag text for Korean meaning", tooltip: "텍스트를 드래그하면 한국어 뜻이 나옵니다" },
                        ].map((feature, i) => (
                          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group relative">
                            <div className="mb-4 bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                              {feature.icon}
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                            <p className="text-slate-500 text-sm">{feature.desc}</p>
                            {/* Custom Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-indigo-100 text-indigo-700 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              {feature.tooltip}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Testimonials Section */}
                    <div className="mt-24 max-w-6xl mx-auto overflow-hidden">
                      <h2 className="text-center text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">Testimonials</h2>
                      <p className="text-center text-2xl font-semibold text-slate-800 mb-10">What learners are saying</p>

                      {/* Infinite Scroll Carousel */}
                      <div className="relative">
                        <div className="flex animate-scroll gap-6">
                          {/* First set of testimonials */}
                          {[
                            { quote: "Finally, an app that creates content I actually want to read!", name: "Minji K.", level: "Intermediate Learner" },
                            { quote: "The vocabulary flashcards are so much better than random word lists.", name: "David P.", level: "Advanced Learner" },
                            { quote: "I love how I can learn about K-pop while improving my English!", name: "Soyeon L.", level: "Beginner" },
                            { quote: "AI가 만들어주는 맞춤형 콘텐츠가 정말 좋아요!", name: "Jihoon P.", level: "Intermediate Learner" },
                            { quote: "Grammar explanations are so clear and helpful.", name: "Emily C.", level: "Advanced Learner" },
                            { quote: "Best English learning app I've ever used!", name: "Taehyung K.", level: "Beginner" },
                          ].map((testimonial, i) => (
                            <div key={i} className="flex-shrink-0 w-80 bg-slate-50 p-6 rounded-2xl hover:bg-indigo-50 transition-colors">
                              <p className="text-slate-700 mb-4 italic">"{testimonial.quote}"</p>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">{testimonial.name}</p>
                                <p className="text-slate-400 text-xs">{testimonial.level}</p>
                              </div>
                            </div>
                          ))}
                          {/* Duplicate for seamless loop */}
                          {[
                            { quote: "Finally, an app that creates content I actually want to read!", name: "Minji K.", level: "Intermediate Learner" },
                            { quote: "The vocabulary flashcards are so much better than random word lists.", name: "David P.", level: "Advanced Learner" },
                            { quote: "I love how I can learn about K-pop while improving my English!", name: "Soyeon L.", level: "Beginner" },
                            { quote: "AI가 만들어주는 맞춤형 콘텐츠가 정말 좋아요!", name: "Jihoon P.", level: "Intermediate Learner" },
                            { quote: "Grammar explanations are so clear and helpful.", name: "Emily C.", level: "Advanced Learner" },
                            { quote: "Best English learning app I've ever used!", name: "Taehyung K.", level: "Beginner" },
                          ].map((testimonial, i) => (
                            <div key={`dup-${i}`} className="flex-shrink-0 w-80 bg-slate-50 p-6 rounded-2xl hover:bg-indigo-50 transition-colors">
                              <p className="text-slate-700 mb-4 italic">"{testimonial.quote}"</p>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm">{testimonial.name}</p>
                                <p className="text-slate-400 text-xs">{testimonial.level}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-24 mb-12 text-center">
                      <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-4">Ready to start learning?</h2>
                      <p className="text-slate-500 mb-6">Enter a topic above and see the magic happen.</p>
                      <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-all inline-flex items-center gap-2"
                      >
                        Get Started Free
                        <ArrowRight size={18} />
                      </button>
                    </div>

                  </div>
                </div>
                <Footer />
              </>
            ) : view === 'learner' ? (
              <>
                <LearnerDashboard
                  onSelectTopic={(topic) => {
                    setTopic(topic);
                    handleGenerate(topic);
                  }}
                  onRestoreSession={restoreSession}
                  setView={setView}
                  learningHistory={learningHistory}
                />
                <Footer />
              </>
            ) : (
              <div className="flex flex-col md:flex-row h-[calc(100vh-5rem)] overflow-hidden bg-slate-50">
                {/* Sidebar Navigation (Desktop) */}
                <aside className="hidden md:flex flex-col w-60 bg-white border-r border-slate-200 p-5 shrink-0">
                  <div className="mb-6">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Learning Mode</p>
                    <nav className="space-y-1">
                      {[
                        { id: 'read', label: 'Article', icon: BookOpen },
                        { id: 'vocab', label: 'Vocabulary', icon: Cards },
                        { id: 'collocation', label: 'Collocations', icon: PuzzlePiece },
                        { id: 'grammar', label: 'Grammar', icon: ChalkboardTeacher },
                        { id: 'quiz', label: 'Quiz', icon: GraduationCap },
                        { id: 'discuss', label: 'Discussion', icon: ChatCircle },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id as TabView)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${activeTab === item.id
                              ? 'bg-indigo-500 text-white'
                              : 'text-slate-600 hover:bg-slate-100'}
                      `}
                        >
                          <item.icon size={18} weight={activeTab === item.id ? "fill" : "regular"} />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="mt-auto pt-5 border-t border-slate-200">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Current Topic</p>
                      <p className="font-medium text-slate-700 text-sm line-clamp-2">{articleData?.topic}</p>
                    </div>
                  </div>
                </aside>

                {/* Mobile Nav Tabs */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around p-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  {[
                    { id: 'read', icon: BookOpen },
                    { id: 'vocab', icon: Cards },
                    { id: 'collocation', icon: PuzzlePiece },
                    { id: 'grammar', icon: ChalkboardTeacher },
                    { id: 'quiz', icon: GraduationCap },
                    { id: 'discuss', icon: ChatCircle },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as TabView)}
                      className={`p-3 rounded-xl transition-all ${activeTab === item.id ? 'text-white bg-indigo-500 shadow-md transform scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      <item.icon size={24} weight={activeTab === item.id ? "fill" : "regular"} />
                    </button>
                  ))}
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto bg-slate-50 p-4 md:p-10 pb-24 md:pb-10 w-full">
                  {/* Topic-based Article View */}
                  {articleData && (
                    <div className="max-w-4xl mx-auto">
                      {/* PDF Download Button - Disabled
                  <div className="flex justify-end mb-4">
                    <PDFDownloadButton
                      targetId={activeTab === 'read' ? "article-content" : "pdf-export-container"}
                      filename={activeTab === 'read'
                        ? `Lingoleap - Article - ${articleData.topic}`
                        : `Lingoleap - Study Pack - ${articleData.topic}`}
                    />
                  </div>
                  */}

                      {/* Hidden Printable View for Study Pack - Disabled
                  {studyData && (
                    <div
                      id="pdf-export-container"
                      className="absolute top-0 -left-[9999px] w-[794px] min-h-[1123px] bg-white text-black p-10"
                    >
                      <PDFExportView studyData={studyData} topic={articleData.topic} />
                    </div>
                  )}
                  */}

                      {activeTab === 'read' && (
                        <>
                          <WordLookup>
                            <div id="article-content" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif' }}>
                              <ArticleView
                                articles={articleData.variations}
                                currentLevelIndex={currentLevelIndex}
                                onLevelChange={setCurrentLevelIndex}
                              />

                              {/* Translation Section */}
                              <div className="mt-8 border-t border-slate-200 pt-8">
                                <TranslationSection text={articleData.variations[currentLevelIndex].content} />
                              </div>
                            </div>
                          </WordLookup>
                        </>
                      )}

                      {/* Study Sections Wrapper */}
                      {activeTab !== 'read' && (
                        <div>
                          {isGeneratingStudy ? (
                            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-slate-200">
                              <div className="flex flex-col items-center">
                                <div className="mb-6">
                                  <Spinner className="animate-spin text-indigo-500" size={36} weight="bold" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                  Crafting Your Lesson
                                </h3>
                                <p className="text-slate-500 text-sm">
                                  Generating content for <span className="font-medium">Level {articleData.variations[currentLevelIndex].level}</span>
                                </p>
                              </div>
                            </div>
                          ) : studyData ? (
                            <>
                              {activeTab === 'vocab' && (
                                <VocabPractice
                                  vocabulary={studyData.vocabulary}
                                  onRegenerate={() => {
                                    if (articleData) {
                                      const variation = articleData.variations[currentLevelIndex];
                                      const currentWords = studyData.vocabulary.map(v => v.word);
                                      generateStudyMaterial(variation.content, variation.level, currentWords);
                                    }
                                  }}
                                />
                              )}
                              {activeTab === 'collocation' && <CollocationPractice collocations={studyData.collocations} />}
                              {activeTab === 'grammar' && <GrammarPractice grammarPoints={studyData.grammar} />}
                              {activeTab === 'quiz' && <QuizSection mcqs={studyData.mcq} clozes={studyData.cloze} />}
                              {activeTab === 'discuss' && <DiscussionSection items={studyData.discussion} />}
                            </>
                          ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                              <p className="text-slate-500">Something went wrong loading the study data.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>

          <OnboardingModal
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
            onComplete={handleOnboardingComplete}
          />
        </div>
      )}
    </>
  );
};

const TranslationSection: React.FC<{ text: string }> = ({ text }) => {
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const result = await translateText(text);
      setTranslation(result);
    } catch (error) {
      console.error("Translation failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      {!translation && !loading && (
        <button
          onClick={handleTranslate}
          className="w-full py-3 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-xl transition-colors border border-slate-200"
        >
          <Translate size={20} weight="duotone" />
          Translate Article to Korean
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
          <Spinner size={28} className="animate-spin text-indigo-500 mb-3" />
          <p className="font-medium text-sm">Translating article...</p>
        </div>
      )}

      {translation && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4 text-indigo-600 font-semibold">
            <Translate size={22} weight="duotone" />
            <h3>Korean Translation</h3>
          </div>
          <div className="prose prose-slate max-w-none leading-relaxed text-slate-700 whitespace-pre-wrap text-sm">
            {translation}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

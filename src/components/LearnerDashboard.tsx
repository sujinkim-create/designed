import React from 'react';
import {
    BookOpen,
    Trophy,
    Target,
    TrendUp,
    Calendar,
    Clock,
    ArrowRight,
    Sparkle,
    Brain,
    Fire
} from '@phosphor-icons/react';

interface LearningRecord {
    id: string;
    topic: string;
    level: string;
    date: string;
    wordsLearned: number;
    article_data?: any;
    study_data?: any;
}

interface LearnerDashboardProps {
    onSelectTopic: (topic: string) => void;
    onRestoreSession: (record: any) => void;
    setView: (view: 'home' | 'dashboard' | 'learner') => void;
    learningHistory: LearningRecord[];
}

const LearnerDashboard: React.FC<LearnerDashboardProps> = ({ onSelectTopic, onRestoreSession, setView, learningHistory }) => {
    // 통계 데이터 (학습 기록 기반으로 계산)
    const stats = {
        totalWordsLearned: learningHistory.reduce((sum, item) => sum + item.wordsLearned, 0) || 0,
        streakDays: learningHistory.length > 0 ? Math.min(learningHistory.length, 7) : 0,
        totalQuizzes: learningHistory.length,
        totalTopics: learningHistory.length,
        weeklyGoalProgress: Math.min(learningHistory.length * 15, 100),
    };

    // Use actual learning history or show empty state
    const recentLearning = learningHistory;

    const levelProgress = [
        { level: 'A1', progress: 100, label: 'Beginner' },
        { level: 'A2', progress: 85, label: 'Elementary' },
        { level: 'B1', progress: 60, label: 'Intermediate' },
        { level: 'B2', progress: 35, label: 'Upper Intermediate' },
        { level: 'C1', progress: 15, label: 'Advanced' },
    ];

    const handleContinueLearning = (record: any) => {
        onRestoreSession(record);
    };

    return (
        <div className="min-h-screen py-4 md:py-8 px-3 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">My Learning</h1>
                    <p className="text-sm md:text-base text-slate-500">Track your progress and continue where you left off</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-4 md:p-5 hover:border-indigo-300 hover:shadow-2xl transition-all">
                        <div className="flex items-center gap-3 mb-2 md:mb-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <BookOpen size={16} weight="fill" className="text-indigo-500 md:w-5 md:h-5" />
                            </div>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-slate-900">{stats.totalWordsLearned}</p>
                        <p className="text-xs md:text-sm text-slate-500">Words Learned</p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-4 md:p-5 hover:border-orange-300 hover:shadow-2xl transition-all">
                        <div className="flex items-center gap-3 mb-2 md:mb-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                <Fire size={16} weight="fill" className="text-orange-500 md:w-5 md:h-5" />
                            </div>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-slate-900">{stats.streakDays} days</p>
                        <p className="text-xs md:text-sm text-slate-500">Streak</p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-4 md:p-5 hover:border-green-300 hover:shadow-2xl transition-all">
                        <div className="flex items-center gap-3 mb-2 md:mb-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <Trophy size={16} weight="fill" className="text-green-500 md:w-5 md:h-5" />
                            </div>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-slate-900">{stats.totalQuizzes}</p>
                        <p className="text-xs md:text-sm text-slate-500">Quizzes</p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-4 md:p-5 hover:border-purple-300 hover:shadow-2xl transition-all">
                        <div className="flex items-center gap-3 mb-2 md:mb-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Brain size={16} weight="fill" className="text-purple-500 md:w-5 md:h-5" />
                            </div>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-slate-900">{stats.totalTopics}</p>
                        <p className="text-xs md:text-sm text-slate-500">Topics</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Weekly Goal */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6 border border-white/40">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Target size={20} weight="fill" className="text-indigo-500" />
                                <h2 className="font-semibold text-slate-900">Weekly Goal</h2>
                            </div>
                            <span className="text-sm text-slate-500">{stats.weeklyGoalProgress}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden mb-3">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${stats.weeklyGoalProgress}%` }}
                            />
                        </div>
                        <p className="text-sm text-slate-500">
                            Learn 20 new words to complete your weekly goal!
                        </p>
                    </div>

                    {/* Level Progress */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6 border border-white/40">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendUp size={20} weight="fill" className="text-indigo-500" />
                            <h2 className="font-semibold text-slate-900">Level Progress</h2>
                        </div>
                        <div className="space-y-3">
                            {levelProgress.map((item) => (
                                <div key={item.level} className="flex items-center gap-3">
                                    <span className="w-8 text-xs font-bold text-slate-600">{item.level}</span>
                                    <div className="flex-grow h-2 bg-white/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-400 w-8">{item.progress}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Learning */}
                <div className="mt-6 glass-card rounded-2xl p-6 border border-white/40">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Clock size={20} weight="fill" className="text-indigo-500" />
                            <h2 className="font-semibold text-slate-900">Recent Learning</h2>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {recentLearning.length > 0 ? (
                            recentLearning.map((record) => (
                                <div
                                    key={record.id}
                                    className="flex items-center justify-between p-4 bg-white/40 hover:bg-white/60 rounded-xl transition-colors group cursor-pointer"
                                    onClick={() => handleContinueLearning(record)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center border border-white/40 group-hover:border-indigo-300 transition-colors">
                                            <span className="text-xs font-bold text-indigo-500">{record.level}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">{record.topic}</h3>
                                            <p className="text-xs text-slate-400 flex items-center gap-2">
                                                <Calendar size={12} />
                                                {record.date}
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No learning history yet</p>
                                <p className="text-sm mt-1">Start learning to see your progress here!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Start New Topic CTA */}
                <div className="mt-6 glass rounded-2xl p-6 text-slate-800 text-center border-l-4 border-indigo-500">
                    <Sparkle size={28} weight="fill" className="mx-auto mb-3 opacity-90" />
                    <h3 className="text-xl font-semibold mb-2">Ready to learn something new?</h3>
                    <p className="text-slate-600 font-medium mb-4">Explore a new topic and expand your vocabulary</p>
                    <button
                        onClick={() => setView('home')}
                        className="px-6 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-colors inline-flex items-center gap-2"
                    >
                        Start New Topic
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LearnerDashboard;

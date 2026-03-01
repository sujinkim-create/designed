import React, { useRef } from 'react';
import { CaretRight, ChartBar, HardDrives, Dna, MusicNotes, Robot, VideoCamera, ArrowUp } from '@phosphor-icons/react';

interface TrendItem {
    id: number;
    rank: number;
    title: string;
    description: string;
    category: string;
    likes: number;
    icon: React.ElementType;
    iconColor: string;
    bgColor: string; // for the icon container
}

const TREND_DATA: TrendItem[] = [
    {
        id: 1,
        rank: 1,
        title: "Series Graph",
        description: "모든 시리즈와 영화의 실제 평점을 한눈에 확인하세요",
        category: "엔터테인먼트",
        likes: 378,
        icon: ChartBar,
        iconColor: "text-slate-900",
        bgColor: "bg-lime-400"
    },
    {
        id: 2,
        rank: 2,
        title: "MultiDrive",
        description: "무료 디스크 복제, 백업 및 삭제 소프트웨어",
        category: "앱",
        likes: 403,
        icon: HardDrives,
        iconColor: "text-blue-400",
        bgColor: "bg-slate-800"
    },
    {
        id: 3,
        rank: 3,
        title: "Genetics & Genomics",
        description: "생물의학 연구를 위한 AI 공동 연구원",
        category: "생산성",
        likes: 372,
        icon: Dna,
        iconColor: "text-emerald-500",
        bgColor: "bg-emerald-100" // using icon color for tint if needed, or custom
    },
    {
        id: 4,
        rank: 4,
        title: "ACE Studio 2.0",
        description: "올인원 AI 음악 캔버스",
        category: "AI",
        likes: 364,
        icon: MusicNotes,
        iconColor: "text-white",
        bgColor: "bg-black"
    },
    {
        id: 5,
        rank: 5,
        title: "Strater AI",
        description: "어떤 영상, PDF, 웹페이지도 AI 튜터로 변환하세요",
        category: "생산성",
        likes: 267,
        icon: Robot,
        iconColor: "text-red-500",
        bgColor: "bg-white"
    },
    {
        id: 6,
        rank: 6,
        title: "Video Magic",
        description: "텍스트로 비디오를 생성하는 차세대 AI",
        category: "비디오",
        likes: 210,
        icon: VideoCamera,
        iconColor: "text-purple-500",
        bgColor: "bg-purple-100"
    }
];

interface WeeklyTrendProps {
    onSelectTopic: (topic: string) => void;
}

const WeeklyTrend: React.FC<WeeklyTrendProps> = ({ onSelectTopic }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className="w-full bg-[#0f1117] rounded-3xl p-6 md:p-8 text-white overflow-hidden shadow-2xl border border-slate-800">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                            금주의 트렌딩
                        </h2>
                    </div>
                    <p className="text-slate-400 text-xs md:text-sm pl-8">
                        이번 주 인기 제품 TOP 10
                    </p>
                </div>
                <button
                    className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium flex items-center gap-1"
                    onClick={() => { }} // Placeholder for 'View All'
                >
                    전체 보기
                    <CaretRight size={12} weight="bold" />
                </button>
            </div>

            {/* Carousel Container */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 snap-x scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {TREND_DATA.map((item, index) => (
                    <div
                        key={item.id}
                        onClick={() => onSelectTopic(item.title)}
                        className="flex-shrink-0 w-64 md:w-72 bg-[#161b22] rounded-2xl p-4 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group snap-start flex flex-col relative"
                    >
                        {/* Rank Badge */}
                        <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold shadow-lg z-10">
                            {item.rank}
                        </div>

                        {/* Card Hero / Icon Area */}
                        <div className={`w-full aspect-video rounded-xl mb-4 ${item.bgColor} relative overflow-hidden flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-300`}>
                            {/* Fallback visual if no specific image */}
                            {index === 0 ? (
                                // Special styling for first item to match reference "Series Graph" bright yellow
                                <div className="w-full h-full bg-lime-400 flex items-center justify-center text-slate-900">
                                    <ChartBar size={48} weight="fill" />
                                    <span className="ml-2 font-bold text-xl">Series Graph</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <item.icon size={48} weight="duotone" className={item.iconColor} />
                                    <span className={`mt-2 font-bold ${item.id === 4 ? 'text-white' : 'text-slate-700'}`}>{item.title}</span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-grow flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                {/* Icon mini */}
                                <div className={`p-1.5 rounded-lg ${index === 0 ? 'bg-lime-400 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                                    <item.icon size={16} weight="fill" />
                                </div>
                                <h3 className="font-bold text-slate-100 text-lg leading-tight line-clamp-1">{item.title}</h3>
                            </div>

                            <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2 h-8">
                                {item.description}
                            </p>

                            {/* Footer */}
                            <div className="mt-auto flex items-center justify-between border-t border-slate-800 pt-3">
                                <span className="text-[10px] px-2 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                                    {item.category}
                                </span>

                                <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
                                    <ArrowUp size={12} weight="bold" />
                                    {item.likes}
                                </div>
                            </div>
                        </div>

                        {/* Hover overlay hint */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-slate-500/50 pointer-events-none transition-colors" />
                    </div>
                ))}

                {/* 'More' Card */}
                <div className="flex-shrink-0 w-32 flex items-center justify-center bg-[#161b22] rounded-2xl border border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors snap-start">
                    <div className="flex flex-col items-center text-slate-400 gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                            <CaretRight size={20} />
                        </div>
                        <span className="text-xs font-medium">더 보기</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyTrend;

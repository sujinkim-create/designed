import React from 'react';
import { Fire } from '@phosphor-icons/react';

interface TrendingTickerProps {
    onSelectTopic: (topic: string) => void;
}

const TRENDING_TOPICS_ROW1 = [
    { topic: "AI & ChatGPT", image: "https://images.unsplash.com/photo-1677442135136-760c813028c0?w=100&h=100&fit=crop" },
    { topic: "Climate Change", image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=100&h=100&fit=crop" },
    { topic: "K-pop & BTS", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop" },
    { topic: "Space Exploration", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=100&h=100&fit=crop" },
    { topic: "Mental Health", image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=100&h=100&fit=crop" },
    { topic: "Healthy Lifestyle", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop" },
    { topic: "Electric Vehicles", image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=100&h=100&fit=crop" },
    { topic: "Social Media", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop" },
];

const TRENDING_TOPICS_ROW2 = [
    { topic: "Travel Tips", image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100&h=100&fit=crop" },
    { topic: "Cryptocurrency", image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=100&h=100&fit=crop" },
    { topic: "Remote Work", image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=100&h=100&fit=crop" },
    { topic: "Sustainable Living", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&h=100&fit=crop" },
    { topic: "Fashion Trends", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=100&h=100&fit=crop" },
    { topic: "Gaming & Esports", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&h=100&fit=crop" },
    { topic: "Movies & Netflix", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&h=100&fit=crop" },
    { topic: "Food & Cooking", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop" },
];

const TrendingTicker: React.FC<TrendingTickerProps> = ({ onSelectTopic }) => {
    // Double the items for seamless loop
    const row1Items = [...TRENDING_TOPICS_ROW1, ...TRENDING_TOPICS_ROW1];
    const row2Items = [...TRENDING_TOPICS_ROW2, ...TRENDING_TOPICS_ROW2];

    return (
        <div className="w-full mt-16 mb-12 relative">
            {/* Background Atmosphere - A glowing mesh behind the ticker */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10 blur-3xl rounded-full transform -skew-y-2 pointer-events-none" />

            {/* Content Container */}
            <div className="relative overflow-hidden py-6">
                {/* Section Header */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Fire size={20} weight="fill" className="text-indigo-600 animate-pulse" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                        Trending Now
                    </span>
                </div>

                {/* Glass Ticker Wrapper */}
                <div className="relative space-y-3">
                    {/* Side Fades for smooth entry/exit */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none" />

                    {/* Row 1 - Scrolling Left */}
                    <div className="flex animate-ticker gap-3 hover:pause">
                        {row1Items.map((item, index) => (
                            <button
                                key={`row1-${item.topic}-${index}`}
                                onClick={() => onSelectTopic(item.topic)}
                                className="group relative flex-shrink-0 px-5 py-2.5 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_8px_32px_rgba(31,38,135,0.07)] transition-all duration-300 group-hover:shadow-[0_8px_32px_rgba(99,102,241,0.2)] group-hover:border-indigo-200" />
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
                                <span className="relative z-10 text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors whitespace-nowrap flex items-center gap-2">
                                    <img src={item.image} alt={item.topic} className="w-7 h-7 rounded-lg object-cover" />
                                    {item.topic}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Row 2 - Scrolling Right */}
                    <div className="flex animate-ticker-reverse gap-3 hover:pause">
                        {row2Items.map((item, index) => (
                            <button
                                key={`row2-${item.topic}-${index}`}
                                onClick={() => onSelectTopic(item.topic)}
                                className="group relative flex-shrink-0 px-5 py-2.5 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl shadow-[0_8px_32px_rgba(31,38,135,0.07)] transition-all duration-300 group-hover:shadow-[0_8px_32px_rgba(99,102,241,0.2)] group-hover:border-indigo-200" />
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
                                <span className="relative z-10 text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors whitespace-nowrap flex items-center gap-2">
                                    <img src={item.image} alt={item.topic} className="w-7 h-7 rounded-lg object-cover" />
                                    {item.topic}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendingTicker;

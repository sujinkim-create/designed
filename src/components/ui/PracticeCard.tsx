import React from 'react';

interface PracticeCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const PracticeCard: React.FC<PracticeCardProps> = ({ children, className = '', onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden ${onClick ? 'cursor-pointer transition-transform hover:-translate-y-1' : ''} ${className}`}
        >
            {children}
        </div>
    );
};

export default PracticeCard;

import React from 'react';

interface LessonLayoutProps {
    children: React.ReactNode;
    className?: string;
}

const LessonLayout: React.FC<LessonLayoutProps> = ({ children, className = '' }) => {
    return (
        <div className={`min-h-full w-full bg-[#f8f7ff] py-8 px-4 md:px-8 ${className}`}>
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </div>
    );
};

export default LessonLayout;

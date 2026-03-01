import React from 'react';

interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    action?: React.ReactNode;
    iconWrapperClassName?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, subtitle, action, iconWrapperClassName }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl shadow-sm border border-slate-100 ${iconWrapperClassName || 'bg-white text-indigo-500'}`}>
                    {icon}
                </div>
                <div>
                    <h2 className="text-2xl md:text-[28px] font-bold text-slate-900 leading-tight">{title}</h2>
                    <p className="text-base text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
                </div>
            </div>
            {action && (
                <div className="flex-shrink-0">
                    {action}
                </div>
            )}
        </div>
    );
};

export default SectionHeader;

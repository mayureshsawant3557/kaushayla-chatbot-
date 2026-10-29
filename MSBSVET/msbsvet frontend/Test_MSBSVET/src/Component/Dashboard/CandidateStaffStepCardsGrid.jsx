import React from 'react';
import { Lock, CircleCheckBigIcon } from 'lucide-react';

// Rotating palette for the bottom label strip — same pastel feel as the
// Institute dashboard cards. Colors cycle by card index, independent of
// completion status.
const COLOR_PALETTE = [
    '#fdeeb4', // yellow
    '#c9dcf5', // blue
    '#f8d2d2', // pink
    '#e2e2e2', // gray
    '#c9dcf5', // blue
    '#f8d2d2', // pink
    '#d4ede4', // green
    '#f5e0c9', // orange/tan
    '#dcd4f0', // purple
    '#c9e8dc', // teal
    '#f0d4e0', // rose
    '#dce8c9', // lime
];

const CandidateStaffStepCardsGrid = ({ title, steps = [], onStepClick }) => {
    return (
        <div className="mb-8">
            {title && (
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg font-bold text-gray-700 tracking-wide uppercase border-l-4 border-blue-500 pl-3">
                        {title}
                    </h2>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {steps.map((step, idx) => (
                    <StepCard
                        key={`${step.pageCode}-${idx}`}
                        step={step}
                        bgColor={COLOR_PALETTE[idx % COLOR_PALETTE.length]}
                        onClick={() => onStepClick?.(step)}
                    />
                ))}
            </div>
        </div>
    );
};

const StepCard = ({ step, bgColor, onClick }) => {
    const { label, progress = 0, disabled = false } = step;
    const isCompleted = progress === 100;

    const cardClass = [
        'relative rounded-xl overflow-hidden',
        'shadow-sm border border-gray-200 bg-white',
        'transition-all duration-200',
        disabled
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
    ].join(' ');

    return (
        <div className={cardClass} onClick={onClick} title={label}>
            {disabled && (
                <div className="absolute top-2 right-2 z-10 text-gray-400">
                    <Lock size={14} />
                </div>
            )}

            {/* TOP: percentage badge, white background */}
            <div className="bg-white p-5 min-h-[110px] flex items-center justify-center">
                <div className={`text-4xl font-bold ${isCompleted ? 'text-green-600' : 'text-gray-800'}`}>
                    {/* {progress}% */}
                    <CircleCheckBigIcon size={40} className={isCompleted ? 'text-green-600' : 'text-gray-400'} />
                </div>
            </div>

            {/* BOTTOM: colored label strip, cycles through palette */}
            <div
                className="px-3 py-3 text-center border-t border-gray-200"
                style={{ backgroundColor: bgColor }}
            >
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {label}
                </p>
            </div>
        </div>
    );
};

export default CandidateStaffStepCardsGrid;
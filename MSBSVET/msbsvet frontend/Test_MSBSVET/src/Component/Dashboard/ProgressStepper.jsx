// components/dashboard/ProgressStepper.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';

const ProgressStep = ({ label, percentage, link, isLast }) => {
    const animatedCount = useAnimatedCounter(percentage, 5000);

    return (
        <div className="flex flex-col items-center">
            <div className="flex items-center">
                <div className="text-center mb-2">
                    <Link to={link} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        {label}
                    </Link>
                </div>
            </div>
            <div className="flex items-center">
                {!isLast && <div className="w-11 h-0.5 bg-gray-300"><span></span></div>}
                <Link
                    to={link}
                    className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 transition-colors"
                >
                    <span>{Math.floor(animatedCount)}</span>
                    <span className="text-sm">%</span>
                </Link>
                {!isLast && <div className="w-11 h-0.5 bg-gray-300"><span></span></div>}
            </div>
        </div>
    );
};

const ProgressStepper = ({ steps }) => {
    return (
        <div className="flex flex-row flex-wrap justify-center items-start gap-4 mb-6">
            {steps.map((step, index) => (
                <ProgressStep
                    key={step.key}
                    label={step.label}
                    percentage={step.percentage}
                    link={step.link}
                    isLast={index === steps.length - 1}
                />
            ))}
        </div>
    );
};

export default ProgressStepper;
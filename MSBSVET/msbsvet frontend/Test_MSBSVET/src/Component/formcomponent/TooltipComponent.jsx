import React, { useState, useRef, useEffect } from 'react';
import { FiInfo } from 'react-icons/fi';

const IconTooltip = ({
    message,
    position = 'right',
    width = 'w-80'
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [adjustedPosition, setAdjustedPosition] = useState(position);
    const tooltipRef = useRef(null);
    const iconRef = useRef(null);

    useEffect(() => {
        if (isVisible && tooltipRef.current && iconRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const padding = 20;

            let newPosition = position;

            if (position === 'right' && tooltipRect.right > window.innerWidth - padding) {
                newPosition = 'left';
            } else if (position === 'left' && tooltipRect.left < padding) {
                newPosition = 'right';
            } else if (position === 'top' && tooltipRect.top < padding) {
                newPosition = 'bottom';
            } else if (position === 'bottom' && tooltipRect.bottom > window.innerHeight - padding) {
                newPosition = 'top';
            }

            setAdjustedPosition(newPosition);
        }
    }, [isVisible, position]);

    const getPositionClasses = () => {
        switch (adjustedPosition) {
            case 'right':
                return 'left-6 top-1/2 -translate-y-1/2';
            case 'left':
                return 'right-6 top-1/2 -translate-y-1/2';
            case 'top':
                return 'bottom-6 left-1/2 -translate-x-1/2';
            case 'bottom':
                return 'top-6 left-1/2 -translate-x-1/2';
            default:
                return 'left-6 top-1/2 -translate-y-1/2';
        }
    };

    return (
        <div
            ref={iconRef}
            className="relative inline-block ml-1"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <FiInfo
                className="text-blue-500 cursor-help inline hover:text-blue-600 transition-colors"
                size={16}
            />
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={`absolute z-50 ${width} p-3 bg-gray-900 text-white text-xs rounded-lg shadow-2xl border border-gray-700 pointer-events-none transition-opacity duration-200 ${getPositionClasses()}`}
                    role="tooltip"
                >
                    {message}
                </div>
            )}
        </div>
    );
};

export default IconTooltip;

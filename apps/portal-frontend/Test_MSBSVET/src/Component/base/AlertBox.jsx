import { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import Button from './Button';

/**
 * Alert Component - A generalized alert/notification box
 * 
 * @param {boolean} show - Controls visibility
 * @param {function} onClose - Callback when alert is closed
 * @param {string} title - Alert title
 * @param {string} message - Alert message/content
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {boolean} autoClose - Auto close after duration
 * @param {number} duration - Auto close duration in ms (default: 3000)
 * @param {boolean} showCloseButton - Show close button (default: true)
 */
const AlertBox = ({
    show = false,
    onClose,
    title,
    message,
    type = 'info',
    autoClose = false,
    duration = 3000,
    showCloseButton = true,
    className = ''
}) => {
    const [isClosing, setIsClosing] = useState(false);
    const [progress, setProgress] = useState(100);

    // Auto close timer
    useEffect(() => {
        if (show && autoClose && duration > 0) {
            const startTime = Date.now();
            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
                setProgress(remaining);

                if (remaining === 0) {
                    clearInterval(interval);
                    handleClose();
                }
            }, 50);

            return () => clearInterval(interval);
        }
    }, [show, autoClose, duration]);

    // Reset state when shown
    useEffect(() => {
        if (show) {
            setIsClosing(false);
            setProgress(100);
        }
    }, [show]);

    // Prevent body scroll
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [show]);

    const handleClose = () => {
        if (isClosing) return;
        setIsClosing(true);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300);
    };

    // Handle Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && show) {
                handleClose();
            }
        };

        if (show) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => document.removeEventListener('keydown', handleEscape);
    }, [show]);

    if (!show && !isClosing) return null;

    // Icon and color based on type
    const config = {
        success: {
            icon: CheckCircle,
            bgGradient: 'from-emerald-500 to-teal-600',
            iconColor: 'text-emerald-600',
            borderColor: 'border-emerald-200',
            bgColor: 'bg-emerald-50',
            progressColor: 'bg-emerald-500'
        },
        error: {
            icon: AlertCircle,
            bgGradient: 'from-rose-500 to-pink-600',
            iconColor: 'text-rose-600',
            borderColor: 'border-rose-200',
            bgColor: 'bg-rose-50',
            progressColor: 'bg-rose-500'
        },
        warning: {
            icon: AlertTriangle,
            bgGradient: 'from-amber-500 to-orange-600',
            iconColor: 'text-amber-600',
            borderColor: 'border-amber-200',
            bgColor: 'bg-amber-50',
            progressColor: 'bg-amber-500'
        },
        info: {
            icon: Info,
            bgGradient: 'from-blue-500 to-indigo-600',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-200',
            bgColor: 'bg-blue-50',
            progressColor: 'bg-blue-500'
        }
    };

    const { icon: Icon, bgGradient, iconColor, borderColor, bgColor, progressColor } = config[type];

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-9998 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'
                    }`}
                onClick={handleClose}
            />

            {/* Alert Box */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-9999 pointer-events-none">
                <div
                    className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl pointer-events-auto transform transition-all duration-300 ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                        } ${className}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header with gradient */}
                    <div className={`relative h-2 rounded-t-2xl bg-linear-to-r ${bgGradient} overflow-hidden`}>
                        {autoClose && (
                            <div
                                className="absolute inset-0 bg-white/30 transition-all duration-100 ease-linear origin-left"
                                style={{ transform: `scaleX(${progress / 100})` }}
                            />
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`shrink-0 w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}>
                                <Icon className={`w-6 h-6 ${iconColor}`} />
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 min-w-0">
                                {title && (
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {title}
                                    </h3>
                                )}
                                {message && (
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {message}
                                    </p>
                                )}
                            </div>

                            {/* Close Button */}
                            {showCloseButton && (
                                <button
                                    onClick={handleClose}
                                    className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Action Button */}
                        {!autoClose && (
                            <div className="mt-6 flex justify-end">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleClose}
                                    className={`bg-linear-to-r ${bgGradient} hover:opacity-90`}
                                >
                                    Got it
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default AlertBox;

/*
 * Confirm Component - A generalized confirmation dialog

 * @param {boolean} show - Controls visibility
 * @param {function} onClose - Callback when dialog is closed without action
 * @param {function} onConfirm - Callback when Yes/Confirm button is clicked
 * @param {function} onCancel - Callback when No/Cancel button is clicked
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message/content
 * @param {string} type - 'success' | 'error' | 'warning' | 'info' | 'question'
 * @param {string} confirmText - Text for confirm button (default: 'Yes')
 * @param {string} cancelText - Text for cancel button (default: 'No')
 * @param {string} confirmVariant - Button variant for confirm button
 * @param {boolean} loading - Show loading state on confirm button
 * @param {boolean} danger - Make confirm button danger style
 * @param {string} size - Dialog size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 */

import { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, HelpCircle } from 'lucide-react';
import Button from './Button';

const ConfirmBox = ({
    show = false,
    onClose,
    onConfirm,
    onCancel,
    title,
    message,
    type = 'question',
    confirmText = 'Yes',
    cancelText = 'No',
    confirmVariant,
    loading = false,
    danger = false,
    size = 'md',
    className = ''
}) => {
    // ============================================================
    // STATE
    // ============================================================
    const [isClosing, setIsClosing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // ============================================================
    // EFFECTS
    // ============================================================

    // Handle show prop changes
    useEffect(() => {
        if (show) {
            setIsVisible(true);
            setIsClosing(false);
            setIsProcessing(false);
        } else if (isVisible) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setIsClosing(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [show, isVisible]);

    // Prevent body scroll
    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isVisible]);

    // Handle Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isVisible && !isProcessing) {
                handleCancel();
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isVisible, isProcessing]);

    // ============================================================
    // HANDLERS
    // ============================================================

    const handleClose = () => {
        if (isClosing || isProcessing) return;

        setIsClosing(true);
        setTimeout(() => {
            setIsVisible(false);
            setIsClosing(false);
            if (onClose) onClose();
        }, 500);
    };

    const handleConfirm = async () => {
        if (isProcessing) return;

        if (onConfirm) {
            setIsProcessing(true);
            try {
                await onConfirm();
                // After successful confirm, close the dialog
                handleClose();
            } catch (error) {
                setIsProcessing(false);
            }
        }
    };

    const handleCancel = () => {
        if (isProcessing) return;

        if (onCancel) {
            onCancel();
        } else {
            handleClose();
        }
    };

    // ============================================================
    // CONFIGURATION
    // ============================================================

    // Icon and color based on type
    const config = {
        success: {
            icon: CheckCircle,
            bgGradient: 'from-emerald-500 to-teal-600',
            iconColor: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            ringColor: 'ring-emerald-500/20'
        },
        error: {
            icon: AlertCircle,
            bgGradient: 'from-rose-500 to-pink-600',
            iconColor: 'text-rose-600',
            bgColor: 'bg-rose-50',
            ringColor: 'ring-rose-500/20'
        },
        warning: {
            icon: AlertTriangle,
            bgGradient: 'from-amber-500 to-orange-600',
            iconColor: 'text-amber-600',
            bgColor: 'bg-amber-50',
            ringColor: 'ring-amber-500/20'
        },
        info: {
            icon: Info,
            bgGradient: 'from-blue-500 to-indigo-600',
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            ringColor: 'ring-blue-500/20'
        },
        question: {
            icon: HelpCircle,
            bgGradient: 'from-violet-500 to-purple-600',
            iconColor: 'text-violet-600',
            bgColor: 'bg-violet-50',
            ringColor: 'ring-violet-500/20'
        }
    };

    const { icon: Icon, bgGradient, iconColor, bgColor, ringColor } = config[type];

    // Size configuration
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    // Determine confirm button style
    const getConfirmButtonClass = () => {
        if (confirmVariant) return '';
        if (danger) return 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white';
        return `bg-gradient-to-r ${bgGradient} hover:opacity-90 text-white`;
    };

    // ============================================================
    // RENDER
    // ============================================================

    if (!isVisible) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-9998 transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100'
                    }`}
                onClick={!isProcessing ? handleCancel : undefined}
            />

            {/* Confirm Dialog */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-9999 pointer-events-none">
                <div
                    className={`relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-2xl pointer-events-auto overflow-hidden ${isClosing ? 'animate-modalSlideOut' : 'animate-modalSlideIn'
                        } ${className}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={`flex items-center justify-between gap-3 px-3 py-2 md:py-2.5 bg-linear-to-r ${bgGradient}`}>
                        {/* Icon and Title */}
                        <div className="flex items-center gap-3">
                            <div className={`relative shrink-0`}>
                                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full ${bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${iconColor}`} />
                                </div>
                            </div>
                            {title && (
                                <h3 className=" text-base md:text-lg font-bold text-white">
                                    {title}
                                </h3>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className="shrink-0 text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-3 py-2 md:py-3 overflow-y-auto">
                        {/* Icon with animated ring (centered in body) */}
                        <div className="flex justify-center mb-4">
                            <div className={`relative`}>
                                <div className={`absolute inset-0 rounded-full ${bgColor} animate-ping opacity-75`} />
                                <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full ${bgColor} ring-4 ${ringColor} flex items-center justify-center`}>
                                    <Icon className={`w-7 h-7 md:w-8 md:h-8 ${iconColor}`} />
                                </div>
                            </div>
                        </div>

                        {/* Message */}
                        {message && (
                            <div className="text-center mb-4">
                                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 pb-4">
                        <div className="flex items-center justify-end gap-3">
                            <Button
                                variant="outline"
                                size="md"
                                onClick={handleCancel}
                                disabled={isProcessing}
                                className="text-base! md:text-lg! py-1! md:py-1.5! min-w-25 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                {cancelText}
                            </Button>
                            <Button
                                variant={confirmVariant || "primary"}
                                size="md"
                                onClick={handleConfirm}
                                loading={loading || isProcessing}
                                disabled={isProcessing}
                                className={`text-base! md:text-lg! py-1! md:py-1.5! min-w-25 ${getConfirmButtonClass()}`}
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes modalSlideOut {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-40px);
                    }
                }

                .animate-modalSlideIn {
                    animation: modalSlideIn 0.5s ease-out forwards;
                }

                .animate-modalSlideOut {
                    animation: modalSlideOut 0.5s ease-in forwards;
                }

                @keyframes ping {
                    75%, 100% {
                        transform: scale(1.1);
                        opacity: 0;
                    }
                }
                
                .animate-ping {
                    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
            `}</style>
        </>
    );
};

export default ConfirmBox;
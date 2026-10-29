import { useAuth } from "../../hooks/AuthProvider";
import { useEffect, useState } from "react";

const WARNING_TIME = Number(import.meta.env.VITE_WARNING_TIME) || 300000;

function SessionWarning() {
    const { showWarning, extendSession, logout } = useAuth();
    const [secondsLeft, setSecondsLeft] = useState(WARNING_TIME / 1000);

    useEffect(() => {
        if (!showWarning) return;

        setSecondsLeft(WARNING_TIME / 1000);

        const interval = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [showWarning]);

    if (!showWarning) return null;

    const totalSeconds = WARNING_TIME / 1000;
    const progress = (secondsLeft / totalSeconds) * 100;
    const circumference = 2 * Math.PI * 54; // radius = 54
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Format time as MM:SS
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = Math.floor(secondsLeft % 60);
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Determine color based on time left
    const getProgressColor = () => {
        if (secondsLeft > totalSeconds * 0.5) return '#10b981'; // green
        if (secondsLeft > totalSeconds * 0.25) return '#f59e0b'; // amber
        return '#ef4444'; // red
    };

    const getGlowColor = () => {
        if (secondsLeft > totalSeconds * 0.5) return 'rgba(16, 185, 129, 0.4)';
        if (secondsLeft > totalSeconds * 0.25) return 'rgba(245, 158, 11, 0.4)';
        return 'rgba(239, 68, 68, 0.4)';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-linear-to-r from-orange-500 to-red-500 p-2 md:p-3 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-7 md:w-10 h-7 md:h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-base md:text-xl font-bold">Session Expiring Soon</h3>
                    </div>
                </div>

                {/* Content */}
                <div className="p-2 md:p-5">
                    {/* Circular Progress */}
                    <div className="flex flex-col items-center mb-3 md:mb-5">
                        <div className="relative">
                            {/* Glow effect */}
                            <div
                                className="absolute inset-0 rounded-full blur-xl transition-all duration-500"
                                style={{
                                    backgroundColor: getGlowColor(),
                                    transform: 'scale(1.1)'
                                }}
                            />

                            {/* SVG Circle */}
                            <svg className="relative transform -rotate-90" width="140" height="140">
                                {/* Background circle */}
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="54"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="54"
                                    stroke={getProgressColor()}
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-linear"
                                    style={{
                                        filter: `drop-shadow(0 0 8px ${getProgressColor()})`
                                    }}
                                />
                            </svg>

                            {/* Timer in center */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div
                                    className="text-4xl font-bold transition-colors duration-500"
                                    style={{ color: getProgressColor() }}
                                >
                                    {formattedTime}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 font-medium">
                                    {secondsLeft <= 1 ? 'Expired' : 'remaining'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="text-center mb-3 md:mb-5">
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Your session is about to expire due to inactivity.
                            <br />
                            Would you like to continue?
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={logout}
                            className="flex-1 px-1 py-2 md:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            Logout
                        </button>

                        <button
                            onClick={extendSession}
                            className="flex-1 px-1 py-2 md:py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                        >
                            Stay Logged In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SessionWarning;
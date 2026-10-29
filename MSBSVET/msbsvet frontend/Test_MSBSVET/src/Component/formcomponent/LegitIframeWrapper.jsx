// IframeWrapper.jsx (Final version with CSP error handling)
import React, { useState, useEffect, useRef, useContext } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { ThemeContext } from "../Context/ThemeContext";

const IframeWrapper = ({
    title,
    src,
    eventName = 'lgtDocVerifierHeight',
    showLoading = true
}) => {
    const { color } = useContext(ThemeContext);
    const [iframeHeight, setIframeHeight] = useState('600px');
    const [isLoading, setIsLoading] = useState(true);
    const [showFallback, setShowFallback] = useState(false);
    const iframeRef = useRef(null);

    useEffect(() => {
        const handleMessage = (event) => {
            const receivedEventName = event.data[0];
            const data = event.data[1];

            if (receivedEventName === eventName) {
                setIframeHeight(`${data}px`);
                setIsLoading(false);
            }
        };

        window.addEventListener('message', handleMessage);

        // Check for CSP/iframe errors after 3 seconds
        const errorTimer = setTimeout(() => {
            if (isLoading) {
                setShowFallback(true);
                setIsLoading(false);
            }
        }, 3000);

        return () => {
            window.removeEventListener('message', handleMessage);
            clearTimeout(errorTimer);
        };
    }, [eventName, isLoading]);

    const handleIframeLoad = () => {
        setTimeout(() => setIsLoading(false), 1500);
    };

    return (
        <div className="relative w-full p-3 sm:p-4 md:p-6">
            <fieldset className="mb-6 rounded-sm border border-gray-300 bg-white p-4 shadow-lg">
                <legend className={`flex ${color} items-center text-base sm:text-lg font-semibold text-white border-2 border-gray-300 p-2 rounded-sm`}>
                    <FileText className="mr-2 text-white w-4 h-4 sm:w-5 sm:h-5" />
                    {title}
                </legend>
                <div className="col-md-12 ml-2 sm:ml-6 flex flex-col p-2">
                    <div className="w-full relative">
                        {/* Loading Indicator */}
                        {showLoading && isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-sm z-10 min-h-[400px]">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                    <p className="text-sm text-gray-600">Loading verification system...</p>
                                </div>
                            </div>
                        )}

                        {/* CSP Fallback Warning */}
                        {showFallback && (
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-sm">
                                <div className="flex items-start gap-3">
                                    <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-700 mb-3">
                                            <strong>Note:</strong> If the content doesn't load below, please click the button to open in a new window.
                                        </p>
                                        <a
                                            href={src}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`${color} inline-flex items-center gap-2 px-4 py-2 text-sm text-white rounded-sm hover:opacity-90 transition-opacity`}
                                        >
                                            Open in New Window
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Iframe */}
                        <div className="lgt-content w-full overflow-hidden rounded-sm border border-gray-200">
                            <iframe
                                ref={iframeRef}
                                id="lgtdoc_iframe"
                                src={src}
                                title={title}
                                onLoad={handleIframeLoad}
                                style={{
                                    width: '100%',
                                    height: iframeHeight,
                                    border: 'none',
                                    display: 'block',
                                    minHeight: '600px'
                                }}
                                scrolling="no"
                                frameBorder="0"
                            />
                        </div>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default IframeWrapper;

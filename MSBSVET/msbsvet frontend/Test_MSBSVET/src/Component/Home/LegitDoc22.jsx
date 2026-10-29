import React from 'react';
import { ArrowLeft } from 'lucide-react';
import IframeWrapper from '../formcomponent/LegitIframeWrapper';

const LegitDoc22 = ({ onBack }) => {
    return (
        <div>
            <div className="max-w-8xl mx-auto px-9 mt-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-3 px-4 py-2 rounded-full 
                   bg-gray-200 hover:bg-gray-300
                   text-black text-sm font-medium
                   transition-all duration-200 shadow-sm hover:shadow"
                >
                    <ArrowLeft className="h-6 w-6" />
                    Back to Certificate Selection
                </button>
            </div>
            <div className="lgt-content">
                <IframeWrapper
                    id="lgtdoc_iframe"
                    src="/legitdoc22/index.html"
                    title="Certificate Verification (2021-2022)"
                    eventName="lgtDocVerifierHeight"
                    width="100%"
                    frameBorder="0"
                    scrolling="no"
                />
            </div>
        </div>
    );
};

export default LegitDoc22;



/// components/dashboard/StepCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';
import VerifiedIcon from '../../assets/VerifiedIcon.jpg';
import NotVerifiedIcon from '../../assets/NotVerifiedIcon.jpg';
import pdf from '../../assets/pdf.png';

const StepCard = ({ label, percentage, color, link }) => {
    const animatedCount = useAnimatedCounter(percentage, 5000);
    const isComplete = percentage === 100;

    // Define display rules based on label
    //const getDisplayType = (label) => {
    //    // Count only (no image even at 100%)
    //    const countOnlyLabels = [
    //        'Registration Fee',
    //        'Institute Profile',
    //        'Proposed Courses',
    //        'Self-Declaration'
    //    ];

    //    // Verified icon only (no count)
    //    const verifiedOnlyLabels = [
    //        'Promoting Organization',
    //        'Promoters',
    //        'Registration Fee',
    //        'Institute Profile',
    //        'Proposed Courses',
    //        'Self-Declaration'
    //    ];

    //    // PDF icon only (for LOI/LOR documents)
    //    const pdfOnlyLabels = [
    //        'Application for LoI',
    //        'Letter of Intent (LoI)',
    //        'Letter of Rejection(LoR)'
    //    ];

    //    if (countOnlyLabels.includes(label)) {
    //        return 'count-only';
    //    } else if (verifiedOnlyLabels.includes(label)) {
    //        return 'verified-only';
    //    } else if (pdfOnlyLabels.includes(label)) {
    //        return 'pdf-only';
    //    } else {
    //        // Default: show both count and verified icon
    //        return 'both';
    //    }
    //};

    //const displayType = getDisplayType(label);

    // Render content based on display type
    //const renderContent = () => {
    //    switch (displayType) {
    //        case 'count-only':
    //            // Show only count, centered
    //            return (
    //                <h2 className="text-4xl font-bold text-gray-800">
    //                    {Math.floor(animatedCount)}%
    //                </h2>
    //            );

    //        case 'verified-only':
    //            // Show only verified icon when complete, centered
    //            return isComplete ? (
    //                <img
    //                    src={VerifiedIcon}
    //                    alt="Complete"
    //                    className="w-16 h-16"
    //                />
    //            ) : (
    //                <h2 className="text-4xl font-bold text-gray-800">
    //                    {Math.floor(animatedCount)}%
    //                </h2>
    //            );

    //        case 'pdf-only':
    //            // Show only PDF icon, centered
    //            return (
    //                <img
    //                    src={pdf}
    //                    alt="PDF Document"
    //                    className="w-16 h-16"
    //                />
    //            );

    //        case 'both':
    //        default:
    //            // Show count + verified icon when 100%, centered
    //            return (
    //                <div className="flex items-center justify-center gap-2">
    //                    <h2 className="text-4xl font-bold text-gray-800">
    //                        {Math.floor(animatedCount)}%
    //                    </h2>
    //                    {isComplete && (
    //                        <img
    //                            src={VerifiedIcon}
    //                            alt="Complete"
    //                            className="w-10 h-10"
    //                        />
    //                    )}
    //                </div>
    //            );
    //    }
    //};


    // update render
    const renderContent = () => {

        const isRejected = percentage === 25;   
        const isVerified = percentage === 100;  
        const isApplicationLOI =
            label === 'Application for LoI' ||
            label === 'Letter of Intent (LoI)';


        
        if (isRejected) {
            return (
                <img
                    src={NotVerifiedIcon}
                    alt="Rejected"
                    className="w-16 h-16"
                />
            );
        }

       
        if (isApplicationLOI && isVerified) {
            return (
                <img
                    src={pdf}
                    alt="PDF Document"
                    className="w-16 h-16"
                />
            );
        }

        
        if (isVerified) {
            return (
                <img
                    src={VerifiedIcon}
                    alt="Verified"
                    className="w-16 h-16"
                />
            );
        }

        
        return (
            <h2 className="text-4xl font-bold text-gray-800">
                {Math.floor(animatedCount)}%
            </h2>
        );
    };
    //return (
    //    <div className="rounded-lg shadow-md border border-gray-300 overflow-hidden h-full">
    //        <Link to={link} className="block h-full flex flex-col">
    //            {/* White background content area - 50% height - centered */}
    //            <div className="bg-white h-1/2 flex items-center justify-center">
    //                {renderContent()}
    //            </div>

    //            {/* Colored background label - 50% height - centered */}
    //            <div className={`${color} h-1/2 flex items-center justify-center px-4`}>
    //                <h6 className="text-sm font-semibold text-center text-gray-800">
    //                    {label}
    //                </h6>
    //            </div>
    //        </Link>
    //    </div>
    //);

    return (
        <div
            className="
            rounded-lg
            border border-gray-300
            overflow-hidden
            h-full
            transform transition-all duration-300 ease-in-out
            hover:shadow-2xl
            hover:-translate-y-2
            hover:scale-105
            hover:border-blue-400
            active:scale-95
        "
        >
            <Link to={link} className="block h-full flex flex-col group">

                {/* White top section */}
                <div className="
                bg-white
                h-1/2
                flex items-center justify-center
                transition-all duration-300
                group-hover:bg-gray-50
            ">
                    {renderContent()}
                </div>

                {/* Colored bottom section */}
                <div className={`
                ${color}
                h-1/2
                flex items-center justify-center
                px-4
                transition-all duration-300
                group-hover:brightness-110
            `}>
                    <h6 className="
                    text-sm font-semibold
                    text-center text-gray-800
                    transition-all duration-300
                    group-hover:scale-105
                ">
                        {label}
                    </h6>
                </div>

            </Link>
        </div>
    );


};

export default StepCard;


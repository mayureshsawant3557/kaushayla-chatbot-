


import React from 'react';
import Verified from '../../assets/VerifiedIcon.jpg';
import Rejected from '../../assets/NotVerifiedIcon.jpg';
import Document from '../../assets/pdf.png';

const StepCardsGrid = ({ title, steps = [] }) => {

    const handleNavigate = (step) => {
        const { link, label, displayType } = step;

        if (!link) return;

        // Open Inspection Application popup when Request for Inspection is verified
        if (
            step.key === "InspectionRequest" &&
            displayType === "Document"
        ) {
            const query = link.includes("?")
                ? link.substring(link.indexOf("?"))
                : "";

            window.open(
                `/React/InspectionApplication${query}`,
                "InspectionApplication",
                "width=1000,height=750,left=150,top=50,resizable=yes,scrollbars=yes"
            );
            return;
        }
        if (link.includes("PrintLOIInstituteProfile.aspx")) {
            const query = link.includes("?")
                ? link.substring(link.indexOf("?"))
                : "";

            window.open(
                `/React/LOIApplicationPrintForm${query}`,
                "LOIApplication",
                "width=1000,height=700,top=50,left=100,resizable=yes,scrollbars=yes"
            );
            return;
        }

        if (link.includes("PrintLOI.aspx")) {
            const query = link.includes("?")
                ? link.substring(link.indexOf("?"))
                : "";

            window.open(
                `/React/PrintLOI${query}`,
                "PrintLOI",
                "width=1000,height=700,top=50,left=100,resizable=yes,scrollbars=yes"
            );
            return;
        }

        if (link.startsWith("http")) {
            window.open(link, "_blank");
        } else {
            window.location.href = link;
        }
    };

    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-700 tracking-wide uppercase border-l-4 border-blue-500 pl-3">
                    {title}
                </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {steps.map((step, idx) => (
                    <StepCard
                        key={`${step.key}-${idx}`}
                        step={step}
                        onNavigate={handleNavigate}
                    />
                ))}
            </div>
        </div>
    );
};

const StepCard = ({ step, onNavigate }) => {

    const {
        label,
        bgColorStyle,
        color,
        link,
        anchorTarget,
        percentage,
        verifyStatus,
        displayType,
    } = step;

    const isClickable = !!link;

    const cardClass = [
        'relative rounded-xl overflow-hidden',
        'shadow-sm border border-gray-200 bg-white',
        'transition-all duration-200',
        isClickable
            ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'
            : 'cursor-default',
        !bgColorStyle && color ? color : '',
    ].join(' ');

    return (
        <div
            className={cardClass}
            onClick={() => isClickable && onNavigate(step)}
            title={label}
        >

            {/* TOP SECTION */}
            <div className="bg-white p-5 min-h-[110px] flex items-center justify-center">
                <StatusBadge
                    percentage={percentage}
                    verifyStatus={verifyStatus}
                    displayType={displayType}
                />
            </div>

            {/* BOTTOM TITLE SECTION ONLY */}
            <div
                className="px-3 py-3 text-center border-t border-gray-200"
                style={{
                    backgroundColor: bgColorStyle || '#f3f4f6',
                }}
            >
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {label}
                </p>
            </div>
        </div>
    );
};

const StatusBadge = ({ percentage, verifyStatus, displayType }) => {
    // VERIFIED
    if (displayType === 'Verified') {

        return (
            <div className="flex flex-col items-center justify-center">
                <img
                    src={Verified}
                    alt="Verified"
                    className="w-14 h-14 object-contain"
                />
            </div>
        );
    }
    // Rejected 
    if (displayType === 'Rejected') {
        return (
            <div className="flex flex-col items-center justify-center">
                <img
                    src={Rejected}
                    alt="Rejected"
                    className="w-14 h-14 object-contain"
                />
            </div>
        );
    }

    // DOCUMENT
    if (displayType === 'Document') {
        return (
            <div className="flex flex-col items-center gap-1">
                <img
                    src={Document}
                    alt="Document"
                    className="w-12 h-12 object-contain"
                />

                <span className="text-xs font-semibold text-blue-600">
                    Document
                </span>
            </div>
        );
    }

    // DEFAULT PERCENTAGE
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-black">
                {percentage}
            </div>
        </div>
    );
};

export default StepCardsGrid;



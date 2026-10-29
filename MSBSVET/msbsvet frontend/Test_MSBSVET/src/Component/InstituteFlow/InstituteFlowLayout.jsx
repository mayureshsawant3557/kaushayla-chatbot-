import React from "react";
import { usePagePermission } from "../../Hooks/usePagePermission";
import { useInstituteFlow } from "../../Hooks/useInstituteFlow";

/**
 * InstituteFlowLayout provides common UI layout, headers, notice alerts,
 * and unified action buttons (Back, Save and Next / Next, Close) for all 15 inspection pages.
 */
const InstituteFlowLayout = ({
    children,
    currentPageCode,
    p1,
    p2,
    onSave,
    isSaveLoading = false,
    isLocked = false,
    title,
    color = "bg-blue-600",
    showFlowActions = true
}) => {
    const { isViewer, canSave } = usePagePermission();
    const { goNext, goBack, handleClose } = useInstituteFlow(currentPageCode, p1, p2);

    const handleSaveAndNext = async (e) => {
        if (e) e.preventDefault();

        // Viewer or users without save permission skip API save call and go directly to next page
        if (isViewer || !canSave || isLocked) {
            goNext();
            return;
        }

        if (onSave) {
            await onSave();
        }
    };

    return (
        <div className="p-6">
            {(isLocked || isViewer) && (
                <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 font-medium">
                    {isViewer
                        ? "View-Only Mode (Read Only)."
                        : "Editing is not allowed. Inspection is in progress or completed."}
                </div>
            )}

            {title ? (
                <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-1">
                    <legend
                        className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
                    >
                        {title}
                    </legend>
                    {children}
                </fieldset>
            ) : (
                children
            )}

            {/* Common Action Buttons Footer */}
            {showFlowActions && (
                <div className="flex justify-center gap-8 mt-8 pt-12 border-t-2 border-gray-300">
                    <button
                        type="button"
                        className="px-4 py-3 bg-cyan-500 text-white font-semibold rounded text-sm hover:bg-cyan-600 transition-colors"
                        onClick={goBack}
                    >
                        Back
                    </button>

                    {isViewer || !canSave ? (
                        <button
                            type="button"
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                            onClick={goNext}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-2 rounded font-semibold text-sm transition-colors disabled:opacity-50"
                            onClick={handleSaveAndNext}
                            disabled={isSaveLoading}
                        >
                            {isSaveLoading ? "Saving..." : isLocked ? "Next" : "Save and Next"}
                        </button>
                    )}

                    <button
                        type="button"
                        className="px-4 py-3 bg-gray-600 text-white font-semibold rounded text-sm hover:bg-gray-700 transition-colors"
                        onClick={handleClose}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default InstituteFlowLayout;

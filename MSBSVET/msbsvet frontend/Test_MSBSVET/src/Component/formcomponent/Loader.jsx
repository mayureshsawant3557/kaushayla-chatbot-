import React from "react";
import gearGif from "../../assets/kaushalyaRotate.gif"; // Fixed path

const Loader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="flex flex-col items-center">
                {/* Enlarged GIF without rotation */}
                <img
                    src={gearGif}
                    alt="Loading..."
                    className="w-40 h-40 mb-4" // Adjust size here (e.g., w-24 h-24, w-32 h-32)
                />


            </div>
        </div>
    );
};

export default Loader;

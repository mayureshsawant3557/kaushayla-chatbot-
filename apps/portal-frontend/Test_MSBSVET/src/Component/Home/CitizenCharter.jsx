import React, { useContext } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import { ThemeContext } from "../Context/ThemeContext";

const CitizenCharter = () => {
    const { color } = useContext(ThemeContext);

    const pdfUrl = "https://msbsvet.blob.core.windows.net/msbsvet/msbsvetlive/notifications/%E0%A4%AE%E0%A4%B9%E0%A4%BE%E0%A4%B0%E0%A4%BE%E0%A4%B7%E0%A5%8D%E0%A4%9F%E0%A5%8D%E0%A4%B0%20%E0%A4%B0%E0%A4%BE%E0%A4%9C%E0%A5%8D%E0%A4%AF%20%E0%A4%95%E0%A5%8C%E0%A4%B6%E0%A4%B2%E0%A5%8D%E0%A4%AF,%20%E0%A4%B5%E0%A5%8D%E0%A4%AF%E0%A4%B5%E0%A4%B8%E0%A4%BE%E0%A4%AF%20%E0%A4%B6%E0%A4%BF%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%A3%20%E0%A4%B5%20%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%B6%E0%A4%BF%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%A3%20%E0%A4%AE%E0%A4%82%E0%A4%A1%E0%A4%B3%20-%20%E0%A4%A8%E0%A4%BE%E0%A4%97%E0%A4%B0%E0%A5%80%E0%A4%95%E0%A4%BE%E0%A4%82%E0%A4%9A%E0%A5%80%20%E0%A4%B8%E0%A4%A8%E0%A4%A6%20-%20%E0%A5%A9%E0%A5%A6.%E0%A5%A6%E0%A5%AA.%E0%A5%A8%E0%A5%A6%E0%A5%A8%E0%A5%AB.pdf";

    return (
        <div className="w-full p-6">
            <fieldset className="rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
                <legend className={`flex ${color} items-center text-lg font-semibold text-white border-2 border-gray-300 p-2 rounded-md`}>
                    <FaFileAlt className="mr-2 text-white" />
                    Citizen Charter
                </legend>

                <div className="p-3">
                    <div className="w-full">
                        {/* PDF Viewer */}
                        <div className="relative w-full" style={{ height: '600px' }}>
                            <iframe
                                src={pdfUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 'none' }}
                                title="Citizen Charter PDF"
                                className="rounded-lg shadow-md"
                            >
                                <p className="text-center text-gray-600 p-4">
                                    Your browser does not support iframes.
                                    <a
                                        href={pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline ml-1"
                                    >
                                        Click here to view the PDF
                                    </a>
                                </p>
                            </iframe>
                        </div>

                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default CitizenCharter;

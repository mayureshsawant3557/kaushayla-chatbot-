import React, { useContext, useState, useEffect } from 'react';
import { FaArrowUp, FaPrint } from 'react-icons/fa'; 
import { ThemeContext } from "../Context/ThemeContext"; 
import { useTranslation } from "react-i18next"; 

const AboutBoard = () => {
    const { color } = useContext(ThemeContext); 
    const { t } = useTranslation(); 
    const [scrollTop, setScrollTop] = useState(false);

    const handleScroll = () => {
        if (window.scrollY > 200) {
            setScrollTop(true);
        } else {
            setScrollTop(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const handlePrint = () => {
        window.print(); 
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="w-full p-6 relative print:static">

            <div className="flex justify-end mb-2 print:hidden">
                <button
                    type="button"
                    onClick={handlePrint}
                    className="bg-[#0066a1] hover:bg-[#005586] text-white text-sm font-bold px-4 py-1.5  rounded-lg transition-all tracking-wide shadow-sm"
                >
                    {t("Print")}
                </button>
            </div>

            {/* Only the content inside #print-area will be printed.
                Everything else on the page (header, footer, nav, etc.)
                is hidden via the @media print rule in index.css */}
            <div id="print-area">
                <fieldset className="bg-white p-4 rounded-lg shadow-lg border border-gray-300 mb-6">
                    <legend className={`flex ${color} items-center text-lg font-semibold text-white border-2 border-gray-300 p-2 rounded-md`}>
                        <FaArrowUp className="mr-2 text-white" /> 
                        {t("About_Board")}
                    </legend>

                    <div className="space-y-6">
                        <div>
                            <p className="text-base text-gray-800">
                                <strong>1. {t("Govt_Maharashtra")}</strong> {t("History_Part_1")}
                            </p>
                        </div>
                        <div>
                            <p className="text-base text-gray-800">
                                <strong>2. {t("Renaming_MSBVEE")}:</strong> {t("History_Part_2")}
                            </p>
                        </div>
                        <div>
                            <div className="text-base text-gray-800">
                                <strong>3. {t("Functions_of_Board")}:</strong> {t("Functions_Intro")}
                                <ul className="list-disc pl-6 mt-2">
                                    <li>{t("Design_Approval_Courses")}</li>
                                    <li>{t("Affiliation_VTIs")}</li>
                                    <li>{t("Assessment_Certification")}</li>
                                    <li>{t("Training_Management_Research")}</li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <p className="text-base text-gray-800">
                                <strong>4. {t("MSCVT_Heading")}:</strong> {t("MSCVT_Description")}
                            </p>
                        </div>
                        <div>
                            <p className="text-base text-gray-800">
                                <strong>5. {t("Board_Courses_Institutes")}:</strong> {t("Board_Courses_Description")}
                            </p>
                        </div>
                        <div>
                            <p className="text-base text-gray-800">
                                <strong>6. {t("Training_Programs")}:</strong> {t("Training_Programs_Description")}
                            </p>
                        </div>
                        <div>
                            <p className="text-base text-gray-800">
                                <strong>7. {t("Green_Channel_Process")}:</strong> {t("Green_Channel_Description")}
                            </p>
                        </div>
                        <div>
                            <div className="text-base text-gray-800">
                                <strong>9. {t("Salient_Features_Heading")}:</strong>
                                <ul className="list-decimal pl-6 mt-2 space-y-2">
                                    <li>{t("Salient_Feature_1")}</li>
                                    <li>{t("Salient_Feature_2")}</li>
                                    <li>{t("Salient_Feature_3")}</li>
                                    <li>{t("Salient_Feature_4")}</li>
                                    <li>{t("Salient_Feature_5")}</li>
                                    <li>{t("Salient_Feature_6")}</li>
                                    <li>{t("Salient_Feature_7")}</li>
                                    <li>{t("Salient_Feature_8")}</li>
                                    <li>{t("Salient_Feature_9")}</li>
                                    <li>{t("Salient_Feature_10")}</li>
                                    <li>{t("Salient_Feature_11")}</li>
                                    <li>{t("Salient_Feature_12")}</li>
                                    <li>{t("Salient_Feature_13")}</li>
                                    <li>{t("Salient_Feature_14")}</li>
                                    <li>{t("Salient_Feature_15")}</li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <div className="text-base text-gray-800">
                                <strong>10. {t("Assessment_Heading")}:</strong>
                                <ul className="list-decimal pl-6 mt-2 space-y-1">
                                    <li>{t("Assessment_1")}</li>
                                    <li>{t("Assessment_2")}</li>
                                    <li>{t("Assessment_3")}</li>
                                    <li>{t("Assessment_4")}</li>
                                    <li>{t("Assessment_5")}</li>
                                </ul>
                            </div>
                        </div>
                        <div>
                            <div className="text-base text-gray-800">
                                <strong>11. {t("Highlights_Heading")}:</strong>
                                <ul className="list-decimal pl-6 mt-2 space-y-1">
                                    <li>{t("Sectors_Count")}: 38</li>
                                    <li>{t("Types_of_Courses")}:
                                        <ul className="list-disc pl-6 mt-2">
                                            <li>{t("Diploma_2yr")}</li>
                                            <li>{t("Advance_Diploma_1yr")}</li>
                                            <li>{t("NSQF_Mapped_Cert")}</li>
                                            <li>{t("Non_NSQF_Cert")}</li>
                                            <li>{t("NSQF_Cert")}</li>
                                        </ul>
                                    </li>
                                    <li>{t("Course_Duration_Highlight")}</li>
                                    <li>{t("Apprenticeship_Highlight")}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </fieldset>
            </div>

            {/* Back to top dynamic shortcut */}
            {/* {scrollTop && (
                <div
                    onClick={scrollToTop}
                    className={`fixed bottom-6 right-6 ${color} text-white p-3 rounded-full shadow-lg cursor-pointer hover:opacity-90 print:hidden transition-all`}
                >
                    <FaArrowUp />
                </div>
            )} */}
        </div>
    );
};

export default AboutBoard;
import React, { useContext } from 'react';
import { FaUsers } from 'react-icons/fa'; // Using FaUsers icon for values page
import { ThemeContext } from "../Context/ThemeContext"; // Importing ThemeContext
import { useTranslation } from "react-i18next";

const Values = () => {
    const { color } = useContext(ThemeContext); // Access the color from the ThemeContext

    // Function to trigger the print dialog
    const handlePrint = () => {
        window.print(); // Trigger the print dialog
    };
    const { t } = useTranslation();

    return (
        <div className="relative w-full p-6">
            <div className="flex justify-end mb-2 print:hidden">
                {/* <button
                    type="button"
                    onClick={handlePrint}
                    className="bg-[#0066a1] hover:bg-[#005586] text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-all tracking-wide shadow-sm"
                >
                    {t("Print")}
                </button> */}
            </div>
            {/* Card-style container for Values */}
            <fieldset className="mb-6 rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
                <legend className={`flex ${color} items-center text-lg font-semibold text-white border-2 border-gray-300 p-2 rounded-md`}>
                    <FaUsers className="mr-2 text-white" /> {/* Values icon */}
                    {t("Values")}
                </legend>

                {/* Values Content */}
                <div className="col-md-12 ml-6 flex flex-col p-2">
                    <ol className="list-decimal space-y-2 text-base text-gray-800">
                        <li>{t("Gender Equality")}</li>
                        <li>{t("Employment and Entrepreneurship Strengthening")}</li>
                        <li>{t("Modern Technology")}</li>
                        <li>{t("Collaborative Approach")}</li>
                        <li>{t("Adaptability Approach")}</li>
                        <li>{t("Pro Active Leadership")}</li>
                        <li>{t("Innovation")}</li>
                        <li>{t("Inclusive Growth")}</li>
                    </ol>
                </div>
            </fieldset>
        </div>
    );
};

export default Values;


import React, { useContext } from 'react';
import { FaBullhorn } from 'react-icons/fa'; // Using FaBullhorn icon for Objectives
import { ThemeContext } from "../Context/ThemeContext"; // Importing ThemeContext
import { useTranslation } from "react-i18next";

const Objectives = () => {
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
            {/* Card-style container for Objectives */}
            <fieldset className="mb-6 rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
                <legend className={`flex ${color} items-center text-lg font-semibold text-white border-2 border-gray-300 p-2 rounded-md`}>
                    <FaBullhorn className="mr-2 text-white" /> {/* Objectives icon */}
                    {t('Objectives')}
                </legend>

                {/* Objectives Content */}
                <div className="col-md-12 ml-6 flex flex-col p-2">
                    <ol className="list-decimal space-y-2 text-base text-gray-800">
                        <li>{t('Objective_1')}</li>
                        <li>{t('Objective_2')}</li>
                        <li>{t('Objective_3')}</li>
                        <li>{t('Objective_4')}</li>
                        <li>{t('Objective_5')}</li>
                        <li>{t('Objective_6')}</li>
                        <li>{t('Objective_7')}</li>
                        <li>{t('Objective_8')}</li>
                    </ol>
                </div>
            </fieldset>

            {/* Include styles for printing */}
            <style>
                {`
                    @media print {
                        /* Hide the print button during printing */
                        #printButton {
                            display: none;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default Objectives;

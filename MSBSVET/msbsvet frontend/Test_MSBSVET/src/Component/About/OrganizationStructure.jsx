import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { FaSitemap, FaPrint, FaArrowUp } from 'react-icons/fa';
import { ThemeContext } from "../Context/ThemeContext";
import OrgStructureA from '../../assets/OranisationStructureA.jpg';
import OrgStructureB from '../../assets/OranisationStructureB.jpg';
import OrgStructureC from '../../assets/OranisationStructureC.jpg'; 

const OrganizationStructure = () => {
    const { t } = useTranslation();
    const { color } = useContext(ThemeContext);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Single unified data structure using the `t` hook
    const organizationData = [
        {
            id: 1,
            title: t("A. Skill, Employment, Entrepreneurship and Innovation Department, Government of Maharashtra"),
            image: OrgStructureA
        },
        {
            id: 2,
            title: t("B. Directorate of Vocational Education and Training, Maharashtra State"),
            image: OrgStructureB
        },
        {
            id: 3,
            title: t("C. Maharashtra State Board of Skill, Vocational Education and Training, Mumbai"),
            image: OrgStructureC
        }
    ];

    // Scroll to top functionality
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="relative w-full p-6 print:static" id="print-area">
            <div className="flex justify-end mb-2 print:hidden">
                <button
                    type="button"
                    onClick={handlePrint}
                    className="bg-[#0066a1] hover:bg-[#005586] text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-all tracking-wide shadow-sm"
                >
                    {t("Print")}
                </button>
            </div>

            <fieldset className="rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
                <legend className={`flex ${color || 'bg-slate-500'} items-center text-lg font-semibold text-white border-2 border-gray-300 p-2 rounded-md`}>
                    <FaSitemap className="mr-2 text-white" />
                    {t("Organization Structure")}
                </legend>

                {/* Organization Structure Content */}
                <div className="p-3">
                    <div className="space-y-8">
                        {organizationData.map((item) => (
                            <div key={item.id} className="mb-6">
                                {/* Title */}
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    {item.title}
                                </h3>

                                {/* Structure Image */}
                                <div className="flex justify-center">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="max-w-full h-auto border border-gray-300 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/800x400?text=Organization+Structure';
                                        }}
                                    />
                                </div>

                                {/* Divider */}
                                {item.id < organizationData.length && (
                                    <hr className="mt-8 border-gray-300" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </fieldset>

            {/* Scroll to Top Floating Button */}
            {/* {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className={`fixed bottom-5 right-5 p-3 rounded-full text-white shadow-lg transition-all print:hidden ${color || 'bg-slate-500'} hover:scale-110`}
                >
                    <FaArrowUp />
                </button>
            )} */}

            {/* Page-specific print rules only — hide/color-adjust already handled globally in index.css */}
            <style>
                {`
                    @media print {
                        @page {
                            margin: 1cm;
                            size: landscape;
                        }

                        img {
                            max-width: 100%;
                            page-break-inside: avoid;
                        }

                        h3 {
                            page-break-after: avoid;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default OrganizationStructure;
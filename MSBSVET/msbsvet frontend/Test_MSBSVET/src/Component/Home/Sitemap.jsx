import React, { useContext } from 'react';
import { ThemeContext } from "../Context/ThemeContext";
import { 
    Info, ChevronRight, Landmark, Search, GraduationCap,
    BookOpen, Headset, Link, Briefcase, Store, FileText 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

const Sitemap = () => {
    const { color } = useContext(ThemeContext);
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Consolidated config using your exact original labels
    const sitemapConfig = [
        {
            title: "About Board",
            icon: <Landmark size={24} className="text-blue-900" />,
            items: [
                { label: "About Board", path: "/Public/AboutBoard" },
                { label: "Vision", path: "/Public/Vision" },
                { label: "Mission", path: "/Public/Mission" },
                { label: "Core Values", path: "/Public/CoreValues" }, 
                { label: "Objectives", path: "/Public/Objectives" },
                { label: "Goals", path: "/Public/Goals" },
                { label: "Organization Structure", path: "/Public/OrganizationStructure" },
                { label: "Governing Board", path: "/Public/GoverningBoard" },
                { label: "Governing Council", path: "/Public/GoverningCouncil" },
                { label: "Office Bearers", path: "/Public/OfficeBearers" },
            ]
        },
        {
            title: "Search",
            icon: <Search size={24} className="text-blue-900" />,
            items: [
                { label: "Institutes", path: "/Public/Institutes" },
                { label: "Courses", path: "/Public/Courses" },
            ]
        },
        {
            title: "Examination",
            icon: <GraduationCap size={24} className="text-blue-900" />,
            items: [
                { label: "Examination Circular", path: "/Public/ExamCircular" }, 
                { label: "Exam Pattern", path: "/Public/ExamPattern" },         
                { label: "Exam Timetable", path: "/Public/ExamTimeTable" },       
                { label: "Certificate Verification (2016 - 2020)", path: "/Public/legitdoc" }, 
                { label: "Certificate Verification (2021 - 2022)", path: "/Public/legitDoc22" }, 
                { label: "Download Certificate (2016 - 2020)", path: "/Public/LegitDownload" },     
                { label: "Download Certificate (2021 - 2022)", path: "/Public/LegitDownload22" },     
            ]
        },
        {
            title: "STEP Program",
            icon: <BookOpen size={24} className="text-blue-900" />,
            items: [
                { label: "Short Term Training Programs", path: "/Public/ITIShortTermTraining" },
            ]
        },
        {
            title: "Help Desk",
            icon: <Headset size={24} className="text-blue-900" />,
            items: [
                { label: "Contact Us", path: "/Public/ContactUs" },
                { label: "Right To Information (RTI)", path: "/Public/RTI" },
                { label: "Citizen Charter", path: "/Public/CitizenCharter" },
            ]
        },
        {
            title: "Additional Resources",
            icon: <Link size={24} className="text-blue-900" />,
            items: [
                { label: "Unauthorized Institutes", path: "/Public/unauthorized" },
                { label: "International Placement", path: "" },
                { label: "Success Stories", path: "/Public/success-stories-publish" },
            ]
        },
        {
            title: "Higher Education Opportunities",
            icon: <Landmark size={24} className="text-blue-900" />,
            items: [
                { label: "Industrial Training Institutes(ITI)", path: "https://admission.dvet.gov.in/", external: true },  
                { label: "Ratan Tata Maharshtra State Skill University", path: "https://mssu.ac.in/", external: true },  
                { label: "Engineering Diploma", path: "https://msbte.ac.in/", external: true }, 
                { label: "B.Voc Degree Courses (TISS)", path: "https://sve.tiss.edu/TISS/", external: true }, 
            ]
        },
        {
            title: "Apprenticeship, Internship & Employment",
            icon: <Briefcase size={24} className="text-blue-900" />,
            items: [
                { label: "National Apperenticeship Training Scheme (NAPS)", path: "https://www.apprenticeshipindia.gov.in/", external: true },  
                { label: "Maharashtra Apprenticeship Promotion Scheme (MAPS)", path: "https://maps.dvet.gov.in/", external: true },  
                { label: "Commisioner of Skill Developement Employement & Entrepreneurship", path: "https://rojgar.mahaswayam.gov.in/", external: true }, 
                { label: "Chief Minister's Youth Work Training Program", path: "https://www.cmykpy.mahaswayam.gov.in/", external: true }, 
                { label: "PM Internship Scheme", path: "https://pminternship.mca.gov.in/login/", external: true }, 
                { label: "NSDC International", path: "https://www.nsdcinternational.com/", external: true }, 
            ]
        },
        {
            title: "Self Employment Opportunities",
            icon: <Store size={24} className="text-blue-900" />,
            items: [
                { label: "Chief Minister Employment Generation Programme", path: "https://maha-cmegp.gov.in/homepage", external: true },  
                { label: "Annasaheb Patil Economic Backward Development Corporation", path: "https://udyog.mahaswayam.gov.in/#/home", external: true },  
                { label: "Maharashtra State OBC Finance and Development Corporation", path: "https://www.msobcfdc.org/", external: true }, 
                { label: "Mahatma Phule Backward Class Development Corporation", path: "https://mpbcdc.maharashtra.gov.in/", external: true }, 
                { label: "Maulana Azad Minority Financial Development Corporation", path: "https://www.mamfdc.maharashtra.gov.in/", external: true }, 
                { label: "Maharashtra State Khadi and Village Industries Board", path: "https://mskvib.org/en/schemes/", external: true }, 
                { label: "Khadi and Village Industries Commission", path: "https://www.kviconline.gov.in/", external: true }, 
                { label: "Pradhan Mantri Mudra Yojana", path: "https://www.mudra.org.in/Offerings", external: true }, 
            ]
        }
    ];

    const handleAction = (item) => {
        if (item.external) {
            window.open(item.path, "_blank");
        } else {
            navigate(item.path);
        }
    };

    return (
        <div className="relative w-full pt-1 pb-5 bg-gray-50 min-h-screen" id="printdivcontent">
            <div className="max-w-6xl mx-auto mt-10 relative">
                    
                    <fieldset className="w-full rounded-xl border border-gray-300 bg-white shadow-md pt-12 pb-10 px-4 md:px-10">
                        
                        {/* The Legend creates the overlapping effect automatically */}
                        <legend className={`flex items-center gap-2 px-4 py-2 text-white font-bold rounded-lg shadow-md ml-8 ${color || 'bg-slate-500'}`}>
                            <FileText size={18} />
                            <span>{t("Sitemap")}</span>
                        </legend>

                        <div className="w-full md:w-[95%] mx-auto">
                            
                            {/* Information Note */}
                            <div className="flex items-start gap-4 bg-blue-50 border-l-[5px] border-blue-700 p-5 rounded-r-lg mb-10">
                                <Info className="text-blue-800 mt-1" size={20} />
                                <p className="text-slate-800 text-sm md:text-base">
                                    <span className="font-bold">{t("Note")}:</span>{" "}
                                    {t("This sitemap provides quick access to all major sections of the Maharashtra State Board of Skill, Vocational Education and Training website.")}
                                </p>
                            </div>

                            {/* Strictly Vertical Sections */}
                            <div className="flex flex-col space-y-4">
                                {sitemapConfig.map((section, idx) => (
                                    <div key={idx} className="w-full">
                                        <div className="flex items-center gap-3 pb-2 border-b-2 border-blue-900 mb-4">
                                            {section.icon}
                                            <h2 className="text-xl md:text-2xl font-bold text-blue-900">
                                                {t(section.title)}
                                            </h2>
                                        </div>

                                        {/* Strictly Vertical Navigation List */}
                                        <div className="flex flex-col space-y-1">
                                            {section.items.map((item, itemIdx) => (
                                                <div
                                                    key={itemIdx}
                                                    onClick={() => handleAction(item)}
                                                    className="flex items-center gap-4 py-3 px-4 cursor-pointer group hover:bg-blue-50/50 transition-colors rounded-md"
                                                >
                                                    <div className="flex-shrink-0">
                                                        <ChevronRight 
                                                            size={16} 
                                                            className="text-blue-900 stroke-[3px] group-hover:translate-x-1 transition-transform" 
                                                        />
                                                    </div>
                                                    <span className="text-blue-900 font-semibold text-base md:text-lg">
                                                        {t(item.label)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
    );
};

export default Sitemap;
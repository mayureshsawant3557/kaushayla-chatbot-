import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import nsdc from "../../assets/nsdc.jpg";
import pmlogo from "../../assets/pm_internship_logo.svg";
import dvetLogo from "../../assets/dvet.jpg";
import kaushalamLogo from "../../assets/kaushalamLogo.jpg";
import csdee from "../../assets/csdee.jpg";
import naps from "../../assets/naps.jpg";

const ApprenticeshipCarousel = () => {
    const { t } = useTranslation();

    const schemes = [
        {
            id: 1,
            title: t("National_Apprenticeship_Training_Scheme") || "National Apprenticeship Training Scheme",
            logo: naps,
            url: "https://www.apprenticeshipindia.gov.in"
        },
        {
            id: 2,
            title: t("Maharashtra_Apprenticeship_Promotion_Scheme_MAPS") || "Maharashtra Apprenticeship Promotion Scheme MAPS",
            logo: dvetLogo,
            url: "https://maps.dvet.gov.in"
        },
        {
            id: 3,
            title: t("Commissionerate_of_Skill_Development_Employment_and_Entrepreneurship") || "Commissionerate of Skill Development Employment and Entrepreneurship",
            logo: csdee,
            url: "https://rojgar.mahaswayam.gov.in"
        },
        {
            id: 4,
            title: t("CM_Internship_Program") || "CM Internship Program",
            logo: kaushalamLogo,
            url: "https://www.cmykpy.mahaswayam.gov.in"
        },
        {
            id: 5,
            title: t("PM_Internship_Scheme") || "PM Internship Scheme",
            logo: pmlogo,
            url: "https://pminternship.mca.gov.in/login/"
        },
        {
            id: 6,
            title: t("NSDC_International") || "NSDC International",
            logo: nsdc,
            url: "https://www.nsdcinternational.com"
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [mobileIndex, setMobileIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 6000);

        return () => clearInterval(interval);
    }, [currentIndex]);

    useEffect(() => {
        const mobileInterval = setInterval(() => {
            nextMobileSlide();
        }, 6000);

        return () => clearInterval(mobileInterval);
    }, [mobileIndex]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === schemes.length - 3 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? schemes.length - 3 : prevIndex - 1
        );
    };

    const nextMobileSlide = () => {
        setMobileIndex((prevIndex) =>
            prevIndex === schemes.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevMobileSlide = () => {
        setMobileIndex((prevIndex) =>
            prevIndex === 0 ? schemes.length - 1 : prevIndex - 1
        );
    };

    return (
        <div className="w-full bg-white-100 p-4">
            <div className="bg-white p-6 rounded-lg border shadow-lg flex flex-col items-start justify-center w-full mx-auto">
                <div className="w-full text-left mb-6 border-b">
                    <h2 className="text-lg font-semibold text-blue-500">
                        {t("Apprenticeship_and_Internship_Opportunities") || "Apprenticeship and Internship Opportunities"}
                    </h2>
                </div>

                {/* Mobile: Single card with navigation */}
                <div className="block sm:hidden w-full mt-4">
                    <div className="relative">
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
                            >
                                {schemes.map((item) => (
                                    <div key={item.id} className="w-full flex-shrink-0 px-2">
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block transform transition-all duration-300"
                                        >
                                            <div className="flex items-center border p-4 rounded-lg shadow-lg w-full h-24 bg-white hover:shadow-xl transition-shadow duration-300">
                                                {/* Image on the left */}
                                                <div className="flex-shrink-0 w-16 h-16 mr-4">
                                                    <img
                                                        src={typeof item.logo === 'string' ? item.logo : item.logo}
                                                        alt={`${item.title} logo`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>

                                                {/* Content on the right */}
                                                <div className="flex-1 min-w-0">
                                                    <h1 className="text-md font-semibold text-gray-800 leading-tight">
                                                        {item.title}
                                                    </h1>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Navigation Buttons */}
                        <button
                            onClick={prevMobileSlide}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 p-2 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 transition-all duration-300 z-5"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>

                        <button
                            onClick={nextMobileSlide}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 p-2 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 transition-all duration-300 z-5"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>

                        {/* Mobile Dots Indicator */}
                        {/*<div className="flex justify-center mt-4 space-x-2">*/}
                        {/*    {schemes.map((_, index) => (*/}
                        {/*        <button*/}
                        {/*            key={index}*/}
                        {/*            onClick={() => setMobileIndex(index)}*/}
                        {/*            className={`w-2 h-2 rounded-full transition-colors duration-300 ${index === mobileIndex ? 'bg-blue-500' : 'bg-gray-300'*/}
                        {/*                }`}*/}
                        {/*        />*/}
                        {/*    ))}*/}
                        {/*</div>*/}
                    </div>
                </div>

                {/* Desktop: Original carousel layout */}
                <div className="hidden sm:block w-full mt-4">
                    <div className="flex justify-between gap-4 sm:gap-6 w-full relative">
                        {/* Display items depending on the screen size */}
                        <div className="flex w-full justify-center">
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 ease-in-out">
                                {schemes
                                    .slice(currentIndex, currentIndex + 3)
                                    .map((item) => (
                                        <a
                                            href={item.url}
                                            key={item.id}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="transform transition-all duration-500"
                                        >
                                            <div className="flex items-center border p-4 rounded-lg shadow-lg w-full h-24 bg-white hover:shadow-xl transition-shadow duration-300">
                                                {/* Image on the left */}
                                                <div className="flex-shrink-0 w-16 h-16 mr-4">
                                                    <img
                                                        src={typeof item.logo === 'string' ? item.logo : item.logo}
                                                        alt={`${item.title} logo`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>

                                                {/* Content on the right */}
                                                <div className="flex-1 min-w-0">
                                                    <h1 className="text-md font-semibold text-gray-800 leading-tight">
                                                        {item.title}
                                                    </h1>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                            </div>
                        </div>

                        {/* Previous Button */}
                        <button
                            onClick={prevSlide}
                            className="absolute -left-6 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 transition-all duration-300 z-5"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-700" />
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={nextSlide}
                            className="absolute -right-4 top-1/2 transform -translate-y-1/2 p-2 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 transition-all duration-300 z-5"
                        >
                            <ChevronRight className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprenticeshipCarousel;
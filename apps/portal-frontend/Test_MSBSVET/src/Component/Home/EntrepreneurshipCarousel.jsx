import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import sjsa from "../../assets/sjsa.png";
import udyog from "../../assets/udyog.jpg";
import mudra from "../../assets/mudra.jpg";
import mahacmegp from "../../assets/mahacmegp.jpg";
import mpbcdc from "../../assets/mpbcdc.jpg";
import mamfdc from "../../assets/mamfdc.jpg";
import obcfdc from "../../assets/obcfdc.jpg";
import kviconline from "../../assets/kviconline.png";

const EntrepreneurshipCarousel = () => {
    const { t } = useTranslation();

    const opportunities = [
        {
            id: 1,
            name: t("Mahatma_Phule_Backward_Class_Development_Corporation") || "Mahatma Phule Backward Class Development Corporation",
            logo: sjsa,
            link: "https://mpbcdc.maharashtra.gov.in",
        },
        {
            id: 2,
            name: t("Sant_Rohidas_Leather_Industries_&_Charmakar_Development_Corporation") || "Sant Rohidas Leather Industries & Charmakar Development Corporation",
            logo: sjsa,
            link: "https://sjsa.maharashtra.gov.in/en/sant-rohidas-leather-industries-charmakar-development-corporation-ltd",
        },
        {
            id: 3,
            name: t("Lokshahir_Anna_Bhau_Sathe_Development_Corporation") || "Lokshahir Anna Bhau Sathe Development Corporation",
            logo: sjsa,
            link: "https://sjsa.maharashtra.gov.in/en/lokshahir-anna-bhau-sathe-devcoltd",
        },
        {
            id: 4,
            name: t("Pradhan_Mantri_MUDRA_Yojana") || "Pradhan Mantri MUDRA Yojana",
            logo: mudra,
            link: "https://www.mudra.org.in/Offerings",
        },
        {
            id: 5,
            name: t("Chief_Minister_Employment_Generation_Program") || "Chief Minister Employment Generation Program",
            logo: mahacmegp,
            link: "https://maha-cmegp.gov.in/homepage",
        },
        {
            id: 6,
            name: t("Annasaheb_Patil_Arthik_Magas_Vikas_Mahamandal") || "Annasaheb Patil Arthik Magas Vikas Mahamandal",
            logo: udyog,
            link: "https://udyog.mahaswayam.gov.in/#/home",
        },
        {
            id: 7,
            name: t("Khadi_and_Village_Industries_Commission") || "Khadi and Village Industries Commission",
            logo: kviconline,
            link: "https://www.kviconline.gov.in/",
        },
        {
            id: 8,
            name: t("Lokshahir_Anna_Bhau_Sathe_Development_Corporation") || "Lokshahir Anna Bhau Sathe Development Corporation",
            logo: sjsa,
            link: "https://sjsa.maharashtra.gov.in/en/lokshahir-anna-bhau-sathe-devcoltd",
        },
        {
            id: 9,
            name: t("Maharashtra_State_Khadi_and_Village_Industries_Board") || "Maharashtra State Khadi and Village Industries Board",
            logo: mpbcdc,
            link: "https://mskvib.org/en/schemes/",
        },
        {
            id: 10,
            name: t("Maulana_Azad_Minorities_Financial_Development_Corporation") || "Maulana Azad Minorities Financial Development Corporation",
            logo: mamfdc,
            link: "https://mamfdc.maharashtra.gov.in",
        },
        {
            id: 11,
            name: t("Maharashtra_State_Handicapped_Finance_and_Development_Corporation") || "Maharashtra State Handicapped Finance and Development Corporation",
            logo: sjsa,
            link: "https://mshfdc.maharashtra.gov.in",
        },
        {
            id: 12,
            name: t("Maharashtra_State_OBC_Finance_and_Development_Corporation") || "Maharashtra State OBC Finance and Development Corporation",
            logo: obcfdc,
            link: "https://www.msobcfdc.org/",
        },
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
            prevIndex === opportunities.length - 3 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? opportunities.length - 3 : prevIndex - 1
        );
    };

    const nextMobileSlide = () => {
        setMobileIndex((prevIndex) =>
            prevIndex === opportunities.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevMobileSlide = () => {
        setMobileIndex((prevIndex) =>
            prevIndex === 0 ? opportunities.length - 1 : prevIndex - 1
        );
    };

    return (
        <div className="w-full bg-white-100 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg border flex flex-col items-start justify-center w-full mx-auto">
                <div className="w-full text-left mb-6 border-b">
                    <h1 className="text-lg font-semibold text-blue-500">
                        {t("Entrepreneurship_Opportunities") || "Entrepreneurship Opportunities"}
                    </h1>
                </div>

                {/* Mobile: Single card with navigation */}
                <div className="block sm:hidden w-full mt-4">
                    <div className="relative">
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
                            >
                                {opportunities.map((item) => (
                                    <div key={item.id} className="w-full flex-shrink-0 px-2">
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block transform transition-all duration-300"
                                        >
                                            <div className="flex items-center border p-4 rounded-lg shadow-lg w-full h-24 bg-white hover:shadow-xl transition-shadow duration-300">
                                                {/* Image on the left */}
                                                <div className="flex-shrink-0 w-16 h-16 mr-4">
                                                    <img
                                                        src={item.logo}
                                                        alt={`${item.name} logo`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>

                                                {/* Content on the right */}
                                                <div className="flex-1 min-w-0">
                                                    <h1 className="text-md font-semibold text-gray-800 leading-tight">
                                                        {item.name}
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
                        {/*    {opportunities.map((_, index) => (*/}
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
                                {opportunities
                                    .slice(currentIndex, currentIndex + 3)
                                    .map((item) => (
                                        <a
                                            href={item.link}
                                            key={item.id}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="transform transition-all duration-500"
                                        >
                                            <div className="flex items-center border p-4 rounded-lg shadow-lg w-full h-24 bg-white hover:shadow-xl transition-shadow duration-300">
                                                {/* Image on the left */}
                                                <div className="flex-shrink-0 w-16 h-16 mr-4">
                                                    <img
                                                        src={item.logo}
                                                        alt={`${item.name} logo`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>

                                                {/* Content on the right */}
                                                <div className="flex-1 min-w-0">
                                                    <h1 className="text-md font-semibold text-gray-800 leading-tight">
                                                        {item.name}
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

export default EntrepreneurshipCarousel;
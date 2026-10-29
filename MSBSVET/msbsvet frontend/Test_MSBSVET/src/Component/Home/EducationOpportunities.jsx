import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import TISS from "../../assets/TISS.jpg";
import msbte from "../../assets/msbte.jpg";
import dvet from "../../assets/dvet.jpg";
import mssu from "../../assets/RatanTataMaharashtraStateSkillUniversity.jpg";

const EducationOpportunities = () => {
    const { t } = useTranslation();

    const educationItems = [
        {
            id: 1,
            image: TISS,
            alt: "TISS logo",
            title: t("Bachelor_of_Vocation_(B.Voc.)"),
            link: "https://sve.tiss.edu/TISS/",
            additionalText: t("Circular_for_Admission"),
            hasAdditionalLink: true
        },
        {
            id: 2,
            image: msbte,
            alt: "Engineering Logo",
            title: t("Engineering_Diploma"),
            link: "https://admission.dvet.gov.in/",
            hasAdditionalLink: false
        },
        {
            id: 3,
            image: dvet,
            alt: "ITI Logo",
            title: t("Industrial_Training_Institute_(ITI)"),
            link: "https://msbte.org.in/",
            hasAdditionalLink: false
        },
        {
            id: 4,
            image: mssu,
            alt: "MSSU Logo",
            title: t("Ratan_Tata_Maharashtra_State_Skill_University"),
            link: "https://mssu.ac.in/",
            hasAdditionalLink: false
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Check screen size
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Auto-slide functionality
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 6000);

        return () => clearInterval(interval);
    }, [currentIndex]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % educationItems.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? educationItems.length - 1 : prevIndex - 1
        );
    };

    // Get visible items based on screen size
    const getVisibleItems = () => {
        if (isMobile) {
            // Mobile: show 1 item
            return [educationItems[currentIndex]];
        } else {
            // Desktop: show 3 items in circular fashion
            const items = [];
            for (let i = 0; i < 3; i++) {
                const index = (currentIndex + i) % educationItems.length;
                items.push(educationItems[index]);
            }
            return items;
        }
    };

    const visibleItems = getVisibleItems();

    const renderCard = (item) => (
        <div
            key={item.id}
            className={`transform transition-all duration-500 ${isMobile ? 'w-full' : 'flex-1 min-w-0'
                }`}
        >
            <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
            >
                <div className="flex items-center border p-4 rounded-lg shadow-lg w-full h-24 bg-white hover:shadow-xl transition-shadow duration-300">
                    {/* Image on the left */}
                    <div className="flex-shrink-0 w-16 h-16 mr-4">
                        <img
                            src={item.image}
                            alt={item.alt}
                            className="w-full h-full object-contain rounded"
                        />
                    </div>

                    {/* Content on the right */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-md font-semibold text-gray-800 leading-tight">
                            {item.title}
                        </h1>
                        {item.hasAdditionalLink && (
                            <a href="#" className="text-blue-500 text-sm hover:underline">
                                {item.additionalText}
                            </a>
                        )}
                    </div>
                </div>
            </a>
        </div>
    );

    return (
        <div className="w-full bg-gray-50 p-4">
            <div className="bg-white p-6 rounded-lg border shadow-lg flex flex-col items-start justify-center w-full mx-auto">
                <div className="w-full text-left mb-6 border-b">
                    <h1 className="text-lg font-semibold text-blue-500">
                        {t("Higher_Education_Opportunities")}
                    </h1>
                </div>

                {/* Unified carousel for both mobile and desktop */}
                <div className="w-full mt-4">
                    <div className="relative">
                        {/* Cards container */}
                        <div className={`flex transition-all duration-500 ease-in-out ${isMobile ? 'justify-center' : 'justify-between gap-4'
                            }`}>
                            {visibleItems.map((item) => renderCard(item))}
                        </div>

                        {/* Navigation Buttons */}
                        <button
                            onClick={prevSlide}
                            className={`absolute top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all duration-300 z-5 border ${isMobile
                                ? 'left-0 -translate-x-2'
                                : '-left-6'
                                }`}
                            aria-label={t("Previous")}
                        >
                            <ChevronLeft className={`text-gray-700 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'
                                }`} />
                        </button>

                        <button
                            onClick={nextSlide}
                            className={`absolute top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all duration-300 z-5 border ${isMobile
                                ? 'right-0 translate-x-2'
                                : '-right-6'
                                }`}
                            aria-label={t("Next")}
                        >
                            <ChevronRight className={`text-gray-700 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'
                                }`} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EducationOpportunities;
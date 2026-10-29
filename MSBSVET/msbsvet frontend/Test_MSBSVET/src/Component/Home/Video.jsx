import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const VideoCarousel = () => {
    const location = useLocation();
    const { t } = useTranslation();

    const allVideos = [
        {
            id: 1,
            titleKey: "Demo_for_Online_Exam",
            thumbnail: "/api/placeholder/320/180",
            videoUrl: "https://www.youtube.com/embed/5Chk9L6ZeQE",
        },
        {
            id: 3,
            titleKey: "Apply_for_MSBSVET_Courses",
            thumbnail: "/api/placeholder/320/180",
            videoUrl: "https://www.youtube.com/embed/BWkOfr9g-2M",
        },
        {
            id: 4,
            titleKey: "Mandala_Karyavisayak_Sankshipt_Mahiti",
            thumbnail: "/api/placeholder/320/180",
            videoUrl: "https://www.youtube.com/embed/AfE-ORVn3PU",
        },
        {
            id: 2,
            titleKey: "Candidate_Registration",
            thumbnail: "/api/placeholder/320/180",
            videoUrl: "https://player.vimeo.com/video/1066872978?h=c186108f62",
        },
        {
            id: 5,
            titleKey: "Mandala_Karyalaya",
            thumbnail: "/api/placeholder/320/180",
            videoUrl: "https://www.youtube.com/embed/XCGl8r46NhQ",
        },
        {
            id: 6,
            titleKey: "Candidate_Registration_ITI",
            thumbnail: "/api/placeholder/320/180",
            videoUrl: "https://www.youtube.com/embed/XVqs-YKYMVY",
        }
    ];

    const videosToShow =
        location.pathname === "/Public/ITIShortTermTraining"
            ? allVideos.filter((video) => video.id === 6)
            : allVideos.filter((video) => video.id !== 6);

    return (
        <div className="w-full bg-gray-50 p-4 overflow-hidden">
            <div className="bg-white p-6 border rounded-lg shadow-md w-full mx-auto overflow-hidden">
                <div className="w-full text-left mb-6">
                    <h2 className="text-lg font-semibold text-blue-500">
                        {t("Related_Videos")}
                    </h2>
                    <hr />
                </div>
                <div className="w-full overflow-hidden">
                    {/* Mobile: Horizontal scrollable layout */}
                    <div className="block sm:hidden">
                        <div
                            className="flex gap-4 overflow-x-auto pb-2"
                            style={{
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                            }}
                        >
                            <style>{`
                            div::-webkit-scrollbar {
                              display: none;
                            }
                          `}</style>
                            {videosToShow.map((video) => (
                                <div
                                    key={video.id}
                                    className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex-shrink-0"
                                    style={{ minWidth: "280px" }}
                                >
                                    <div className="w-full h-32 bg-gray-100 relative overflow-hidden">
                                        <iframe
                                            src={video.videoUrl}
                                            title={t(video.titleKey)}
                                            className="w-full h-full"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">
                                            {t(video.titleKey)}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop: Grid layout */}
                    <div className="hidden sm:block">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {videosToShow.map((video) => (
                                <div
                                    key={video.id}
                                    className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="w-full h-32 bg-gray-100 relative overflow-hidden">
                                        <iframe
                                            src={video.videoUrl}
                                            title={t(video.titleKey)}
                                            className="w-full h-full"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">
                                            {t(video.titleKey)}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCarousel;
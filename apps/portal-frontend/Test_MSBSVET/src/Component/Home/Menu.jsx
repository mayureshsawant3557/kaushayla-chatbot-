import { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { GetNotificationList } from "../../Endpoints_All/Administration/admin";
import { GetApprovalOrder } from "../../Endpoints_All/Base/masterData";
import { useLoading } from "../../Hooks/useLoading";
import React from 'react';
import {
    Book,
    FileText,
    BellRing,
    Globe2,
    Scale,
    CheckCircle,
    ChevronDown,
    X
} from "lucide-react";
import agent from "../../lib/api/agent";

const Menu = () => {
    const [activeItem, setActiveItem] = useState(null);
    const ThemeContext = React.createContext({
        color: 'bg-[#828AA1]',
    });
    const { color } = useContext(ThemeContext);
    const [notices, setNotices] = useState([]);
    const { t, i18n } = useTranslation();
    const [showPopup, setShowPopup] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredNotices, setFilteredNotices] = useState([]);

    const { startLoading, stopLoading } = useLoading();

    // Helper function to get localized content based on current language
    const getLocalizedContent = (notice) => {
        const currentLang = i18n.language; // 'en' or 'mr'
        
        return {
            title: currentLang === 'mr' && notice.NotificationTitleMarathi 
                ? notice.NotificationTitleMarathi 
                : notice.NotificationTitle,
            textContent: currentLang === 'mr' && notice.TextContentMarathi 
                ? notice.TextContentMarathi 
                : notice.TextContent,
            fileURL: notice.FileContentURL
        };
    };

    useEffect(() => {
        if (notices.length > 0) {
            const filtered = notices.filter(notice => {
                const localized = getLocalizedContent(notice);
                const titleMatch = localized.title?.toLowerCase().includes(searchQuery.toLowerCase());
                const contentMatch = localized.textContent?.toLowerCase().includes(searchQuery.toLowerCase());
                const approvalNoMatch = notice.ApprovalOrderNo?.toLowerCase().includes(searchQuery.toLowerCase());
                return titleMatch || contentMatch || approvalNoMatch;
            });
            setFilteredNotices(filtered);
        }
    }, [searchQuery, notices, i18n.language]); // Re-filter when language changes

    const fetchNotices = (id) => {
        if (activeItem === id) {
            setActiveItem(null);
            setNotices([]);
            return;
        }

        startLoading();

        if (id === 7) {
            // Call Approval Order API for id 7
            agent.get(`${GetApprovalOrder}`)
                .then((response) => {
                    if (response.data.Status === "Success") {
                        const transformedData = response.data.Data.map(item => ({
                            NotificationID: item.ID,
                            NotificationTitle: `Approval Order No: ${item.ApprovalOrderNo} - ${item.ApprovalOrderDateDisplay}`,
                            NotificationTitleMarathi: item.ApprovalOrderNoMarathi 
                                ? `मंजुरी आदेश क्र.: ${item.ApprovalOrderNoMarathi} - ${item.ApprovalOrderDateDisplayMarathi}`
                                : null,
                            TextContent: item.ApprovalOrderRemakr || `Approval Order ${item.ApprovalOrderNo}`,
                            TextContentMarathi: item.ApprovalOrderRemakrMarathi || null,
                            FileContentURL: item.ApprovalOrder,
                            DisplayNewImage: 0,
                            ApprovalOrderNo: item.ApprovalOrderNo,
                            ApprovalOrderDate: item.ApprovalOrderDateDisplay
                        }));
                        setNotices(transformedData);
                        setFilteredNotices(transformedData);
                        setActiveItem(id);
                        setSearchQuery("");
                    }
                })
                .catch((error) => {
                })
                .finally(() => {
                    stopLoading();
                });
        } else {
            // Call notification API for other menu items
            agent.get(`${GetNotificationList}`, {
                params: {
                    RegionID: 1,
                    NotificationCategoryID: id
                }
            })
                .then((response) => {
                    if (response.data.Status === "Success") {
                        setNotices(response.data.Data);
                        setFilteredNotices(response.data.Data);
                        setActiveItem(id);
                        setSearchQuery("");
                    }
                })
                .catch((error) => {
                })
                .finally(() => {
                    stopLoading();
                });
        }
    };

    const menuItems = [
        { id: 2, title: t("User_Manual"), icon: Book },
        { id: 3, title: t("News_and_Updates"), icon: FileText },
        { id: 4, title: t("Notifications_Circulars"), icon: BellRing },
        { id: 5, title: t("Related_Websites"), icon: Globe2 },
        { id: 6, title: t("Acts_and_Resolution"), icon: Scale },
        { id: 7, title: t("Approval_Order"), icon: CheckCircle }
    ];

    const openPopup = () => {
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="w-full px-2 sm:px-4 sm:ml-4 sm:w-[400px] lg:w-[450px] xl:ml-1 xl:w-[450px]">
            <div className="flex flex-col w-full sm:w-[450px] xl:w-[435px]">
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <div key={item.id} className="relative w-full">
                            <button
                                onClick={() => fetchNotices(item.id)}
                                className={`w-full flex items-center justify-between px-3 sm:px-4 py-3 text-left border-b border-opacity-70 text-sm sm:text-base md:text-lg ${color} text-white transition-colors duration-200`}
                            >
                                <div className="flex items-center min-w-0 flex-1">
                                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                                    <span className="truncate font-bold sm:font-normal">{item.title}</span>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 flex-shrink-0 ml-2 ${activeItem === item.id ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {activeItem === item.id && (
                                <div className="relative top-full w-full bg-white shadow-lg rounded-sm border border-gray-300 z-10">
                                    {notices.length > 0 ? (
                                        <ul className="py-2 text-black">
                                            {notices.slice(0, 2).map((notice, index) => {
                                                const localized = getLocalizedContent(notice);
                                                return (
                                                    <li key={notice.NotificationID || index} className="px-3 sm:px-4 py-2 hover:bg-gray-200">
                                                        {localized.fileURL ? (
                                                            <a
                                                                href={localized.fileURL}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline text-sm sm:text-base line-clamp-2 block"
                                                            >
                                                                {localized.title}
                                                                {notice.DisplayNewImage === 1 && (
                                                                    <span className="text-red-500 font-bold ml-2 text-xs px-2 py-0.5 bg-red-50 rounded-sm">
                                                                        {t('new') || "New!"}
                                                                    </span>
                                                                )}
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-700 text-sm sm:text-base line-clamp-2 block">
                                                                {localized.title}
                                                                {notice.DisplayNewImage === 1 && (
                                                                    <span className="text-red-500 font-bold ml-2 text-xs px-2 py-0.5 bg-red-50 rounded-sm">
                                                                        {t('new') || "New!"}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        )}
                                                        {localized.textContent && (
                                                            <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                                                                {localized.textContent}
                                                            </p>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                            {notices.length > 2 && (
                                                <li className="px-3 sm:px-4 py-2 hover:bg-gray-200">
                                                    <button
                                                        onClick={openPopup}
                                                        className="text-blue-600 hover:underline font-medium text-sm sm:text-base"
                                                    >
                                                        {t('See_More') || "See more..."}
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">
                                            {t('No_Success_Stories') || "No notices available"}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Popup Modal */}
            {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-sm shadow-xl w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] flex flex-col">
                        {/* Popup Header */}
                        <div className={`${color} text-white p-3 sm:p-4 rounded-t-sm flex justify-between items-center flex-shrink-0`}>
                            <h3 className="text-lg sm:text-xl font-medium truncate mr-2">
                                {menuItems.find(item => item.id === activeItem)?.title || t("notices")}
                            </h3>
                            <button
                                onClick={closePopup}
                                className="text-white hover:text-gray-200 flex-shrink-0 p-1"
                            >
                                <X className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-3 sm:p-4 flex-shrink-0">
                            <input
                                type="text"
                                placeholder={t("Search") || "Search notices..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border rounded-sm p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Scrollable Notice List */}
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                            {filteredNotices.length > 0 ? (
                                <ul className="space-y-3">
                                    {filteredNotices.map((notice, index) => {
                                        const localized = getLocalizedContent(notice);
                                        return (
                                            <li key={notice.NotificationID || index} className="border-b pb-2">
                                                {localized.fileURL ? (
                                                    <a
                                                        href={localized.fileURL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-sm sm:text-base leading-relaxed break-words block"
                                                    >
                                                        {localized.title}
                                                        {notice.DisplayNewImage === 1 && (
                                                            <span className="text-red-500 font-bold ml-2 text-xs px-2 py-0.5 bg-red-50 rounded-sm inline-block">
                                                                {t('new') || "New!"}
                                                            </span>
                                                        )}
                                                    </a>
                                                ) : (
                                                    <div>
                                                        <span className="text-gray-700 text-sm sm:text-base leading-relaxed break-words block">
                                                            {localized.title}
                                                            {notice.DisplayNewImage === 1 && (
                                                                <span className="text-red-500 font-bold ml-2 text-xs px-2 py-0.5 bg-red-50 rounded-sm inline-block">
                                                                    {t('new') || "New!"}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {localized.textContent && (
                                                    <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed">
                                                        {localized.textContent}
                                                    </p>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center mt-4 text-sm sm:text-base">
                                    {t("No_Success_Stories_Found") || "No matching notices found."}
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t p-3 sm:p-4 flex justify-end flex-shrink-0">
                            <button
                                onClick={closePopup}
                                className={`${color} text-white px-4 py-2 rounded-sm text-sm sm:text-base`}
                            >
                                {t("close") || "Close"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;
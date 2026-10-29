import { useState, useContext, useEffect } from "react";
import { X, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import React from 'react';
import { useLoading } from "../../Hooks/useLoading";
import { GetNotificationListForDisplay } from "../../Endpoints_All/Administration/admin";
import Swal from 'sweetalert2';
import publicAgent from '../../lib/api/publicAgent';

function Notices() {
    const ThemeContext = React.createContext({
        color: 'bg-[#828AA1]',
    });
    const { color } = useContext(ThemeContext);
    const [notices, setNotices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { t, i18n } = useTranslation();
    const { startLoading, stopLoading } = useLoading();

    useEffect(() => {
        const fetchNotices = async () => {
            startLoading();
            try {
                const language = i18n.language === 'mr' ? 'mr' : 'en';

                const response = await publicAgent.get(
                    GetNotificationListForDisplay,
                    {
                        params: {
                            RegionID: 1,
                            Language: language
                        }
                    }
                );

                if (response.data.Status === "Success" && response.data.Data) {
                    const importantNotices = response.data.Data.filter(
                        notice => notice.NotificationCategoryID === 1
                    );
                    setNotices(importantNotices);
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load notices. Please try again later.',
                    confirmButtonColor: '#828AA1'
                });
            } finally {
                stopLoading();
            }
        };

        fetchNotices();
    }, [i18n.language]);

    const filteredNotices = notices.filter((notice) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            (notice.NotificationTitle && notice.NotificationTitle.toLowerCase().includes(searchLower)) ||
            (notice.TextContent && notice.TextContent.toLowerCase().includes(searchLower)) ||
            (notice.FileContentName && notice.FileContentName.toLowerCase().includes(searchLower))
        );
    });

    const getNoticeDisplayText = (notice) => {
        if (notice.TextContent && notice.TextContent.trim() !== '') {
            return notice.TextContent;
        }
        if (notice.NotificationTitle && notice.NotificationTitle.trim() !== '') {
            return notice.NotificationTitle;
        }
        if (notice.FileContentName && notice.FileContentName.trim() !== '') {
            return notice.FileContentName;
        }
        return 'Untitled Notice';
    };

    const handleNoticeClick = (notice) => {
        if (notice.FileContentURL) {
            window.open(notice.FileContentURL, '_blank');
        }
    };

    return (
        <>
            {/* Notices Section */}
            <div className="w-full max-w-6xl md:w-[1000px] h-auto md:h-[400px] border border-gray-300 rounded-sm shadow-md mx-auto">
                {/* Header Section */}
                <div className={`${color} p-3 md:p-4 flex items-center h-12 rounded-t-sm`}>
                    <List className="text-lg sm:text-xl mr-2 text-white" />
                    <h2 className="text-base sm:text-lg font-semibold text-white">
                        {t("Important_Notices")}
                    </h2>
                </div>

                {/* Notices List */}
                <div className="bg-white p-3 md:p-4 h-auto md:h-[calc(100%-3rem)] rounded-b-sm overflow-y-auto">
                    {notices.length > 0 ? (
                        <>
                            <ul className="space-y-2 md:space-y-3">
                                {notices.slice(0, 6).map((notice) => (
                                    <li key={notice.NotificationID} className="flex items-start pb-2 border-b border-gray-100 last:border-b-0">
                                        <div className="flex-1 flex items-start gap-2">
                                            {notice.FileContentURL ? (
                                                <a
                                                    href={notice.FileContentURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-xs sm:text-sm inline"
                                                >
                                                    {getNoticeDisplayText(notice)}
                                                </a>
                                            ) : (
                                                <span className="text-gray-700 text-xs sm:text-sm inline">
                                                    {getNoticeDisplayText(notice)}
                                                </span>
                                            )}
                                            {notice.DisplayNewImage === 1 && (
                                                <img
                                                    src="https://msbsvet.edu.in/App_Themes/default/images/new_img.gif"
                                                    alt="New"
                                                    className="inline-block w-auto h-4 sm:h-5 flex-shrink-0"
                                                />
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* See More Link */}
                            {notices.length > 6 && (
                                <div className="flex justify-end mt-3 md:mt-4">
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="text-blue-600 hover:underline text-xs sm:text-sm font-medium"
                                    >
                                        See more...
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500 text-center text-sm py-4">No notices available.</p>
                    )}
                </div>
            </div>

            {/* Modal - Full Notice List */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-sm shadow-lg w-full max-w-3xl max-h-[90vh] relative flex flex-col">
                        {/* Modal Header */}
                        <div className={`${color} text-white p-3 md:p-4 rounded-t-sm flex justify-between items-center`}>
                            <div className="flex items-center gap-2">
                                <List size={20} className="sm:w-6 sm:h-6" />
                                <h2 className="text-base sm:text-lg font-semibold">
                                    {t("All Notices")}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-white hover:text-gray-300 transition-colors"
                            >
                                <X size={20} className="sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-3 md:p-4 border-b border-gray-200">
                            <input
                                type="text"
                                placeholder="Search notices..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Scrollable Notice List */}
                        <div className="max-h-[50vh] md:max-h-[400px] overflow-y-auto p-3 md:p-4">
                            {filteredNotices.length > 0 ? (
                                <ul className="space-y-3">
                                    {filteredNotices.map((notice) => (
                                        <li
                                            key={notice.NotificationID}
                                            className="border-b border-gray-200 pb-3 last:border-b-0"
                                        >
                                            <div className="flex items-start gap-2">
                                                {notice.FileContentURL ? (
                                                    <a
                                                        href={notice.FileContentURL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-xs sm:text-sm inline"
                                                    >
                                                        {getNoticeDisplayText(notice)}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-700 text-xs sm:text-sm inline">
                                                        {getNoticeDisplayText(notice)}
                                                    </span>
                                                )}
                                                {notice.DisplayNewImage === 1 && (
                                                    <img
                                                        src="https://msbsvet.edu.in/App_Themes/default/images/new_img.gif"
                                                        alt="New"
                                                        className="inline-block w-auto h-4 sm:h-5 flex-shrink-0"
                                                    />
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center mt-4 text-sm">
                                    No matching notices found.
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 p-3 md:p-4 flex justify-end rounded-b-sm">
                            <button
                                onClick={() => setShowModal(false)}
                                className={`${color} text-white px-4 py-2 rounded-sm text-sm hover:opacity-90 transition-opacity`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Notices;

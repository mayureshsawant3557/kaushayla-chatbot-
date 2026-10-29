import { useState, useEffect, useRef } from "react";
import { Megaphone, PauseCircle, PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import publicAgent from '../../lib/api/publicAgent';
import { GetNotificationListForDisplay } from "../../Endpoints_All/Administration/admin"; 
// Update import

const AnnouncementRow = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    const { t, i18n } = useTranslation();

    const innerRef = useRef(null);
    const trackRef = useRef(null);
    const rafRef = useRef(null);
    const posRef = useRef(0);
    const playingRef = useRef(true);

    // Helper function to get localized content
    const getLocalizedContent = (item) => {
        const currentLang = i18n.language; // 'en' or 'mr'
        
        return {
            title: currentLang === 'mr' && item.NotificationTitleMarathi 
                ? item.NotificationTitleMarathi 
                : item.NotificationTitle,
            textContent: currentLang === 'mr' && item.TextContentMarathi 
                ? item.TextContentMarathi 
                : item.TextContent,
            fileURL: currentLang === 'mr' && item.FileContentURLMarathi 
                ? item.FileContentURLMarathi 
                : item.FileContentURL
        };
    };

    // Fetch announcements with Marathi support
    const fetchAnnouncements = async () => {
        try {
            setLoading(true);

            const response = await publicAgent.get(GetNotificationListForDisplay, {
                params: { 
                    RegionID: 1, 
                    NotificationCategoryID: 7 
                }
            });


            if (response.data.Status === "Success" && response.data.Data) {
                // Get localized content based on current language
                const list = response.data.Data
                    .filter(item => {
                        const localized = getLocalizedContent(item);
                        return localized.textContent || localized.title;
                    })
                    .map(item => {
                        const localized = getLocalizedContent(item);
                        // Prefer textContent, fallback to title
                        return localized.textContent || localized.title;
                    })
                    .filter(Boolean);

                setAnnouncements(list);
            } else {
                setAnnouncements([]);
            }

        } catch (err) {
            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when language changes
    useEffect(() => {
        fetchAnnouncements();
    }, [i18n.language]);

    // RAF scrolling logic
    useEffect(() => {
        if (loading || announcements.length === 0) return;

        const inner = innerRef.current;
        const track = trackRef.current;
        if (!inner || !track) return;

        // Reset position when content changes
        posRef.current = track.clientWidth;
        inner.style.transform = `translateX(${posRef.current}px)`;

        const speed = 0.8;

        const loop = () => {
            if (!playingRef.current) return;

            posRef.current -= speed;

            if (posRef.current < -inner.scrollWidth) {
                posRef.current = track.clientWidth;
            }

            inner.style.transform = `translateX(${posRef.current}px)`;
            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [announcements, loading]);

    // Pause
    const pause = () => {
        playingRef.current = false;
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        setIsPlaying(false);
    };

    // Resume
    const resume = () => {
        if (playingRef.current) return;

        playingRef.current = true;
        setIsPlaying(true);

        const inner = innerRef.current;
        const track = trackRef.current;
        if (!inner || !track) return;

        const speed = 0.8;

        const loop = () => {
            if (!playingRef.current) return;

            posRef.current -= speed;

            if (posRef.current < -inner.scrollWidth) {
                posRef.current = track.clientWidth;
            }

            inner.style.transform = `translateX(${posRef.current}px)`;
            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
    };

    const togglePlay = (e) => {
        e.stopPropagation();
        isPlaying ? pause() : resume();
    };

    // Fallback message
    const displayList = announcements.length > 0
        ? announcements
        : [t("NoAnnouncements") || "No announcements at this time"];

    const Badge = (
        <div className="flex items-center gap-2 px-5 h-full bg-orange-700 text-white text-sm font-medium whitespace-nowrap flex-shrink-0">
            <Megaphone className="w-4 h-4" />
            <span>{t("Announcements")}</span>
        </div>
    );

    if (loading) {
        return (
            <section className="w-full h-[44px] flex items-center bg-orange-50 border-y border-orange-200 overflow-hidden">
                {Badge}
                <span className="px-5 text-sm font-medium text-orange-700">
                    {t("Loading") || "Loading announcements..."}
                </span>
            </section>
        );
    }

    return (
        <section className="w-full h-[44px] flex items-center bg-orange-50 border-y border-orange-200 overflow-hidden">
            {/* Label */}
            {Badge}

            {/* Scrolling track */}
            <div
                ref={trackRef}
                className="flex-1 overflow-hidden relative h-full"
                onMouseEnter={pause}
                onMouseLeave={resume}
            >
                <div
                    ref={innerRef}
                    className="absolute top-0 left-0 h-full flex items-center whitespace-nowrap text-sm font-medium text-orange-800"
                    style={{ willChange: "transform" }}
                >
                    {displayList.map((text, i) => (
                        <span key={i}>
                            {text}
                            {i < displayList.length - 1 && (
                                <span className="mx-4 text-orange-400">|</span>
                            )}
                        </span>
                    ))}
                </div>
            </div>

            {/* Play / Pause */}
            <button
                onClick={togglePlay}
                className="flex items-center justify-center w-10 h-full flex-shrink-0 border-l border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
                title={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying
                    ? <PauseCircle className="w-5 h-5 text-orange-700" />
                    : <PlayCircle className="w-5 h-5 text-orange-700" />
                }
            </button>
        </section>
    );
};

export default AnnouncementRow;
import { useEffect, useRef, useState } from "react";

const getThumbnailFromUrl = async (url) => {
    // Vimeo
    if (isVimeo(url)) {
        try {
            const res = await fetch(
                `https://vimeo.com/api/oembed.json?url=${url}`
            );
            const data = await res.json();
            return data.thumbnail_url;
        } catch {
            return "/images/video-placeholder.png";
        }
    }

    // YouTube
    const ytId = getYouTubeId(url);
    return ytId
        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        : "/images/video-placeholder.png";
};

const getYouTubeId = (url) => {
    const patterns = [
        /youtube\.com\/watch\?v=([^&]+)/i,
        /youtu\.be\/([^?&]+)/i,
        /youtube\.com\/embed\/([^?&]+)/i,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

const isVimeo = (url) => url.includes("vimeo.com");

export default function VideoCarousel({ videos = [] }) {
    const ref = useRef(null);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let raf;
        const speed = 0.35;

        const autoScroll = () => {
            if (!paused) {
                el.scrollLeft += speed;
                if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
                    el.scrollLeft = 0;
                }
            }
            raf = requestAnimationFrame(autoScroll);
        };

        raf = requestAnimationFrame(autoScroll);
        return () => cancelAnimationFrame(raf);
    }, [paused]);

    return (
        <div
            ref={ref}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="flex gap-4 px-3 py-2 overflow-x-hidden scrollbar-hide"
        >
            {[...videos, ...videos].map((video, i) => (
                <VideoCard key={`${video.id}-${i}`} video={video} />
            ))}
        </div>
    );
}

function VideoCard({ video }) {
    const [thumb, setThumb] = useState(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const thumbnail = await getThumbnailFromUrl(video.url);
            if (mounted) setThumb(thumbnail);
        })();

        return () => (mounted = false);
    }, [video.url]);

    return (
        <div
            onClick={() =>
                window.open(video.url, "_blank", "noopener,noreferrer")
            }
            className="
                min-w-55 max-w-55 md:min-w-75 md:max-w-75
                cursor-pointer
                border border-(--border-color-carousel) rounded-md p-1
                bg-(--bg-color-carousel)
                hover:shadow-md
                transition-all duration-300
            "
        >
            <div className="relative aspect-video rounded overflow-hidden bg-(--bg-color-carousel)">
                {thumb && (
                    <img
                        src={thumb}
                        alt={video.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
            <span className="block mt-2 text-xs md:text-sm text-(--font-color-carousel) line-clamp-2 text-center">
                {video.title}
            </span>
        </div>
    );
}
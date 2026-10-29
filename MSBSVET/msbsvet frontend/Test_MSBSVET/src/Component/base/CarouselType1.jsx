import { useEffect, useRef, useState } from "react";

export default function CarouselType1({ items = [] }) {
    const containerRef = useRef(null);
    const [index, setIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const touchStartX = useRef(0);

    // items visible
    const itemsPerView = 6;
    const total = items.length;

    // infinite logic
    const extendedItems = [...items, ...items, ...items];
    const startIndex = total;

    useEffect(() => {
        setIndex(startIndex);
    }, [total]);

    // auto scroll
    useEffect(() => {
        if (isHovering) return;

        const timer = setInterval(() => {
            setIndex((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isHovering]);

    // infinite reset
    useEffect(() => {
        if (index >= startIndex + total) {
            setTimeout(() => setIndex(startIndex), 500);
        }
        if (index <= 0) {
            setTimeout(() => setIndex(startIndex), 500);
        }
    }, [index]);

    const next = () => setIndex((i) => i + 1);
    const prev = () => setIndex((i) => i - 1);

    // swipe handlers
    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) next();
        if (diff < -50) prev();
    };

    return (
        <div
            className="relative overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* Slider */}
            <div
                ref={containerRef}
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                    transform: `translateX(-${index * (100 / itemsPerView)}%)`,
                }}
            >
                {extendedItems.map((item, i) => (
                    <div
                        key={i}
                        className="min-w-full sm:min-w-[50%] md:min-w-[33.33%] px-2"
                    >
                        <div className="border border-(--border-color-carousel) rounded-md p-1 md:p-3 min-h-20 md:min-h-30 flex items-center justify-center text-center bg-(--bg-color-carousel) font-(--font-color-carousel)">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="h-16 md:h-25 object-contain pr-1 md:pr-3"
                            />
                            <span className={item.className}>
                                {item.text}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {/* Controls */}
            <button
                onClick={prev}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-gray-100 shadow rounded-full p-2 hover:bg-gray-200 text-md md:text-xl"
            >
                ◀
            </button>
            <button
                onClick={next}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-gray-100 shadow rounded-full p-2 hover:bg-gray-200 text-md md:text-xl"
            >
                ▶
            </button>
        </div>
    );
}

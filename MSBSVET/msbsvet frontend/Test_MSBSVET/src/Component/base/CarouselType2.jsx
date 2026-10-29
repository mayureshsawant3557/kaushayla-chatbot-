import { useEffect, useRef, useState } from "react";

export default function CarouselType2({ items = [] }) {
    const trackRef = useRef(null);
    const positionRef = useRef(0);

    // duplicate logos back-to-back
    const itemsList = [...items, ...items];

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        let animationFrame;
        const speed = 0.3; // VERY LOW SPEED (px per frame)

        const animate = () => {
            positionRef.current -= speed;

            if (Math.abs(positionRef.current) >= track.scrollWidth / 2) {
                positionRef.current = 0;
            }

            track.style.transform = `translateX(${positionRef.current}px)`;
            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <div className="overflow-hidden w-full">
            <div
                ref={trackRef}
                className="flex will-change-transform"
            >
                {itemsList.map((item, index) => (
                    <div
                        key={index}
                        className="shrink-0 w-full sm:w-1/2 md:w-1/3 px-2"
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
        </div>
    );
}

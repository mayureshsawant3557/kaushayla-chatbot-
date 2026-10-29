// hooks/useAnimatedCounter.js
import { useState, useEffect } from 'react';

const useAnimatedCounter = (targetValue, duration = 5000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        let animationFrame = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
            const easedProgress = easeOutCubic(percentage);

            setCount(targetValue * easedProgress);

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(targetValue);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [targetValue, duration]);

    return count;
};

export default useAnimatedCounter;
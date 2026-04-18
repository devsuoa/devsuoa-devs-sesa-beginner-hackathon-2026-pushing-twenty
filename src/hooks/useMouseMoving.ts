import { useState, useEffect } from "react";

/**
 * Returns true while the mouse is moving, false after it's been
 * idle for `idleMs` milliseconds (default 1000ms).
 */
export function useMouseMoving(idleMs = 1000) {
    const [isMoving, setIsMoving] = useState(false);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        const handleMove = () => {
            setIsMoving(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => setIsMoving(false), idleMs);
        };

        window.addEventListener("mousemove", handleMove);
        return () => {
            window.removeEventListener("mousemove", handleMove);
            clearTimeout(timeout);
        };
    }, [idleMs]);

    return isMoving;
}

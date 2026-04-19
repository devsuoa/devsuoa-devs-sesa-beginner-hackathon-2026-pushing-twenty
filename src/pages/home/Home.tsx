import styles from "./Home.module.css";
import { useState, useEffect, useRef } from "react";
import LevelComponent from "../../components/LevelComponent";
import { main } from "./js/main.js";
import { useMouseMoving } from "../../hooks/useMouseMoving.js";

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const zoomOutRef = useRef<(() => void) | null>(null);
    const getLevelRef = useRef<(() => number) | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [mountKey, setMountKey] = useState(0);
    const isMouseMoving = useMouseMoving(2500);
    const hideUI = isMouseMoving || isVisible;

    const handleOpen = () => {
        setMountKey(k => k + 1);
        setIsVisible(true);
    };

    const handleClose = () => {
        setIsVisible(false);
        zoomOutRef.current?.();
    };

    useEffect(() => {
        if (!canvasRef.current) return;
        const { zoomOut, getLevel } = main(canvasRef.current, handleOpen);
        zoomOutRef.current = zoomOut;
        getLevelRef.current = getLevel;
    }, []);

    return (
        <div>
            <header style={{
                transition: "opacity 0.4s ease",
                opacity: hideUI ? 0 : 1,
                pointerEvents: hideUI ? "none" : "auto",
            }}
            >
                <div className={styles["header-brand"]}>
                    <img src="/logo.png" alt="" />
                </div>
            </header>
            <section className="relative w-full h-screen">
               <div
  className="absolute top-1/2 left-1/2 w-[90vw] z-50"
  style={{
    maxHeight: isVisible ? "100vh" : "0",
    overflow: "hidden",
    transition: "max-height 0.3s ease",
    transform: "translate(calc(-50% - 40px), -50%)",
  }}
>
                    <LevelComponent
                    key={mountKey}
                    onClose={() => handleClose()}
                    selectedLevel={getLevelRef.current ? getLevelRef.current() : 1}
                    />
                </div>
                <canvas ref={canvasRef} className={styles.solarsystem}></canvas>
            </section>
        </div>
    );
}

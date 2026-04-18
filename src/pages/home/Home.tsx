import styles from "./Home.module.css";
import { useState, useEffect, useRef } from "react";
import LevelComponent from "../../components/LevelComponent";
import { main } from "./solarsystem.js";

export default function Home() {
    const lvlNum = 4;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const zoomOutRef = useRef<(() => void) | null>(null);

    const [isVisible, setIsVisible] = useState(false);
    const [mountKey, setMountKey] = useState(0);

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
        const { zoomOut } = main(canvasRef.current, handleOpen);
        zoomOutRef.current = zoomOut;
    }, []);

    return (
        <div>
            <section className="relative w-full h-screen">
                {isVisible && (

                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] z-50">
                        <LevelComponent
                        key={mountKey}
                        onClose={() => handleClose()}
                        lvl={lvlNum}
                        />
                    </div>

                )}
                <canvas ref={canvasRef} className={styles.solarsystem}></canvas>
            </section>
        </div>
    );
}

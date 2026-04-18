import styles from "./Home.module.css";
import {useState, useEffect, useRef} from "react";
import LevelComponent from "../../components/LevelComponent";
import { main } from "./solarsystem.js";

export default function Home() {
    const lvlNum = 4;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        
        if (!canvasRef.current) return;
        
        main(canvasRef.current);
        }, []);

    const [isVisible, setIsVisible] = useState(false);
    const [mountKey, setMountKey] = useState(0);

    const handleOpen = () => {
        setMountKey(k => k + 1);
        setIsVisible(true);
    };

    return (
        <div>
            <header>
                <div className={styles["header-brand"]}>
                    <h1>glorpython</h1>
                </div>
            </header>
            <button className="ml-5 mt-5 absolute border-4 rounded-3xl p-5" onClick={handleOpen} disabled={isVisible}>
                Glorp
            </button>
            <section className="">
                {isVisible && (
                    <LevelComponent
                    key={mountKey}
                    onClose={() => setIsVisible(false)}
                    lvl={lvlNum}
                    />
                )}
                <canvas ref={canvasRef} className={styles.solarsystem}></canvas>
            </section>
        </div>
    );
}

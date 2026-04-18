import { useEffect, useRef } from "react";
import { main } from "./solarsystem.js";
import styles from "./Home.module.css";

function Home() {
    
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        
        if (!canvasRef.current) return;
        
        main(canvasRef.current);

    }, []);

    return (
        <>
            <header>
                <div className={styles["header-brand"]}>
                    <h1>Glorpython</h1>
                </div>
            </header>
            <canvas ref={canvasRef} className={styles.solarsystem}></canvas>
        </>
    );
}

export default Home;
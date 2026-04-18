import styles from "./Home.module.css";
import {useState} from "react";
import LevelComponent from "../../components/LevelComponent";
// The home page of the application.


function Home() {
    const lvlNum = 4;
    return (
        <div>
            <LevelComponent lvl={lvlNum} />
        </div>
        
    );
}

export default Home;
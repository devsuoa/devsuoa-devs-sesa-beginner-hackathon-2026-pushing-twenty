import styles from "./Home.module.css";
import {useState} from "react";
import LevelComponent from "../../components/LevelComponent";
// The home page of the application.


function Home() {

    return (
        <div>
            <LevelComponent />
        </div>
        
    );
}

export default Home;
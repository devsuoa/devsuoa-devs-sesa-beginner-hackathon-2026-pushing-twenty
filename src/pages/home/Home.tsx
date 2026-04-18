import styles from "./Home.module.css";
import {useState} from "react";
import LevelComponent from "../../components/LevelComponent";
// The home page of the application.


export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [mountKey, setMountKey] = useState(0);

  const handleToggle = () => {
    if (!isVisible) setMountKey(k => k + 1);
    setIsVisible(v => !v);
  };

  return (
    <div>
      <button onClick={handleToggle}>
        {isVisible ? 'Hide' : 'Show'} Component
      </button>

      {isVisible && <LevelComponent key={mountKey} />}
    </div>
  );
}
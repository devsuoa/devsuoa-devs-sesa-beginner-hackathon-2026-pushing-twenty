import styles from "./Home.module.css";
import {useState} from "react";
import LevelComponent from "../../components/LevelComponent";
// The home page of the application.


export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [mountKey, setMountKey] = useState(0);

  const handleOpen = () => {
    setMountKey(k => k + 1);
    setIsVisible(true);
  };

  return (
    <div>
      <button className="ml-100 mt-80 absolute border-4 rounded-3xl p-5" onClick={handleOpen} disabled={isVisible}>
        Glorp
      </button>

      {isVisible && (
        <LevelComponent
          key={mountKey}
          onClose={() => setIsVisible(false)}
        />
      )}
    </div>
  );
}
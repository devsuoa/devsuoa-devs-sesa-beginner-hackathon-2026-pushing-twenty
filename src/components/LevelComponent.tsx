import React, { useState, useEffect, useRef, useMemo } from "react";
import OutputComponent from './OutputComponent'
import InfoComponent from './InfoComponent'

interface LevelProps {
  onClose: () => void;
  lvl: number;
}

export default function LevelComponent({ onClose, lvl }: LevelProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => setIsClosing(true);

  const handleAnimationEnd = () => {
    if (isClosing) onClose();
  };
  const seed = lvl*71 - 10;
  return (
    <div className="flex items-center justify-center min-h-screen w-full container">
      <style>{`
        @keyframes expandDown {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes collapseUp {
          from { transform: scaleY(1); }
          to   { transform: scaleY(0); }
        }
        .expand-down {
          animation: expandDown 0.2s ease-out forwards;
          transform-origin: center;
        }
        .collapse-up {
          animation: collapseUp 0.2s ease-in forwards;
          transform-origin: center;
        }
        .container {
          position: absolute;
          z-index: 1000;
          margin: 0px;
        }
      `}</style>
      <div
        className={`${isClosing ? 'collapse-up' : 'expand-down'} w-4/5 h-screen flex gap-10 p-4 font-mono overflow-hidden`}
        onAnimationEnd={handleAnimationEnd}
      >
        {/* X button */}
        <button
          onClick={handleClose}
          className="absolute top-9 right-10 text-white text-xl leading-none"
        >
          ✕
        </button>

        <InfoComponent seed={seed}/>
        <OutputComponent seed={seed} />
      </div>
    </div>
  );
}
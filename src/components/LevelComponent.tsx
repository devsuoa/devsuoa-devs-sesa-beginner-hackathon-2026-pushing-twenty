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
    <>
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
      `}</style>
      <div
        className={`${isClosing ? 'collapse-up' : 'expand-down'} w-screen h-screen flex gap-10 p-4 font-mono overflow-hidden`}
        onAnimationEnd={handleAnimationEnd}
      >
        {/* X button */}
        <button
          onClick={handleClose}
          className="absolute top-9 right-38 text-white text-xl leading-none"
        >
          ✕
        </button>

        <div className="flex-1 bg-[#2a2a2a] rounded-2xl p-3 flex flex-col gap-3">
          <InfoComponent seed={seed}/>
        </div>
        <div className="flex-1 bg-[#2a2a2a] rounded-2xl p-3 flex flex-col gap-3">
          <OutputComponent seed={seed} />
        </div>
      </div>
    </>
  );
}
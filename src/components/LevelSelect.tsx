const LEVELS = [
  { id: 1, image: "1.png" },
  { id: 2, image: "2.png" },
  { id: 3, image: "3.png" },
];

interface LevelSelectProps {
  active: number;
  onSelect: (level: number) => void;
}

export default function LevelSelect({ active, onSelect }: LevelSelectProps) {
  return (
    <div className="flex flex-col gap-4 justify-center self-stretch">
      {LEVELS.map(({ id, image }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            disabled={isActive}
            style={{
              backgroundColor: isActive ? "#3A3A3A" : "#5E5E5E",
              boxShadow: isActive ? "0 6px 0 #1A1A1A" : "0 6px 0 #2E2E2E",
              cursor: isActive ? "default" : "pointer",
            }}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 ${!isActive && "hover:brightness-110 active:brightness-90"}`}
          >
            <img src={`/${image}`} alt={`Level ${id}`} className="h-12 w-12 object-contain" />
          </button>
        );
      })}
    </div>
  );
}

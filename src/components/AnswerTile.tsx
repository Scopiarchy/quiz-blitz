interface AnswerTileProps {
  index: number;
  answer: string;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  showResult?: boolean;
  isCorrect?: boolean;
  compact?: boolean;
}

const tileColors = [
  "answer-red",
  "answer-blue",
  "answer-yellow",
  "answer-green",
];

const tileIcons = ["▲", "◆", "●", "■"];

export function AnswerTile({
  index,
  answer,
  onClick,
  disabled = false,
  selected = false,
  showResult = false,
  isCorrect = false,
  compact = false,
}: AnswerTileProps) {
  const colorClass = tileColors[index % 4];
  const icon = tileIcons[index % 4];

  let stateClass = "";
  if (showResult) {
    stateClass = isCorrect ? "ring-4 ring-white animate-pulse" : "opacity-50";
  } else if (selected) {
    stateClass = "ring-4 ring-white scale-95";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`answer-tile ${colorClass} ${stateClass} ${
        disabled ? "cursor-not-allowed" : ""
      } ${compact ? "min-h-[60px] py-3 px-4" : ""}`}
    >
      <span className={`${compact ? "mr-2 text-lg" : "mr-3 text-2xl"}`}>{icon}</span>
      <span className={`${compact ? "text-sm md:text-base" : "text-lg md:text-xl"} font-bold line-clamp-2`}>{answer}</span>
    </button>
  );
}
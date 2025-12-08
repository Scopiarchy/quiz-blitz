interface AnswerTileProps {
  index: number;
  answer: string;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  showResult?: boolean;
  isCorrect?: boolean;
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
      }`}
    >
      <span className="mr-3 text-2xl">{icon}</span>
      <span className="text-lg md:text-xl font-bold">{answer}</span>
    </button>
  );
}
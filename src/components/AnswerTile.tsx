import { motion } from "framer-motion";

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
    stateClass = isCorrect 
      ? "ring-4 ring-white/90 shadow-glow-correct" 
      : "opacity-40 grayscale";
  } else if (selected) {
    stateClass = "ring-4 ring-white/80 scale-[0.97]";
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      whileHover={!disabled ? { 
        scale: 1.03, 
        y: -4,
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      className={`answer-tile ${colorClass} ${stateClass} ${
        disabled ? "cursor-not-allowed" : ""
      } ${compact ? "min-h-[60px] py-3 px-4" : ""}`}
    >
      <motion.span 
        className={`${compact ? "mr-2 text-lg" : "mr-3 text-2xl"} opacity-80`}
        animate={showResult && isCorrect ? { 
          rotate: [0, -10, 10, -10, 0],
          scale: [1, 1.2, 1]
        } : undefined}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.span>
      <span className={`${compact ? "text-sm md:text-base" : "text-lg md:text-xl"} font-bold line-clamp-2`}>
        {answer}
      </span>
      
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
      </div>
      
      {/* Correct answer glow effect */}
      {showResult && isCorrect && (
        <motion.div 
          className="absolute inset-0 rounded-2xl bg-white/20"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
import { Trophy, Medal, Award, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface Player {
  id: string;
  nickname: string;
  score: number;
}

interface LeaderboardProps {
  players: Player[];
  limit?: number;
}

export function Leaderboard({ players, limit }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const displayPlayers = limit ? sortedPlayers.slice(0, limit) : sortedPlayers;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return (
          <div className="relative">
            <Crown className="w-6 h-6 text-yellow-400 absolute -top-3 left-1/2 -translate-x-1/2 rotate-12" />
            <Trophy className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
          </div>
        );
      case 1:
        return <Medal className="w-6 h-6 text-slate-300 drop-shadow-[0_0_6px_rgba(203,213,225,0.4)]" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground bg-muted/50 rounded-full">
            {rank + 1}
          </span>
        );
    }
  };

  const getRankStyles = (rank: number) => {
    switch (rank) {
      case 0:
        return {
          bg: "bg-gradient-to-r from-yellow-500/25 via-amber-500/20 to-yellow-600/25",
          border: "border-yellow-500/60",
          glow: "shadow-[0_0_20px_rgba(250,204,21,0.2)]",
          score: "text-yellow-400"
        };
      case 1:
        return {
          bg: "bg-gradient-to-r from-slate-400/20 via-slate-300/15 to-slate-400/20",
          border: "border-slate-400/50",
          glow: "shadow-[0_0_15px_rgba(148,163,184,0.15)]",
          score: "text-slate-300"
        };
      case 2:
        return {
          bg: "bg-gradient-to-r from-amber-600/20 via-amber-500/15 to-amber-600/20",
          border: "border-amber-500/50",
          glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
          score: "text-amber-500"
        };
      default:
        return {
          bg: "bg-card/60 backdrop-blur-sm",
          border: "border-border/50",
          glow: "",
          score: "text-primary"
        };
    }
  };

  return (
    <div className="space-y-3 w-full max-w-md mx-auto">
      {displayPlayers.map((player, index) => {
        const styles = getRankStyles(index);
        return (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            whileHover={{ scale: 1.02, x: 4 }}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${styles.bg} ${styles.border} ${styles.glow}`}
          >
            <div className="flex items-center justify-center w-10 h-10">
              {getRankIcon(index)}
            </div>
            <div className="flex-1 font-bold text-lg truncate text-foreground">
              {player.nickname}
            </div>
            <motion.div 
              className={`text-xl font-black ${styles.score}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 300 }}
            >
              {player.score.toLocaleString()}
            </motion.div>
          </motion.div>
        );
      })}
      
      {displayPlayers.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No players yet
        </div>
      )}
    </div>
  );
}
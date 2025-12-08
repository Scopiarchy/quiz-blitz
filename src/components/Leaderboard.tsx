import { Trophy, Medal, Award } from "lucide-react";

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
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 text-center font-bold text-muted-foreground">{rank + 1}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 0:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50";
      case 1:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
      case 2:
        return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50";
      default:
        return "bg-card/50 border-border";
    }
  };

  return (
    <div className="space-y-3 w-full max-w-md mx-auto">
      {displayPlayers.map((player, index) => (
        <div
          key={player.id}
          className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 animate-slide-up ${getRankColor(
            index
          )}`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-center w-10">
            {getRankIcon(index)}
          </div>
          <div className="flex-1 font-bold text-lg truncate">
            {player.nickname}
          </div>
          <div className="text-xl font-black text-primary">
            {player.score.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Player {
  id: string;
  nickname: string;
  score: number;
  avatar_url?: string;
}

interface GameState {
  phase: "lobby" | "question" | "results" | "finished";
  currentQuestionIndex: number;
  timeRemaining: number;
}

export function useGameRealtime(sessionId: string, isHost: boolean = false) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    phase: "lobby",
    currentQuestionIndex: 0,
    timeRemaining: 0,
  });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const gameChannel = supabase.channel(`game:${sessionId}`);

    gameChannel
      .on("broadcast", { event: "player_join" }, ({ payload }) => {
        setPlayers((prev) => [...prev.filter(p => p.id !== payload.id), payload]);
      })
      .on("broadcast", { event: "player_leave" }, ({ payload }) => {
        setPlayers((prev) => prev.filter((p) => p.id !== payload.id));
      })
      .on("broadcast", { event: "timer_update" }, ({ payload }) => {
        setGameState((prev) => ({ ...prev, timeRemaining: payload.timeRemaining }));
      })
      .on("broadcast", { event: "phase_change" }, ({ payload }) => {
        setGameState((prev) => ({
          ...prev,
          phase: payload.phase,
          currentQuestionIndex: payload.currentQuestionIndex ?? prev.currentQuestionIndex,
        }));
      })
      .on("broadcast", { event: "leaderboard_update" }, ({ payload }) => {
        setPlayers(payload.players);
      })
      .subscribe();

    setChannel(gameChannel);

    // Fetch existing players from database
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("session_id", sessionId)
        .order("score", { ascending: false });
      
      if (data) {
        setPlayers(data.map(p => ({ id: p.id, nickname: p.nickname, score: p.score || 0, avatar_url: p.avatar_url || undefined })));
      }
    };

    fetchPlayers();

    // Subscribe to database changes for players
    const playersSubscription = supabase
      .channel(`players:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          fetchPlayers();
        }
      )
      .subscribe();

    return () => {
      gameChannel.unsubscribe();
      playersSubscription.unsubscribe();
    };
  }, [sessionId]);

  const broadcastPlayerJoin = useCallback(
    (player: Player) => {
      channel?.send({
        type: "broadcast",
        event: "player_join",
        payload: player,
      });
    },
    [channel]
  );

  const broadcastPlayerLeave = useCallback(
    (playerId: string) => {
      channel?.send({
        type: "broadcast",
        event: "player_leave",
        payload: { id: playerId },
      });
    },
    [channel]
  );

  const broadcastTimerUpdate = useCallback(
    (timeRemaining: number) => {
      channel?.send({
        type: "broadcast",
        event: "timer_update",
        payload: { timeRemaining },
      });
    },
    [channel]
  );

  const broadcastPhaseChange = useCallback(
    (phase: GameState["phase"], currentQuestionIndex?: number) => {
      channel?.send({
        type: "broadcast",
        event: "phase_change",
        payload: { phase, currentQuestionIndex },
      });
    },
    [channel]
  );

  const broadcastLeaderboard = useCallback(
    (sortedPlayers: Player[]) => {
      channel?.send({
        type: "broadcast",
        event: "leaderboard_update",
        payload: { players: sortedPlayers },
      });
    },
    [channel]
  );

  return {
    players,
    gameState,
    broadcastPlayerJoin,
    broadcastPlayerLeave,
    broadcastTimerUpdate,
    broadcastPhaseChange,
    broadcastLeaderboard,
  };
}
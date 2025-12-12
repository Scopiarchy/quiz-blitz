import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGameRealtime } from "@/hooks/useGameRealtime";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnswerTile } from "@/components/AnswerTile";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Leaderboard } from "@/components/Leaderboard";
import { Confetti } from "@/components/Confetti";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { toast } from "sonner";
import { Play, Users, Trophy, SkipForward } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  answers: string[];
  correct_answer_index: number;
  time_limit: number;
}

export default function HostGame() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [phase, setPhase] = useState<"lobby" | "question" | "results" | "finished">("lobby");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    players,
    broadcastPhaseChange,
    broadcastTimerUpdate,
    broadcastLeaderboard,
  } = useGameRealtime(sessionId!, true);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    const { data: sessionData } = await supabase
      .from("game_sessions")
      .select("*, quizzes(*)")
      .eq("id", sessionId)
      .single();

    if (!sessionData) {
      toast.error("Game not found");
      navigate("/");
      return;
    }

    setSession(sessionData);

    const { data: questionsData } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", sessionData.quiz_id)
      .order("order_index");

    if (questionsData) {
      setQuestions(questionsData.map(q => ({
        ...q,
        answers: q.answers as string[]
      })));
    }
  };

  const startGame = async () => {
    await supabase
      .from("game_sessions")
      .update({ status: "playing", started_at: new Date().toISOString() })
      .eq("id", sessionId);

    setPhase("question");
    setCurrentQuestionIndex(0);
    broadcastPhaseChange("question", 0);
    startTimer(questions[0].time_limit);
  };

  const startTimer = useCallback((seconds: number) => {
    setTimeRemaining(seconds);
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1;
        broadcastTimerUpdate(next);
        if (next <= 0) {
          clearInterval(interval);
          showResults();
        }
        return next;
      });
    }, 1000);
  }, [broadcastTimerUpdate]);

  const showResults = async () => {
    setPhase("results");
    broadcastPhaseChange("results");

    // Calculate scores
    const currentQuestion = questions[currentQuestionIndex];
    const { data: answers } = await supabase
      .from("answers")
      .select("*")
      .eq("session_id", sessionId)
      .eq("question_id", currentQuestion.id);

    if (answers) {
      for (const answer of answers) {
        if (answer.is_correct) {
          // First fetch the current player score from DB to avoid stale state
          const { data: playerData } = await supabase
            .from("players")
            .select("score")
            .eq("id", answer.player_id)
            .single();
          
          const currentScore = playerData?.score || 0;
          const points = 1000 - (answer.time_taken || 0) * 10;
          const pointsToAdd = Math.max(100, points);
          
          await supabase
            .from("players")
            .update({ score: currentScore + pointsToAdd })
            .eq("id", answer.player_id);
        }
      }
    }

    // Fetch updated leaderboard
    const { data: updatedPlayers } = await supabase
      .from("players")
      .select("*")
      .eq("session_id", sessionId)
      .order("score", { ascending: false });

    if (updatedPlayers) {
      broadcastLeaderboard(updatedPlayers.map(p => ({ id: p.id, nickname: p.nickname, score: p.score || 0 })));
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setPhase("question");
      broadcastPhaseChange("question", nextIndex);
      startTimer(questions[nextIndex].time_limit);
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    setPhase("finished");
    setShowConfetti(true);
    broadcastPhaseChange("finished");

    await supabase
      .from("game_sessions")
      .update({ status: "finished", ended_at: new Date().toISOString() })
      .eq("id", sessionId);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Confetti show={showConfetti} />

      {phase === "lobby" && (
        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="text-3xl md:text-4xl font-black text-center glow-text text-primary">Game Lobby</h1>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* QR Code and PIN */}
            {session && <QRCodeDisplay pin={session.pin} />}

            {/* Players */}
            <Card className="p-6 bg-gradient-to-br from-card to-card/80 border-border/50 flex flex-col h-full">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-xl font-bold">{players.length} players joined</span>
              </div>
              
              <div className="flex-1 min-h-[120px] mb-6">
                {players.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground animate-pulse">Waiting for players...</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2 content-start">
                    {players.map((player, i) => (
                      <span 
                        key={player.id} 
                        className="px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full font-medium border border-primary/30 animate-slide-up"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        {player.nickname}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <Button 
                onClick={startGame} 
                size="xl" 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30" 
                disabled={players.length === 0}
              >
                <Play className="w-6 h-6 mr-2" />
                Start Game
              </Button>
            </Card>
          </div>
        </div>
      )}

      {phase === "question" && currentQuestion && (
        <div className="max-w-4xl mx-auto space-y-8">
          <CountdownTimer seconds={timeRemaining} maxSeconds={currentQuestion.time_limit} musicEnabled={false} />
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
            <h2 className="text-2xl md:text-4xl font-bold">{currentQuestion.question_text}</h2>
          </Card>
          <div className="grid md:grid-cols-2 gap-4">
            {currentQuestion.answers.map((answer, index) => (
              <AnswerTile key={index} index={index} answer={answer} disabled />
            ))}
          </div>
        </div>
      )}

      {phase === "results" && currentQuestion && (
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <h2 className="text-3xl font-bold">Results</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {currentQuestion.answers.map((answer, index) => (
              <AnswerTile
                key={index}
                index={index}
                answer={answer}
                showResult
                isCorrect={index === currentQuestion.correct_answer_index}
                disabled
              />
            ))}
          </div>
          <Leaderboard players={players} limit={5} />
          <Button onClick={nextQuestion} size="xl">
            <SkipForward className="w-6 h-6 mr-2" />
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Final Results"}
          </Button>
        </div>
      )}

      {phase === "finished" && (
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <Trophy className="w-24 h-24 mx-auto text-accent animate-bounce" />
          <h1 className="text-4xl md:text-6xl font-black">Game Over!</h1>
          {players.length > 0 && (
            <div className="text-2xl font-bold text-primary">
              🏆 Winner: {players.sort((a, b) => b.score - a.score)[0]?.nickname}
            </div>
          )}
          <Leaderboard players={players} />
          <Button onClick={() => navigate("/create")} size="lg">Back to Creator</Button>
        </div>
      )}
    </div>
  );
}
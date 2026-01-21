import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useGameRealtime } from "@/hooks/useGameRealtime";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { Card } from "@/components/ui/card";
import { AnswerTile } from "@/components/AnswerTile";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Leaderboard } from "@/components/Leaderboard";
import { Confetti } from "@/components/Confetti";
import { toast } from "sonner";
import { Clock, Trophy, CheckCircle, XCircle, Zap } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  answers: string[];
  correct_answer_index: number;
  time_limit: number;
}

export default function PlayGame() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const playerId = searchParams.get("playerId");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [musicEnabled, setMusicEnabled] = useState(true);

  const { players, gameState } = useGameRealtime(sessionId!);
  const currentPlayer = players.find((p) => p.id === playerId);
  const { playCorrectSound, playWrongSound } = useSoundEffects();

  useEffect(() => {
    loadQuestions();
  }, [sessionId]);

  useEffect(() => {
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setLastAnswerCorrect(null);
    setQuestionStartTime(Date.now());
  }, [gameState.currentQuestionIndex, gameState.phase]);

  const loadQuestions = async () => {
    const { data: session } = await supabase
      .from("game_sessions")
      .select("quiz_id")
      .eq("id", sessionId)
      .single();

    if (session) {
      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", session.quiz_id)
        .order("order_index");

      if (data) {
        setQuestions(data.map(q => ({ ...q, answers: q.answers as string[] })));
      }

      // Load music setting
      const { data: settings } = await supabase
        .from("quiz_settings")
        .select("music_enabled")
        .eq("quiz_id", session.quiz_id)
        .maybeSingle();

      if (settings) {
        setMusicEnabled(settings.music_enabled);
      }
    }
  };

  const submitAnswer = async (answerIndex: number) => {
    if (answerSubmitted || gameState.phase !== "question") return;

    setSelectedAnswer(answerIndex);
    setAnswerSubmitted(true);

    const currentQuestion = questions[gameState.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correct_answer_index;
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

    setLastAnswerCorrect(isCorrect);

    // Play sound effect if enabled
    if (musicEnabled) {
      if (isCorrect) {
        playCorrectSound();
      } else {
        playWrongSound();
      }
    }

    try {
      const { error: insertError } = await supabase.from("answers").insert({
        player_id: playerId,
        question_id: currentQuestion.id,
        session_id: sessionId,
        answer_index: answerIndex,
        is_correct: isCorrect,
        time_taken: timeTaken,
      });

      if (insertError) {
        console.error("Error inserting answer:", insertError);
      } else if (isCorrect && playerId) {
        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .select("score")
          .eq("id", playerId)
          .single();

        if (playerError) {
          console.error("Error fetching player score:", playerError);
        } else {
          const currentScore = playerData?.score || 0;
          const points = 1000 - timeTaken * 10;
          const pointsToAdd = Math.max(100, points);

          const { error: updateError } = await supabase
            .from("players")
            .update({ score: currentScore + pointsToAdd })
            .eq("id", playerId);

          if (updateError) {
            console.error("Error updating player score:", updateError);
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error submitting answer:", error);
    }

    toast(isCorrect ? "Correct! 🎉" : "Wrong answer", {
      icon: isCorrect ? <CheckCircle className="text-primary" /> : <XCircle className="text-destructive" />,
    });
  };

  const currentQuestion = questions[gameState.currentQuestionIndex];

  return (
    <div className="min-h-screen p-4 flex flex-col bg-background relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-[100px] animate-float" />
        <div 
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-secondary/15 to-primary/10 rounded-full blur-[120px] animate-float" 
          style={{ animationDelay: "2s" }} 
        />
      </div>

      <Confetti show={gameState.phase === "finished"} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/50 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground">{currentPlayer?.nickname}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="text-primary font-bold text-lg">{currentPlayer?.score || 0}</span>
        </div>
      </div>

      {gameState.phase === "lobby" && (
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md bg-card/80 backdrop-blur-md border border-border/50 shadow-soft-lg">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow animate-pulse-glow">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Waiting for host...</h2>
            <p className="text-muted-foreground">Get ready! The game will start soon.</p>
          </Card>
        </div>
      )}

      {gameState.phase === "question" && currentQuestion && (
        <div className="relative z-10 flex-1 flex flex-col gap-4">
          <CountdownTimer seconds={gameState.timeRemaining} maxSeconds={currentQuestion.time_limit} musicEnabled={musicEnabled} />

          {/* Question text for player */}
          <Card className="p-5 text-center bg-card/80 backdrop-blur-md border border-border/50 shadow-soft">
            <p className="text-sm text-muted-foreground mb-2">
              Question {gameState.currentQuestionIndex + 1} of {questions.length}
            </p>
            <h2 className="text-lg md:text-xl font-bold text-foreground">{currentQuestion.question_text}</h2>
          </Card>

          {answerSubmitted ? (
            <Card className="flex-1 flex items-center justify-center p-6 min-h-[200px] bg-card/80 backdrop-blur-md border border-border/50 shadow-soft-lg">
              <div className="text-center animate-bounce-in">
                {lastAnswerCorrect ? (
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-lg">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                ) : (
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center shadow-soft-lg">
                    <XCircle className="w-12 h-12 text-white" />
                  </div>
                )}
                <p className="text-2xl font-bold text-foreground">
                  {lastAnswerCorrect ? "Correct! 🎉" : "Wrong!"}
                </p>
                <p className="text-muted-foreground text-sm mt-2">Waiting for results...</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3 flex-1">
              {currentQuestion.answers.map((answer, index) => (
                <AnswerTile
                  key={index}
                  index={index}
                  answer={answer}
                  onClick={() => submitAnswer(index)}
                  disabled={answerSubmitted || gameState.timeRemaining <= 0}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      )}

      {gameState.phase === "results" && (
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <Card className="p-8 text-center w-full max-w-md bg-card/80 backdrop-blur-md border border-border/50 shadow-soft-lg">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-glow-secondary">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Leaderboard</h2>
            <Leaderboard players={players} limit={5} />
          </Card>
        </div>
      )}

      {gameState.phase === "finished" && (
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 p-8 rounded-3xl bg-card/80 backdrop-blur-md border border-border/50 shadow-soft-lg max-w-lg w-full">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-glow-lg animate-pulse-glow">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gradient">Game Over!</h1>
            <p className="text-2xl text-foreground">
              Your Score: <span className="text-gradient font-bold">{currentPlayer?.score || 0}</span>
            </p>
            <div className="pt-4 border-t border-border/50">
              <Leaderboard players={players} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
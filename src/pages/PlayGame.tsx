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
import { Clock, Trophy, CheckCircle, XCircle } from "lucide-react";

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

    await supabase.from("answers").insert({
      player_id: playerId,
      question_id: currentQuestion.id,
      session_id: sessionId,
      answer_index: answerIndex,
      is_correct: isCorrect,
      time_taken: timeTaken,
    });

    toast(isCorrect ? "Correct! 🎉" : "Wrong answer", {
      icon: isCorrect ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />,
    });
  };

  const currentQuestion = questions[gameState.currentQuestionIndex];

  return (
    <div className="min-h-screen p-4 flex flex-col">
      <Confetti show={gameState.phase === "finished"} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-lg">{currentPlayer?.nickname}</div>
        <div className="flex items-center gap-2 text-primary font-bold">
          <Trophy className="w-5 h-5" />
          {currentPlayer?.score || 0}
        </div>
      </div>

      {gameState.phase === "lobby" && (
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <Clock className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Waiting for host...</h2>
            <p className="text-muted-foreground">Get ready! The game will start soon.</p>
          </Card>
        </div>
      )}

      {gameState.phase === "question" && currentQuestion && (
        <div className="flex-1 flex flex-col gap-4">
          <CountdownTimer seconds={gameState.timeRemaining} maxSeconds={currentQuestion.time_limit} />

          {answerSubmitted ? (
            <Card className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                {lastAnswerCorrect ? (
                  <CheckCircle className="w-24 h-24 mx-auto text-green-500 mb-4" />
                ) : (
                  <XCircle className="w-24 h-24 mx-auto text-red-500 mb-4" />
                )}
                <p className="text-2xl font-bold">
                  {lastAnswerCorrect ? "Correct!" : "Wrong!"}
                </p>
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
                />
              ))}
            </div>
          )}
        </div>
      )}

      {gameState.phase === "results" && (
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
            <Leaderboard players={players} limit={5} />
          </Card>
        </div>
      )}

      {gameState.phase === "finished" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <Trophy className="w-24 h-24 mx-auto text-accent" />
            <h1 className="text-4xl font-black">Game Over!</h1>
            <p className="text-2xl">Your Score: <span className="text-primary font-bold">{currentPlayer?.score || 0}</span></p>
            <Leaderboard players={players} />
          </div>
        </div>
      )}
    </div>
  );
}
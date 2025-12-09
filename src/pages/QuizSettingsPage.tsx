import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { QuizSettings } from "@/components/QuizSettings";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Users, Gamepad2 } from "lucide-react";

export default function QuizSettingsPage() {
  const { quizId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && quizId) {
      loadQuiz();
    }
  }, [user, quizId]);

  const loadQuiz = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .eq("user_id", user?.id)
      .single();

    if (error || !data) {
      toast.error("Quiz not found");
      navigate("/create");
      return;
    }

    setQuiz(data);

    // Check for existing active session
    const { data: existingSession } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("quiz_id", quizId)
      .eq("host_id", user?.id)
      .eq("status", "lobby")
      .maybeSingle();

    if (existingSession) {
      setSession(existingSession);
    } else {
      // Create new session with PIN
      await createSession();
    }

    setLoading(false);
  };

  const createSession = async () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    const { data, error } = await supabase
      .from("game_sessions")
      .insert({
        quiz_id: quizId,
        host_id: user?.id,
        pin,
        status: "lobby",
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create game session");
      return;
    }

    setSession(data);
    toast.success("Game session created!");
  };

  const regeneratePin = async () => {
    if (!session) return;

    const newPin = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await supabase
      .from("game_sessions")
      .update({ pin: newPin })
      .eq("id", session.id);

    if (error) {
      toast.error("Failed to regenerate PIN");
      return;
    }

    setSession({ ...session, pin: newPin });
    toast.success("PIN regenerated!");
  };

  const startGame = () => {
    if (session) {
      navigate(`/host/${session.id}`);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Link to="/create">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Creator
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-primary" />
              {quiz?.title || "Quiz Settings"}
            </h1>
            {quiz?.description && (
              <p className="text-muted-foreground mt-1">{quiz.description}</p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Settings Panel */}
          <QuizSettings
            quizId={quizId!}
            onStartGame={startGame}
            disabled={!session}
          />

          {/* QR Code Panel */}
          <div className="space-y-6">
            {session && (
              <QRCodeDisplay
                pin={session.pin}
                onRegeneratePin={regeneratePin}
                showRegenerateButton
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5" />
                  Waiting Room
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Players will appear here when they join using the PIN or QR code above.
                </p>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg text-center">
                  <span className="text-muted-foreground">No players yet</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

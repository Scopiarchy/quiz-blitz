import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QuizSettings } from "@/components/QuizSettings";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Save,
  Play,
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  Settings2,
} from "lucide-react";

interface Question {
  id?: string;
  question_text: string;
  answers: string[];
  correct_answer_index: number;
  time_limit: number;
  order_index: number;
}

interface Quiz {
  id?: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function CreateQuiz() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz>({
    title: "",
    description: "",
    questions: [createEmptyQuestion(0)],
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedQuizzes, setSavedQuizzes] = useState<{ id: string; title: string }[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadSavedQuizzes();
    }
  }, [user]);

  function createEmptyQuestion(orderIndex: number): Question {
    return {
      question_text: "",
      answers: ["", "", "", ""],
      correct_answer_index: 0,
      time_limit: 20,
      order_index: orderIndex,
    };
  }

  const loadSavedQuizzes = async () => {
    const { data } = await supabase
      .from("quizzes")
      .select("id, title")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (data) {
      setSavedQuizzes(data);
    }
  };

  const loadQuiz = async (quizId: string) => {
    const { data: quizData } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizData) {
      const { data: questionsData } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order_index");

      if (questionsData) {
        setQuiz({
          id: quizData.id,
          title: quizData.title,
          description: quizData.description || "",
          questions: questionsData.map((q) => ({
            id: q.id,
            question_text: q.question_text,
            answers: q.answers as string[],
            correct_answer_index: q.correct_answer_index,
            time_limit: q.time_limit,
            order_index: q.order_index,
          })),
        });
        setSelectedQuizId(quizId);
        setCurrentQuestionIndex(0);
        toast.success("Quiz loaded!");
      }
    }
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const updateQuestion = (field: keyof Question, value: Question[keyof Question]) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === currentQuestionIndex ? { ...q, [field]: value } : q
      ),
    }));
  };

  const updateAnswer = (answerIndex: number, value: string) => {
    const newAnswers = [...currentQuestion.answers];
    newAnswers[answerIndex] = value;
    updateQuestion("answers", newAnswers);
  };

  const addQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion(prev.questions.length)],
    }));
    setCurrentQuestionIndex(quiz.questions.length);
  };

  const deleteQuestion = () => {
    if (quiz.questions.length <= 1) {
      toast.error("You need at least one question");
      return;
    }
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions
        .filter((_, i) => i !== currentQuestionIndex)
        .map((q, i) => ({ ...q, order_index: i })),
    }));
    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
  };

  const saveQuiz = async () => {
    if (!quiz.title.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }

    if (quiz.questions.some((q) => !q.question_text.trim())) {
      toast.error("All questions must have text");
      return;
    }

    if (quiz.questions.some((q) => q.answers.filter((a) => a.trim()).length < 2)) {
      toast.error("Each question needs at least 2 answers");
      return;
    }

    setSaving(true);

    try {
      let quizId = quiz.id;

      if (quizId) {
        // Update existing quiz
        await supabase
          .from("quizzes")
          .update({ title: quiz.title, description: quiz.description })
          .eq("id", quizId);

        // Delete existing questions
        await supabase.from("questions").delete().eq("quiz_id", quizId);
      } else {
        // Create new quiz
        const { data, error } = await supabase
          .from("quizzes")
          .insert({
            title: quiz.title,
            description: quiz.description,
            user_id: user?.id,
          })
          .select()
          .single();

        if (error) throw error;
        quizId = data.id;
      }

      // Insert questions
      const questionsToInsert = quiz.questions.map((q) => ({
        quiz_id: quizId,
        question_text: q.question_text,
        answers: q.answers.filter((a) => a.trim()),
        correct_answer_index: q.correct_answer_index,
        time_limit: q.time_limit,
        order_index: q.order_index,
      }));

      await supabase.from("questions").insert(questionsToInsert);

      setQuiz((prev) => ({ ...prev, id: quizId }));
      setSelectedQuizId(quizId!);
      loadSavedQuizzes();
      toast.success("Quiz saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  const openSettings = () => {
    if (!quiz.id) {
      toast.error("Please save the quiz first");
      return;
    }
    setSettingsOpen(true);
  };

  const handleStartGame = async () => {
    if (!quiz.id) return;
    
    // Generate PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create game session
    const { data: session, error } = await supabase
      .from("game_sessions")
      .insert({
        quiz_id: quiz.id,
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

    setSettingsOpen(false);
    navigate(`/host/${session.id}`);
  };

  const exportQuiz = () => {
    const exportData = {
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map((q) => ({
        question_text: q.question_text,
        answers: q.answers,
        correct_answer_index: q.correct_answer_index,
        time_limit: q.time_limit,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${quiz.title || "quiz"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Quiz exported!");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 to-secondary/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-secondary/15 to-primary/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold flex-1 text-gradient">Quiz Creator</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportQuiz} className="border-border hover:border-primary hover:bg-primary/10">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={saveQuiz} disabled={saving} className="bg-gradient-button shadow-glow hover:shadow-glow-lg">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={openSettings} className="border-border hover:border-secondary hover:bg-secondary/10">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Game Settings</DialogTitle>
                  <DialogDescription className="sr-only">
                    Configure game options like timer, leaderboard, and music.
                  </DialogDescription>
                </DialogHeader>
                {quiz.id && (
                  <QuizSettings
                    quizId={quiz.id}
                    onStartGame={handleStartGame}
                  />
                )}
              </DialogContent>
            </Dialog>
            <Button size="sm" onClick={openSettings} className="bg-gradient-secondary shadow-glow-secondary hover:opacity-90">
              <Play className="w-4 h-4 mr-2" />
              Start Game
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[250px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Saved Quizzes */}
            <Card className="bg-card border-border shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-foreground">My Quizzes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {savedQuizzes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No saved quizzes</p>
                ) : (
                  savedQuizzes.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => loadQuiz(q.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedQuizId === q.id
                          ? "bg-primary text-primary-foreground shadow-glow"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {q.title}
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Question Navigator */}
            <Card className="bg-card border-border shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-foreground">Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      currentQuestionIndex === index
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span className="font-bold">Q{index + 1}</span>
                    <span className="truncate flex-1">
                      {quiz.questions[index].question_text || "Untitled"}
                    </span>
                  </button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 border-primary/30 hover:border-primary hover:bg-primary/10 text-primary"
                  onClick={addQuestion}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor */}
          <div className="space-y-6">
            {/* Quiz Info */}
            <Card className="bg-card border-border shadow-soft">
              <CardContent className="pt-6 space-y-4">
                <Input
                  placeholder="Quiz Title"
                  value={quiz.title}
                  onChange={(e) => setQuiz((prev) => ({ ...prev, title: e.target.value }))}
                  className="text-xl font-bold bg-muted border-border focus:border-primary text-foreground"
                />
                <Input
                  placeholder="Description (optional)"
                  value={quiz.description}
                  onChange={(e) =>
                    setQuiz((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="bg-muted border-border focus:border-primary text-foreground"
                />
              </CardContent>
            </Card>

            {/* Question Editor */}
            <Card className="bg-card border-border shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Question {currentQuestionIndex + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentQuestionIndex + 1} / {quiz.questions.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setCurrentQuestionIndex(
                        Math.min(quiz.questions.length - 1, currentQuestionIndex + 1)
                      )
                    }
                    disabled={currentQuestionIndex === quiz.questions.length - 1}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={deleteQuestion}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Input
                  placeholder="Enter your question..."
                  value={currentQuestion.question_text}
                  onChange={(e) => updateQuestion("question_text", e.target.value)}
                  className="text-lg bg-muted border-border focus:border-primary text-foreground"
                />

                {/* Time Limit */}
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Time limit:</span>
                  <select
                    value={currentQuestion.time_limit}
                    onChange={(e) => updateQuestion("time_limit", parseInt(e.target.value))}
                    className="bg-muted border border-border rounded-lg px-3 py-2 text-foreground focus:border-primary"
                  >
                    <option value={10}>10 seconds</option>
                    <option value={20}>20 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={45}>45 seconds</option>
                    <option value={60}>60 seconds</option>
                  </select>
                </div>

                {/* Answers Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {currentQuestion.answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`relative rounded-xl p-4 border transition-all ${
                        [
                          "bg-red-500/10 border-red-500/30 hover:border-red-500/50",
                          "bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50",
                          "bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50",
                          "bg-primary/10 border-primary/30 hover:border-primary/50"
                        ][index]
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateQuestion("correct_answer_index", index)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            currentQuestion.correct_answer_index === index
                              ? "bg-primary border-primary text-primary-foreground shadow-glow"
                              : "border-muted-foreground hover:border-primary"
                          }`}
                        >
                          {currentQuestion.correct_answer_index === index && (
                            <Check className="w-5 h-5" />
                          )}
                        </button>
                        <Input
                          placeholder={`Answer ${index + 1}`}
                          value={answer}
                          onChange={(e) => updateAnswer(index, e.target.value)}
                          className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
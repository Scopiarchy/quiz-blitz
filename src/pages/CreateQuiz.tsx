import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const startGame = async () => {
    if (!quiz.id) {
      toast.error("Please save the quiz first");
      return;
    }

    // Generate 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    const { data, error } = await supabase
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
      toast.error("Failed to start game");
      return;
    }

    navigate(`/host/${data.id}`);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold flex-1">Quiz Creator</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportQuiz}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={saveQuiz} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="accent" size="sm" onClick={startGame}>
              <Play className="w-4 h-4 mr-2" />
              Start Game
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[250px_1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Saved Quizzes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">My Quizzes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {savedQuizzes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No saved quizzes</p>
                ) : (
                  savedQuizzes.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => loadQuiz(q.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedQuizId === q.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {q.title}
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Question Navigator */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      currentQuestionIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
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
                  className="w-full mt-2"
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
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Input
                  placeholder="Quiz Title"
                  value={quiz.title}
                  onChange={(e) => setQuiz((prev) => ({ ...prev, title: e.target.value }))}
                  className="text-xl font-bold"
                />
                <Input
                  placeholder="Description (optional)"
                  value={quiz.description}
                  onChange={(e) =>
                    setQuiz((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </CardContent>
            </Card>

            {/* Question Editor */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
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
                  className="text-lg"
                />

                {/* Time Limit */}
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Time limit:</span>
                  <select
                    value={currentQuestion.time_limit}
                    onChange={(e) => updateQuestion("time_limit", parseInt(e.target.value))}
                    className="bg-card border border-border rounded-lg px-3 py-2"
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
                      className={`relative rounded-xl p-4 ${
                        ["bg-red-500/20", "bg-blue-500/20", "bg-yellow-500/20", "bg-green-500/20"][
                          index
                        ]
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateQuestion("correct_answer_index", index)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            currentQuestion.correct_answer_index === index
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-muted-foreground hover:border-foreground"
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
                          className="flex-1 bg-transparent border-none"
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
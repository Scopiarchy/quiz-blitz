import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Loader2,
  Sparkles,
  X,
  BookOpen,
  FileQuestion,
} from "lucide-react";

interface Question {
  question_text: string;
  answers: string[];
  correct_answer_index: number;
  time_limit: number;
  order_index: number;
}

interface FileUploadQuizProps {
  onQuestionsGenerated: (questions: Question[]) => void;
  existingQuestionCount: number;
}

const ACCEPTED_FILE_TYPES = [
  "text/plain",
  "text/markdown",
  "application/pdf",
  "text/csv",
  "application/json",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const FILE_EXTENSIONS = ".txt,.md,.pdf,.csv,.json,.doc,.docx";

export function FileUploadQuiz({ onQuestionsGenerated, existingQuestionCount }: FileUploadQuizProps) {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type) && !selectedFile.name.endsWith('.md')) {
      toast.error("Please upload a text, markdown, PDF, or document file");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const generateQuestions = async () => {
    if (!file) {
      toast.error("Please upload a file first");
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("questionCount", questionCount.toString());
      if (subject) {
        formData.append("subject", subject);
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-questions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate questions");
      }

      const data = await response.json();
      
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions were generated");
      }

      // Adjust order_index based on existing questions
      const adjustedQuestions = data.questions.map((q: Question, index: number) => ({
        ...q,
        order_index: existingQuestionCount + index,
      }));

      onQuestionsGenerated(adjustedQuestions);
      toast.success(`Generated ${adjustedQuestions.length} questions!`);
      
      // Reset form
      setFile(null);
      setSubject("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-card border-border shadow-soft overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Question Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : file
              ? "border-secondary bg-secondary/5"
              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
          }`}
          whileHover={{ scale: file ? 1 : 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={FILE_EXTENSIONS}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-3"
              >
                <div className="p-3 rounded-lg bg-secondary/20">
                  <FileText className="w-8 h-8 text-secondary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="ml-2 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-foreground font-medium">
                  Drop your file here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports: TXT, MD, PDF, DOC, DOCX (max 10MB)
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Subject (optional)
            </Label>
            <Input
              id="subject"
              placeholder="e.g., Biology, History..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-muted border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="count" className="text-sm text-muted-foreground flex items-center gap-1">
              <FileQuestion className="w-3 h-3" />
              Number of questions
            </Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 5)))}
              className="bg-muted border-border focus:border-primary"
            />
          </div>
        </div>

        {/* Generate button */}
        <Button
          onClick={generateQuestions}
          disabled={!file || isGenerating}
          className="w-full bg-gradient-button shadow-glow hover:shadow-glow-lg disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating questions...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Questions
            </>
          )}
        </Button>

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground"
          >
            <p>AI is analyzing your document and creating questions...</p>
            <p className="text-xs mt-1">This may take a moment</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

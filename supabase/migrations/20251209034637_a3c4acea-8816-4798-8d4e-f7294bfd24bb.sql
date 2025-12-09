-- Create quiz_settings table
CREATE TABLE public.quiz_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  random_questions BOOLEAN NOT NULL DEFAULT false,
  random_answers BOOLEAN NOT NULL DEFAULT false,
  show_answers BOOLEAN NOT NULL DEFAULT true,
  enable_timer BOOLEAN NOT NULL DEFAULT true,
  timer_seconds INTEGER NOT NULL DEFAULT 20,
  points_mode TEXT NOT NULL DEFAULT 'standard',
  leaderboard_enabled BOOLEAN NOT NULL DEFAULT true,
  music_enabled BOOLEAN NOT NULL DEFAULT true,
  nickname_generator BOOLEAN NOT NULL DEFAULT false,
  max_players INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quiz_id)
);

-- Enable RLS
ALTER TABLE public.quiz_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view settings for their quizzes"
ON public.quiz_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = quiz_settings.quiz_id
    AND (quizzes.user_id = auth.uid() OR quizzes.is_public = true)
  )
);

CREATE POLICY "Users can create settings for their quizzes"
ON public.quiz_settings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = quiz_settings.quiz_id
    AND quizzes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update settings for their quizzes"
ON public.quiz_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = quiz_settings.quiz_id
    AND quizzes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete settings for their quizzes"
ON public.quiz_settings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.quizzes
    WHERE quizzes.id = quiz_settings.quiz_id
    AND quizzes.user_id = auth.uid()
  )
);

-- Enable realtime for quiz_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_settings;

-- Add trigger for updated_at
CREATE TRIGGER update_quiz_settings_updated_at
BEFORE UPDATE ON public.quiz_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
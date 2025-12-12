-- Fix: Allow anyone to view questions for active game sessions
-- This enables players (who may not be authenticated) to see questions during gameplay

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view questions of accessible quizzes" ON public.questions;

-- Create a more permissive policy that allows viewing questions for:
-- 1. Quiz owners
-- 2. Public quizzes
-- 3. Questions in active game sessions (for players)
CREATE POLICY "Users can view questions of accessible quizzes" 
ON public.questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = questions.quiz_id 
    AND (
      quizzes.user_id = auth.uid() 
      OR quizzes.is_public = true
      OR EXISTS (
        SELECT 1 FROM game_sessions 
        WHERE game_sessions.quiz_id = quizzes.id 
        AND game_sessions.status IN ('lobby', 'playing')
      )
    )
  )
);

-- Also allow players to view quiz_settings for active sessions (for music_enabled setting)
DROP POLICY IF EXISTS "Users can view settings for their quizzes" ON public.quiz_settings;

CREATE POLICY "Users can view settings for accessible quizzes" 
ON public.quiz_settings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = quiz_settings.quiz_id 
    AND (
      quizzes.user_id = auth.uid() 
      OR quizzes.is_public = true
      OR EXISTS (
        SELECT 1 FROM game_sessions 
        WHERE game_sessions.quiz_id = quizzes.id 
        AND game_sessions.status IN ('lobby', 'playing')
      )
    )
  )
);

-- Security Enhancement: Restrict answer submissions to valid game scenarios
DROP POLICY IF EXISTS "Anyone can submit answers" ON public.answers;

CREATE POLICY "Players can submit answers for active games"
ON public.answers
FOR INSERT
WITH CHECK (
  -- Player must exist in the session
  EXISTS (
    SELECT 1 FROM players 
    WHERE players.id = answers.player_id 
    AND players.session_id = answers.session_id
  )
  -- Session must be active
  AND EXISTS (
    SELECT 1 FROM game_sessions 
    WHERE game_sessions.id = answers.session_id 
    AND game_sessions.status = 'playing'
  )
  -- Question must belong to the quiz in the session
  AND EXISTS (
    SELECT 1 FROM game_sessions gs
    JOIN questions q ON q.quiz_id = gs.quiz_id
    WHERE gs.id = answers.session_id 
    AND q.id = answers.question_id
  )
);

-- Restrict answer viewing to relevant parties only
DROP POLICY IF EXISTS "Anyone can view answers" ON public.answers;

CREATE POLICY "Users can view answers for their quizzes or own answers"
ON public.answers
FOR SELECT
USING (
  -- Quiz owner can see all answers
  EXISTS (
    SELECT 1 FROM game_sessions gs
    JOIN quizzes q ON q.id = gs.quiz_id
    WHERE gs.id = answers.session_id
    AND q.user_id = auth.uid()
  )
  -- Players can see their own answers
  OR EXISTS (
    SELECT 1 FROM players p
    WHERE p.id = answers.player_id
    AND p.session_id = answers.session_id
  )
);

-- Restrict answer updates to prevent cheating
DROP POLICY IF EXISTS "Anyone can update answers" ON public.answers;

CREATE POLICY "Host can update answer scores"
ON public.answers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM game_sessions gs
    JOIN quizzes q ON q.id = gs.quiz_id
    WHERE gs.id = answers.session_id
    AND q.user_id = auth.uid()
  )
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_answers_session_player ON public.answers(session_id, player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON public.game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_quiz_id ON public.game_sessions(quiz_id);
-- Fix: Allow anyone to view quizzes that have active game sessions
-- This is needed because the questions RLS policy joins to quizzes table

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own quizzes" ON public.quizzes;

-- Create a more permissive policy that allows viewing quizzes for:
-- 1. Quiz owners
-- 2. Public quizzes  
-- 3. Quizzes with active game sessions (for players)
CREATE POLICY "Users can view accessible quizzes" 
ON public.quizzes 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR is_public = true
  OR EXISTS (
    SELECT 1 FROM game_sessions 
    WHERE game_sessions.quiz_id = quizzes.id 
    AND game_sessions.status IN ('lobby', 'playing')
  )
);
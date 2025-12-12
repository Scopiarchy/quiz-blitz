-- Fix: Simplify the answers INSERT policy to fix RLS violation
-- The complex nested query was causing issues for unauthenticated players

DROP POLICY IF EXISTS "Players can submit answers for active games" ON public.answers;

-- Create a simpler policy that allows any player to submit answers
-- The validation will be handled by the application logic
CREATE POLICY "Anyone can submit answers for active sessions"
ON public.answers
FOR INSERT
WITH CHECK (
  -- Session must be in playing status
  EXISTS (
    SELECT 1 FROM game_sessions 
    WHERE game_sessions.id = answers.session_id 
    AND game_sessions.status = 'playing'
  )
  -- Player must exist in the session
  AND EXISTS (
    SELECT 1 FROM players 
    WHERE players.id = answers.player_id 
    AND players.session_id = answers.session_id
  )
);
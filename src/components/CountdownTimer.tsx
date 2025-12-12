import { useEffect, useRef } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface CountdownTimerProps {
  seconds: number;
  maxSeconds: number;
  musicEnabled?: boolean;
}

export function CountdownTimer({ seconds, maxSeconds, musicEnabled = true }: CountdownTimerProps) {
  const percentage = (seconds / maxSeconds) * 100;
  const isLow = seconds <= 5;
  const lastTickRef = useRef(seconds);
  const { playTickSound, playCountdownSound } = useSoundEffects();

  useEffect(() => {
    if (!musicEnabled || seconds === lastTickRef.current) return;
    
    lastTickRef.current = seconds;
    
    if (seconds > 0 && seconds <= 5) {
      // Urgent countdown sound for last 5 seconds
      playCountdownSound();
    } else if (seconds > 5 && seconds <= maxSeconds) {
      // Regular tick sound
      playTickSound();
    }
  }, [seconds, musicEnabled, playTickSound, playCountdownSound, maxSeconds]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`text-5xl md:text-7xl font-black ${
          isLow ? "text-destructive animate-countdown" : "text-accent"
        }`}
      >
        {seconds}
      </div>
      <div className="w-full max-w-md h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${
            isLow ? "bg-destructive" : "bg-gradient-to-r from-primary to-secondary"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
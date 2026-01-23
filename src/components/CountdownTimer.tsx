import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface CountdownTimerProps {
  seconds: number;
  maxSeconds: number;
  musicEnabled?: boolean;
}

export function CountdownTimer({ seconds, maxSeconds, musicEnabled = true }: CountdownTimerProps) {
  const percentage = (seconds / maxSeconds) * 100;
  const isLow = seconds <= 5;
  const isCritical = seconds <= 3;
  const lastTickRef = useRef(seconds);
  const { playTickSound, playCountdownSound } = useSoundEffects();

  useEffect(() => {
    if (!musicEnabled || seconds === lastTickRef.current) return;
    
    lastTickRef.current = seconds;
    
    if (seconds > 0 && seconds <= 5) {
      playCountdownSound();
    } else if (seconds > 5 && seconds <= maxSeconds) {
      playTickSound();
    }
  }, [seconds, musicEnabled, playTickSound, playCountdownSound, maxSeconds]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Timer number with animations */}
      <div className="relative">
        {/* Glow effect behind number */}
        <motion.div
          className={`absolute inset-0 rounded-full blur-2xl ${
            isCritical 
              ? "bg-destructive/40" 
              : isLow 
                ? "bg-amber-500/30" 
                : "bg-primary/20"
          }`}
          animate={{
            scale: isLow ? [1, 1.2, 1] : 1,
            opacity: isLow ? [0.5, 0.8, 0.5] : 0.5,
          }}
          transition={{
            duration: isLow ? 0.5 : 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Animated number */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={seconds}
            initial={{ scale: 1.5, opacity: 0, y: -20 }}
            animate={{ 
              scale: isLow ? [1, 1.1, 1] : 1, 
              opacity: 1, 
              y: 0,
            }}
            exit={{ scale: 0.5, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              scale: isLow ? {
                duration: 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              } : undefined,
            }}
            className={`relative text-6xl md:text-8xl font-black tabular-nums ${
              isCritical 
                ? "text-destructive drop-shadow-[0_0_30px_hsl(var(--destructive)/0.8)]" 
                : isLow 
                  ? "text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]" 
                  : "bg-gradient-to-b from-primary to-secondary bg-clip-text text-transparent drop-shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
            }`}
          >
            {seconds}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar container */}
      <div className="w-full max-w-md relative">
        {/* Background track */}
        <div className="h-4 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
          {/* Animated progress fill */}
          <motion.div
            className={`h-full rounded-full relative overflow-hidden ${
              isCritical 
                ? "bg-gradient-to-r from-destructive to-red-400" 
                : isLow 
                  ? "bg-gradient-to-r from-amber-500 to-orange-400" 
                  : "bg-gradient-to-r from-primary via-secondary to-accent"
            }`}
            initial={false}
            animate={{ 
              width: `${percentage}%`,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        </div>

        {/* Glow under progress bar */}
        <motion.div
          className={`absolute -bottom-2 left-0 h-4 rounded-full blur-md ${
            isCritical 
              ? "bg-destructive/50" 
              : isLow 
                ? "bg-amber-500/40" 
                : "bg-primary/30"
          }`}
          style={{ width: `${percentage}%` }}
          animate={{
            opacity: isLow ? [0.3, 0.6, 0.3] : 0.4,
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Time warning text */}
      <AnimatePresence>
        {isLow && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`text-sm font-medium ${
              isCritical ? "text-destructive" : "text-amber-400"
            }`}
          >
            {isCritical ? "⚠️ Hurry up!" : "Time running out!"}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
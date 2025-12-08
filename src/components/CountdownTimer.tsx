interface CountdownTimerProps {
  seconds: number;
  maxSeconds: number;
}

export function CountdownTimer({ seconds, maxSeconds }: CountdownTimerProps) {
  const percentage = (seconds / maxSeconds) * 100;
  const isLow = seconds <= 5;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`text-6xl md:text-8xl font-black ${
          isLow ? "text-destructive animate-countdown" : "text-accent"
        }`}
      >
        {seconds}
      </div>
      <div className="w-full max-w-md h-4 bg-muted rounded-full overflow-hidden">
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
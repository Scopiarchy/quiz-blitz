import { useEffect } from "react";

interface ConfettiProps {
  show: boolean;
  count?: number;
}

export function Confetti({ show, count = 100 }: ConfettiProps) {
  useEffect(() => {
    if (!show) return;

    const container = document.createElement("div");
    container.id = "confetti-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";
    document.body.appendChild(container);

    const colors = ["#ff6b6b", "#4ecdc4", "#ffe66d", "#a855f7", "#3b82f6", "#22c55e"];

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti-piece";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 2}s`;
      confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
      confetti.style.width = `${5 + Math.random() * 10}px`;
      confetti.style.height = `${5 + Math.random() * 10}px`;
      container.appendChild(confetti);
    }

    const timeout = setTimeout(() => {
      container.remove();
    }, 5000);

    return () => {
      clearTimeout(timeout);
      container.remove();
    };
  }, [show, count]);

  return null;
}
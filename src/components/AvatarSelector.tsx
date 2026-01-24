import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Import avatar images
import robotAvatar from "@/assets/avatars/robot.png";
import foxAvatar from "@/assets/avatars/fox.png";
import catAvatar from "@/assets/avatars/cat.png";
import owlAvatar from "@/assets/avatars/owl.png";
import pandaAvatar from "@/assets/avatars/panda.png";
import lionAvatar from "@/assets/avatars/lion.png";
import unicornAvatar from "@/assets/avatars/unicorn.png";
import monkeyAvatar from "@/assets/avatars/monkey.png";

export const AVATARS = [
  { id: "robot", name: "Robot", src: robotAvatar },
  { id: "fox", name: "Fox", src: foxAvatar },
  { id: "cat", name: "Cool Cat", src: catAvatar },
  { id: "owl", name: "Owl", src: owlAvatar },
  { id: "panda", name: "Panda", src: pandaAvatar },
  { id: "lion", name: "Lion", src: lionAvatar },
  { id: "unicorn", name: "Unicorn", src: unicornAvatar },
  { id: "monkey", name: "Monkey", src: monkeyAvatar },
];

// Export alias for convenience - same array with avatar options containing src
export const AVATAR_OPTIONS = AVATARS;

interface AvatarSelectorProps {
  selectedAvatar: string | null;
  onSelect: (avatarSrc: string) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AvatarSelector({ selectedAvatar, onSelect, disabled, size = "md" }: AvatarSelectorProps) {
  const sizeClasses = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
  };

  const avatarSizeClasses = {
    sm: "w-12 h-12",
    md: "",
    lg: "w-20 h-20",
  };

  return (
    <div className={cn("grid grid-cols-4", sizeClasses[size])}>
      {AVATARS.map((avatar) => {
        // Support both id and src matching for backwards compatibility
        const isSelected = selectedAvatar === avatar.id || selectedAvatar === avatar.src;
        return (
          <motion.button
            key={avatar.id}
            type="button"
            onClick={() => !disabled && onSelect(avatar.src)}
            className={cn(
              "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all",
              isSelected
                ? "border-primary ring-2 ring-primary/30 shadow-glow"
                : "border-border/50 hover:border-primary/50",
              disabled && "opacity-50 cursor-not-allowed",
              avatarSizeClasses[size]
            )}
            whileHover={!disabled ? { scale: 1.05 } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
          >
            <img
              src={avatar.src}
              alt={avatar.name}
              className="w-full h-full object-cover"
            />
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg"
              >
                <Check className="w-3 h-3 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export function getAvatarById(id: string | null | undefined) {
  if (!id) return null;
  return AVATARS.find((a) => a.id === id) || null;
}

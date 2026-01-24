import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AvatarSelector, getAvatarById, AVATARS } from "./AvatarSelector";
import { toast } from "sonner";

interface Profile {
  username: string | null;
  avatar_url: string | null;
}

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setSelectedAvatar(data.avatar_url);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const handleSaveAvatar = async () => {
    if (!user || !selectedAvatar) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: selectedAvatar })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, avatar_url: selectedAvatar } : null);
      setShowAvatarDialog(false);
      toast.success("Avatar updated!");
    } catch (error) {
      toast.error("Failed to update avatar");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="ghost" className="font-medium hover:text-primary">
          Sign In
        </Button>
      </Link>
    );
  }

  const avatarData = getAvatarById(profile?.avatar_url);
  const initials = profile?.username?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-primary/10">
            <Avatar className="w-8 h-8 border-2 border-primary/30">
              {avatarData ? (
                <AvatarImage src={avatarData.src} alt={profile?.username || "User"} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-bold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="hidden md:inline text-sm font-medium max-w-[100px] truncate">
              {profile?.username || user.email?.split("@")[0]}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2 border-b border-border/50">
            <p className="text-sm font-medium truncate">
              {profile?.username || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          <DropdownMenuItem onClick={() => setShowAvatarDialog(true)} className="cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Change Avatar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gradient">Choose Your Avatar</DialogTitle>
            <DialogDescription>
              Select an avatar that represents you
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onSelect={setSelectedAvatar}
              disabled={saving}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAvatarDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAvatar}
              disabled={saving || !selectedAvatar}
              className="shadow-glow"
            >
              {saving ? "Saving..." : "Save Avatar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

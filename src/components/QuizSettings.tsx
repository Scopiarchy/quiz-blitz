import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Shuffle,
  ListOrdered,
  Eye,
  Timer,
  Trophy,
  Music,
  Users,
  User,
  Play,
  Settings2,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface QuizSettingsData {
  random_questions: boolean;
  random_answers: boolean;
  show_answers: boolean;
  enable_timer: boolean;
  timer_seconds: number;
  points_mode: string;
  leaderboard_enabled: boolean;
  music_enabled: boolean;
  nickname_generator: boolean;
  max_players: number;
}

interface QuizSettingsProps {
  quizId: string;
  onStartGame: () => void;
  disabled?: boolean;
}

const defaultSettings: QuizSettingsData = {
  random_questions: false,
  random_answers: false,
  show_answers: true,
  enable_timer: true,
  timer_seconds: 20,
  points_mode: "standard",
  leaderboard_enabled: true,
  music_enabled: true,
  nickname_generator: false,
  max_players: 50,
};

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ icon, label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/30 last:border-0 group hover:bg-muted/20 -mx-2 px-2 rounded-lg transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center text-primary shadow-sm group-hover:shadow-glow-primary/20 transition-shadow">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{label}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="bg-card border-border/50 shadow-soft">
                  <p className="max-w-xs text-sm">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

export function QuizSettings({ quizId, onStartGame, disabled = false }: QuizSettingsProps) {
  const [settings, setSettings] = useState<QuizSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [quizId]);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quiz_settings")
      .select("*")
      .eq("quiz_id", quizId)
      .maybeSingle();

    if (data) {
      setSettings({
        random_questions: data.random_questions,
        random_answers: data.random_answers,
        show_answers: data.show_answers,
        enable_timer: data.enable_timer,
        timer_seconds: data.timer_seconds,
        points_mode: data.points_mode,
        leaderboard_enabled: data.leaderboard_enabled,
        music_enabled: data.music_enabled,
        nickname_generator: data.nickname_generator,
        max_players: data.max_players,
      });
    }
    setLoading(false);
  };

  const updateSetting = async <K extends keyof QuizSettingsData>(
    key: K,
    value: QuizSettingsData[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    setSaving(true);
    const { error } = await supabase
      .from("quiz_settings")
      .upsert(
        {
          quiz_id: quizId,
          ...newSettings,
        },
        { onConflict: "quiz_id" }
      );

    if (error) {
      toast.error("Failed to save setting");
      setSettings(settings); // Revert
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Card className="animate-pulse bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardContent className="h-96 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-card to-card/80 border-border/50 shadow-soft-lg">
      {/* Decorative top gradient bar */}
      <div className="h-1 bg-gradient-mixed" />
      
      <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 border-b border-border/30">
        <CardTitle className="flex items-center gap-3 text-foreground">
          <div className="w-10 h-10 rounded-xl bg-gradient-mixed flex items-center justify-center shadow-glow">
            <Settings2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-gradient font-bold">Quiz Settings</span>
          {saving && (
            <span className="text-xs text-primary font-normal animate-pulse flex items-center gap-1 ml-auto">
              <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin" />
              Saving...
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-1">
          <SettingRow
            icon={<Shuffle className="w-5 h-5" />}
            label="Randomize Questions"
            description="Shuffle the order of questions for each game"
          >
            <Switch
              checked={settings.random_questions}
              onCheckedChange={(checked) => updateSetting("random_questions", checked)}
              disabled={disabled}
              className="data-[state=checked]:bg-primary"
            />
          </SettingRow>

          <SettingRow
            icon={<ListOrdered className="w-5 h-5" />}
            label="Randomize Answers"
            description="Shuffle answer options within each question"
          >
            <Switch
              checked={settings.random_answers}
              onCheckedChange={(checked) => updateSetting("random_answers", checked)}
              disabled={disabled}
              className="data-[state=checked]:bg-primary"
            />
          </SettingRow>

          <SettingRow
            icon={<Eye className="w-5 h-5" />}
            label="Show Correct Answers"
            description="Display the correct answer after each question"
          >
            <Switch
              checked={settings.show_answers}
              onCheckedChange={(checked) => updateSetting("show_answers", checked)}
              disabled={disabled}
              className="data-[state=checked]:bg-primary"
            />
          </SettingRow>

          <SettingRow
            icon={<Timer className="w-5 h-5" />}
            label="Enable Timer"
            description="Use countdown timer for each question"
          >
            <div className="flex items-center gap-3">
              <Switch
                checked={settings.enable_timer}
                onCheckedChange={(checked) => updateSetting("enable_timer", checked)}
                disabled={disabled}
                className="data-[state=checked]:bg-primary"
              />
              {settings.enable_timer && (
                <Select
                  value={settings.timer_seconds.toString()}
                  onValueChange={(val) => updateSetting("timer_seconds", parseInt(val))}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-28 border-border/50 bg-muted/50 focus:border-primary focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/50">
                    <SelectItem value="10">10 sec</SelectItem>
                    <SelectItem value="20">20 sec</SelectItem>
                    <SelectItem value="30">30 sec</SelectItem>
                    <SelectItem value="60">60 sec</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </SettingRow>

          <SettingRow
            icon={<Sparkles className="w-5 h-5" />}
            label="Points Mode"
            description="Choose how points are awarded"
          >
            <Select
              value={settings.points_mode}
              onValueChange={(val) => updateSetting("points_mode", val)}
              disabled={disabled}
            >
              <SelectTrigger className="w-36 border-border/50 bg-muted/50 focus:border-primary focus:ring-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50">
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="double">Double Points</SelectItem>
                <SelectItem value="none">No Points</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            icon={<Trophy className="w-5 h-5" />}
            label="Leaderboard"
            description="Show live leaderboard during the game"
          >
            <Switch
              checked={settings.leaderboard_enabled}
              onCheckedChange={(checked) => updateSetting("leaderboard_enabled", checked)}
              disabled={disabled}
              className="data-[state=checked]:bg-primary"
            />
          </SettingRow>

          <SettingRow
            icon={<Music className="w-5 h-5" />}
            label="Music & Sound Effects"
            description="Play sounds for correct/wrong answers"
          >
            <Switch
              checked={settings.music_enabled}
              onCheckedChange={(checked) => updateSetting("music_enabled", checked)}
              disabled={disabled}
              className="data-[state=checked]:bg-primary"
            />
          </SettingRow>

          <SettingRow
            icon={<User className="w-5 h-5" />}
            label="Nickname Generator"
            description="Generate random nicknames for players"
          >
            <Switch
              checked={settings.nickname_generator}
              onCheckedChange={(checked) => updateSetting("nickname_generator", checked)}
              disabled={disabled}
              className="data-[state=checked]:bg-primary"
            />
          </SettingRow>

          <SettingRow
            icon={<Users className="w-5 h-5" />}
            label="Maximum Players"
            description="Limit the number of players who can join"
          >
            <Input
              type="number"
              min={2}
              max={500}
              value={settings.max_players}
              onChange={(e) => updateSetting("max_players", parseInt(e.target.value) || 50)}
              className="w-24 text-center border-border/50 bg-muted/50 focus:border-primary focus:ring-primary/20"
              disabled={disabled}
            />
          </SettingRow>
        </div>

        <div className="mt-8">
          <Button
            onClick={onStartGame}
            size="xl"
            className="w-full bg-gradient-button hover:opacity-90 shadow-glow hover:shadow-glow-lg transition-all font-bold text-lg"
            disabled={disabled}
          >
            <Play className="w-6 h-6 mr-2" />
            START QUIZ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

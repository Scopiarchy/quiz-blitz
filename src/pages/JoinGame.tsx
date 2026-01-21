import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Users, Sparkles } from "lucide-react";

export default function JoinGame() {
  const [searchParams] = useSearchParams();
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-fill PIN from URL if provided
  useEffect(() => {
    const urlPin = searchParams.get("pin");
    if (urlPin && /^\d{6}$/.test(urlPin)) {
      setPin(urlPin);
    }
  }, [searchParams]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || !nickname.trim()) {
      toast.error("Please enter both PIN and nickname");
      return;
    }

    setLoading(true);

    try {
      const { data: session } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("pin", pin.trim())
        .single();

      if (!session) {
        toast.error("Game not found. Check your PIN.");
        setLoading(false);
        return;
      }

      if (session.status !== "lobby") {
        toast.error("This game has already started");
        setLoading(false);
        return;
      }

      const { data: player, error } = await supabase
        .from("players")
        .insert({
          session_id: session.id,
          nickname: nickname.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/play/${session.id}?playerId=${player.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to join game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-secondary/15 to-accent/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        <Card className="shadow-soft-lg border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm overflow-hidden">
          {/* Decorative top gradient bar */}
          <div className="h-1 bg-gradient-mixed" />
          
          <CardHeader className="text-center pt-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-mixed flex items-center justify-center shadow-glow relative">
              <Users className="w-10 h-10 text-white" />
              <Sparkles className="w-5 h-5 text-white absolute -top-1 -right-1 animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-black text-gradient">Join Game</CardTitle>
            <p className="text-muted-foreground mt-2">Enter the game PIN to join</p>
          </CardHeader>
          
          <CardContent className="pb-8">
            <form onSubmit={handleJoin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Game PIN</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-3xl font-black tracking-[0.3em] h-16 rounded-xl border-border/50 bg-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/30"
                  maxLength={6}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Your Nickname</label>
                <Input
                  type="text"
                  placeholder="Enter your nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="h-14 rounded-xl border-border/50 bg-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg"
                  maxLength={20}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-button hover:opacity-90 transition-all shadow-glow hover:shadow-glow-lg"
                size="lg"
                disabled={loading || pin.length !== 6}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    Joining...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Join Game!
                  </span>
                )}
              </Button>
            </form>
            
            {/* Help text */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Ask your host for the 6-digit PIN
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

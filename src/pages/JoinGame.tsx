import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Users } from "lucide-react";

export default function JoinGame() {
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secondary to-cyan-500 flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-black">Join Game</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <Input
                type="text"
                placeholder="Game PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-2xl font-bold tracking-widest"
                maxLength={6}
              />
              <Input
                type="text"
                placeholder="Your Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                size="lg"
                disabled={loading || pin.length !== 6}
              >
                {loading ? "Joining..." : "Join Game!"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, Zap, Trophy } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo/Title */}
          <div className="mb-8 animate-bounce-in">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              QuizBlitz
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              Create. Play. Compete. Win!
            </p>
          </div>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { icon: Sparkles, label: "Interactive Quizzes" },
              { icon: Users, label: "Multiplayer Fun" },
              { icon: Zap, label: "Real-time Action" },
              { icon: Trophy, label: "Leaderboards" },
            ].map((feature, i) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border backdrop-blur-sm animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <feature.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/create">
              <Button variant="kahoot" size="xl" className="min-w-[200px]">
                <Sparkles className="w-6 h-6 mr-2" />
                Create Quiz
              </Button>
            </Link>
            <Link to="/join">
              <Button variant="secondary" size="xl" className="min-w-[200px]">
                <Users className="w-6 h-6 mr-2" />
                Join Game
              </Button>
            </Link>
          </div>

          {/* Login link */}
          <p className="mt-8 text-muted-foreground">
            Already have quizzes?{" "}
            <Link to="/auth" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Quiz",
                description: "Build engaging quizzes with multiple choice questions and custom time limits.",
                color: "from-primary to-purple-600",
              },
              {
                step: "2",
                title: "Share the PIN",
                description: "Get a unique 6-digit PIN. Share it with players to join your live game.",
                color: "from-secondary to-cyan-500",
              },
              {
                step: "3",
                title: "Compete & Win",
                description: "Players answer in real-time. Fastest correct answers earn the most points!",
                color: "from-accent to-yellow-600",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="kahoot-card text-center animate-slide-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl font-black text-white`}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>© 2024 QuizBlitz. Built with ❤️ for learning and fun.</p>
        </div>
      </footer>
    </div>
  );
}
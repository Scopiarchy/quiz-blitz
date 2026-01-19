import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, Zap, Trophy, ArrowRight, Play } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">QuizBlitz</span>
        </div>
        <Link to="/auth">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Sign in
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-16 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full blur-[80px] animate-float" />
          <div 
            className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-accent/25 to-primary/15 rounded-full blur-[100px] animate-float" 
            style={{ animationDelay: "1.5s" }} 
          />
          <div 
            className="absolute top-1/3 right-1/4 w-[200px] h-[200px] bg-gradient-to-br from-secondary/20 to-accent/10 rounded-full blur-[60px] animate-float" 
            style={{ animationDelay: "3s" }} 
          />
        </div>

        {/* Decorative grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">The #1 Live Quiz Platform</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-bounce-in leading-tight">
              <span className="text-foreground">Make Learning </span>
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Fun & Interactive
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed">
              Create engaging quizzes, host live games, and compete with friends. 
              Perfect for classrooms, team events, and parties.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/create">
                <Button size="xl" className="min-w-[220px] group">
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Create Quiz
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/join">
                <Button variant="outline" size="xl" className="min-w-[220px] bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card hover:border-primary/30">
                  <Users className="w-5 h-5 mr-2" />
                  Join Game
                </Button>
              </Link>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              {[
                { icon: Sparkles, label: "Interactive Quizzes" },
                { icon: Users, label: "Multiplayer" },
                { icon: Zap, label: "Real-time" },
                { icon: Trophy, label: "Leaderboards" },
              ].map((feature, i) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card/60 border border-border/50 backdrop-blur-sm shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Quiz",
                description: "Build engaging quizzes with multiple choice questions and custom time limits.",
                gradient: "from-primary to-secondary",
              },
              {
                step: "2",
                title: "Share the PIN",
                description: "Get a unique 6-digit PIN. Share it with players to join your live game.",
                gradient: "from-secondary to-accent",
              },
              {
                step: "3",
                title: "Compete & Win",
                description: "Players answer in real-time. Fastest correct answers earn the most points!",
                gradient: "from-accent to-primary",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="quiz-card text-center group animate-slide-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div
                  className={`w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-xl font-bold text-white shadow-glow group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50 bg-card/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">QuizBlitz</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 QuizBlitz. Built with ❤️ for learning and fun.
          </p>
        </div>
      </footer>
    </div>
  );
}
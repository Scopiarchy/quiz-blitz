import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FadeInUp, ScaleIn, StaggerContainer, StaggerItem } from "@/components/MotionWrappers";
import { Sparkles, Users, Zap, Trophy, ArrowRight, Play, ChevronDown, Code, Award, Clock } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow animate-pulse-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">
              QuizBlitz
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              How It Works
            </a>
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" className="font-medium hover:text-primary">
                Sign In
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Animated gradient orbs - teal/purple theme */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-[120px] animate-float" />
          <div 
            className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-gradient-to-br from-secondary/15 to-primary/10 rounded-full blur-[140px] animate-float" 
            style={{ animationDelay: "2s" }} 
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-accent/10 to-primary/5 rounded-full blur-[100px] animate-float" 
            style={{ animationDelay: "4s" }} 
          />
        </div>

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Hero Text */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <FadeInUp delay={0.1}>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm font-semibold text-primary">The #1 Live Quiz Platform</span>
                </div>
              </FadeInUp>

              {/* Main heading */}
              <FadeInUp delay={0.2}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-[1.1]">
                  <span className="text-foreground">Hi, Welcome to </span>
                  <span className="text-gradient">
                    QuizBlitz
                  </span>
                </h1>
              </FadeInUp>

              {/* Subtitle */}
              <FadeInUp delay={0.3}>
                <h2 className="text-xl md:text-2xl font-semibold text-foreground/80 mb-4">
                  Make Learning Fun & Interactive
                </h2>
              </FadeInUp>

              {/* Description */}
              <FadeInUp delay={0.4}>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                  Create engaging quizzes, host live games, and compete with friends. 
                  Perfect for classrooms, team events, and parties.
                </p>
              </FadeInUp>

              {/* CTA Buttons */}
              <FadeInUp delay={0.5}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/create">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button size="xl" className="min-w-[200px] group shadow-glow-lg">
                        <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Create Quiz
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/join">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button variant="outline" size="xl" className="min-w-[200px] bg-card/60 backdrop-blur-sm border-border hover:bg-card hover:border-primary/40 hover:shadow-soft-lg transition-all">
                        <Users className="w-5 h-5 mr-2" />
                        Join Game
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </FadeInUp>
            </div>

            {/* Right: Decorative Element */}
            <ScaleIn delay={0.4} className="hidden lg:flex items-center justify-center">
              <div className="relative">
                {/* Main card shape */}
                <div className="w-80 h-80 relative">
                  {/* Outer glow ring */}
                  <motion.div 
                    className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/25 via-secondary/15 to-accent/20 blur-xl"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      opacity: [0.6, 0.8, 0.6]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Main shape */}
                  <div className="absolute inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary via-secondary to-accent p-1 shadow-glow-lg">
                    <div className="w-full h-full rounded-[2.25rem] bg-card flex items-center justify-center">
                      <div className="text-center p-8">
                        <motion.div 
                          className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow"
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Zap className="w-10 h-10 text-white" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Play?</h3>
                        <p className="text-muted-foreground text-sm">Join millions of learners worldwide</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating feature badges */}
                  <motion.div 
                    className="absolute -top-4 -right-4 px-4 py-2 rounded-xl bg-card border border-border shadow-soft-lg"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">Leaderboards</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-card border border-border shadow-soft-lg"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Multiplayer</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="absolute top-1/2 -right-8 px-4 py-2 rounded-xl bg-card border border-border shadow-soft-lg"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-medium">Real-time</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </ScaleIn>
          </div>

          {/* Feature pills - Mobile */}
          <div className="lg:hidden flex flex-wrap justify-center gap-3 mt-12 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            {[
              { icon: Sparkles, label: "Interactive" },
              { icon: Users, label: "Multiplayer" },
              { icon: Zap, label: "Real-time" },
              { icon: Trophy, label: "Leaderboards" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card/80 border border-border/50 backdrop-blur-sm shadow-soft"
              >
                <feature.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <a 
          href="#stats" 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors animate-bounce cursor-pointer"
        >
          <span className="text-sm font-medium">Scroll Down</span>
          <ChevronDown className="w-5 h-5" />
        </a>
      </section>

      {/* Stats Section - Portfolio style */}
      <section id="stats" className="py-20 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Code, number: "10K+", label: "Quizzes Created" },
              { icon: Users, number: "50K+", label: "Active Players" },
              { icon: Award, number: "1M+", label: "Games Played" },
              { icon: Clock, number: "24/7", label: "Available" },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <motion.div 
                  className="text-center p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-soft-lg transition-all duration-300"
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <stat.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-gradient mb-1">{stat.number}</h3>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <FadeInUp className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Why Choose <span className="text-gradient">QuizBlitz?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to create engaging, interactive learning experiences
            </p>
          </FadeInUp>
          
          <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: "Interactive Quizzes", description: "Create engaging multiple-choice questions with custom options", gradient: "from-primary to-primary/60" },
              { icon: Users, title: "Multiplayer Mode", description: "Host live games with unlimited players joining in real-time", gradient: "from-secondary to-secondary/60" },
              { icon: Zap, title: "Real-time Results", description: "See answers and scores update instantly as players respond", gradient: "from-primary to-secondary" },
              { icon: Trophy, title: "Leaderboards", description: "Track scores and celebrate winners with animated leaderboards", gradient: "from-accent to-accent/60" },
            ].map((feature) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  className="group p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 h-full"
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <div className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <FadeInUp className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
              <Play className="w-4 h-4 text-secondary" />
              <span className="text-sm font-semibold text-secondary">How It Works</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Get Started in <span className="text-gradient">3 Easy Steps</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Launch your first quiz in minutes with our simple process
            </p>
          </FadeInUp>
          
          <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Quiz",
                description: "Build engaging quizzes with multiple choice questions, custom time limits, and personalized themes.",
                gradient: "from-primary to-primary/70",
              },
              {
                step: "2",
                title: "Share the PIN",
                description: "Get a unique 6-digit PIN. Share it with players via QR code or just tell them the number.",
                gradient: "from-secondary to-secondary/70",
              },
              {
                step: "3",
                title: "Compete & Win",
                description: "Players answer in real-time. Fastest correct answers earn the most points. Celebrate the winners!",
                gradient: "from-accent to-accent/70",
              },
            ].map((item) => (
              <StaggerItem key={item.step}>
                <motion.div
                  className="relative p-8 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-soft-lg transition-all duration-300 text-center group h-full"
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <motion.div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl font-bold text-white shadow-glow group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Final CTA */}
          <FadeInUp delay={0.6} className="text-center mt-16">
            <Link to="/create">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Button size="xl" className="group shadow-glow-lg">
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Creating Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </FadeInUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border/40 bg-card/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">QuizBlitz</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 QuizBlitz. Built with ❤️ for learning and fun.
          </p>
        </div>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WalletCards, CheckSquare, Target, TrendingUp, BookOpen, Shield, ArrowRight, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: CheckSquare, title: 'Task & Earn', description: 'Kids complete tasks set by parents and earn virtual money as rewards', color: '#4F7DF3' },
  { icon: Target, title: 'Save & Goal', description: 'Set savings goals and watch progress grow with visual milestones', color: '#34D399' },
  { icon: TrendingUp, title: 'Invest (SIP)', description: 'Learn about investing through simplified SIP with compound interest', color: '#A78BFA' },
  { icon: Shield, title: 'Credit Score', description: 'Build a gamified credit score from 0-1000 based on financial habits', color: '#FB923C' },
  { icon: BookOpen, title: 'Learn Finance', description: 'Story-based micro lessons about money, saving, interest, and loans', color: '#F472B6' },
  { icon: Sparkles, title: '10 Levels', description: 'Progress through levels from Money Beginner to Money Legend', color: '#FCD34D' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <WalletCards className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-heading tracking-tight">Kids Money</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="rounded-full font-medium" data-testid="landing-login-btn">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="rounded-full px-6 font-semibold shadow-lg shadow-primary/20" data-testid="landing-signup-btn">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-44 lg:pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Financial literacy for the next generation
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading tracking-tight leading-[1.1] mb-6 animate-slide-up">
            Teach Kids the
            <span className="gradient-text"> Power of Money</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            A gamified platform where kids earn, save, invest, and learn financial literacy through fun tasks, goals, and interactive stories. No real money involved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/signup">
              <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95" data-testid="hero-cta-btn">
                Start Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-base font-medium" data-testid="hero-login-btn">
                I have an account
              </Button>
            </Link>
          </div>

          {/* Tagline badges */}
          <div className="flex items-center justify-center gap-3 mt-12 flex-wrap animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {['Learn', 'Earn', 'Save', 'Grow'].map((word, i) => (
              <span
                key={word}
                className="px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: ['#EBF2FF', '#D1FAE5', '#FEF3C7', '#EDE9FE'][i],
                  color: ['#4F7DF3', '#34D399', '#F59E0B', '#A78BFA'][i]
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pb-20 lg:pb-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold font-heading tracking-tight mb-4">
              Everything Kids Need to Learn Money
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              A complete financial education ecosystem designed for young minds
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-3xl p-8 border border-border/50 card-hover dark:border-white/5"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: feature.color + '15', color: feature.color }}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold font-heading mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-20 lg:pb-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-primary-foreground mb-4">
                Ready to Start Your Child's Financial Journey?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
                Join thousands of parents who are building financially smart kids
              </p>
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 text-base font-semibold shadow-lg" data-testid="cta-signup-btn">
                  Create Free Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletCards className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold font-heading">Kids Money</span>
          </div>
          <p className="text-xs text-muted-foreground">No real money involved. Built for learning.</p>
        </div>
      </footer>
    </div>
  );
}

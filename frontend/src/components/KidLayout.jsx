import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard, CheckSquare, WalletCards, Target,
  TrendingUp, Banknote, BookOpen, Award, LogOut,
  Sun, Moon, Menu, ChevronRight
} from 'lucide-react';

const KID_NAV = [
  { path: '/kid/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/kid/tasks', icon: CheckSquare, label: 'My Tasks' },
  { path: '/kid/wallet', icon: WalletCards, label: 'My Wallet' },
  { path: '/kid/goals', icon: Target, label: 'Goals' },
  { path: '/kid/sip', icon: TrendingUp, label: 'Invest' },
  { path: '/kid/loans', icon: Banknote, label: 'Borrow' },
  { path: '/kid/learning', icon: BookOpen, label: 'Stories' },
  { path: '/kid/achievements', icon: Award, label: 'Achievements' },
];

const MOBILE_NAV = [
  { path: '/kid/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/kid/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/kid/wallet', icon: WalletCards, label: 'Wallet' },
  { path: '/kid/learning', icon: BookOpen, label: 'Stories' },
  { path: '/kid/achievements', icon: Award, label: 'Awards' },
];

const THEMES = {
  boy: {
    primary: '#0EA5E9', secondary: '#14B8A6', accent: '#3B82F6',
    bg: 'from-sky-50 to-teal-50 dark:from-sky-950/20 dark:to-teal-950/20',
    navActive: 'bg-sky-500 text-white shadow-lg shadow-sky-500/20',
    cardBorder: 'border-sky-200/60 dark:border-sky-800/30',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    animClass: 'kid-bounce',
  },
  girl: {
    primary: '#A78BFA', secondary: '#F472B6', accent: '#C084FC',
    bg: 'from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20',
    navActive: 'bg-violet-500 text-white shadow-lg shadow-violet-500/20',
    cardBorder: 'border-violet-200/60 dark:border-violet-800/30',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    animClass: 'kid-fade',
  },
  neutral: {
    primary: '#34D399', secondary: '#4F7DF3', accent: '#34D399',
    bg: 'from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20',
    navActive: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
    cardBorder: 'border-emerald-200/60 dark:border-emerald-800/30',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    animClass: 'kid-slide',
  },
};

export function useKidTheme() {
  const { user } = useAuth();
  const uiTheme = user?.ui_theme || 'neutral';
  return THEMES[uiTheme] || THEMES.neutral;
}

export default function KidLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const kidTheme = useKidTheme();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${kidTheme.bg} flex`}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-border bg-card/60 backdrop-blur-lg p-6 fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10" data-testid="kid-sidebar-logo">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: kidTheme.primary }}>
            <WalletCards className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-heading tracking-tight">Kids Money</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Hello, {user?.name}!</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {KID_NAV.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`kid-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive ? kidTheme.navActive : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <button
            onClick={() => { logout(); navigate('/'); }}
            data-testid="kid-logout-btn"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[260px] pb-20 lg:pb-0">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="rounded-xl" data-testid="kid-mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: kidTheme.primary }}>
                    <WalletCards className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-lg font-bold font-heading">Kids Money</h1>
                </div>
                <nav className="space-y-1">
                  {KID_NAV.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                        ${location.pathname === item.path ? kidTheme.navActive : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      <span className="flex items-center gap-3"><item.icon className="w-[18px] h-[18px]" />{item.label}</span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: kidTheme.primary }}>
                <WalletCards className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold font-heading text-sm">Hi, {user?.name}!</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <p className="text-sm font-semibold">{user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl" data-testid="kid-theme-toggle">
            {theme === 'light' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
          </Button>
        </header>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-card/90 backdrop-blur-xl border-t border-border px-2 py-2">
        <div className="flex items-center justify-around">
          {MOBILE_NAV.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} data-testid={`kid-mob-${item.label.toLowerCase()}`}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                <item.icon className="w-5 h-5" style={isActive ? { color: kidTheme.primary } : {}} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

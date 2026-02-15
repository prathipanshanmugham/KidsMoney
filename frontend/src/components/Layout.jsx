import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LayoutDashboard, CheckSquare, WalletCards, Target,
  TrendingUp, Banknote, BookOpen, Settings, LogOut,
  Sun, Moon, Menu, Users, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/wallet', icon: WalletCards, label: 'Wallet' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/sip', icon: TrendingUp, label: 'Invest' },
  { path: '/loans', icon: Banknote, label: 'Borrow' },
  { path: '/learning', icon: BookOpen, label: 'Learn' },
];

const MOBILE_NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/wallet', icon: WalletCards, label: 'Wallet' },
  { path: '/learning', icon: BookOpen, label: 'Learn' },
];

const AVATAR_COLORS = {
  lion: '#FB923C', bear: '#A78BFA', fox: '#F472B6', rabbit: '#34D399',
  panda: '#4F7DF3', unicorn: '#FCD34D', owl: '#818CF8', dolphin: '#22D3EE'
};

export default function Layout({ children }) {
  const { user, kids, selectedKid, setSelectedKid, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleKidChange = (kidId) => {
    const kid = kids.find(k => k.id === kidId);
    if (kid) setSelectedKid(kid);
  };

  const avatarColor = selectedKid ? (AVATAR_COLORS[selectedKid.avatar] || '#4F7DF3') : '#4F7DF3';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-border bg-card/50 p-6 fixed h-full z-20">
        <Link to="/dashboard" className="flex items-center gap-3 mb-10" data-testid="sidebar-logo">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <WalletCards className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-heading tracking-tight">Kids Money</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Learn. Earn. Save.</p>
          </div>
        </Link>

        {/* Kid Selector */}
        {kids.length > 0 && (
          <div className="mb-8">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Active Child</p>
            <Select value={selectedKid?.id || ''} onValueChange={handleKidChange}>
              <SelectTrigger className="rounded-xl h-12 bg-muted/50" data-testid="kid-selector">
                <SelectValue placeholder="Select a child" />
              </SelectTrigger>
              <SelectContent>
                {kids.map(kid => (
                  <SelectItem key={kid.id} value={kid.id}>
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: AVATAR_COLORS[kid.avatar] || '#4F7DF3' }}>
                        {kid.name[0]}
                      </span>
                      {kid.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <Link
            to="/settings"
            data-testid="nav-settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
              ${location.pathname === '/settings'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
          >
            <Settings className="w-[18px] h-[18px]" />
            Settings
          </Link>
          <button
            onClick={() => { logout(); navigate('/'); }}
            data-testid="logout-btn"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[260px] pb-20 lg:pb-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="rounded-xl" data-testid="mobile-menu-btn">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                    <WalletCards className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-lg font-bold font-heading">Kids Money</h1>
                </div>
                {kids.length > 0 && (
                  <div className="mb-6">
                    <Select value={selectedKid?.id || ''} onValueChange={(v) => { handleKidChange(v); }}>
                      <SelectTrigger className="rounded-xl h-12" data-testid="mobile-kid-selector">
                        <SelectValue placeholder="Select child" />
                      </SelectTrigger>
                      <SelectContent>
                        {kids.map(kid => (
                          <SelectItem key={kid.id} value={kid.id}>{kid.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <nav className="space-y-1">
                  {[...NAV_ITEMS, { path: '/settings', icon: Settings, label: 'Settings' }].map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                        ${location.pathname === item.path ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="w-[18px] h-[18px]" />
                        {item.label}
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <WalletCards className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold font-heading text-sm">Kids Money</span>
            </div>

            {/* Desktop welcome */}
            <div className="hidden lg:block">
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <p className="text-sm font-semibold">{user?.full_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile kid selector */}
            {kids.length > 0 && selectedKid && (
              <div className="lg:hidden flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: avatarColor }}>
                  {selectedKid.name[0]}
                </span>
                <span className="text-xs font-medium max-w-[60px] truncate">{selectedKid.name}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl"
              data-testid="theme-toggle"
            >
              {theme === 'light' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-card/90 backdrop-blur-xl border-t border-border px-2 py-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          {MOBILE_NAV.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200
                  ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/settings"
            data-testid="mobile-nav-more"
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200
              ${location.pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

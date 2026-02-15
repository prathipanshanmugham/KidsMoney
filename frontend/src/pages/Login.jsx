import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletCards, Eye, EyeOff, ArrowLeft, Sparkles, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [tab, setTab] = useState('parent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [kidName, setKidName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, kidLogin } = useAuth();
  const navigate = useNavigate();

  const handleParentLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleKidLogin = async (e) => {
    e.preventDefault();
    if (!parentEmail || !kidName || !pin) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await kidLogin(parentEmail, kidName, pin);
      toast.success('Welcome!');
      navigate('/kid/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors" data-testid="login-back-btn">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <WalletCards className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading tracking-tight">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">Sign in to Kids Money</p>
          </div>
        </div>

        <Card className="rounded-3xl border-border/50 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:border-white/5">
          <CardContent className="p-8">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted/50 p-1 mb-6" data-testid="login-tabs">
                <TabsTrigger value="parent" className="rounded-full text-sm gap-2" data-testid="login-tab-parent">
                  <User className="w-3.5 h-3.5" /> Parent
                </TabsTrigger>
                <TabsTrigger value="kid" className="rounded-full text-sm gap-2" data-testid="login-tab-kid">
                  <Sparkles className="w-3.5 h-3.5" /> Kid
                </TabsTrigger>
              </TabsList>

              <TabsContent value="parent">
                <form onSubmit={handleParentLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="parent@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl h-12 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20"
                      data-testid="login-email-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPass ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl h-12 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 pr-10"
                        data-testid="login-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        data-testid="login-toggle-password"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-full h-12 font-semibold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                    disabled={loading}
                    data-testid="login-submit-btn"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary font-medium hover:underline" data-testid="login-to-signup">
                    Sign up
                  </Link>
                </p>
              </TabsContent>

              <TabsContent value="kid">
                <form onSubmit={handleKidLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="parent-email" className="text-sm font-medium">Parent's Email</Label>
                    <Input
                      id="parent-email"
                      type="email"
                      placeholder="parent@example.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="rounded-xl h-12 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20"
                      data-testid="kid-login-parent-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kid-name" className="text-sm font-medium">Your Name</Label>
                    <Input
                      id="kid-name"
                      type="text"
                      placeholder="What's your name?"
                      value={kidName}
                      onChange={(e) => setKidName(e.target.value)}
                      className="rounded-xl h-12 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20"
                      data-testid="kid-login-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kid-pin" className="text-sm font-medium">Your PIN</Label>
                    <Input
                      id="kid-pin"
                      type="password"
                      placeholder="Enter your secret PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      maxLength={6}
                      className="rounded-xl h-12 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 text-center tracking-[0.5em] text-lg"
                      data-testid="kid-login-pin"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-full h-12 font-semibold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                    disabled={loading}
                    data-testid="kid-login-submit-btn"
                  >
                    {loading ? 'Signing in...' : "Let's Go!"}
                  </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Ask your parent to create your account and set your PIN
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

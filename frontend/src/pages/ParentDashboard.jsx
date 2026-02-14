import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  WalletCards, CheckSquare, Target, TrendingUp, Star, Plus,
  ArrowUpRight, ArrowDownRight, Clock, Award, Sparkles, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AVATAR_MAP = {
  lion: { color: '#FB923C', icon: '🦁' }, bear: { color: '#A78BFA', icon: '🐻' },
  fox: { color: '#F472B6', icon: '🦊' }, rabbit: { color: '#34D399', icon: '🐰' },
  panda: { color: '#4F7DF3', icon: '🐼' }, unicorn: { color: '#FCD34D', icon: '🦄' },
  owl: { color: '#818CF8', icon: '🦉' }, dolphin: { color: '#22D3EE', icon: '🐬' },
};

const AVATAR_OPTIONS = ['lion', 'bear', 'fox', 'rabbit', 'panda', 'unicorn', 'owl', 'dolphin'];

export default function ParentDashboard() {
  const { kids, selectedKid, loadKids } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addKidOpen, setAddKidOpen] = useState(false);
  const [kidForm, setKidForm] = useState({ name: '', age: '', avatar: 'panda', grade: '', starting_balance: 0 });
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedKid) loadDashboard();
    else setLoading(false);
  }, [selectedKid]);

  const loadDashboard = async () => {
    try {
      const { data } = await API.get(`/dashboard/kid/${selectedKid.id}`);
      setDashboard(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKid = async (e) => {
    e.preventDefault();
    if (!kidForm.name || !kidForm.age) {
      toast.error('Name and age are required');
      return;
    }
    setAdding(true);
    try {
      await API.post('/kids', { ...kidForm, age: parseInt(kidForm.age), starting_balance: parseFloat(kidForm.starting_balance) || 0 });
      toast.success(`${kidForm.name} added successfully!`);
      await loadKids();
      setAddKidOpen(false);
      setKidForm({ name: '', age: '', avatar: 'panda', grade: '', starting_balance: 0 });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add kid');
    } finally {
      setAdding(false);
    }
  };

  // Empty state
  if (!loading && kids.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-8">Get started by adding your first child</p>
        <Card className="rounded-3xl border-dashed border-2 border-primary/30 bg-primary/5 dark:border-white/10">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold font-heading mb-2">Add Your First Child</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Create a profile for your child to start their financial learning journey
            </p>
            <Dialog open={addKidOpen} onOpenChange={setAddKidOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full px-8 font-semibold shadow-lg shadow-primary/20" data-testid="add-first-kid-btn">
                  <Plus className="w-4 h-4 mr-2" /> Add Child
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading text-xl">Add New Child</DialogTitle>
                </DialogHeader>
                <AddKidForm form={kidForm} setForm={setKidForm} onSubmit={handleAddKid} loading={adding} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-3xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const kid = dashboard?.kid;
  const wallet = dashboard?.wallet;
  const levelInfo = dashboard?.level_info;
  const nextLevel = dashboard?.next_level;
  const xpProgress = nextLevel ? ((kid?.xp - levelInfo?.xp_required) / (nextLevel.xp_required - levelInfo?.xp_required)) * 100 : 100;

  function getScoreColor(score) {
    if (score >= 800) return '#4F7DF3';
    if (score >= 600) return '#34D399';
    if (score >= 400) return '#FCD34D';
    if (score >= 200) return '#FB923C';
    return '#EF4444';
  }

  return (
    <div className="animate-fade-in" data-testid="parent-dashboard">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview for {kid?.name}</p>
        </div>
        <Dialog open={addKidOpen} onOpenChange={setAddKidOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full font-semibold shadow-lg shadow-primary/20" data-testid="add-kid-btn">
              <Plus className="w-4 h-4 mr-2" /> Add Child
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Add New Child</DialogTitle>
            </DialogHeader>
            <AddKidForm form={kidForm} setForm={setKidForm} onSubmit={handleAddKid} loading={adding} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <WalletCards className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="secondary" className="rounded-full text-[10px] font-semibold bg-secondary/10 text-secondary">Balance</Badge>
            </div>
            <p className="text-2xl font-bold font-heading" data-testid="wallet-balance">{wallet?.balance?.toFixed(0) || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">coins</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-secondary" />
              </div>
              <Badge variant="outline" className="rounded-full text-[10px]">Lvl {kid?.level}</Badge>
            </div>
            <p className="text-2xl font-bold font-heading">{levelInfo?.name}</p>
            <div className="mt-2">
              <Progress value={Math.min(xpProgress, 100)} className="h-1.5 rounded-full" />
              <p className="text-[10px] text-muted-foreground mt-1">{kid?.xp} XP</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: getScoreColor(kid?.credit_score) + '15' }}>
                <Star className="w-5 h-5" style={{ color: getScoreColor(kid?.credit_score) }} />
              </div>
              <Badge variant="outline" className="rounded-full text-[10px]">Score</Badge>
            </div>
            <p className="text-2xl font-bold font-heading" data-testid="credit-score">{kid?.credit_score || 500}</p>
            <p className="text-xs text-muted-foreground mt-1">/ 1000</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-purple-500" />
              </div>
              <Badge variant="outline" className="rounded-full text-[10px]">Tasks</Badge>
            </div>
            <p className="text-2xl font-bold font-heading">{dashboard?.stats?.total_tasks_completed || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold font-heading">Pending Approvals</h3>
              <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={() => navigate('/tasks')} data-testid="view-all-tasks-btn">
                View All <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            {dashboard?.active_tasks?.filter(t => t.status === 'completed').length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No pending approvals</p>
            ) : (
              <div className="space-y-3">
                {dashboard?.active_tasks?.filter(t => t.status === 'completed').slice(0, 4).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-[11px] text-muted-foreground">+{task.reward_amount} coins</p>
                      </div>
                    </div>
                    <Badge className="rounded-full bg-yellow-500/10 text-yellow-600 border-0 text-[10px]">Awaiting</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
          <CardContent className="p-6">
            <h3 className="font-semibold font-heading mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'New Task', icon: CheckSquare, path: '/tasks', color: '#4F7DF3' },
                { label: 'Set Goal', icon: Target, path: '/goals', color: '#34D399' },
                { label: 'Start SIP', icon: TrendingUp, path: '/sip', color: '#A78BFA' },
                { label: 'Stories', icon: BookOpen, path: '/learning', color: '#FB923C' },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-all active:scale-[0.98]"
                  data-testid={`quick-action-${action.label.toLowerCase().replace(' ', '-')}`}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: action.color + '15', color: action.color }}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-heading">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={() => navigate('/wallet')} data-testid="view-all-txns-btn">
              View All <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          {(!dashboard?.recent_transactions || dashboard.recent_transactions.length === 0) ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {dashboard.recent_transactions.slice(0, 5).map(txn => (
                <div key={txn.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    {txn.type === 'credit' ? (
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                        <ArrowDownRight className="w-4 h-4 text-secondary" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4 text-destructive" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{txn.description}</p>
                      <p className="text-[11px] text-muted-foreground">{txn.category}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-secondary' : 'text-destructive'}`}>
                    {txn.type === 'credit' ? '+' : '-'}{txn.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddKidForm({ form, setForm, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Name</Label>
        <Input placeholder="Child's name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="rounded-xl h-12" data-testid="kid-name-input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Age</Label>
          <Input type="number" min="3" max="18" placeholder="Age" value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="rounded-xl h-12" data-testid="kid-age-input" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Grade</Label>
          <Input placeholder="Optional" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} className="rounded-xl h-12" data-testid="kid-grade-input" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Avatar</Label>
        <div className="grid grid-cols-4 gap-3">
          {AVATAR_OPTIONS.map(av => (
            <button
              type="button"
              key={av}
              onClick={() => setForm({...form, avatar: av})}
              className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all ${form.avatar === av ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'bg-muted/50 hover:bg-muted'}`}
              style={{ backgroundColor: form.avatar === av ? AVATAR_MAP[av]?.color + '20' : undefined }}
              data-testid={`avatar-${av}`}
            >
              <span className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: AVATAR_MAP[av]?.color }}>
                {av[0].toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Starting Balance (coins)</Label>
        <Input type="number" min="0" placeholder="0" value={form.starting_balance} onChange={e => setForm({...form, starting_balance: e.target.value})} className="rounded-xl h-12" data-testid="kid-balance-input" />
      </div>
      <Button type="submit" className="w-full rounded-full h-12 font-semibold" disabled={loading} data-testid="submit-add-kid-btn">
        {loading ? 'Adding...' : 'Add Child'}
      </Button>
    </form>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  WalletCards, Star, Trophy, Target, CheckSquare,
  TrendingUp, BookOpen, Sparkles, Award, Zap, Crown, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LEVEL_ICONS = {
  1: Sparkles, 2: WalletCards, 3: Target, 4: Trophy, 5: Shield,
  6: TrendingUp, 7: Award, 8: Star, 9: Zap, 10: Crown
};

const LEVEL_COLORS = ['#94A3B8','#4F7DF3','#34D399','#FCD34D','#FB923C','#A78BFA','#F472B6','#EF4444','#22D3EE','#FFD700'];

export default function KidDashboard() {
  const { selectedKid } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedKid) loadData();
  }, [selectedKid]);

  const loadData = async () => {
    try {
      const { data } = await API.get(`/dashboard/kid/${selectedKid.id}`);
      setDashboard(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (!selectedKid) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Please add a child first from the Dashboard</p>
        <Button className="mt-4 rounded-full" onClick={() => navigate('/dashboard')} data-testid="go-dashboard-btn">Go to Dashboard</Button>
      </div>
    );
  }

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-3xl animate-pulse" />)}</div>;
  }

  const kid = dashboard?.kid;
  const wallet = dashboard?.wallet;
  const levelInfo = dashboard?.level_info;
  const nextLevel = dashboard?.next_level;
  const xpProgress = nextLevel ? Math.min(((kid?.xp - levelInfo?.xp_required) / (nextLevel.xp_required - levelInfo?.xp_required)) * 100, 100) : 100;
  const LevelIcon = LEVEL_ICONS[kid?.level] || Sparkles;
  const levelColor = LEVEL_COLORS[(kid?.level || 1) - 1];

  return (
    <div className="animate-fade-in" data-testid="kid-dashboard">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">{kid?.name}'s World</h1>
        <p className="text-muted-foreground text-sm">Keep going, you're doing amazing!</p>
      </div>

      {/* Level Hero Card */}
      <Card className="rounded-3xl border-none overflow-hidden mb-8 relative" style={{ background: `linear-gradient(135deg, ${levelColor}20, ${levelColor}05)` }}>
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg" style={{ backgroundColor: levelColor }}>
              <LevelIcon className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <Badge className="rounded-full mb-2 border-0 text-xs font-semibold" style={{ backgroundColor: levelColor + '20', color: levelColor }}>
                Level {kid?.level}
              </Badge>
              <h2 className="text-2xl font-bold font-heading">{levelInfo?.name}</h2>
              <div className="mt-3 max-w-xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{kid?.xp} XP</span>
                  <span>{nextLevel ? `${nextLevel.xp_required} XP` : 'MAX'}</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${xpProgress}%`, backgroundColor: levelColor }} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance & Credit Score */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
          <CardContent className="p-6 text-center">
            <WalletCards className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="text-3xl font-bold font-heading" data-testid="kid-balance">{wallet?.balance?.toFixed(0) || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">coins in wallet</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <p className="text-3xl font-bold font-heading" data-testid="kid-credit-score">{kid?.credit_score || 500}</p>
            <p className="text-xs text-muted-foreground mt-1">credit score</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Tasks */}
      <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-heading">Active Tasks</h3>
            <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={() => navigate('/tasks')} data-testid="kid-view-tasks-btn">See all</Button>
          </div>
          {dashboard?.active_tasks?.filter(t => t.status === 'pending').length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No active tasks right now</p>
          ) : (
            <div className="space-y-3">
              {dashboard.active_tasks.filter(t => t.status === 'pending').slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{task.title}</span>
                  </div>
                  <Badge className="rounded-full bg-primary/10 text-primary border-0 text-[10px]">+{task.reward_amount}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goals Progress */}
      {dashboard?.active_goals?.length > 0 && (
        <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5 mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold font-heading mb-4">My Goals</h3>
            <div className="space-y-4">
              {dashboard.active_goals.slice(0, 3).map(goal => {
                const pct = Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{goal.title}</span>
                      <span className="text-xs text-muted-foreground">{goal.saved_amount}/{goal.target_amount}</span>
                    </div>
                    <Progress value={pct} className="h-2 rounded-full" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => navigate('/learning')} className="bg-card rounded-2xl p-4 text-center card-hover border border-border/50 dark:border-white/5" data-testid="kid-stories-btn">
          <BookOpen className="w-5 h-5 text-orange-500 mx-auto mb-2" />
          <p className="text-lg font-bold font-heading">{dashboard?.stats?.total_stories_read || 0}</p>
          <p className="text-[10px] text-muted-foreground">Stories</p>
        </button>
        <button onClick={() => navigate('/goals')} className="bg-card rounded-2xl p-4 text-center card-hover border border-border/50 dark:border-white/5" data-testid="kid-goals-btn">
          <Target className="w-5 h-5 text-secondary mx-auto mb-2" />
          <p className="text-lg font-bold font-heading">{dashboard?.stats?.active_goals_count || 0}</p>
          <p className="text-[10px] text-muted-foreground">Goals</p>
        </button>
        <button onClick={() => navigate('/sip')} className="bg-card rounded-2xl p-4 text-center card-hover border border-border/50 dark:border-white/5" data-testid="kid-sips-btn">
          <TrendingUp className="w-5 h-5 text-purple-500 mx-auto mb-2" />
          <p className="text-lg font-bold font-heading">{dashboard?.stats?.active_sips_count || 0}</p>
          <p className="text-[10px] text-muted-foreground">SIPs</p>
        </button>
      </div>
    </div>
  );
}

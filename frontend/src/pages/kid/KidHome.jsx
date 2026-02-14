import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useKidTheme } from '@/components/KidLayout';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { WalletCards, Star, CheckSquare, Target, TrendingUp, BookOpen, Award, Sparkles, Zap, Crown, Trophy, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LEVEL_ICONS = { 1: Sparkles, 2: WalletCards, 3: Target, 4: Trophy, 5: Shield, 6: TrendingUp, 7: Award, 8: Star, 9: Zap, 10: Crown };

export default function KidHome() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const t = useKidTheme();

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try { const { data: d } = await API.get('/kid/dashboard'); setData(d); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-muted/50 rounded-3xl animate-pulse" />)}</div>;

  const kid = data?.kid;
  const wallet = data?.wallet;
  const levelInfo = data?.level_info;
  const nextLevel = data?.next_level;
  const xpProgress = nextLevel ? Math.min(((kid?.xp - levelInfo?.xp_required) / (nextLevel.xp_required - levelInfo?.xp_required)) * 100, 100) : 100;
  const LevelIcon = LEVEL_ICONS[kid?.level] || Sparkles;

  return (
    <div className="animate-fade-in" data-testid="kid-home">
      <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">{kid?.name}'s World</h1>
      <p className="text-muted-foreground text-sm mb-8">Keep going, you're amazing!</p>

      {/* Level Card */}
      <Card className={`rounded-3xl border ${t.cardBorder} overflow-hidden mb-8`} style={{ background: `linear-gradient(135deg, ${t.primary}10, ${t.secondary}08)` }}>
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg" style={{ backgroundColor: t.primary }}>
              <LevelIcon className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <Badge className="rounded-full mb-2 border-0 text-xs font-semibold" style={{ backgroundColor: t.primary + '20', color: t.primary }}>Level {kid?.level}</Badge>
              <h2 className="text-2xl font-bold font-heading">{levelInfo?.name}</h2>
              <div className="mt-3 max-w-xs">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{kid?.xp} XP</span><span>{nextLevel ? `${nextLevel.xp_required} XP` : 'MAX'}</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${xpProgress}%`, backgroundColor: t.primary }} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance & Score */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className={`rounded-3xl border ${t.cardBorder} shadow-sm`}>
          <CardContent className="p-6 text-center">
            <WalletCards className="w-8 h-8 mx-auto mb-3" style={{ color: t.primary }} />
            <p className="text-3xl font-bold font-heading" data-testid="kid-home-balance">{wallet?.balance?.toFixed(0) || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">coins</p>
          </CardContent>
        </Card>
        <Card className={`rounded-3xl border ${t.cardBorder} shadow-sm`}>
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <p className="text-3xl font-bold font-heading" data-testid="kid-home-score">{kid?.credit_score || 500}</p>
            <p className="text-xs text-muted-foreground mt-1">credit score</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      <Card className={`rounded-3xl border ${t.cardBorder} shadow-sm mb-6`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-heading">Active Tasks</h3>
            <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={() => navigate('/kid/tasks')} data-testid="kid-home-view-tasks">See all</Button>
          </div>
          {data?.active_tasks?.filter(t => t.status === 'pending').length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No active tasks</p>
          ) : (
            <div className="space-y-3">
              {data.active_tasks.filter(t => t.status === 'pending').slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-4 h-4" style={{ color: t.primary }} />
                    <span className="text-sm font-medium">{task.title}</span>
                  </div>
                  <Badge className={`rounded-full border-0 text-[10px] ${t.badge}`}>+{task.reward_amount}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: BookOpen, label: 'Stories', val: data?.stats?.total_stories_read || 0, path: '/kid/learning' },
          { icon: Target, label: 'Goals', val: data?.stats?.active_goals_count || 0, path: '/kid/goals' },
          { icon: TrendingUp, label: 'SIPs', val: data?.stats?.active_sips_count || 0, path: '/kid/sip' },
        ].map(s => (
          <button key={s.label} onClick={() => navigate(s.path)} className={`bg-card rounded-2xl p-4 text-center card-hover border ${t.cardBorder}`} data-testid={`kid-stat-${s.label.toLowerCase()}`}>
            <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: t.primary }} />
            <p className="text-lg font-bold font-heading">{s.val}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

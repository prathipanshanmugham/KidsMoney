import { useState, useEffect } from 'react';
import { useKidTheme } from '@/components/KidLayout';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Award, CheckCircle, BookOpen, Target, TrendingUp,
  Shield, Star, Zap, Crown, Trophy, Sparkles, WalletCards
} from 'lucide-react';

const ICON_MAP = {
  'check-circle': CheckCircle, 'check-square': CheckCircle, 'book-open': BookOpen,
  'graduation-cap': BookOpen, 'target': Target, 'trending-up': TrendingUp,
  'shield': Shield, 'star': Star, 'zap': Zap, 'crown': Crown,
  'trophy': Trophy, 'sparkles': Sparkles, 'piggy-bank': WalletCards,
  'award': Award, 'sprout': Sparkles, 'seedling': Sparkles,
};

export default function KidAchievements() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const t = useKidTheme();

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const { data: d } = await API.get('/kid/achievements'); setData(d); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-32 bg-muted/50 rounded-3xl animate-pulse" />)}</div>;

  const scoreColor = (s) => {
    if (s >= 800) return '#4F7DF3';
    if (s >= 600) return '#34D399';
    if (s >= 400) return '#FCD34D';
    if (s >= 200) return '#FB923C';
    return '#EF4444';
  };

  return (
    <div className="animate-fade-in" data-testid="kid-achievements-page">
      <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">Achievements</h1>
      <p className="text-muted-foreground text-sm mb-8">Your badges and milestones!</p>

      {/* Credit Score */}
      <Card className={`rounded-3xl border ${t.cardBorder} shadow-sm mb-8`}>
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">Credit Score</p>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor(data?.credit_score || 500)} strokeWidth="8"
                strokeDasharray={`${((data?.credit_score || 500) / 1000) * 264} 264`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold font-heading" data-testid="kid-achievement-score">{data?.credit_score || 500}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">out of 1000</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Tasks Done', val: data?.stats?.tasks_completed || 0 },
          { label: 'Stories Read', val: data?.stats?.stories_read || 0 },
          { label: 'Goals Done', val: data?.stats?.goals_achieved || 0 },
        ].map(s => (
          <Card key={s.label} className={`rounded-2xl border ${t.cardBorder}`}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold font-heading">{s.val}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* XP Progress */}
      <Card className={`rounded-3xl border ${t.cardBorder} shadow-sm mb-8`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Experience Points</span>
            <Badge className={`rounded-full border-0 ${t.badge}`}>{data?.xp || 0} XP</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">Level {data?.level_info?.level}: {data?.level_info?.name}</p>
          <Progress value={Math.min((data?.xp || 0) / 75, 100)} className="h-2 rounded-full" />
        </CardContent>
      </Card>

      {/* Badges */}
      <h3 className="font-semibold font-heading mb-4">My Badges ({data?.badges?.length || 0})</h3>
      {(!data?.badges || data.badges.length === 0) ? (
        <Card className="rounded-3xl"><CardContent className="p-8 text-center text-muted-foreground text-sm">Complete tasks and stories to earn badges!</CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {data.badges.map((badge, i) => {
            const Icon = ICON_MAP[badge.icon] || Award;
            return (
              <Card key={i} className={`rounded-2xl border ${t.cardBorder} shadow-sm`}>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: t.primary + '15' }}>
                    <Icon className="w-6 h-6" style={{ color: t.primary }} />
                  </div>
                  <p className="text-xs font-semibold">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

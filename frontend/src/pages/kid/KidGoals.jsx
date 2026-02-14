import { useState, useEffect } from 'react';
import { useKidTheme } from '@/components/KidLayout';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

export default function KidGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const t = useKidTheme();

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const { data } = await API.get('/kid/goals'); setGoals(data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleContribute = async () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid amount'); return; }
    setSaving(true);
    try {
      await API.put(`/kid/goals/${contributeGoal.id}/contribute`, { amount: parseFloat(amount) });
      toast.success('Savings added!');
      setContributeGoal(null); setAmount(''); load();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-fade-in" data-testid="kid-goals-page">
      <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">My Goals</h1>
      <p className="text-muted-foreground text-sm mb-8">Save up for the things you want!</p>

      {loading ? <div className="h-32 bg-muted/50 rounded-3xl animate-pulse" /> : goals.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2"><CardContent className="p-12 text-center"><Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No goals yet. Ask your parent to create one!</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const pct = Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
            return (
              <Card key={goal.id} className={`rounded-3xl border ${t.cardBorder} shadow-sm`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: t.primary + '15' }}>
                        <Target className="w-5 h-5" style={{ color: t.primary }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{goal.title}</h4>
                        <p className="text-xs text-muted-foreground">{goal.saved_amount} / {goal.target_amount} coins</p>
                      </div>
                    </div>
                    <Badge className={`rounded-full border-0 text-[10px] ${goal.status === 'completed' ? 'bg-green-100 text-green-700' : t.badge}`}>
                      {goal.status === 'completed' ? 'Achieved!' : 'Active'}
                    </Badge>
                  </div>
                  <Progress value={pct} className="h-2.5 rounded-full mb-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{Math.round(pct)}% saved</span>
                    {goal.status === 'active' && (
                      <Button size="sm" className="rounded-full text-xs" style={{ backgroundColor: t.primary }} onClick={() => setContributeGoal(goal)} data-testid={`kid-contribute-${goal.id}`}>
                        <ArrowUpRight className="w-3 h-3 mr-1" /> Save
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!contributeGoal} onOpenChange={v => { if (!v) { setContributeGoal(null); setAmount(''); } }}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader><DialogTitle className="font-heading">Add Savings</DialogTitle><DialogDescription>How much do you want to save?</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2"><Label>Amount (coins)</Label><Input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} className="rounded-xl h-12" data-testid="kid-contribute-input" /></div>
            <Button className="w-full rounded-full h-12 font-semibold" style={{ backgroundColor: t.primary }} onClick={handleContribute} disabled={saving} data-testid="kid-submit-contribute">
              {saving ? 'Saving...' : 'Add to Savings'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

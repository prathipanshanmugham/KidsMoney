import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Plus, Trash2, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Goals() {
  const { selectedKid } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(null);
  const [form, setForm] = useState({ title: '', target_amount: '', deadline: '' });
  const [contributeAmt, setContributeAmt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (selectedKid) loadGoals(); }, [selectedKid]);

  const loadGoals = async () => {
    try {
      const { data } = await API.get(`/goals/${selectedKid.id}`);
      setGoals(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.target_amount) { toast.error('Title and target are required'); return; }
    setSubmitting(true);
    try {
      await API.post('/goals', { kid_id: selectedKid.id, title: form.title, target_amount: parseFloat(form.target_amount), deadline: form.deadline || null });
      toast.success('Goal created!');
      setCreateOpen(false);
      setForm({ title: '', target_amount: '', deadline: '' });
      loadGoals();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleContribute = async (goalId) => {
    if (!contributeAmt || parseFloat(contributeAmt) <= 0) { toast.error('Enter a valid amount'); return; }
    setSubmitting(true);
    try {
      await API.put(`/goals/${goalId}/contribute`, { amount: parseFloat(contributeAmt) });
      toast.success('Savings added!');
      setContributeOpen(null);
      setContributeAmt('');
      loadGoals();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (goalId) => {
    try {
      await API.delete(`/goals/${goalId}`);
      toast.success('Goal deleted');
      loadGoals();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  if (!selectedKid) return <p className="text-muted-foreground text-center py-20">Select a child first</p>;

  return (
    <div className="animate-fade-in" data-testid="goals-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">Goals</h1>
          <p className="text-muted-foreground text-sm">Savings goals for {selectedKid.name}</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full font-semibold shadow-lg shadow-primary/20" data-testid="create-goal-btn">
              <Plus className="w-4 h-4 mr-2" /> New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader><DialogTitle className="font-heading text-xl">Create Goal</DialogTitle><DialogDescription className="text-sm text-muted-foreground">Set a savings target</DialogDescription></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Goal Title</Label>
                <Input placeholder="e.g., New bicycle" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="rounded-xl h-12" data-testid="goal-title-input" />
              </div>
              <div className="space-y-2">
                <Label>Target Amount (coins)</Label>
                <Input type="number" min="1" placeholder="500" value={form.target_amount} onChange={e => setForm({...form, target_amount: e.target.value})} className="rounded-xl h-12" data-testid="goal-target-input" />
              </div>
              <div className="space-y-2">
                <Label>Deadline (optional)</Label>
                <Input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="rounded-xl h-12" data-testid="goal-deadline-input" />
              </div>
              <Button type="submit" className="w-full rounded-full h-12 font-semibold" disabled={submitting} data-testid="submit-goal-btn">
                {submitting ? 'Creating...' : 'Create Goal'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-32 bg-muted rounded-3xl animate-pulse" />)}</div>
      ) : goals.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2">
          <CardContent className="p-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No goals yet. Create one to start saving!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const pct = Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
            return (
              <Card key={goal.id} className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-secondary/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{goal.title}</h4>
                        <p className="text-xs text-muted-foreground">{goal.saved_amount} / {goal.target_amount} coins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`rounded-full border-0 text-[10px] ${goal.status === 'completed' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                        {goal.status === 'completed' ? 'Achieved!' : 'Active'}
                      </Badge>
                      <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(goal.id)} data-testid={`delete-goal-${goal.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2.5 rounded-full mb-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{Math.round(pct)}% saved</span>
                    {goal.status === 'active' && (
                      <Dialog open={contributeOpen === goal.id} onOpenChange={(v) => { setContributeOpen(v ? goal.id : null); setContributeAmt(''); }}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="rounded-full text-xs" data-testid={`contribute-goal-${goal.id}`}>
                            <ArrowUpRight className="w-3 h-3 mr-1" /> Save
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-3xl max-w-sm">
                          <DialogHeader><DialogTitle className="font-heading">Add Savings</DialogTitle><DialogDescription className="text-sm text-muted-foreground">Contribute to this goal</DialogDescription></DialogHeader>
                          <div className="space-y-4 mt-2">
                            <div className="space-y-2">
                              <Label>Amount (coins)</Label>
                              <Input type="number" min="1" value={contributeAmt} onChange={e => setContributeAmt(e.target.value)} className="rounded-xl h-12" placeholder="How much to save?" data-testid="contribute-amount-input" />
                            </div>
                            <Button className="w-full rounded-full h-12 font-semibold" onClick={() => handleContribute(goal.id)} disabled={submitting} data-testid="submit-contribute-btn">
                              {submitting ? 'Saving...' : 'Add to Savings'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

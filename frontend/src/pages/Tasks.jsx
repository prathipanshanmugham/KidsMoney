import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, CheckSquare, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-blue-500/10 text-blue-600', icon: Clock },
  completed: { label: 'Awaiting Approval', color: 'bg-yellow-500/10 text-yellow-600', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-secondary/10 text-secondary', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

export default function Tasks() {
  const { selectedKid } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', reward_amount: '', penalty_amount: '0', frequency: 'one-time', approval_required: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (selectedKid) loadTasks(); }, [selectedKid]);

  const loadTasks = async () => {
    try {
      const { data } = await API.get(`/tasks/${selectedKid.id}`);
      setTasks(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.reward_amount) { toast.error('Title and reward are required'); return; }
    setSubmitting(true);
    try {
      await API.post('/tasks', { ...form, kid_id: selectedKid.id, reward_amount: parseFloat(form.reward_amount), penalty_amount: parseFloat(form.penalty_amount) || 0 });
      toast.success('Task created!');
      setCreateOpen(false);
      setForm({ title: '', description: '', reward_amount: '', penalty_amount: '0', frequency: 'one-time', approval_required: true });
      loadTasks();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to create task'); }
    finally { setSubmitting(false); }
  };

  const handleAction = async (taskId, action) => {
    try {
      await API.put(`/tasks/${taskId}/${action}`);
      toast.success(`Task ${action}d!`);
      loadTasks();
    } catch (err) { toast.error(err.response?.data?.detail || `Failed to ${action} task`); }
  };

  if (!selectedKid) return <p className="text-muted-foreground text-center py-20">Select a child first</p>;

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const awaitingTasks = tasks.filter(t => t.status === 'completed');
  const doneTasks = tasks.filter(t => t.status === 'approved' || t.status === 'rejected');

  return (
    <div className="animate-fade-in" data-testid="tasks-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">Tasks</h1>
          <p className="text-muted-foreground text-sm">Manage tasks for {selectedKid.name}</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full font-semibold shadow-lg shadow-primary/20" data-testid="create-task-btn">
              <Plus className="w-4 h-4 mr-2" /> New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader><DialogTitle className="font-heading text-xl">Create Task</DialogTitle><DialogDescription className="text-sm text-muted-foreground">Assign a task with reward</DialogDescription></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g., Clean your room" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="rounded-xl h-12" data-testid="task-title-input" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Optional details" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="rounded-xl h-12" data-testid="task-desc-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reward (coins)</Label>
                  <Input type="number" min="1" placeholder="10" value={form.reward_amount} onChange={e => setForm({...form, reward_amount: e.target.value})} className="rounded-xl h-12" data-testid="task-reward-input" />
                </div>
                <div className="space-y-2">
                  <Label>Penalty (coins)</Label>
                  <Input type="number" min="0" placeholder="0" value={form.penalty_amount} onChange={e => setForm({...form, penalty_amount: e.target.value})} className="rounded-xl h-12" data-testid="task-penalty-input" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={v => setForm({...form, frequency: v})}>
                  <SelectTrigger className="rounded-xl h-12" data-testid="task-frequency-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <Label className="text-sm">Requires approval</Label>
                <Switch checked={form.approval_required} onCheckedChange={v => setForm({...form, approval_required: v})} data-testid="task-approval-switch" />
              </div>
              <Button type="submit" className="w-full rounded-full h-12 font-semibold" disabled={submitting} data-testid="submit-task-btn">
                {submitting ? 'Creating...' : 'Create Task'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="rounded-full bg-muted/50 p-1">
          <TabsTrigger value="active" className="rounded-full text-sm" data-testid="tasks-tab-active">Active ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="awaiting" className="rounded-full text-sm" data-testid="tasks-tab-awaiting">Awaiting ({awaitingTasks.length})</TabsTrigger>
          <TabsTrigger value="done" className="rounded-full text-sm" data-testid="tasks-tab-done">Done ({doneTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3">
          {pendingTasks.length === 0 ? (
            <Card className="rounded-3xl"><CardContent className="p-8 text-center text-muted-foreground text-sm">No active tasks</CardContent></Card>
          ) : pendingTasks.map(task => (
            <TaskCard key={task.id} task={task} onAction={handleAction} />
          ))}
        </TabsContent>
        <TabsContent value="awaiting" className="space-y-3">
          {awaitingTasks.length === 0 ? (
            <Card className="rounded-3xl"><CardContent className="p-8 text-center text-muted-foreground text-sm">No tasks awaiting approval</CardContent></Card>
          ) : awaitingTasks.map(task => (
            <TaskCard key={task.id} task={task} onAction={handleAction} />
          ))}
        </TabsContent>
        <TabsContent value="done" className="space-y-3">
          {doneTasks.length === 0 ? (
            <Card className="rounded-3xl"><CardContent className="p-8 text-center text-muted-foreground text-sm">No completed tasks yet</CardContent></Card>
          ) : doneTasks.map(task => (
            <TaskCard key={task.id} task={task} onAction={handleAction} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskCard({ task, onAction }) {
  const cfg = STATUS_CONFIG[task.status];
  const StatusIcon = cfg.icon;
  return (
    <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mt-0.5">
              <CheckSquare className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{task.title}</h4>
              {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className={`rounded-full border-0 text-[10px] ${cfg.color}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />{cfg.label}
                </Badge>
                <Badge variant="outline" className="rounded-full text-[10px]">+{task.reward_amount} coins</Badge>
                {task.penalty_amount > 0 && <Badge variant="outline" className="rounded-full text-[10px] text-destructive border-destructive/30">-{task.penalty_amount}</Badge>}
                <Badge variant="outline" className="rounded-full text-[10px]">{task.frequency}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {task.status === 'pending' && (
              <Button size="sm" className="rounded-full text-xs" onClick={() => onAction(task.id, 'complete')} data-testid={`complete-task-${task.id}`}>
                Done
              </Button>
            )}
            {task.status === 'completed' && (
              <>
                <Button size="sm" className="rounded-full text-xs bg-secondary hover:bg-secondary/90" onClick={() => onAction(task.id, 'approve')} data-testid={`approve-task-${task.id}`}>
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive" onClick={() => onAction(task.id, 'reject')} data-testid={`reject-task-${task.id}`}>
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

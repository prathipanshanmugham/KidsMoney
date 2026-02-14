import { useState, useEffect } from 'react';
import { useKidTheme } from '@/components/KidLayout';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const STATUS = {
  pending: { label: 'To Do', color: 'bg-blue-500/10 text-blue-600', icon: Clock },
  completed: { label: 'Awaiting Approval', color: 'bg-yellow-500/10 text-yellow-600', icon: AlertCircle },
  approved: { label: 'Approved', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-600', icon: XCircle },
};

export default function KidTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useKidTheme();

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const { data } = await API.get('/kid/tasks'); setTasks(data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleComplete = async (taskId) => {
    try {
      await API.put(`/kid/tasks/${taskId}/complete`);
      toast.success('Task marked as done!');
      load();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const pending = tasks.filter(t => t.status === 'pending');
  const awaiting = tasks.filter(t => t.status === 'completed');
  const done = tasks.filter(t => t.status === 'approved' || t.status === 'rejected');

  return (
    <div className="animate-fade-in" data-testid="kid-tasks-page">
      <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">My Tasks</h1>
      <p className="text-muted-foreground text-sm mb-8">Complete tasks to earn coins and XP!</p>

      <Tabs defaultValue="todo" className="space-y-6">
        <TabsList className="rounded-full bg-muted/50 p-1">
          <TabsTrigger value="todo" className="rounded-full text-sm" data-testid="kid-tasks-tab-todo">To Do ({pending.length})</TabsTrigger>
          <TabsTrigger value="waiting" className="rounded-full text-sm" data-testid="kid-tasks-tab-waiting">Waiting ({awaiting.length})</TabsTrigger>
          <TabsTrigger value="done" className="rounded-full text-sm" data-testid="kid-tasks-tab-done">Done ({done.length})</TabsTrigger>
        </TabsList>

        {['todo', 'waiting', 'done'].map(tab => {
          const list = tab === 'todo' ? pending : tab === 'waiting' ? awaiting : done;
          return (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {list.length === 0 ? (
                <Card className="rounded-3xl"><CardContent className="p-8 text-center text-muted-foreground text-sm">{tab === 'todo' ? 'No tasks to do right now!' : tab === 'waiting' ? 'Nothing waiting for approval' : 'No completed tasks yet'}</CardContent></Card>
              ) : list.map(task => {
                const cfg = STATUS[task.status];
                const Icon = cfg.icon;
                return (
                  <Card key={task.id} className={`rounded-3xl border ${t.cardBorder} shadow-sm`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center mt-0.5" style={{ backgroundColor: t.primary + '15' }}>
                            <CheckSquare className="w-5 h-5" style={{ color: t.primary }} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{task.title}</h4>
                            {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge className={`rounded-full border-0 text-[10px] ${cfg.color}`}><Icon className="w-3 h-3 mr-1" />{cfg.label}</Badge>
                              <Badge className={`rounded-full border-0 text-[10px] ${t.badge}`}>+{task.reward_amount} coins</Badge>
                            </div>
                          </div>
                        </div>
                        {task.status === 'pending' && (
                          <Button size="sm" className="rounded-full text-xs" style={{ backgroundColor: t.primary }} onClick={() => handleComplete(task.id)} data-testid={`kid-complete-${task.id}`}>
                            Done!
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

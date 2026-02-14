import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, Plus, Pause, Play, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SIP() {
  const { selectedKid } = useAuth();
  const [sips, setSips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ amount: '', interest_rate: '8' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (selectedKid) loadSIPs(); }, [selectedKid]);

  const loadSIPs = async () => {
    try {
      const { data } = await API.get(`/sip/${selectedKid.id}`);
      setSips(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.amount) { toast.error('Amount is required'); return; }
    setSubmitting(true);
    try {
      await API.post('/sip', { kid_id: selectedKid.id, amount: parseFloat(form.amount), interest_rate: parseFloat(form.interest_rate) });
      toast.success('SIP created!');
      setCreateOpen(false);
      setForm({ amount: '', interest_rate: '8' });
      loadSIPs();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handlePay = async (sipId) => {
    try {
      await API.post(`/sip/${sipId}/pay`);
      toast.success('SIP payment made!');
      loadSIPs();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const handlePause = async (sipId) => {
    try {
      await API.put(`/sip/${sipId}/pause`);
      toast.success('SIP status updated');
      loadSIPs();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  function generateChartData(sip) {
    const data = [{ month: 0, invested: 0, value: 0 }];
    const r = sip.interest_rate / 100 / 12;
    for (let i = 1; i <= Math.max(sip.payments_made, 12); i++) {
      const invested = sip.amount * i;
      const value = r > 0 ? sip.amount * ((Math.pow(1 + r, i) - 1) / r) * (1 + r) : invested;
      data.push({ month: i, invested: Math.round(invested), value: Math.round(value) });
    }
    return data;
  }

  if (!selectedKid) return <p className="text-muted-foreground text-center py-20">Select a child first</p>;

  return (
    <div className="animate-fade-in" data-testid="sip-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">Invest (SIP)</h1>
          <p className="text-muted-foreground text-sm">Systematic Investment Plan for {selectedKid.name}</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full font-semibold shadow-lg shadow-primary/20" data-testid="create-sip-btn">
              <Plus className="w-4 h-4 mr-2" /> New SIP
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader><DialogTitle className="font-heading text-xl">Create SIP</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Monthly Amount (coins)</Label>
                <Input type="number" min="1" placeholder="50" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="rounded-xl h-12" data-testid="sip-amount-input" />
              </div>
              <div className="space-y-2">
                <Label>Annual Interest Rate (%)</Label>
                <Input type="number" min="0" max="50" step="0.5" value={form.interest_rate} onChange={e => setForm({...form, interest_rate: e.target.value})} className="rounded-xl h-12" data-testid="sip-rate-input" />
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl">
                <p className="text-xs text-muted-foreground mb-1">Estimated value after 12 months</p>
                <p className="text-lg font-bold font-heading text-secondary">
                  {form.amount ? (() => {
                    const a = parseFloat(form.amount);
                    const r = parseFloat(form.interest_rate) / 100 / 12;
                    return r > 0 ? Math.round(a * ((Math.pow(1 + r, 12) - 1) / r) * (1 + r)) : a * 12;
                  })() : 0} coins
                </p>
              </div>
              <Button type="submit" className="w-full rounded-full h-12 font-semibold" disabled={submitting} data-testid="submit-sip-btn">
                {submitting ? 'Creating...' : 'Start SIP'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">{[1].map(i => <div key={i} className="h-48 bg-muted rounded-3xl animate-pulse" />)}</div>
      ) : sips.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2">
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No SIPs yet. Start investing!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sips.map(sip => {
            const chartData = generateChartData(sip);
            const profit = sip.current_value - sip.total_invested;
            return (
              <Card key={sip.id} className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{sip.amount} coins/month</h4>
                        <p className="text-xs text-muted-foreground">{sip.interest_rate}% annual rate</p>
                      </div>
                    </div>
                    <Badge className={`rounded-full border-0 text-[10px] ${sip.status === 'active' ? 'bg-secondary/10 text-secondary' : 'bg-yellow-500/10 text-yellow-600'}`}>
                      {sip.status}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-muted/30 rounded-2xl p-3 text-center">
                      <p className="text-[10px] text-muted-foreground">Invested</p>
                      <p className="text-sm font-bold font-heading">{sip.total_invested}</p>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-3 text-center">
                      <p className="text-[10px] text-muted-foreground">Value</p>
                      <p className="text-sm font-bold font-heading text-secondary">{sip.current_value}</p>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-3 text-center">
                      <p className="text-[10px] text-muted-foreground">Returns</p>
                      <p className={`text-sm font-bold font-heading ${profit >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                        {profit >= 0 ? '+' : ''}{profit.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {/* Chart */}
                  {sip.payments_made > 0 && (
                    <div className="h-40 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id={`grad-${sip.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                          <Area type="monotone" dataKey="invested" stroke="#94A3B8" strokeWidth={1.5} fill="none" strokeDasharray="4 4" name="Invested" />
                          <Area type="monotone" dataKey="value" stroke="#A78BFA" strokeWidth={2} fill={`url(#grad-${sip.id})`} name="Value" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {sip.status === 'active' && (
                      <Button size="sm" className="rounded-full text-xs flex-1" onClick={() => handlePay(sip.id)} data-testid={`pay-sip-${sip.id}`}>
                        <ArrowUpRight className="w-3 h-3 mr-1" /> Pay Monthly
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => handlePause(sip.id)} data-testid={`pause-sip-${sip.id}`}>
                      {sip.status === 'active' ? <><Pause className="w-3 h-3 mr-1" /> Pause</> : <><Play className="w-3 h-3 mr-1" /> Resume</>}
                    </Button>
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

import { useState, useEffect } from 'react';
import { useKidTheme } from '@/components/KidLayout';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ArrowUpRight, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function KidSIP() {
  const [sips, setSips] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useKidTheme();

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const { data } = await API.get('/kid/sip'); setSips(data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handlePay = async (sipId) => {
    try { await API.post(`/kid/sip/${sipId}/pay`); toast.success('SIP payment made!'); load(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const chartData = (sip) => {
    const d = [{ month: 0, invested: 0, value: 0 }];
    const r = sip.interest_rate / 100 / 12;
    for (let i = 1; i <= Math.max(sip.payments_made, 12); i++) {
      const inv = sip.amount * i;
      const val = r > 0 ? sip.amount * ((Math.pow(1 + r, i) - 1) / r) * (1 + r) : inv;
      d.push({ month: i, invested: Math.round(inv), value: Math.round(val) });
    }
    return d;
  };

  return (
    <div className="animate-fade-in" data-testid="kid-sip-page">
      <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">My Investments</h1>
      <p className="text-muted-foreground text-sm mb-8">Watch your money grow!</p>

      {loading ? <div className="h-48 bg-muted/50 rounded-3xl animate-pulse" /> : sips.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2"><CardContent className="p-12 text-center"><TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No SIPs yet. Ask your parent to start one!</p></CardContent></Card>
      ) : (
        <div className="space-y-6">
          {sips.map(sip => {
            const profit = sip.current_value - sip.total_invested;
            return (
              <Card key={sip.id} className={`rounded-3xl border ${t.cardBorder} shadow-sm`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: t.primary + '15' }}>
                        <TrendingUp className="w-5 h-5" style={{ color: t.primary }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{sip.amount} coins/month</h4>
                        <p className="text-xs text-muted-foreground">{sip.interest_rate}% annual rate</p>
                      </div>
                    </div>
                    <Badge className={`rounded-full border-0 text-[10px] ${sip.status === 'active' ? t.badge : 'bg-yellow-100 text-yellow-700'}`}>{sip.status}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-muted/30 rounded-2xl p-3 text-center"><p className="text-[10px] text-muted-foreground">Invested</p><p className="text-sm font-bold">{sip.total_invested}</p></div>
                    <div className="bg-muted/30 rounded-2xl p-3 text-center"><p className="text-[10px] text-muted-foreground">Value</p><p className="text-sm font-bold" style={{ color: t.primary }}>{sip.current_value}</p></div>
                    <div className="bg-muted/30 rounded-2xl p-3 text-center"><p className="text-[10px] text-muted-foreground">Returns</p><p className={`text-sm font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{profit >= 0 ? '+' : ''}{profit.toFixed(0)}</p></div>
                  </div>
                  {sip.payments_made > 0 && (
                    <div className="h-40 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData(sip)}>
                          <defs><linearGradient id={`kg-${sip.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={t.primary} stopOpacity={0.3} /><stop offset="100%" stopColor={t.primary} stopOpacity={0} /></linearGradient></defs>
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                          <Area type="monotone" dataKey="invested" stroke="#94A3B8" strokeWidth={1.5} fill="none" strokeDasharray="4 4" name="Invested" />
                          <Area type="monotone" dataKey="value" stroke={t.primary} strokeWidth={2} fill={`url(#kg-${sip.id})`} name="Value" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {sip.status === 'active' && (
                    <Button size="sm" className="rounded-full text-xs w-full" style={{ backgroundColor: t.primary }} onClick={() => handlePay(sip.id)} data-testid={`kid-pay-sip-${sip.id}`}>
                      <ArrowUpRight className="w-3 h-3 mr-1" /> Pay Monthly SIP
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

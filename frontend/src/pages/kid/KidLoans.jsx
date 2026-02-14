import { useState, useEffect } from 'react';
import { useKidTheme } from '@/components/KidLayout';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Banknote, CreditCard, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const LOAN_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
  active: { label: 'Active', color: 'bg-blue-500/10 text-blue-600', icon: CreditCard },
  completed: { label: 'Paid Off', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  defaulted: { label: 'Defaulted', color: 'bg-red-500/10 text-red-600', icon: AlertTriangle },
};

export default function KidLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useKidTheme();

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const { data } = await API.get('/kid/loans'); setLoans(data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handlePay = async (loanId) => {
    try { await API.post(`/kid/loans/${loanId}/pay`); toast.success('EMI paid!'); load(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  return (
    <div className="animate-fade-in" data-testid="kid-loans-page">
      <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">My Loans</h1>
      <p className="text-muted-foreground text-sm mb-8">Pay back on time to build your credit!</p>

      {loading ? <div className="h-48 bg-muted/50 rounded-3xl animate-pulse" /> : loans.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2"><CardContent className="p-12 text-center"><Banknote className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No loans yet.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {loans.map(loan => {
            const cfg = LOAN_STATUS[loan.status] || LOAN_STATUS.pending;
            const Icon = cfg.icon;
            const paid = loan.principal - loan.remaining_balance;
            const paidPct = loan.principal > 0 ? (paid / loan.principal) * 100 : 0;
            return (
              <Card key={loan.id} className={`rounded-3xl border ${t.cardBorder} shadow-sm`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: t.primary + '15' }}>
                        <Banknote className="w-5 h-5" style={{ color: t.primary }} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{loan.purpose}</h4>
                        <p className="text-xs text-muted-foreground">{loan.interest_rate}% rate</p>
                      </div>
                    </div>
                    <Badge className={`rounded-full border-0 text-[10px] ${cfg.color}`}><Icon className="w-3 h-3 mr-1" />{cfg.label}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-muted/30 rounded-2xl p-3 text-center"><p className="text-[10px] text-muted-foreground">Borrowed</p><p className="text-sm font-bold">{loan.principal}</p></div>
                    <div className="bg-muted/30 rounded-2xl p-3 text-center"><p className="text-[10px] text-muted-foreground">EMI</p><p className="text-sm font-bold">{loan.emi_amount}</p></div>
                    <div className="bg-muted/30 rounded-2xl p-3 text-center"><p className="text-[10px] text-muted-foreground">Left</p><p className="text-sm font-bold text-red-500">{loan.remaining_balance}</p></div>
                  </div>
                  {loan.status === 'active' && (
                    <>
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Repayment</span><span>{loan.payments_made} payments</span></div>
                        <Progress value={paidPct} className="h-2 rounded-full" />
                      </div>
                      <Button size="sm" className="rounded-full text-xs w-full" style={{ backgroundColor: t.primary }} onClick={() => handlePay(loan.id)} data-testid={`kid-pay-loan-${loan.id}`}>
                        <CreditCard className="w-3 h-3 mr-1" /> Pay EMI ({loan.emi_amount} coins)
                      </Button>
                    </>
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

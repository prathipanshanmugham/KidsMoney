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
import { Banknote, Plus, CreditCard, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const LOAN_STATUS = {
  pending: { label: 'Pending Approval', color: 'bg-yellow-500/10 text-yellow-600', icon: Clock },
  active: { label: 'Active', color: 'bg-primary/10 text-primary', icon: CreditCard },
  completed: { label: 'Paid Off', color: 'bg-secondary/10 text-secondary', icon: CheckCircle },
  defaulted: { label: 'Defaulted', color: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
};

export default function Loans() {
  const { selectedKid } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ amount: '', purpose: '', duration_months: '6', interest_rate: '5' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (selectedKid) loadLoans(); }, [selectedKid]);

  const loadLoans = async () => {
    try {
      const { data } = await API.get(`/loans/${selectedKid.id}`);
      setLoans(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.purpose) { toast.error('Amount and purpose required'); return; }
    setSubmitting(true);
    try {
      await API.post('/loans/request', {
        kid_id: selectedKid.id,
        amount: parseFloat(form.amount),
        purpose: form.purpose,
        duration_months: parseInt(form.duration_months),
        interest_rate: parseFloat(form.interest_rate)
      });
      toast.success('Loan requested!');
      setCreateOpen(false);
      setForm({ amount: '', purpose: '', duration_months: '6', interest_rate: '5' });
      loadLoans();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleApprove = async (loanId) => {
    try {
      await API.post(`/loans/${loanId}/approve`);
      toast.success('Loan approved!');
      loadLoans();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const handlePay = async (loanId) => {
    try {
      await API.post(`/loans/${loanId}/pay`);
      toast.success('EMI paid!');
      loadLoans();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  if (!selectedKid) return <p className="text-muted-foreground text-center py-20">Select a child first</p>;

  // EMI preview calc
  const previewEMI = () => {
    const p = parseFloat(form.amount) || 0;
    const r = (parseFloat(form.interest_rate) || 0) / 100 / 12;
    const n = parseInt(form.duration_months) || 6;
    if (p === 0) return 0;
    if (r === 0) return Math.round(p / n);
    return Math.round(p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
  };

  return (
    <div className="animate-fade-in" data-testid="loans-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">Borrow</h1>
          <p className="text-muted-foreground text-sm">Loan management for {selectedKid.name}</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full font-semibold shadow-lg shadow-primary/20" data-testid="request-loan-btn">
              <Plus className="w-4 h-4 mr-2" /> Request Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-w-md">
            <DialogHeader><DialogTitle className="font-heading text-xl">Request Loan</DialogTitle><DialogDescription className="text-sm text-muted-foreground">Borrow coins and learn about EMI</DialogDescription></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Input placeholder="What is this loan for?" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} className="rounded-xl h-12" data-testid="loan-purpose-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (coins)</Label>
                  <Input type="number" min="1" placeholder="100" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="rounded-xl h-12" data-testid="loan-amount-input" />
                </div>
                <div className="space-y-2">
                  <Label>Duration (months)</Label>
                  <Input type="number" min="1" max="24" value={form.duration_months} onChange={e => setForm({...form, duration_months: e.target.value})} className="rounded-xl h-12" data-testid="loan-duration-input" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Interest Rate (%)</Label>
                <Input type="number" min="0" max="50" step="0.5" value={form.interest_rate} onChange={e => setForm({...form, interest_rate: e.target.value})} className="rounded-xl h-12" data-testid="loan-rate-input" />
              </div>
              <div className="p-4 bg-muted/30 rounded-2xl">
                <p className="text-xs text-muted-foreground mb-1">Estimated EMI</p>
                <p className="text-lg font-bold font-heading text-primary">{previewEMI()} coins/month</p>
              </div>
              <Button type="submit" className="w-full rounded-full h-12 font-semibold" disabled={submitting} data-testid="submit-loan-btn">
                {submitting ? 'Requesting...' : 'Request Loan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">{[1].map(i => <div key={i} className="h-48 bg-muted rounded-3xl animate-pulse" />)}</div>
      ) : loans.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2">
          <CardContent className="p-12 text-center">
            <Banknote className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No loans yet. Request one to learn about borrowing!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {loans.map(loan => {
            const cfg = LOAN_STATUS[loan.status] || LOAN_STATUS.pending;
            const StatusIcon = cfg.icon;
            const paid = loan.principal - loan.remaining_balance;
            const paidPct = loan.principal > 0 ? (paid / loan.principal) * 100 : 0;
            return (
              <Card key={loan.id} className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                        <Banknote className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{loan.purpose}</h4>
                        <p className="text-xs text-muted-foreground">{loan.interest_rate}% rate · {loan.duration_months} months</p>
                      </div>
                    </div>
                    <Badge className={`rounded-full border-0 text-[10px] ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />{cfg.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-muted/30 rounded-2xl p-3 text-center">
                      <p className="text-[10px] text-muted-foreground">Principal</p>
                      <p className="text-sm font-bold">{loan.principal}</p>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-3 text-center">
                      <p className="text-[10px] text-muted-foreground">EMI</p>
                      <p className="text-sm font-bold">{loan.emi_amount}</p>
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-3 text-center">
                      <p className="text-[10px] text-muted-foreground">Remaining</p>
                      <p className="text-sm font-bold text-destructive">{loan.remaining_balance}</p>
                    </div>
                  </div>

                  {loan.status === 'active' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Repayment progress</span>
                        <span>{loan.payments_made} payments made</span>
                      </div>
                      <Progress value={paidPct} className="h-2 rounded-full" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {loan.status === 'pending' && (
                      <Button size="sm" className="rounded-full text-xs flex-1 bg-secondary hover:bg-secondary/90" onClick={() => handleApprove(loan.id)} data-testid={`approve-loan-${loan.id}`}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve Loan
                      </Button>
                    )}
                    {loan.status === 'active' && (
                      <Button size="sm" className="rounded-full text-xs flex-1" onClick={() => handlePay(loan.id)} data-testid={`pay-loan-${loan.id}`}>
                        <CreditCard className="w-3 h-3 mr-1" /> Pay EMI ({loan.emi_amount} coins)
                      </Button>
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

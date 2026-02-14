import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletCards, ArrowUpRight, ArrowDownRight, TrendingUp, PiggyBank, ShoppingBag } from 'lucide-react';

const CATEGORY_ICONS = {
  task: CheckIcon, sip: TrendingUp, emi: ArrowUpRight, goal: PiggyBank,
  goal_refund: ArrowDownRight, loan: ArrowDownRight, penalty: ShoppingBag, initial: WalletCards
};

function CheckIcon(props) { return <ArrowDownRight {...props} />; }

export default function Wallet() {
  const { selectedKid } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (selectedKid) loadData(); }, [selectedKid]);

  const loadData = async () => {
    try {
      const [walletRes, txnRes] = await Promise.all([
        API.get(`/wallet/${selectedKid.id}`),
        API.get(`/wallet/${selectedKid.id}/transactions`)
      ]);
      setWallet(walletRes.data);
      setTxns(txnRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (!selectedKid) return <p className="text-muted-foreground text-center py-20">Select a child first</p>;

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-3xl animate-pulse" />)}</div>;
  }

  return (
    <div className="animate-fade-in" data-testid="wallet-page">
      <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">Wallet</h1>
      <p className="text-muted-foreground text-sm mb-8">{selectedKid.name}'s finances</p>

      {/* Balance Card */}
      <Card className="rounded-3xl border-none bg-primary text-primary-foreground mb-8 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        <CardContent className="p-8 relative z-10">
          <p className="text-primary-foreground/70 text-sm mb-2">Current Balance</p>
          <p className="text-4xl font-bold font-heading" data-testid="wallet-total-balance">{wallet?.balance?.toFixed(0) || 0} <span className="text-lg font-normal opacity-70">coins</span></p>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
            <div>
              <p className="text-xs text-primary-foreground/60">Earned</p>
              <p className="text-lg font-semibold" data-testid="wallet-earned">{wallet?.total_earned?.toFixed(0) || 0}</p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/60">Spent</p>
              <p className="text-lg font-semibold" data-testid="wallet-spent">{wallet?.total_spent?.toFixed(0) || 0}</p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/60">Saved</p>
              <p className="text-lg font-semibold" data-testid="wallet-saved">{wallet?.total_saved?.toFixed(0) || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <h3 className="font-semibold font-heading mb-4">Transaction History</h3>
      {txns.length === 0 ? (
        <Card className="rounded-3xl"><CardContent className="p-8 text-center text-muted-foreground text-sm">No transactions yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {txns.map(txn => (
            <Card key={txn.id} className="rounded-2xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'credit' ? 'bg-secondary/10' : 'bg-destructive/10'}`}>
                      {txn.type === 'credit' ? <ArrowDownRight className="w-5 h-5 text-secondary" /> : <ArrowUpRight className="w-5 h-5 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{txn.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="rounded-full text-[10px] py-0">{txn.category}</Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${txn.type === 'credit' ? 'text-secondary' : 'text-destructive'}`}>
                    {txn.type === 'credit' ? '+' : '-'}{txn.amount}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

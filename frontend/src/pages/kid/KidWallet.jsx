import { useState, useEffect } from 'react';
import { useKidTheme } from '@/components/KidLayout';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletCards, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KidWallet() {
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useKidTheme();

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [w, tx] = await Promise.all([API.get('/kid/wallet'), API.get('/kid/transactions')]);
      setWallet(w.data); setTxns(tx.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-24 bg-muted/50 rounded-3xl animate-pulse" />)}</div>;

  return (
    <div className="animate-fade-in" data-testid="kid-wallet-page">
      <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">My Wallet</h1>
      <p className="text-muted-foreground text-sm mb-8">Your money at a glance</p>

      <Card className="rounded-3xl border-none overflow-hidden mb-8 text-white" style={{ backgroundColor: t.primary }}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        <CardContent className="p-8 relative z-10">
          <p className="text-white/70 text-sm mb-2">My Balance</p>
          <p className="text-4xl font-bold font-heading" data-testid="kid-wallet-balance">{wallet?.balance?.toFixed(0) || 0} <span className="text-lg font-normal opacity-70">coins</span></p>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
            <div><p className="text-xs text-white/60">Earned</p><p className="text-lg font-semibold">{wallet?.total_earned?.toFixed(0) || 0}</p></div>
            <div><p className="text-xs text-white/60">Spent</p><p className="text-lg font-semibold">{wallet?.total_spent?.toFixed(0) || 0}</p></div>
            <div><p className="text-xs text-white/60">Saved</p><p className="text-lg font-semibold">{wallet?.total_saved?.toFixed(0) || 0}</p></div>
          </div>
        </CardContent>
      </Card>

      <h3 className="font-semibold font-heading mb-4">Recent Activity</h3>
      {txns.length === 0 ? (
        <Card className="rounded-3xl"><CardContent className="p-8 text-center text-muted-foreground text-sm">No transactions yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {txns.map(txn => (
            <Card key={txn.id} className={`rounded-2xl border ${t.cardBorder} shadow-sm`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {txn.type === 'credit' ? <ArrowDownRight className="w-5 h-5 text-green-500" /> : <ArrowUpRight className="w-5 h-5 text-red-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{txn.description}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${txn.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
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

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import API from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Sun, Moon, User, Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const AVATAR_COLORS = {
  lion: '#FB923C', bear: '#A78BFA', fox: '#F472B6', rabbit: '#34D399',
  panda: '#4F7DF3', unicorn: '#FCD34D', owl: '#818CF8', dolphin: '#22D3EE'
};
const AVATAR_OPTIONS = ['lion', 'bear', 'fox', 'rabbit', 'panda', 'unicorn', 'owl', 'dolphin'];

export default function Settings() {
  const { user, kids, loadKids, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [editKid, setEditKid] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', age: '', avatar: '', grade: '' });
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', age: '', avatar: 'panda', grade: '', starting_balance: 0 });
  const [saving, setSaving] = useState(false);

  const openEdit = (kid) => {
    setEditKid(kid);
    setEditForm({ name: kid.name, age: String(kid.age), avatar: kid.avatar, grade: kid.grade || '' });
  };

  const handleEditSave = async () => {
    if (!editForm.name || !editForm.age) { toast.error('Name and age required'); return; }
    setSaving(true);
    try {
      await API.put(`/kids/${editKid.id}`, { name: editForm.name, age: parseInt(editForm.age), avatar: editForm.avatar, grade: editForm.grade || null });
      toast.success('Updated!');
      setEditKid(null);
      loadKids();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (kidId, name) => {
    if (!window.confirm(`Remove ${name}? This will delete all their data.`)) return;
    try {
      await API.delete(`/kids/${kidId}`);
      toast.success(`${name} removed`);
      loadKids();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.age) { toast.error('Name and age required'); return; }
    setSaving(true);
    try {
      await API.post('/kids', { ...addForm, age: parseInt(addForm.age), starting_balance: parseFloat(addForm.starting_balance) || 0 });
      toast.success(`${addForm.name} added!`);
      setAddOpen(false);
      setAddForm({ name: '', age: '', avatar: 'panda', grade: '', starting_balance: 0 });
      loadKids();
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-fade-in" data-testid="settings-page">
      <h1 className="text-3xl font-bold font-heading tracking-tight mb-1">Settings</h1>
      <p className="text-muted-foreground text-sm mb-8">Manage your account and preferences</p>

      {/* Profile */}
      <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5 mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold font-heading mb-4">Profile</h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{user?.full_name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="outline" className="rounded-full text-[10px] mt-1">Parent Account</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5 mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold font-heading mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-400" />}
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
              </div>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} data-testid="dark-mode-switch" />
          </div>
        </CardContent>
      </Card>

      {/* Kids Management */}
      <Card className="rounded-3xl border-none shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-none dark:bg-zinc-900/50 dark:border dark:border-white/5 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-heading">Children</h3>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-full text-xs" data-testid="settings-add-kid-btn">
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-w-md">
                <DialogHeader><DialogTitle className="font-heading text-xl">Add Child</DialogTitle><DialogDescription className="text-sm text-muted-foreground">Create a new child profile</DialogDescription></DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className="rounded-xl h-12" data-testid="settings-kid-name-input" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input type="number" min="3" max="18" value={addForm.age} onChange={e => setAddForm({...addForm, age: e.target.value})} className="rounded-xl h-12" data-testid="settings-kid-age-input" />
                    </div>
                    <div className="space-y-2">
                      <Label>Grade</Label>
                      <Input value={addForm.grade} onChange={e => setAddForm({...addForm, grade: e.target.value})} className="rounded-xl h-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Avatar</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {AVATAR_OPTIONS.map(av => (
                        <button type="button" key={av} onClick={() => setAddForm({...addForm, avatar: av})}
                          className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${addForm.avatar === av ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'bg-muted/50'}`}>
                          <span className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: AVATAR_COLORS[av] }}>{av[0].toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Starting Balance</Label>
                    <Input type="number" min="0" value={addForm.starting_balance} onChange={e => setAddForm({...addForm, starting_balance: e.target.value})} className="rounded-xl h-12" />
                  </div>
                  <Button type="submit" className="w-full rounded-full h-12 font-semibold" disabled={saving} data-testid="settings-submit-kid-btn">
                    {saving ? 'Adding...' : 'Add Child'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {kids.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No children added yet</p>
          ) : (
            <div className="space-y-3">
              {kids.map(kid => (
                <div key={kid.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: AVATAR_COLORS[kid.avatar] || '#4F7DF3' }}>
                      {kid.name[0]}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{kid.name}</p>
                      <p className="text-xs text-muted-foreground">Age {kid.age} · Level {kid.level}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8" onClick={() => openEdit(kid)} data-testid={`edit-kid-${kid.id}`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 text-destructive" onClick={() => handleDelete(kid.id, kid.name)} data-testid={`delete-kid-${kid.id}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Kid Dialog */}
      <Dialog open={!!editKid} onOpenChange={(v) => { if (!v) setEditKid(null); }}>
        <DialogContent className="rounded-3xl max-w-md">
          <DialogHeader><DialogTitle className="font-heading text-xl">Edit Child</DialogTitle><DialogDescription className="text-sm text-muted-foreground">Update child details</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="rounded-xl h-12" data-testid="edit-kid-name-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} className="rounded-xl h-12" data-testid="edit-kid-age-input" />
              </div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <Input value={editForm.grade} onChange={e => setEditForm({...editForm, grade: e.target.value})} className="rounded-xl h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Avatar</Label>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map(av => (
                  <button type="button" key={av} onClick={() => setEditForm({...editForm, avatar: av})}
                    className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${editForm.avatar === av ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'bg-muted/50'}`}>
                    <span className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: AVATAR_COLORS[av] }}>{av[0].toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full rounded-full h-12 font-semibold" onClick={handleEditSave} disabled={saving} data-testid="save-edit-kid-btn">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Injectable, inject, signal, computed } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Kid, Wallet } from '../models/interfaces';

export type AppRole = 'parent' | 'kid' | null;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  firebaseUser = signal<User | null>(null);
  role = signal<AppRole>(null);
  parentProfile = signal<any>(null);
  kidSession = signal<{ kid: Kid; wallet: Wallet } | null>(null);
  loading = signal(true);
  kids = signal<Kid[]>([]);
  selectedKid = signal<Kid | null>(null);

  isLoggedIn = computed(() => this.role() !== null);
  isParent = computed(() => this.role() === 'parent');
  isKid = computed(() => this.role() === 'kid');

  constructor() {
    onAuthStateChanged(this.auth, async (user) => {
      this.firebaseUser.set(user);
      if (user && !user.isAnonymous) {
        const profile = await this.loadParentProfile(user.uid);
        if (profile) {
          this.role.set('parent');
          this.parentProfile.set(profile);
          await this.loadKids();
        }
      } else if (!user) {
        const kidData = localStorage.getItem('km_kid_session');
        if (kidData) {
          try {
            const parsed = JSON.parse(kidData);
            this.kidSession.set(parsed);
            this.role.set('kid');
          } catch { localStorage.removeItem('km_kid_session'); }
        }
      }
      this.loading.set(false);
    });
  }

  private async loadParentProfile(uid: string) {
    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
      const snap = await Promise.race([getDoc(doc(this.firestore, 'users', uid)), timeout]) as any;
      return snap.exists() ? snap.data() : { uid, role: 'parent', full_name: 'Parent', email: '' };
    } catch {
      return { uid, role: 'parent', full_name: 'Parent', email: '' };
    }
  }

  async loadKids() {
    const user = this.firebaseUser();
    if (!user) return;
    const q = query(collection(this.firestore, 'kids'), where('parent_uid', '==', user.uid));
    const snap = await getDocs(q);
    const kidsList = snap.docs.map(d => d.data() as Kid);
    this.kids.set(kidsList);
    if (kidsList.length > 0) {
      const current = this.selectedKid();
      const existing = current ? kidsList.find(k => k.id === current.id) : null;
      this.selectedKid.set(existing || kidsList[0]);
    } else {
      this.selectedKid.set(null);
    }
  }

  async signup(fullName: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    const profile = {
      uid: cred.user.uid,
      email: email.toLowerCase(),
      full_name: fullName,
      role: 'parent',
      created_at: new Date().toISOString()
    };
    try {
      const writePromise = setDoc(doc(this.firestore, 'users', cred.user.uid), profile);
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 8000));
      await Promise.race([writePromise, timeout]);
    } catch (e) {
      console.warn('Firestore write failed, continuing with auth only:', e);
    }
    this.parentProfile.set(profile);
    this.role.set('parent');
  }

  async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async kidLogin(parentEmail: string, kidName: string, pin: string): Promise<void> {
    const usersQ = query(collection(this.firestore, 'users'), where('email', '==', parentEmail.toLowerCase()));
    const usersSnap = await getDocs(usersQ);
    if (usersSnap.empty) throw new Error('Invalid credentials');
    const parentUid = usersSnap.docs[0].data()['uid'];

    const kidsQ = query(
      collection(this.firestore, 'kids'),
      where('parent_uid', '==', parentUid),
      where('name', '==', kidName)
    );
    const kidsSnap = await getDocs(kidsQ);
    if (kidsSnap.empty) throw new Error('Invalid credentials');

    const kid = kidsSnap.docs[0].data() as Kid;
    if (kid.pin !== pin) throw new Error('Invalid credentials');

    const walletSnap = await getDoc(doc(this.firestore, 'wallets', kid.id));
    const wallet = walletSnap.exists() ? walletSnap.data() as Wallet : { kid_id: kid.id, balance: 0, total_earned: 0, total_spent: 0, total_saved: 0 };

    const session = { kid, wallet };
    this.kidSession.set(session);
    this.role.set('kid');
    localStorage.setItem('km_kid_session', JSON.stringify(session));
  }

  async logout() {
    localStorage.removeItem('km_kid_session');
    this.role.set(null);
    this.parentProfile.set(null);
    this.kidSession.set(null);
    this.kids.set([]);
    this.selectedKid.set(null);
    if (this.firebaseUser() && !this.firebaseUser()!.isAnonymous) {
      await signOut(this.auth);
    }
  }

  refreshKidSession(kid: Kid, wallet: Wallet) {
    const session = { kid, wallet };
    this.kidSession.set(session);
    localStorage.setItem('km_kid_session', JSON.stringify(session));
  }
}

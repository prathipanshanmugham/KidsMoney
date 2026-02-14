import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [kids, setKids] = useState([]);
  const [selectedKid, setSelectedKid] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadKids = useCallback(async () => {
    try {
      const { data } = await API.get('/kids');
      setKids(data);
      if (data.length > 0) {
        setSelectedKid(prev => {
          const existing = prev ? data.find(k => k.id === prev.id) : null;
          return existing || data[0];
        });
      } else {
        setSelectedKid(null);
      }
    } catch (e) {
      console.error('Failed to load kids:', e);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('km_token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const { data } = await API.get('/auth/me');
      setUser(data);
      await loadKids();
    } catch (e) {
      localStorage.removeItem('km_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('km_token', data.token);
    setUser(data.user);
    await loadKids();
    return data;
  };

  const signup = async (full_name, email, password) => {
    const { data } = await API.post('/auth/signup', { full_name, email, password });
    localStorage.setItem('km_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('km_token');
    setUser(null);
    setKids([]);
    setSelectedKid(null);
  };

  return (
    <AuthContext.Provider value={{ user, kids, selectedKid, loading, setSelectedKid, login, signup, logout, loadKids }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

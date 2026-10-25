import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { fetchDemoUsers } from '../services/api';
import {
  auth,
  loginWithGoogle,
  logoutFirebase,
  onAuthStateChanged,
  FirebaseUser
} from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  demoUsers: User[];
  switchUserRole: (role: UserRole) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isDemoAuth: boolean;
}

const DEFAULT_CITIZEN: User = {
  id: 'user-demo-citizen',
  email: 'rahul.menon@example.com',
  displayName: 'Rahul Menon (Commuter)',
  role: 'citizen',
  jurisdiction: 'Kochi Municipal Corp',
  phone: '+91 98470 12345',
};

const AuthContext = createContext<AuthContextType>({
  currentUser: DEFAULT_CITIZEN,
  firebaseUser: null,
  demoUsers: [],
  switchUserRole: () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  isDemoAuth: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_CITIZEN);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isDemoAuth, setIsDemoAuth] = useState<boolean>(true);

  // Fetch demo accounts
  useEffect(() => {
    fetchDemoUsers()
      .then(users => {
        if (users && users.length > 0) {
          setDemoUsers(users);
        }
      })
      .catch(err => {
        console.warn('Using fallback demo users', err);
      });
  }, []);

  // Listen to live Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setFirebaseUser(user);
        setIsDemoAuth(false);
        setCurrentUser({
          id: user.uid,
          email: user.email || 'user@example.com',
          displayName: user.displayName || user.email?.split('@')[0] || 'Authenticated User',
          role: 'citizen',
          jurisdiction: 'Kochi Municipal Corp',
          createdAt: new Date().toISOString()
        });
      } else {
        setFirebaseUser(null);
        setIsDemoAuth(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const switchUserRole = (role: UserRole) => {
    localStorage.setItem('roadguard_demo_role', role);
    const target = demoUsers.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
    } else {
      setCurrentUser(prev => (prev ? { ...prev, role } : { ...DEFAULT_CITIZEN, role }));
    }
    setIsDemoAuth(true);
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        setFirebaseUser(user);
        setIsDemoAuth(false);
        setCurrentUser({
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Google User',
          role: 'citizen',
          jurisdiction: 'Kochi Municipal Corp',
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error('Failed to sign in with Google:', err);
      alert(err.message || 'Google Sign-In failed');
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutFirebase();
      setFirebaseUser(null);
      setIsDemoAuth(true);
      setCurrentUser(DEFAULT_CITIZEN);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        demoUsers,
        switchUserRole,
        signInWithGoogle: handleGoogleSignIn,
        signOut: handleSignOut,
        isDemoAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

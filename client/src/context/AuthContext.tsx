import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { fetchDemoUsers } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  demoUsers: User[];
  switchUserRole: (role: UserRole) => void;
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
  demoUsers: [],
  switchUserRole: () => {},
  isDemoAuth: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_CITIZEN);
  const [isDemoAuth] = useState<boolean>(true);

  useEffect(() => {
    fetchDemoUsers()
      .then(users => {
        if (users && users.length > 0) {
          setDemoUsers(users);
          const savedRole = localStorage.getItem('roadguard_demo_role');
          const matched = savedRole ? users.find(u => u.role === savedRole) : users[0];
          setCurrentUser(matched || users[0]);
        }
      })
      .catch(err => {
        console.warn('Using default fallback demo users', err);
      });
  }, []);

  const switchUserRole = (role: UserRole) => {
    localStorage.setItem('roadguard_demo_role', role);
    const target = demoUsers.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
    } else {
      setCurrentUser(prev => ({ ...prev, role }));
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, demoUsers, switchUserRole, isDemoAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

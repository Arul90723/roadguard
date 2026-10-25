import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginWithEmail, registerWithEmail } from '../services/firebase';
import { UserRole } from '../types';
import {
  X,
  Shield,
  Mail,
  Lock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  LogIn,
  KeyRound,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, switchUserRole, currentUser, firebaseUser, signOut } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (authMode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setErrorMsg('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Try signing in.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password must be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in was cancelled or blocked.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSelect = (role: UserRole) => {
    switchUserRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-navy-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan">
              <Shield className="w-5 h-5 text-navy-950 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-mono tracking-wide">
                ROADGUARD CITIZEN AUTH
              </h3>
              <p className="text-[11px] text-slate-400">
                Official Firebase & Google Identity Provider
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User State if logged in */}
        {firebaseUser ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-950 border-2 border-cyan-400 mx-auto flex items-center justify-center text-cyan-400 text-xl font-bold shadow-glow-cyan">
              {firebaseUser.displayName?.charAt(0) || firebaseUser.email?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="text-base font-bold text-white">{firebaseUser.displayName || 'Google Account User'}</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{firebaseUser.email}</div>
              <span className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Firebase ID Verified
              </span>
            </div>
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/50 transition-all"
            >
              Sign Out from Device
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google One-Click Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-navy-950 font-black text-xs flex items-center justify-center gap-3 shadow-xl transition-all transform active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-navy-950 px-3 text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">
                Or with Email
              </span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-navy-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password (minimum 6 chars)"
                  className="w-full bg-navy-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 text-navy-950 font-black text-xs shadow-glow-cyan transition-all transform active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading
                  ? 'Verifying Token...'
                  : authMode === 'signin'
                  ? 'Sign In with Email'
                  : 'Create Firebase Account'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'register' : 'signin')}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  {authMode === 'signin'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>

            {/* Fast Demo Role Switcher for Hackathon Judges */}
            <div className="pt-3 border-t border-slate-800/80">
              <span className="block text-[10px] uppercase font-bold text-slate-500 mb-2 font-mono">
                Judge Fast Switch (Demo Personas)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoSelect('citizen')}
                  className="p-2 rounded-xl bg-navy-950/80 hover:bg-navy-800 border border-slate-700/80 text-[11px] font-semibold text-slate-300 transition-colors"
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSelect('authority')}
                  className="p-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-[11px] font-semibold text-indigo-300 transition-colors"
                >
                  Authority
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSelect('admin')}
                  className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-[11px] font-semibold text-purple-300 transition-colors"
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AuthModal;

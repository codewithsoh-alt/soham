import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthViewProps {
  onSuccessToast?: (msg: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccessToast }) => {
  const { signIn, signUp, signInDemo, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(cleanEmail, password);
        onSuccessToast?.('Account created! Welcome to your Daily Activity Tracker.');
      } else {
        await signIn(cleanEmail, password);
        onSuccessToast?.('Signed in successfully.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInDemo();
      onSuccessToast?.('Signed in as Demo Student.');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in as demo student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-sm mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Daily Activity Tracker
        </h1>
        <p className="text-xs uppercase tracking-wider font-semibold text-blue-600 mt-1">
          Student Academic Planner
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {/* Card Title */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'signin' ? 'Sign in to your account' : 'Create your student account'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'signin'
                ? 'Enter your credentials to access your personal daily activities and study schedule.'
                : 'Sign up to get started with your private student workspace and welcome task.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (min. 6 characters)"
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'signin' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Student Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign In & Sign Up */}
          <div className="mt-5 text-center">
            {mode === 'signin' ? (
              <p className="text-xs text-slate-600">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Or Instant Demo
            </span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Instant Demo Account Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Sign in as Demo Student</span>
          </button>

          {/* How Auth Works Explanation Accordion */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setInfoOpen(!infoOpen)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                How Supabase Auth works in this app
              </span>
              <span>{infoOpen ? '▲' : '▼'}</span>
            </button>

            {infoOpen && (
              <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                <p>
                  <strong>1. Engine:</strong> Uses Supabase Auth (GoTrue) to hash passwords server-side using bcrypt and securely issue JSON Web Tokens (JWT).
                </p>
                <p>
                  <strong>2. Session:</strong> Access tokens and refresh tokens are stored in the browser session. Refreshes keep you signed in automatically.
                </p>
                <p>
                  <strong>3. Isolation:</strong> Every student is assigned a unique <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800 font-mono text-[10px]">user.id</code>. Activities, categories, and calendar entries are partitioned strictly to your account.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{isConfigured ? 'Connected to configured Supabase project' : 'Resilient local mode active (credentials optional)'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Lock, Mail, AlertCircle, ArrowRight, UserCheck, Shield, Sparkles } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (user.role === 'job_seeker') navigate('/candidate/dashboard');
        else if (user.role === 'recruiter') navigate('/recruiter/dashboard');
        else if (user.role === 'admin') navigate('/admin/dashboard');
        else navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const user = await login(demoEmail, demoPassword);
      if (user.role === 'job_seeker') navigate('/candidate/dashboard');
      else if (user.role === 'recruiter') navigate('/recruiter/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Job<span className="text-brand-600">Connect</span>
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-xs text-slate-500">Sign in to your JobConnect account to continue</p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="bg-brand-50/70 border border-brand-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-900 mb-2.5">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Instant Demo Logins (Click to Test)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('seeker@jobconnect.ai', 'Seeker123!')}
              className="px-2.5 py-2 rounded-xl bg-white border border-brand-200 text-xs font-semibold text-slate-800 hover:bg-brand-50 hover:border-brand-400 transition-all text-center flex flex-col items-center justify-center space-y-1 shadow-2xs"
            >
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span className="text-[11px] leading-tight">Job Seeker</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('recruiter@techcorp.com', 'Recruiter123!')}
              className="px-2.5 py-2 rounded-xl bg-white border border-brand-200 text-xs font-semibold text-slate-800 hover:bg-brand-50 hover:border-brand-400 transition-all text-center flex flex-col items-center justify-center space-y-1 shadow-2xs"
            >
              <Briefcase className="w-4 h-4 text-brand-600" />
              <span className="text-[11px] leading-tight">Recruiter</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin@jobconnect.ai', 'AdminPass123!')}
              className="px-2.5 py-2 rounded-xl bg-white border border-brand-200 text-xs font-semibold text-slate-800 hover:bg-brand-50 hover:border-brand-400 transition-all text-center flex flex-col items-center justify-center space-y-1 shadow-2xs"
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-[11px] leading-tight">Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-800">
              Create an account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

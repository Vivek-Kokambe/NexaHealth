import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, User, Stethoscope, Building2, Shield, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login') {
      navigate(from);
      return;
    }
    switch (role) {
      case 'patient': navigate('/patient/dashboard'); break;
      case 'doctor': navigate('/doctor/dashboard'); break;
      case 'hospital': navigate('/hospital/dashboard'); break;
      case 'admin': navigate('/admin/dashboard'); break;
      default: navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      redirectAfterLogin(data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleType) => {
    setError('');
    setLoading(true);
    try {
      const data = await quickDemoLogin(roleType);
      redirectAfterLogin(data.user.role);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white mx-auto shadow-md">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to SmartCare</h2>
          <p className="text-xs text-slate-500">Access your healthcare dashboard, appointments, and Smart Card</p>
        </div>

        {/* Demo Fast-Login Strip */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-blue-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>1-Click Prototype Demo Logins:</span>
            </span>
            <span className="text-[10px] text-slate-400">Select Role</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('patient')}
              className="flex items-center space-x-2 p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold transition text-left border border-blue-200/60"
            >
              <User className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] text-slate-500">Patient</span>
                <span>Vivek Kokambe</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('doctor')}
              className="flex items-center space-x-2 p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-semibold transition text-left border border-teal-200/60"
            >
              <Stethoscope className="w-4 h-4 text-tealAccent flex-shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] text-slate-500">Doctor</span>
                <span>Dr. Ananya Sen</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('hospital')}
              className="flex items-center space-x-2 p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-semibold transition text-left border border-indigo-200/60"
            >
              <Building2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] text-slate-500">Hospital Admin</span>
                <span>Apollo Central</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="flex items-center space-x-2 p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-semibold transition text-left border border-rose-200/60"
            >
              <Shield className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] text-slate-500">System Admin</span>
                <span>Dr. Rajesh Mehta</span>
              </div>
            </button>
          </div>
        </div>

        {/* Standard Credentials Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-card border border-slate-100 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Don’t have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base">Reset Password</h3>
            <p className="text-xs text-slate-500">Enter your registered email to receive a password reset token.</p>
            {forgotMsg ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
                {forgotMsg}
              </div>
            ) : (
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            )}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setForgotModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              {!forgotMsg && (
                <button
                  type="button"
                  onClick={() => setForgotMsg(`Reset link & demo token [749210] dispatched for ${forgotEmail || 'user'}.`)}
                  className="px-4 py-1.5 text-xs bg-primary text-white font-bold rounded-lg hover:bg-primary-dark"
                >
                  Send Reset Code
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

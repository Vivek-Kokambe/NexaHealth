import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import {
  Shield,
  Activity,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Building2,
  Stethoscope,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'patient': return '/patient/dashboard';
      case 'doctor': return '/doctor/dashboard';
      case 'hospital': return '/hospital/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Hospitals', path: '/hospitals' },
    { name: 'Doctors', path: '/doctors' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Features', path: '/features' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Prototype Compliance Banner */}
      <div className="bg-gradient-to-r from-primary via-[#1c2980] to-teal-800 text-white text-[11px] py-1 px-4 text-center font-medium tracking-wide flex items-center justify-center space-x-2">
        <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded text-[10px] uppercase">Prototype</span>
        <span>SmartCare Health Network • Student Project Prototype — Not a Certified Medical System</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-primary tracking-tight">SmartCare</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-secondary font-bold">NETWORK</span>
              </div>
              <p className="text-[10px] text-slate-500 tracking-wider -mt-1 hidden sm:block font-medium">
                Connected Care. Smarter Health.
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    isActive
                      ? 'text-primary bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Auth Profile */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <img
                      src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="hidden sm:block text-left text-xs leading-tight pr-1">
                      <p className="font-bold text-slate-800 truncate max-w-[120px]">{user.name}</p>
                      <span className="text-[10px] uppercase font-bold text-primary">{user.role}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 text-xs">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-bold text-slate-800 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-primary">
                          Role: {user.role}
                        </span>
                      </div>

                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-primary transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold">My Dashboard</span>
                      </Link>

                      {user.role === 'patient' && (
                        <Link
                          to="/patient/smart-card"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-primary transition"
                        >
                          <Shield className="w-4 h-4 text-slate-400" />
                          <span>Digital Smart Card</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-semibold">Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-primary hover:bg-blue-50 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-dark rounded-xl transition shadow-sm shadow-primary/20"
                >
                  Get Smart Card
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-100">
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-bold text-primary bg-blue-50"
              >
                Go to {user.role} Dashboard
              </Link>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-bold border border-slate-300 rounded-xl text-slate-700"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-bold bg-primary text-white rounded-xl shadow"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

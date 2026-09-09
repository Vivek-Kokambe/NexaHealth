import React from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RoleQuickSwitcher from '../components/RoleQuickSwitcher';
import { LayoutDashboard, CreditCard, Calendar, Clock, FileText } from 'lucide-react';

export default function DashboardLayout({ allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBg">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-600">Verifying SmartCare Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  const patientBottomNav = [
    { name: 'Home', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Smart Card', path: '/patient/smart-card', icon: CreditCard },
    { name: 'Book', path: '/patient/book', icon: Calendar },
    { name: 'Queue', path: '/patient/queue', icon: Clock },
    { name: 'Records', path: '/patient/medical-records', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#EFF6FF]">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 md:pb-0">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Dashboard Screen Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          <Outlet />
        </main>
      </div>

      {/* Patient Mobile Bottom Navigation (as required by prompt) */}
      {user.role === 'patient' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around shadow-lg">
          {patientBottomNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium transition ${
                  isActive ? 'text-primary font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Floating Demo Role Switcher */}
      <RoleQuickSwitcher />
    </div>
  );
}

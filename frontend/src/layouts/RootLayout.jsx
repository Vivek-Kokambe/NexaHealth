import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RoleQuickSwitcher from '../components/RoleQuickSwitcher';
import { Activity, Shield, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EFF6FF] text-slate-900">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Floating Demo Role Switcher */}
      <RoleQuickSwitcher />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs mt-16 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-base text-white">SmartCare Health Network</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Connected Care. Smarter Health. A unified national healthcare platform linking patients, physicians, and hospitals through secure digital Smart Cards.
              </p>
              <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Encrypted Patient Data Protection</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">Quick Navigation</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/hospitals" className="hover:text-white transition">Hospital Directory</Link></li>
                <li><Link to="/doctors" className="hover:text-white transition">Doctor Directory</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
                <li><Link to="/features" className="hover:text-white transition">Network Features</Link></li>
                <li><Link to="/patient/smart-card" className="hover:text-white transition">Smart Card Portal</Link></li>
              </ul>
            </div>

            {/* Portals */}
            <div>
              <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">User Portals</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/login" className="hover:text-white transition">Patient Login</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Doctor Login</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Hospital Authority Login</Link></li>
                <li><Link to="/login" className="hover:text-white transition">Administrative Command</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Join the Network</Link></li>
              </ul>
            </div>

            {/* Contact & Disclaimer */}
            <div>
              <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">Network Headquarters</h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>National Health Tech Quad, New Delhi, India</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>+91 11 2048 5900 (Toll Free 24/7)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>support@smartcare.org</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-4">
            <p>© 2026 SmartCare Health Network. Student Project Prototype — Not a Certified Medical System.</p>
            <div className="flex space-x-4">
              <Link to="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-slate-400">Terms of Service</Link>
              <Link to="/contact" className="hover:text-slate-400">Support Desk</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

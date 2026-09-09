import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Get In Touch</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Contact Support & Affiliations</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Have inquiries regarding Smart Card integration, doctor credentials, or hospital onboarding? Our support team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 space-y-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h4 className="font-bold text-slate-900 text-xs">National Health Center</h4>
            <p className="text-xs text-slate-500">Tech Quad, Mathura Road, New Delhi, 110076</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 space-y-2">
            <Phone className="w-5 h-5 text-secondary" />
            <h4 className="font-bold text-slate-900 text-xs">24/7 Helpline</h4>
            <p className="text-xs text-slate-500">+91 11 2048 5900</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 space-y-2">
            <Mail className="w-5 h-5 text-tealAccent" />
            <h4 className="font-bold text-slate-900 text-xs">Email Desk</h4>
            <p className="text-xs text-slate-500">support@smartcare.org</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-card border border-slate-100">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Inquiry Dispatched</h3>
              <p className="text-xs text-slate-500">Thank you. Your message has been logged under reference ticket #{Math.floor(100000 + Math.random() * 900000)}.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Subject of inquiry..."
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide detailed description of your request or issue..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import RootLayout from './layouts/RootLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import HospitalDirectoryPage from './pages/HospitalDirectoryPage';
import DoctorDirectoryPage from './pages/DoctorDirectoryPage';
import HospitalDetailPage from './pages/HospitalDetailPage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import HowItWorksPage from './pages/HowItWorksPage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import SmartCardPage from './pages/patient/SmartCardPage';
import AppointmentBookingPage from './pages/patient/AppointmentBookingPage';
import AppointmentHistoryPage from './pages/patient/AppointmentHistoryPage';
import LiveQueuePage from './pages/patient/LiveQueuePage';
import MedicalRecordsPage from './pages/patient/MedicalRecordsPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import TodayAppointmentsPage from './pages/doctor/TodayAppointmentsPage';
import DoctorQueuePage from './pages/doctor/DoctorQueuePage';
import PatientLookupPage from './pages/doctor/PatientLookupPage';
import AddConsultationPage from './pages/doctor/AddConsultationPage';
import DoctorSchedulePage from './pages/doctor/DoctorSchedulePage';

// Hospital Pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import HospitalDoctorsPage from './pages/hospital/HospitalDoctorsPage';
import HospitalAppointmentsPage from './pages/hospital/HospitalAppointmentsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import HospitalApprovalsPage from './pages/admin/HospitalApprovalsPage';
import DoctorApprovalsPage from './pages/admin/DoctorApprovalsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import ComplaintsPage from './pages/admin/ComplaintsPage';

export default function App() {
  return (
    <Routes>
      {/* Public Pages with RootLayout */}
      <Route path="/" element={<RootLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="hospitals" element={<HospitalDirectoryPage />} />
        <Route path="hospitals/:id" element={<HospitalDetailPage />} />
        <Route path="doctors" element={<DoctorDirectoryPage />} />
        <Route path="doctors/:id" element={<DoctorDetailPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="features" element={<FeaturesPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PrivacyPolicyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Patient Portal Routes */}
      <Route path="/patient" element={<DashboardLayout allowedRoles={['patient', 'admin']} />}>
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="smart-card" element={<SmartCardPage />} />
        <Route path="book" element={<AppointmentBookingPage />} />
        <Route path="appointments" element={<AppointmentHistoryPage />} />
        <Route path="queue" element={<LiveQueuePage />} />
        <Route path="medical-records" element={<MedicalRecordsPage />} />
        <Route path="prescriptions" element={<MedicalRecordsPage />} />
        <Route path="reports" element={<MedicalRecordsPage />} />
        <Route path="profile" element={<PatientProfilePage />} />
      </Route>

      {/* Doctor Portal Routes */}
      <Route path="/doctor" element={<DashboardLayout allowedRoles={['doctor', 'admin']} />}>
        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<TodayAppointmentsPage />} />
        <Route path="queue" element={<DoctorQueuePage />} />
        <Route path="lookup" element={<PatientLookupPage />} />
        <Route path="consultation" element={<AddConsultationPage />} />
        <Route path="schedule" element={<DoctorSchedulePage />} />
        <Route path="profile" element={<DoctorSchedulePage />} />
      </Route>

      {/* Hospital Portal Routes */}
      <Route path="/hospital" element={<DashboardLayout allowedRoles={['hospital', 'admin']} />}>
        <Route index element={<Navigate to="/hospital/dashboard" replace />} />
        <Route path="dashboard" element={<HospitalDashboard />} />
        <Route path="profile" element={<HospitalDashboard />} />
        <Route path="doctors" element={<HospitalDoctorsPage />} />
        <Route path="appointments" element={<HospitalAppointmentsPage />} />
        <Route path="patients" element={<HospitalAppointmentsPage />} />
        <Route path="analytics" element={<HospitalDashboard />} />
        <Route path="departments" element={<HospitalDashboard />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route path="/admin" element={<DashboardLayout allowedRoles={['admin']} />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="hospitals" element={<HospitalApprovalsPage />} />
        <Route path="doctors" element={<DoctorApprovalsPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="analytics" element={<AdminDashboard />} />
      </Route>

      {/* Fallback Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

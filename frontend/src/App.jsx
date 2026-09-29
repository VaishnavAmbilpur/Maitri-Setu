import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import OnboardingWizard from './pages/OnboardingWizard';
import ChecklistForm from './pages/ChecklistForm';
import DocumentUpload from './pages/DocumentUpload';
import ApplicantDashboard from './pages/ApplicantDashboard';
import ApplicationDetail from './pages/ApplicationDetail';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerApplicationDetail from './pages/OfficerApplicationDetail';

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090b]">
        <div className="spinner"></div>
      </div>
    );
  }
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    const target = user.role === 'officer' ? '/officer' : '/dashboard';
    return <Navigate to={target} replace />;
  }
  return children;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const getTargetDashboard = () => {
    if (!user || !user.role) return '/dashboard';
    return user.role === 'officer' ? '/officer' : '/dashboard';
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={isAuthenticated && user ? <Navigate to={getTargetDashboard()} replace /> : <Login />} 
      />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<ProtectedRoute role="applicant"><ApplicantDashboard /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute role="applicant"><OnboardingWizard /></ProtectedRoute>} />
        <Route path="/checklist" element={<ProtectedRoute role="applicant"><ChecklistForm /></ProtectedRoute>} />
        <Route path="/upload/:applicationId" element={<ProtectedRoute role="applicant"><DocumentUpload /></ProtectedRoute>} />
        <Route path="/application/:id" element={<ProtectedRoute><ApplicationDetail /></ProtectedRoute>} />
        <Route path="/officer" element={<ProtectedRoute role="officer"><OfficerDashboard /></ProtectedRoute>} />
        <Route path="/officer/application/:id" element={<ProtectedRoute role="officer"><OfficerApplicationDetail /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #27272a', fontSize: '12px' },
            success: { iconTheme: { primary: '#f4f4f5', secondary: '#09090b' } },
            error: { iconTheme: { primary: '#ffffff', secondary: '#09090b' } },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

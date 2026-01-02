import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ParticipantDashboard } from '@/pages/ParticipantDashboard';
import { ParticipantManagement } from '@/pages/ParticipantManagement';
import { LogActivity } from '@/pages/LogActivity';
import { ConsistencyBonuses } from '@/pages/ConsistencyBonuses';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, participant, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || !participant) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {isAdmin ? <AdminDashboard /> : <ParticipantDashboard />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/participants"
          element={
            <ProtectedRoute adminOnly>
              <ParticipantManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consistency-bonuses"
          element={
            <ProtectedRoute adminOnly>
              <ConsistencyBonuses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/log-activity"
          element={
            <ProtectedRoute>
              <LogActivity />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

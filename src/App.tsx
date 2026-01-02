import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { Layout } from '@/components/layout/Layout';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ParticipantDashboard } from '@/pages/ParticipantDashboard';
import { ParticipantManagement } from '@/pages/ParticipantManagement';
import { LogActivity } from '@/pages/LogActivity';
import { ConsistencyBonuses } from '@/pages/ConsistencyBonuses';
import { WorkoutCategories } from '@/pages/WorkoutCategories';

function AppRoutes() {
  const { isAdmin } = useApp();

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={isAdmin ? <AdminDashboard /> : <ParticipantDashboard />}
        />
        <Route
          path="/participants"
          element={isAdmin ? <ParticipantManagement /> : <Navigate to="/" />}
        />
        <Route
          path="/consistency-bonuses"
          element={isAdmin ? <ConsistencyBonuses /> : <Navigate to="/" />}
        />
        <Route
          path="/categories"
          element={isAdmin ? <WorkoutCategories /> : <Navigate to="/" />}
        />
        <Route
          path="/log-activity"
          element={<LogActivity />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </Router>
  );
}

export default App;

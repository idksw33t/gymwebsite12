import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppNavbar from './components/AppNavbar';
import TrainerNavbar from './components/TrainerNavbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MemberDashboard from './pages/MemberDashboard';
import MyProgramme from './pages/MyProgramme';
import MyPlans from './pages/MyPlans';
import MyTasks from './pages/MyTasks';
import AdminDashboard from './pages/admin/AdminDashboard';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import MyMembers from './pages/trainer/MyMembers';
import WorkoutPlans from './pages/trainer/WorkoutPlans';
import WorkoutTasks from './pages/trainer/WorkoutTasks';

// Member screens: Member role only, with the member navbar on top
function MemberPage({ children }) {
  return (
    <ProtectedRoute allowedRoles={['Member']}>
      <>
        <AppNavbar />
        {children}
      </>
    </ProtectedRoute>
  );
}

// Trainer screens: Trainer role only, with the trainer navbar on top
function TrainerPage({ children }) {
  return (
    <ProtectedRoute allowedRoles={['Trainer']}>
      <>
        <TrainerNavbar />
        {children}
      </>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/trainer/dashboard" element={<TrainerPage><TrainerDashboard /></TrainerPage>} />
          <Route path="/trainer/members" element={<TrainerPage><MyMembers /></TrainerPage>} />
          <Route path="/trainer/members/:memberId/plans" element={<TrainerPage><WorkoutPlans /></TrainerPage>} />
          <Route path="/trainer/plans/:planId/tasks" element={<TrainerPage><WorkoutTasks /></TrainerPage>} />

          <Route path="/member/dashboard" element={<MemberPage><MemberDashboard /></MemberPage>} />
          <Route path="/member/programme" element={<MemberPage><MyProgramme /></MemberPage>} />
          <Route path="/member/plans" element={<MemberPage><MyPlans /></MemberPage>} />
          <Route path="/member/tasks" element={<MemberPage><MyTasks /></MemberPage>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
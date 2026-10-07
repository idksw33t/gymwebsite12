import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppNavbar from './components/AppNavbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MemberDashboard from './pages/MemberDashboard';
import MyProgramme from './pages/MyProgramme';
import MyPlans from './pages/MyPlans';
import MyTasks from './pages/MyTasks';

// Placeholders - each area's owner replaces these with their real dashboard.
function AdminDashboard() {
  return <h2 className="p-4">Admin Dashboard (Screen 2)</h2>;
}
function TrainerDashboard() {
  return <h2 className="p-4">Trainer Dashboard (Screen 9)</h2>;
}

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
          <Route
            path="/trainer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Trainer']}>
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />

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
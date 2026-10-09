import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Trainer pages 
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import MyMembers from './pages/trainer/MyMembers';
import WorkoutPlans from './pages/trainer/WorkoutPlans';
import WorkoutTasks from './pages/trainer/WorkoutTasks';

// Admin placeholder — owner will replace this later
function AdminDashboard() {
  return <h2 className="p-4">Admin Dashboard (Screen 2)</h2>;
}

// Member placeholder — owner will replace this later
function MemberDashboard() {
  return <h2 className="p-4">Member Dashboard (Screen 13)</h2>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin — placeholder for now */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Trainer — YOUR REAL PAGES */}
          <Route
            path="/trainer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Trainer']}>
                <TrainerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/members"
            element={
              <ProtectedRoute allowedRoles={['Trainer']}>
                <MyMembers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/members/:memberId/plans"
            element={
              <ProtectedRoute allowedRoles={['Trainer']}>
                <WorkoutPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer/plans/:planId/tasks"
            element={
              <ProtectedRoute allowedRoles={['Trainer']}>
                <WorkoutTasks />
              </ProtectedRoute>
            }
          />

          {/* Member — placeholder for now */}
          <Route
            path="/member/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Member']}>
                <MemberDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback: any unknown URL goes to /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
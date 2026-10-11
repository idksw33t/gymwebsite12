import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap any page that needs login with this. Pass allowedRoles to also
// restrict it to specific roles, e.g. <ProtectedRoute allowedRoles={["Admin"]}>
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in, but wrong role for this page — send them to their own dashboard.
    const homeByRole = {
      Admin: '/admin/dashboard',
      Trainer: '/trainer/dashboard',
      Member: '/member/dashboard',
    };
    return <Navigate to={homeByRole[role] || '/login'} replace />;
  }

  return children;
}

export default ProtectedRoute;

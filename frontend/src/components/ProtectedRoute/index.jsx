import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/authService';

/**
 * Reusable ProtectedRoute component.
 * Checks localStorage.getItem("isAuthenticated") === "true".
 * Renders requested child page via Outlet or children if authenticated,
 * otherwise redirects to /login.
 */
export const ProtectedRoute = ({ children }) => {
  const isAuth = authService.isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;

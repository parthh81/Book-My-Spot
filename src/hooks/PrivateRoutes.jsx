import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import AuthService from "../services/AuthService";

const useAuth = () => {
  const [authState, setAuthState] = useState({
    isLoggedin: false,
    role: "",
    isOrganizer: false,
    isAdmin: false,
    loading: true
  });

  useEffect(() => {
    // Check auth state on component mount
    const checkAuth = () => {
      console.log('PrivateRoutes - Checking Authentication');
      
      // Use AuthService to check authentication
      const isLoggedin = AuthService.isAuthenticated();
      const userInfo = AuthService.getUserInfo();
      
      if (isLoggedin) {
        setAuthState({
          isLoggedin: true,
          role: userInfo.role || "",
          isOrganizer: userInfo.role === "organizer",
          isAdmin: userInfo.role === "admin",
          loading: false
        });
      } else {
        setAuthState({
          isLoggedin: false,
          role: "",
          isOrganizer: false,
          isAdmin: false,
          loading: false
        });
      }
    };

    checkAuth();
  }, []);

  return authState;
};

const PrivateRoutes = () => {
  const location = useLocation();
  const { isLoggedin, loading } = useAuth();

  // Show loading state if still checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is authenticated, render the protected routes
  // Otherwise, redirect to login page, preserving the attempted URL
  return isLoggedin ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default PrivateRoutes;
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LandingPage from './components/common/LandingPage';
import Login from './components/common/Login';
import Signup from './components/common/Signup';
import { UserSidebar } from "./components/layouts/UserSidebar";
import { UserProfile } from "./components/user/UserProfile";
import { UserDashboard } from "./components/user/UserDashboard";
import { UserHome } from "./components/user/UserHome";
import { OrganizerSidebar } from "./components/layouts/OrganizerSidebar";
import { AdminSidebar } from "./components/layouts/AdminSidebar";
import axios from "axios";
import PrivateRoutes from "./hooks/PrivateRoutes";
import { AddEvent } from "./components/organizer/AddEvent";
import OrganizerDashboard from "./components/organizer/OrganizerDashboard";
import EventsTable from "./components/organizer/EventsTable";
import BookingManagement from "./components/organizer/BookingManagement";
import Profile from "./components/organizer/Profile";
import Settings from "./components/organizer/Settings";
import Customers from "./components/organizer/Customers";
import { ResetPassword } from "./components/common/ResetPassword";
import { ForgotPassword } from "./components/common/ForgotPassword";
import EventBrowse from "./components/user/EventBrowse";
import VenuesByEvent from "./components/user/VenuesByEvent";
import VenueDetails from "./components/user/VenueDetails";
import { MyBookings } from "./components/user/MyBookings";
import UserSettings from "./components/user/UserSettings";
import AboutUs from './components/common/AboutUs';
import HelpCenter from './components/common/HelpCenter';
import BookingForm from './components/user/BookingForm';
import PaymentPage from './components/user/PaymentPage';
import BookingConfirmation from './components/user/BookingConfirmation';
import AuthService from './services/AuthService';
import EventVenueLinker from "./components/organizer/EventVenueLinker";
import AddVenueForEvent from "./components/organizer/AddVenueForEvent";
import EventCategoryVenueFlowWithErrorBoundary from "./components/organizer/EventCategoryVenueFlow";
import EventDetails from "./components/user/EventDetails";
import EventVenueDetails from "./components/user/EventVenueDetails";
import BrowseEventsPage from './pages/BrowseEventsPage';
import OrganizerAddEventPage from './pages/OrganizerAddEventPage';

// Admin imports
import AdminDashboard from './components/admin/AdminDashboard';
import AdminEventManagement from './components/admin/AdminEventManagement';
import AdminUserManagement from './components/admin/AdminUserManagement';
import AdminOrganizerManagement from './components/admin/AdminOrganizerManagement';
import AdminBookingManagement from './components/admin/AdminBookingManagement';
import AdminAnalytics from './components/admin/AdminAnalytics';
import AdminReports from './components/admin/AdminReports';
import AdminSettings from './components/admin/AdminSettings';

// Import CSS in the correct order - bootstrap first, then AdminLTE, then custom styles
import 'bootstrap/dist/css/bootstrap.min.css';
import "./assets/adminlte.min.css";
import "./App.css";
import "./styles/user.css";
import "./styles/organizer.css";
import "./styles/charts.css";
import "./styles/admin.css";
import "./styles/navbar.css";

// Logout component that handles user logout
const Logout = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    AuthService.logout();
    navigate('/');
  }, [navigate]);
  
  return null;
};

// Main App component
function App() {
  useEffect(() => {
    // Validate token on app load - but don't auto-logout
    // This allows the token to remain until explicitly checked by a protected route
    const validateAuth = async () => {
      try {
        // Set default axios base URL
        axios.defaults.baseURL = "http://localhost:3200";

        // Get stored token and set axios default headers if token exists
        const token = AuthService.getToken();
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Setting default Authorization header with token');
        }
        
        // Add a response interceptor to catch 401 errors
        axios.interceptors.response.use(
          response => response,
          error => {
            if (error.response && error.response.status === 401) {
              console.log('Unauthorized access detected, logging out');
              AuthService.logout();
              // Only redirect if not already on landing page
              if (window.location.pathname !== '/') {
                window.location.href = '/';
              }
            }
            return Promise.reject(error);
          }
        );

        // Validate token with backend
        await AuthService.validateToken();
      } catch (error) {
        console.error("Error validating token:", error);
      }
    };
    
    validateAuth();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/resetpassword/:token" element={<ResetPassword />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />

      {/* Public Routes for Event and Venue Browsing */}
      <Route path="/events/browse" element={<BrowseEventsPage />} />
      <Route path="/event/:eventId" element={<EventDetails />} />
      <Route path="/event/:eventId/booking" element={<EventVenueDetails />} />
      <Route path="/venues" element={<Navigate to="/venues/browse" replace />} />
      <Route path="/venues/byevent/:eventId" element={<VenuesByEvent />} />
      <Route path="/venues/browse" element={<VenuesByEvent />} />
      <Route path="/venues/:venueId" element={<VenueDetails />} />

      <Route path="" element={<PrivateRoutes />}>
        {/* User Routes */}
        <Route path="/user" element={<UserSidebar />}>
          <Route index element={<UserProfile />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>
        
        {/* Organizer Routes */}
        <Route path="/organizer" element={<OrganizerSidebar />}>
          <Route index element={<OrganizerDashboard />} />
          <Route path="dashboard" element={<OrganizerDashboard />} />
          <Route path="addevent" element={<OrganizerAddEventPage />} />
          <Route path="events" element={<EventsTable />} />
          <Route path="events/create" element={<OrganizerAddEventPage />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="bookings/:bookingId" element={<BookingManagement />} />
          <Route path="customers" element={<Customers />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="venue-event-linker" element={<EventVenueLinker />} />
          <Route path="add-venue-for-event/:eventId" element={<AddVenueForEvent />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminSidebar />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<AdminEventManagement />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="organizers" element={<AdminOrganizerManagement />} />
          <Route path="bookings" element={<AdminBookingManagement />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="/about" element={<AboutUs />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/booking/:venueId" element={<BookingForm />} />
      <Route path="/booking" element={<BookingForm />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
    </Routes>
  );
}

export default App;
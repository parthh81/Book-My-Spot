import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { UserSidebar } from "./components/layouts/UserSidebar";
import { OrganizerSidebar } from "./components/layouts/OrganizerSidebar";
import { AddEvent } from "./components/organizer/AddEvent";
import OrganizerDashboard from "./components/organizer/OrganizerDashboard";
import EventsTable from "./components/organizer/EventsTable";
import BookingManagement from "./components/organizer/BookingManagement";
import { UserDashboard } from "./components/user/UserDashboard";
import { UserHome } from "./components/user/UserHome";
import VenueList from "./components/user/VenueList";
import VenueDetails from "./components/user/VenueDetails";
import BookingConfirm from "./components/user/BookingConfirm";
import MyBookings from "./components/user/MyBookings";
import Login from "./components/common/Login";
import LandingPage from "./components/common/LandingPage";
import OrganizerHome from './components/organizer/OrganizerHome';
import Profile from './components/layouts/Profile';
import AuthService from './services/AuthService';

// Import CSS
import './App.css';
import './styles/theme-override.css';
import './styles/organizer.css';
import './styles/dashboard.css';
import './styles/bookings.css';
import './styles/events.css';
import './styles/profile.css';

// Logout component that handles user logout
const Logout = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    AuthService.logout();
    navigate('/login');
  }, [navigate]);
  
  return null;
};

function App() {
  useEffect(() => {
    // Validate token on app load
    AuthService.validateToken();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        
        {/* Special redirect route for problematic URL */}
        <Route path="/user/venues" element={<RedirectHandler />} />
        
        {/* User Routes - Protected */}
        <Route path="/user" element={
          <PrivateRoute>
            <UserSidebar />
          </PrivateRoute>
        }>
          <Route index element={<UserHome />} />
          <Route path="dashboard" element={<UserDashboard />} />
          {/* Events browsing route */}
          <Route path="events/browse" element={<EventBrowse />} />
          {/* Venues routes */}
          <Route path="venues" element={<VenueList />} />
          <Route path="venues/:id" element={<VenueDetails />} />
          {/* Query parameter handler - this needs to be a different path */}
          <Route path="venue-redirect" element={<QueryParamHandler />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="booking-confirm" element={<BookingConfirm />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        {/* Organizer Routes - Protected */}
        <Route path="/organizer" element={
          <PrivateRoute>
            <OrganizerSidebar />
          </PrivateRoute>
        }>
          <Route index element={<OrganizerHome />} />
          <Route path="dashboard" element={<OrganizerDashboard />} />
          <Route path="events" element={<EventsTable />} />
          <Route path="addevent" element={<AddEvent />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const PrivateRoute = ({ children }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Component to handle query parameters in the URL
const QueryParamHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we have query parameters
    if (location.search) {
      const params = new URLSearchParams(location.search);
      const categoryId = params.get('category');
      
      if (categoryId) {
        // Redirect to the events browse page
        console.log(`Redirecting from query params to events browse page. Category ID: ${categoryId}`);
        navigate('/user/events/browse', { replace: true });
      } else {
        // If no category ID, just go to the venues list
        navigate('/user/venues', { replace: true });
      }
    }
  }, [location, navigate]);
  
  // Show loading while redirecting
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

// Special handler for the problematic URL with query parameters
const RedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we have the problematic query parameters
    if (location.search && location.search.includes('category=')) {
      const params = new URLSearchParams(location.search);
      const categoryId = params.get('category');
      const categoryTitle = params.get('title');
      
      console.log(`Handling problematic URL with category ID: ${categoryId}, title: ${categoryTitle}`);
      
      // Store the category ID in sessionStorage
      if (categoryId) {
        sessionStorage.setItem('selectedCategoryId', categoryId);
        if (categoryTitle) {
          sessionStorage.setItem('selectedCategoryTitle', categoryTitle);
        }
      }
      
      // Redirect to the events browse page
      navigate('/user/events/browse', { replace: true });
    } else {
      // If no problematic query parameters, just show the venues list
      navigate('/user/venues', { replace: true });
    }
  }, [location, navigate]);
  
  // Show loading while redirecting
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border" style={{ color: '#f05537' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="ms-3">Redirecting to the correct page...</p>
    </div>
  );
};

export default App; 
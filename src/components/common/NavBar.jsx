import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaQuestionCircle, FaCalendarAlt, FaBuilding, FaUserCircle, FaSignOutAlt, FaUsers, FaTachometerAlt } from 'react-icons/fa';
import AuthService from '../../services/AuthService';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [browseDropdownOpen, setBrowseDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState('');
  const [userRole, setUserRole] = useState('');
  const browseDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Update the useEffect hook that checks login status
  useEffect(() => {
    console.log('Navbar - Checking login status');
    
    // Use AuthService instead of directly checking localStorage
    const isAuthenticated = AuthService.isAuthenticated();
    const userInfo = AuthService.getUserInfo();
    
    if (isAuthenticated) {
      console.log('User is authenticated');
      console.log('User info:', userInfo);
      setIsLoggedIn(true);
      setUserRole(userInfo.role || '');
      
      // Set user initial for avatar
      if (userInfo.firstName) {
        setUserInitial(userInfo.firstName.charAt(0).toUpperCase());
      } else if (userInfo.lastName) {
        setUserInitial(userInfo.lastName.charAt(0).toUpperCase());
      } else {
        // If no name data, use the first character of their role or default to 'U'
        const roleInitial = userInfo.role ? userInfo.role.charAt(0).toUpperCase() : 'U';
        console.log('No name data, using role initial:', roleInitial);
        setUserInitial(roleInitial);
      }
    } else {
      console.log('No token found, user is not logged in');
      setIsLoggedIn(false);
      setUserRole('');
    }
  }, [location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (browseDropdownRef.current && !browseDropdownRef.current.contains(event.target)) {
        setBrowseDropdownOpen(false);
      }
      
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation handlers
  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const navigateToEvents = () => {
    navigate('/events/browse');
  };
  
  const navigateToVenues = () => {
    navigate('/venues/browse');
    setBrowseDropdownOpen(false);
  };
  
  const navigateToDashboard = () => {
    console.log('Navigating to dashboard...');
    
    // Check the isOrganizer flag first (most reliable)
    const isOrganizer = sessionStorage.getItem("isOrganizer") === "true";
    // Fallback to checking role string
    const role = sessionStorage.getItem("role") || '';
    
    console.log('Dashboard navigation check:');
    console.log('- isOrganizer flag:', isOrganizer);
    console.log('- role value:', role);
    
    if (isOrganizer || role === 'organizer') {
      console.log('Organizer detected, navigating to /organizer');
      navigate('/organizer');
    } else if (role === 'admin') {
      console.log('Admin detected, navigating to /admin');
      navigate('/admin');
    } else {
      console.log('User role detected, navigating to user dashboard');
      navigate('/user/dashboard');
    }
    
    setUserDropdownOpen(false);
  };
  
  const navigateToProfile = () => {
    const isOrganizer = sessionStorage.getItem("isOrganizer") === "true";
    if (isOrganizer) {
      navigate('/organizer/profile');
    } else {
      navigate('/user/profile');
    }
    setUserDropdownOpen(false);
  };

  return (
    <header 
      className={`header_section sticky-top ${isScrolled ? 'scrolled' : ''}`} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0, 
        right: 0,
        zIndex: 2000,
        transition: 'all 0.3s ease',
        background: isScrolled ? 'rgba(255, 255, 255, 0.98)' : '#ffffff',
        boxShadow: isScrolled ? '0 4px 12px rgba(0, 0, 0, 0.08)' : '0 1px 0 rgba(0, 0, 0, 0.08)'
      }}
    >
      <div className="container-fluid px-3">
        <nav className="navbar navbar-expand-lg py-2">
          {/* Logo - Simplified */}
          <Link className="navbar-brand ms-2" to="/" aria-label="BookMySpot Home">
            <span className="fw-bold fs-4" style={{ color: '#f05537' }}>BookMySpot</span>
          </Link>

          {/* Responsive Toggle Button */}
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation Links */}
          <div className="collapse navbar-collapse" id="navbarContent">
            {/* Nav Links */}
            <ul className="navbar-nav ms-auto align-items-center gap-3">
              <li className="nav-item" role="menuitem">
                <Link
                  to="/events/browse"
                  className="nav-link d-flex align-items-center"
                  aria-label="Browse Events"
                >
                  <FaCalendarAlt className="me-1" aria-hidden="true" />
                  <span>Browse Events</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/help" className="nav-link d-flex align-items-center">
                  <FaQuestionCircle className="me-1" aria-hidden="true" />
                  <span className="d-none d-lg-inline">Help Center</span>
                </Link>
              </li>
              
              {/* User authentication status */}
              {isLoggedIn ? (
                <li className="nav-item dropdown" ref={userDropdownRef}>
                  <div 
                    className={`nav-link d-flex align-items-center cursor-pointer ${userDropdownOpen ? 'text-primary' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  >
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ 
                        width: "34px", 
                        height: "34px", 
                        backgroundColor: '#f05537',
                        color: 'white',
                        fontSize: '0.9rem'
                      }}
                    >
                      {userInitial}
                    </div>
                  </div>
                  <div 
                    className={`dropdown-menu dropdown-menu-end py-0 ${userDropdownOpen ? 'show' : ''}`}
                    style={{ 
                      right: 0,
                      left: 'auto',
                      minWidth: '200px',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <div className="dropdown-header py-3 bg-light">
                      <strong>My Account</strong>
                    </div>
                    <button className="dropdown-item py-2" onClick={navigateToDashboard}>
                      <FaTachometerAlt className="me-2 text-muted" aria-hidden="true" />
                      Dashboard
                    </button>
                    <button className="dropdown-item py-2" onClick={navigateToProfile}>
                      <FaUserCircle className="me-2 text-muted" aria-hidden="true" />
                      My Profile
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                      <FaSignOutAlt className="me-2" aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <button 
                      onClick={handleLogin} 
                      className="nav-link border-0 bg-transparent"
                      aria-label="Log in to your account"
                    >
                      Log In
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      onClick={handleSignup} 
                      className="btn btn-primary rounded-pill px-4"
                      aria-label="Sign up for a new account"
                      style={{backgroundColor: "#f05537", borderColor: "#f05537"}}
                    >
                      Sign Up
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar; 
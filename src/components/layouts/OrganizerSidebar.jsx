import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  FaHome, 
  FaCalendarAlt, 
  FaUsers, 
  FaCog, 
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartLine,
  FaTicketAlt,
  FaTachometerAlt,
  FaUserCircle
} from "react-icons/fa";
import AuthService from '../../services/AuthService';

export const OrganizerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(window.innerWidth < 992);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userInitials, setUserInitials] = useState('');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile && !isMobile) {
        setCollapsed(true);
        setMobileMenuOpen(false);
      } else if (!mobile && isMobile) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  useEffect(() => {
    // Get user info from AuthService
    const userInfo = AuthService.getUserInfo();
    const firstName = userInfo.firstName || 'Organizer';
    const lastName = userInfo.lastName || '';
    const email = userInfo.email || 'organizer@example.com';
    
    setUserName(`${firstName} ${lastName}`.trim());
    setUserEmail(email);
    
    // Set user initials
    if (firstName && lastName) {
      setUserInitials(`${firstName.charAt(0)}${lastName.charAt(0)}`);
    } else if (firstName) {
      setUserInitials(firstName.charAt(0));
    } else {
      setUserInitials('O');
    }
  }, []);

  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === path || 
           (path !== "/organizer" && location.pathname.startsWith(path));
  };

  // Handle logout
  const handleLogout = () => {
    // Use AuthService for logout
    AuthService.logout();
    navigate('/login');
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Main menu items
  const menuItems = [
    {
      path: '/organizer/dashboard',
      icon: <FaChartLine />,
      label: 'Dashboard'
    },
    {
      path: '/organizer/events',
      icon: <FaCalendarAlt />,
      label: 'Events'
    },
    {
      path: '/organizer/bookings',
      icon: <FaTicketAlt />,
      label: 'Bookings'
    },
    {
      path: '/organizer/profile',
      icon: <FaUser />,
      label: 'Profile'
    }
  ];

  return (
    <div className="app-container" style={{ border: 'none', outline: 'none' }}>
      {/* Top Navigation Bar */}
      <header className="app-header" style={{ height: "50px", padding: "0 15px", borderBottom: "1px solid #e2e8f0" }}>
        {isMobile && (
          <button 
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#1a2236' }}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        )}
        
        <div className="app-logo">
          {isMobile ? (
            <span>BMS</span>
          ) : (
            <span>BookMySpot</span>
          )}
        </div>
        
        <div className="header-actions">
          <div className="user-menu-container">
            <div 
              className="user-menu-trigger" 
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                <span>{userInitials}</span>
              </div>
              <div className="user-info">
                <span className="user-name">{userName}</span>
                <span className="user-role">Organizer</span>
              </div>
            </div>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <Link to="/organizer/profile" className="dropdown-item">
                  <FaUser />
                  <span>My Profile</span>
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="app-body" style={{ marginTop: 0, padding: 0 }}>
        {/* Sidebar */}
        <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${isMobile && mobileMenuOpen ? 'mobile-open' : ''}`} style={{ 
          top: "50px",
          height: "calc(100vh - 50px)",
          zIndex: "1000",
          border: "none",
          backgroundColor: "white",
          borderRight: "1px solid #e2e8f0"
        }}>
          <div className="sidebar-content" style={{ padding: "1rem 0" }}>
            <nav className="sidebar-menu">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                  style={{ 
                    color: "#333",
                    backgroundColor: isActive(item.path) ? "#f5f7fa" : "transparent"
                  }}
                >
                  <span className="menu-icon" style={{ color: isActive(item.path) ? "#f05537" : "#666" }}>{item.icon}</span>
                  {(!collapsed || (isMobile && mobileMenuOpen)) && (
                    <span className="menu-label">{item.label}</span>
                  )}
                  {isActive(item.path) && <span className="active-indicator" style={{ backgroundColor: "#f05537" }}></span>}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile overlay */}
        {isMobile && mobileMenuOpen && (
          <div 
            className="mobile-overlay" 
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="app-main" style={{ marginTop: "0", padding: 0 }}>
          {/* Page content is rendered by the Outlet */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Helper function to get the page title based on the current route
const getPageTitle = (pathname) => {
  if (pathname === '/organizer' || pathname === '/organizer/dashboard') {
    return 'Dashboard';
  } else if (pathname.includes('/events')) {
    return 'Events';
  } else if (pathname.includes('/addevent')) {
    return 'Add Event';
  } else if (pathname.includes('/bookings')) {
    return 'Bookings';
  } else if (pathname.includes('/profile')) {
    return 'Profile';
  } else {
    return 'Organizer Portal';
  }
};
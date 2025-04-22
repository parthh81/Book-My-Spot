import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaBookmark, 
  FaStar, 
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa';
import AuthService from '../../services/AuthService';

export const UserSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [userName, setUserName] = useState('User');
  const [userInitials, setUserInitials] = useState('U');
  
  // Use AuthService to get user data
  useEffect(() => {
    const userInfo = AuthService.getUserInfo();
    const firstName = userInfo.firstName || 'User';
    const lastName = userInfo.lastName || '';
    
    setUserName(firstName);
    
    // Set user initials
    if (firstName && lastName) {
      setUserInitials(`${firstName.charAt(0)}${lastName.charAt(0)}`);
    } else if (firstName) {
      setUserInitials(firstName.charAt(0));
    }
  }, []);

  // Check if current path matches the link
  const isActive = (path) => {
    return location.pathname === path || 
           (path !== "/user" && location.pathname.startsWith(path));
  };

  return (
    <>
      <div className={`user-sidebar ${isSidebarExpanded ? '' : 'collapsed'}`}>
        <div className="user-sidebar-header">
          {!isSidebarExpanded && <Link to="/user" className="user-sidebar-brand">BookMySpot</Link>}
        </div>
        
        <ul className="user-sidebar-menu">
          <li className="user-sidebar-item">
            <Link to="/user/profile" className={`user-sidebar-link ${isActive('/user/profile') ? 'active' : ''}`}>
              <FaUser className="user-sidebar-icon" />
              <span className="user-sidebar-text">My Profile</span>
            </Link>
          </li>
          
          <li className="user-sidebar-item">
            <Link to="/user/bookings" className={`user-sidebar-link ${isActive('/user/bookings') ? 'active' : ''}`}>
              <FaCalendarAlt className="user-sidebar-icon" />
              <span className="user-sidebar-text">My Bookings</span>
            </Link>
          </li>
          
          <li className="user-sidebar-item">
            <Link to="/events/browse" className={`user-sidebar-link ${isActive('/events/browse') ? 'active' : ''}`}>
              <FaBookmark className="user-sidebar-icon" />
              <span className="user-sidebar-text">Browse Events</span>
            </Link>
          </li>
          
          <li className="user-sidebar-item mt-auto">
            <Link to="/logout" onClick={(e) => {
              e.preventDefault();
              AuthService.logout();
              navigate('/');
            }} className="user-sidebar-link">
              <FaSignOutAlt className="user-sidebar-icon" />
              <span className="user-sidebar-text">Logout</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Header */}
      <header className="position-fixed top-0 w-100 bg-white border-bottom" style={{ height: "56px", zIndex: 1030 }}>
        <div className="d-flex align-items-center h-100">
          <div className="d-flex align-items-center" style={{ width: "250px", borderRight: "1px solid #dee2e6", height: "100%" }}>
            <Link to="/" className="text-decoration-none ms-4">
              <span style={{ color: '#f05537', fontWeight: 'bold', fontSize: '1.25rem' }}>BookMySpot</span>
            </Link>
          </div>

          <div className="d-flex align-items-center ms-auto me-4">
            <div className="position-relative dropdown">
              <div 
                className="d-flex align-items-center cursor-pointer" 
                style={{ cursor: 'pointer' }}
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
                  {userInitials}
                </div>
                <span className="ms-2" style={{ fontSize: '0.9rem' }}>{userName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        marginLeft: '250px',
        marginTop: '56px',
        minHeight: 'calc(100vh - 56px)',
        width: 'calc(100% - 250px)',
        padding: '20px',
        background: '#f5f7fa',
        overflow: 'auto'
      }}>
        <Outlet />
      </main>
    </>
  );
};
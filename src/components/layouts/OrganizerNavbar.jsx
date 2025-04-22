import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';

export const OrganizerNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const firstName = localStorage.getItem('firstName') || 'Organizer';
  const firstInitial = firstName ? firstName.charAt(0) : 'O';

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white py-2 px-md-4 px-3 fixed-top shadow-sm">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center" style={{ fontWeight: 'bold', color: '#0096FF' }}>
          <div className="d-none d-sm-block">BookMySpot</div>
          <div className="d-block d-sm-none">BMS</div>
        </Link>
        
        <div className="d-flex align-items-center">
          <div className="position-relative d-none d-lg-block me-3">
            <FaBell className="text-muted" style={{ cursor: 'pointer' }} />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </div>
          
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
        
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className="d-lg-flex d-block position-relative my-3 my-lg-0 mx-lg-auto" style={{ maxWidth: "400px" }}>
            <div className="position-absolute ms-3 top-50 translate-middle-y">
              <FaSearch className="text-muted" />
            </div>
            <input
              type="search"
              className="form-control bg-light border-0 ps-5"
              placeholder="Search events, venues..."
              style={{ borderRadius: "20px" }}
            />
          </div>
          
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item me-lg-3 mb-2 mb-lg-0">
              <Link to="/organizer/dashboard" className="nav-link">Dashboard</Link>
            </li>
            <li className="nav-item me-lg-3 mb-2 mb-lg-0">
              <Link to="/organizer/events" className="nav-link">Events</Link>
            </li>
            <li className="nav-item me-lg-3 mb-2 mb-lg-0">
              <Link to="/organizer/bookings" className="nav-link">Bookings</Link>
            </li>
            
            <li className="nav-item me-lg-3 mb-2 mb-lg-0 position-relative d-block d-lg-none">
              <span className="nav-link">
                <FaBell className="text-muted" style={{ cursor: 'pointer' }} />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3
                </span>
              </span>
            </li>
            
            <li className="nav-item dropdown">
              <div 
                className="nav-link dropdown-toggle d-flex align-items-center"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: "#f05537",
                    color: "white",
                  }}
                >
                  {firstInitial}
                </div>
                <span className="d-none d-md-inline">{firstName}</span>
              </div>
              
              <ul className="dropdown-menu dropdown-menu-end mt-2" style={{ minWidth: '200px' }}>
                <li className="px-3 py-1 text-muted">
                  <small>Signed in as</small>
                  <div className="fw-bold">Organizer</div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link to="/organizer/profile" className="dropdown-item d-flex align-items-center">
                    <FaUser className="me-2" /> Profile
                  </Link>
                </li>
                <li>
                  <Link to="/organizer/settings" className="dropdown-item d-flex align-items-center">
                    <FaCog className="me-2" /> Settings
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item d-flex align-items-center text-danger"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="me-2" /> Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}; 
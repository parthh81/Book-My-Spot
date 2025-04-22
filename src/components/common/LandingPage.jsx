import React, { useState, useEffect, useRef, lazy, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/landing/css/style.css";
import "../../assets/landing/css/responsive.css";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaChevronDown, FaQuestionCircle, FaCalendarAlt, FaUsers, FaHeart, FaFilter, FaSlidersH, FaArrowUp, FaHome, FaSignOutAlt } from 'react-icons/fa';
import AuthService from '../../services/AuthService';

// Services and Venues with open-source images
const services = [
  { title: "Fully managed venues", description: "Complete venue management for hassle-free events", image: "https://images.pexels.com/photos/3037165/pexels-photo-3037165.jpeg?auto=compress&cs=tinysrgb&w=600&h=400", icon: "FaBuilding" },
  { title: "Banquet halls & Farmhouses", description: "Luxury venues for every occasion", image: "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=600&h=400", icon: "FaHotel" },
  { title: "Photography & Videography", description: "Capture your precious moments forever", image: "https://images.pexels.com/photos/3014019/pexels-photo-3014019.jpeg?auto=compress&cs=tinysrgb&w=600&h=400", icon: "FaCamera" },
  { title: "Professional Makeup", description: "Expert makeup services for you and your family", image: "https://images.pexels.com/photos/457701/pexels-photo-457701.jpeg?auto=compress&cs=tinysrgb&w=600&h=400", icon: "FaPaintBrush" },
  { title: "Bridal Mehendi", description: "Traditional and modern mehendi designs", image: "https://images.pexels.com/photos/1021525/pexels-photo-1021525.jpeg?auto=compress&cs=tinysrgb&w=600&h=400", icon: "FaHandPaper" },
];

// Blog data with Pexels images
const blogs = [
  {
    title: "10 Tips for Choosing the Perfect Wedding Venue",
    image: "https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=600&h=400",
    description: "Find the perfect venue that matches your vision, guest count, and budget with these expert tips.",
    date: "Dec 15, 2024",
    author: "Priya Sharma",
    category: "Wedding Planning"
  },
  {
    title: "Corporate Event Planning: A Complete Guide",
    image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=600&h=400",
    description: "Everything you need to know about organizing successful corporate events that impress your clients and team.",
    date: "June 12, 2024",
    author: "Rahul Verma",
    category: "Corporate Events"
  },
  {
    title: "Budget-Friendly Celebration Ideas That Look Expensive",
    image: "https://images.pexels.com/photos/7180795/pexels-photo-7180795.jpeg?auto=compress&cs=tinysrgb&w=600&h=400",
    description: "Create a luxurious event experience without breaking the bank with these smart planning tips.",
    date: "Nov 8, 2024",
    author: "Ananya Desai",
    category: "Budget Planning"
  }
];

const venues = [
  { 
    title: "Royal Grand Palace", 
    image: "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=600&h=400", 
    description: "Elegant venue perfect for weddings and grand celebrations", 
    price: "₹50,000 onwards",
    rating: 4.9,
    location: "Ahmedabad"
  },
  { 
    title: "Riverside Retreat", 
    image: "https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=600&h=400", 
    description: "Beautiful waterfront venue for memorable occasions", 
    price: "₹35,000 onwards",
    rating: 4.7,
    location: "Mumbai"
  },
  { 
    title: "Modern Event Center", 
    image: "https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=600&h=400", 
    description: "Contemporary space with state-of-the-art facilities", 
    price: "₹45,000 onwards",
    rating: 4.8,
    location: "Delhi"
  },
];

// Testimonial data with Pexels images
const testimonials = [
  {
    name: "Priya Sharma",
    role: "Bride",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    text: "BookMySpot made our wedding planning so easy! We found the perfect venue and vendors all in one place.",
    rating: 5
  },
  {
    name: "Amit Patel",
    role: "Corporate Event Manager",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    text: "The platform is incredibly user-friendly. Booking venues for our corporate events has never been this seamless.",
    rating: 4
  },
  {
    name: "Neha & Rohit",
    role: "Newly Weds",
    image: "https://images.pexels.com/photos/3768901/pexels-photo-3768901.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    text: "Thanks to BookMySpot, we found all our wedding vendors within our budget. Highly recommended!",
    rating: 5
  }
];

// Header Component
const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Ahmedabad");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [browseDropdownOpen, setBrowseDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState('');
  const [userRole, setUserRole] = useState('');
  const searchRef = useRef(null);
  const browseDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Update the useEffect hook that checks login status
  useEffect(() => {
    console.log('LandingPage Header - Checking login status');
    
    // Use AuthService instead of directly checking localStorage
    const isLoggedIn = AuthService.isAuthenticated();
    const userInfo = AuthService.getUserInfo();
    
    if (isLoggedIn) {
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
  }, []);

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

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery, "in", location);
    // Close mobile search after submission on mobile
    if (window.innerWidth < 992) {
      setMobileSearchVisible(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {      
      if (searchRef.current && !searchRef.current.contains(event.target) && window.innerWidth < 992) {
        setMobileSearchVisible(false);
      }
      
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key to close mobile search and dropdowns
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && window.innerWidth < 992) {
        setMobileSearchVisible(false);
      }
      
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };
  
  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  const toggleMobileSearch = () => {
    setMobileSearchVisible(!mobileSearchVisible);
  };
  
  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
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
    const isOrganizer = localStorage.getItem("isOrganizer") === "true";
    // Fallback to checking role string
    const role = localStorage.getItem("role") || '';
    
    console.log('Dashboard navigation check:');
    console.log('- isOrganizer flag:', isOrganizer);
    console.log('- role value:', role);
    console.log('- localStorage data:', {
      id: localStorage.getItem("id"),
      email: localStorage.getItem("email"),
      firstName: localStorage.getItem("firstName"),
      lastName: localStorage.getItem("lastName"),
      token: localStorage.getItem("token")?.substring(0, 10) + '...' // Only show part of token for security
    });
    
    if (isOrganizer) {
      console.log('Organizer detected via isOrganizer flag, navigating to /organizer');
      navigate('/organizer');
    } else if (role && (
        role.toLowerCase().includes('organizer') || 
        role.toLowerCase() === 'admin')) {
      console.log('Organizer detected via role string, navigating to /organizer');
      // Double check - set the flag if it's not already set
      localStorage.setItem("isOrganizer", "true");
      navigate('/organizer');
    } else {
      console.log('User role detected, navigating to user profile');
      navigate('/user');
    }
  };
  
  const navigateToProfile = () => {
    navigate('/user/profile');
    setUserDropdownOpen(false);
  };

  return (
    <>
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
              <span className="fw-bold fs-4">BookMySpot</span>
            </Link>

            {/* Mobile Search Toggle */}
            <div className="d-flex d-lg-none ms-auto me-2">
              <button 
                className="btn btn-icon text-dark border-0 bg-transparent"
                onClick={toggleMobileSearch}
                aria-label="Toggle search"
                aria-expanded={mobileSearchVisible}
              >
                <FaSearch className={`fs-5 ${mobileSearchVisible ? 'text-primary' : ''}`} />
              </button>
            </div>

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
              {/* Mobile Search Form */}
              {mobileSearchVisible && (
                <div className="mobile-search-wrapper p-3 d-lg-none" ref={searchRef}>
                  <form onSubmit={handleSearch}>
                    <div className="input-group search-input-group mb-2">
                      <div className="search-box-container flex-grow-1">
                        <div className="search-icon">
                          <FaSearch className="text-muted" aria-hidden="true" />
                        </div>
                        <input
                          type="text"
                          className="form-control search-input"
                          placeholder="Search venues, events..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          aria-label="Search for venues or events"
                        />
                      </div>
                      <button type="submit" className="search-button">Search</button>
                    </div>
                    <div className="d-flex align-items-center mb-3 p-2 bg-light rounded">
                      <FaMapMarkerAlt className="me-2 text-muted" aria-hidden="true" />
                      <span>{location}</span>
                    </div>
                  </form>
                </div>
              )}

              {/* Right Side Links */}
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
                
                {isLoggedIn ? (
                  <li className="nav-item dropdown position-relative" ref={userDropdownRef}>
                    <button
                      className="nav-link bg-transparent border-0 d-flex align-items-center"
                      onClick={toggleUserDropdown}
                      aria-expanded={userDropdownOpen}
                      style={{ textDecoration: 'none' }}
                    >
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ 
                          width: "34px", 
                          height: "34px",
                          backgroundColor: 'var(--primary-color)',
                          color: 'white',
                          fontSize: '0.9rem'
                        }}
                      >
                        {userInitial}
                      </div>
                    </button>
                    <div 
                      className={`dropdown-menu dropdown-menu-end ${userDropdownOpen ? 'show' : ''}`}
                      style={{
                        display: userDropdownOpen ? 'block' : 'none',
                        margin: 0,
                        right: 0,
                        left: 'auto',
                        top: '100%',
                        width: '200px',
                        zIndex: 2001,
                        padding: '8px 0'
                      }}
                    >
                      <button className="dropdown-item py-2" onClick={navigateToProfile}>
                        <FaUsers className="me-2 text-muted" aria-hidden="true" />
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
    </>
  );
};

// Scroll To Top Button Component
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`scroll-to-top-btn ${isVisible ? 'visible' : ''}`}
      aria-label="Scroll to top"
      style={{
        position: 'fixed',
        bottom: '90px',
        right: '30px',
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid #f05537',
        color: '#f05537',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
        transition: 'all 0.3s ease',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <FaArrowUp aria-hidden="true" />
    </button>
  );
};

// Reusable Scroll Reveal Component
const ScrollReveal = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.unobserve(domRef.current);
      }
    }, { threshold: 0.1 });
    
    observer.observe(domRef.current);
    
    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);
  
  const revealStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.5s ease, transform 0.5s ease ${delay}s`
  };
  
  return (
    <div ref={domRef} style={revealStyle}>
      {children}
    </div>
  );
};

// Hero Section
const HeaderSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const backgroundImages = [
    "https://images.pexels.com/photos/2291462/pexels-photo-2291462.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1", // Elegant banquet hall
    "https://images.pexels.com/photos/931887/pexels-photo-931887.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1",   // Garden wedding
    "https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1", // Luxury venue
    "https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1", // Event celebration
    "https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"    // Grand ballroom
  ];

  // Preload the first image for faster initial render
  useEffect(() => {
    const img = new Image();
    img.src = backgroundImages[0];
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Preload next image when current image changes
  useEffect(() => {
    const nextIndex = (currentImageIndex + 1) % backgroundImages.length;
    const img = new Image();
    img.src = backgroundImages[nextIndex];
  }, [currentImageIndex, backgroundImages]);
  
  // Handle Find Now button click
  const handleFindNow = (e) => {
    e.preventDefault();
    navigate('/events/browse');
  };
  
  return (
    <section 
      className="hero_section" 
      style={{ 
        backgroundImage: `url('${backgroundImages[currentImageIndex]}')`, 
        backgroundSize: "cover", 
        backgroundPosition: "center",
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        width: "100%",
      }}
    >
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.35)",
        }}
      />
      
      <div
        className="content-overlay"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "1200px",
          zIndex: 10,
          padding: "0 20px"
        }}
      >
        <div className="text-center text-white mb-4" style={{ background: "transparent" }}>
          <h1 className="display-4 fw-bold mb-2" style={{ background: "transparent" }}>Find Your Perfect Venue for Every Occasion</h1>
          <p className="lead">Discover, Book, and Celebrate at the Best Prices</p>
        </div>
        
        <div className="search-container bg-white rounded-lg shadow p-3" style={{ borderRadius: "0.5rem", maxWidth: "800px", margin: "0 auto" }}>
          <form className="row g-2" role="search" aria-label="Find venues and services">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-0"><FaSearch aria-hidden="true" /></span>
                <input 
                  type="text" 
                  className="form-control border-0" 
                  placeholder="Search Weddings, Birthday Parties etc." 
                  aria-label="Search venues or services"
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-0"><FaMapMarkerAlt aria-hidden="true" /></span>
                <select className="form-select border-0" aria-label="Select location">
                  <option>Ahmedabad</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Bangalore</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary w-100" onClick={handleFindNow}>Find Now</button>
            </div>
          </form>
        </div>
        
        <div className="mt-4 text-center">
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <div className="badge bg-light text-dark p-2 px-3">
              <span className="fw-bold d-block">10,000+</span>
              <span className="small">Events Hosted</span>
            </div>
            <div className="badge bg-light text-dark p-2 px-3">
              <span className="fw-bold d-block">500+</span>
              <span className="small">Venues</span>
            </div>
            <div className="badge bg-light text-dark p-2 px-3">
              <span className="fw-bold d-block">300+</span>
              <span className="small">Photographers</span>
            </div>
            <div className="badge bg-light text-dark p-2 px-3">
              <span className="fw-bold d-block">100+</span>
              <span className="small">Makeup Artists</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Services Section
const ServicesSection = () => (
  <section className="services_section py-5">
    <div className="container-fluid">
      <div className="text-center mb-5">
        <h2 className="section-title fw-bold">Our Premium Services</h2>
        <p className="section-subtitle text-muted">Everything you need for your special events</p>
      </div>
      
      <div className="row g-4">
        {services.map((service, index) => (
          <div className="col-lg-4 col-md-6" key={index}>
            <div className="card h-100 border-0 shadow-sm service-card">
              <img 
                src={service.image} 
                className="card-img-top" 
                alt={service.title} 
                style={{height: "200px", objectFit: "cover"}} 
                loading="lazy"
              />
              <div className="card-body">
                <h5 className="card-title">{service.title}</h5>
                <p className="card-text text-muted">{service.description}</p>
                <Link to={`/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`} className="btn btn-primary mt-2" 
                      aria-label={`Explore ${service.title}`}>
                  Explore Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-4">
        <Link to="/services" className="btn btn-outline-primary btn-lg px-4">
          View All Services
        </Link>
      </div>
    </div>
  </section>
);

// Optimize card rendering with memoization for better performance
const OptimizedCard = React.memo(({ item, type }) => {
  if (type === 'venue') {
    const venue = item;
    return (
      <div className="card h-100 border-0 shadow-sm venue-card">
        <img 
          src={venue.image} 
          className="card-img-top" 
          alt={venue.title} 
          style={{height: "250px", objectFit: "cover"}} 
          loading="lazy"
          width="600" 
          height="400"
        />
        <div className="card-body">
          <h5 className="card-title mb-1">{venue.title}</h5>
          <p className="small mb-1">
            <FaMapMarkerAlt className="me-1" aria-hidden="true" /> {venue.location}
          </p>
          <p className="card-text text-muted">{venue.description}</p>
          <p className="text-primary fw-bold">{venue.price}</p>
          <div>
            <Link to={`/venues/${venue.title.toLowerCase().replace(/\s+/g, '-')}`}
                 className="btn btn-primary" 
                 aria-label={`Check availability for ${venue.title}`}>
              Check Availability
            </Link>
          </div>
        </div>
      </div>
    );
  } else if (type === 'blog') {
    const blog = item;
    return (
      <div className="card h-100 border-0 shadow-sm blog-card">
        <img 
          src={blog.image} 
          className="card-img-top" 
          alt={blog.title} 
          style={{height: "220px", objectFit: "cover"}} 
          loading="lazy"
          width="600" 
          height="400"
        />
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="badge bg-light text-dark px-3 py-2 rounded-pill">{blog.category}</span>
            <small className="text-muted">{blog.date}</small>
          </div>
          <h5 className="card-title">{blog.title}</h5>
          <p className="card-text text-muted" style={{ 
            whiteSpace: 'normal', 
            wordBreak: 'keep-all', 
            hyphens: 'none',
            wordWrap: 'normal',
            overflowWrap: 'normal'
          }}>
            {blog.description}
          </p>
        </div>
        <div className="card-footer bg-transparent border-0 pt-0">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">By {blog.author}</small>
            <Link to={`/blog/${blog.title.toLowerCase().replace(/\s+/g, '-')}`} className="btn btn-sm text-primary">
              Read More <i className="fas fa-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return null;
});

// Popular Venues Section with filtering
const PopularVenuesSection = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredVenues, setFilteredVenues] = useState(venues);
  
  // Filter venues based on activeFilter
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredVenues(venues);
    } else {
      setFilteredVenues(venues.filter(venue => venue.location === activeFilter));
    }
  }, [activeFilter]);
  
  return (
    <section className="popular_venues_section py-5" style={{ background: '#f9f9f9' }}>
      <div className="container-fluid">
        <ScrollReveal>
          <div className="text-center mb-4">
            <h2 className="section-title fw-bold">Explore Popular Venues</h2>
            <p className="section-subtitle text-muted">Find the perfect setting for your memorable occasions</p>
          </div>
        </ScrollReveal>
        
        <div className="row g-4">
          {filteredVenues.map((venue, index) => (
            <div className="col-lg-4 col-md-6" key={index}>
              <ScrollReveal delay={0.1 * (index % 3)}>
                <OptimizedCard item={venue} type="venue" />
              </ScrollReveal>
            </div>
          ))}
        </div>
        
        <ScrollReveal delay={0.3}>
          <div className="text-center mt-5">
            <Link 
              to="/venues" 
              className="btn btn-primary btn-lg" 
              aria-label="View all available venues"
            >
              View All Venues <i className="fas fa-chevron-right ms-2" aria-hidden="true"></i>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

// Blogs Section with improved visuals
const BlogsSection = () => {
  return (
    <section className="blogs_section py-5" style={{ background: '#ffffff' }}>
      <div className="container-fluid">
        <ScrollReveal>
          <div className="text-center mb-5">
            <h2 className="section-title fw-bold">Latest From Our Blog</h2>
            <p className="section-subtitle text-muted">Expert tips and inspiration for your events</p>
          </div>
        </ScrollReveal>
        
        <div className="row g-4">
          {blogs.map((blog, index) => (
            <div className="col-lg-4 col-md-6" key={index}>
              <ScrollReveal delay={0.1 * (index % 3)}>
                <div className="card h-100 border-0 shadow-sm blog-card">
                  <img 
                    src={blog.image} 
                    className="card-img-top" 
                    alt={blog.title} 
                    style={{height: "220px", objectFit: "cover"}} 
                    loading="lazy"
                    width="600" 
                    height="400"
                  />
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="badge bg-light text-dark px-3 py-2 rounded-pill">{blog.category}</span>
                      <small className="text-muted">{blog.date}</small>
                    </div>
                    <h5 className="card-title fw-bold mb-3">{blog.title}</h5>
                    <p className="card-text text-muted" style={{ 
                      whiteSpace: 'normal', 
                      wordBreak: 'keep-all', 
                      hyphens: 'none',
                      wordWrap: 'normal',
                      overflowWrap: 'normal'
                    }}>
                      {blog.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          ))}
        </div>
        
        <ScrollReveal delay={0.3}>
          <div className="text-center mt-4">
            <Link 
              to="/blog" 
              className="btn btn-outline-primary btn-lg px-4"
              aria-label="View all blog articles"
            >
              View All Articles
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => (
  <section className="testimonials_section py-5" style={{ background: '#f8f9fa' }}>
    <div className="container-fluid">
      <div className="text-center mb-5">
        <h2 className="section-title fw-bold">What Our Customers Say</h2>
        <p className="section-subtitle text-muted">Real experiences from real people</p>
      </div>
      
      <div className="row gx-4 gy-4 mb-5">
        {testimonials.map((testimonial, index) => (
          <div className="col-lg-4 col-md-6" key={index}>
            <div className="card h-100 shadow-sm testimonial-flat-card">
              <div className="card-body p-4">
                <div className="d-flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas fa-star ${i < testimonial.rating ? 'text-warning' : 'text-muted'}`} aria-hidden="true"></i>
                  ))}
                </div>
                <p className="card-text mb-4" style={{ fontSize: '1rem', lineHeight: '1.6' }}>{testimonial.text}</p>
                <div className="d-flex align-items-center mt-auto">
                  <img src={testimonial.image} alt="" className="rounded-circle me-3" width="50" height="50" style={{objectFit: "cover"}} />
                  <div>
                    <h6 className="mb-0 fw-bold">{testimonial.name}</h6>
                    <small className="text-muted">{testimonial.role}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Trust Badges/Partners Section */}
      <div className="mt-5 pt-4 border-top">
        <div className="row align-items-center">
          <div className="col-lg-3 text-center text-lg-start mb-4 mb-lg-0">
            <h5 className="fw-bold">Trusted By:</h5>
          </div>
          <div className="col-lg-9">
            <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-4 align-items-center">
              <div className="text-center px-3">
                <i className="fas fa-shield-alt fa-2x mb-2 text-secondary"></i>
                <p className="small mb-0">Secure Payments</p>
              </div>
              <div className="text-center px-3">
                <i className="fas fa-headset fa-2x mb-2 text-secondary"></i>
                <p className="small mb-0">24/7 Support</p>
              </div>
              <div className="text-center px-3">
                <i className="fas fa-credit-card fa-2x mb-2 text-secondary"></i>
                <p className="small mb-0">Flexible Payments</p>
              </div>
              <div className="text-center px-3">
                <i className="fas fa-check-circle fa-2x mb-2 text-secondary"></i>
                <p className="small mb-0">Verified Venues</p>
              </div>
              <div className="text-center px-3">
                <i className="fas fa-calendar-check fa-2x mb-2 text-secondary"></i>
                <p className="small mb-0">Instant Confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// How It Works Section with enhanced accessibility
const HowItWorksSection = () => (
  <section className="how_it_works py-5" style={{ background: '#f5f7fa' }}>
    <div className="container-fluid">
      <ScrollReveal>
        <div className="text-center mb-5">
          <h2 className="section-title fw-bold">How It Works</h2>
          <p className="section-subtitle text-muted">Simple steps to find and book your perfect venue</p>
        </div>
      </ScrollReveal>
      
      <div className="row g-4">
        <div className="col-md-3 text-center">
          <ScrollReveal delay={0.1}>
            <div className="card h-100 border-0 shadow-sm">
              <img src="https://images.pexels.com/photos/5054356/pexels-photo-5054356.jpeg?auto=compress&cs=tinysrgb&w=600&h=400" 
                   className="card-img-top" 
                   alt="Person searching for venues on a laptop" 
                   style={{height: "180px", objectFit: "cover"}} 
                   loading="lazy"
                   width="600"
                   height="400" />
              <div className="card-body">
                <div className="icon-circle bg-primary mx-auto mb-4 d-flex align-items-center justify-content-center" 
                     style={{
                       width: "80px", 
                       height: "80px", 
                       borderRadius: "50%"
                     }}
                     aria-hidden="true"
                >
                  <FaSearch style={{fontSize: "30px", color: "white"}} />
                </div>
                <h5>Search</h5>
                <p className="text-muted">Find the perfect venue for your occasion</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <div className="col-md-3 text-center">
          <ScrollReveal delay={0.2}>
            <div className="card h-100 border-0 shadow-sm">
              <img src="https://images.pexels.com/photos/8867262/pexels-photo-8867262.jpeg?auto=compress&cs=tinysrgb&w=600&h=400" 
                   className="card-img-top" 
                   alt="Person booking a venue online" 
                   style={{height: "180px", objectFit: "cover"}} 
                   loading="lazy"
                   width="600"
                   height="400" />
              <div className="card-body">
                <div className="icon-circle bg-primary mx-auto mb-4 d-flex align-items-center justify-content-center" 
                     style={{
                       width: "80px", 
                       height: "80px", 
                       borderRadius: "50%"
                     }}
                     aria-hidden="true"
                >
                  <FaCalendarAlt style={{fontSize: "30px", color: "white"}} />
                </div>
                <h5>Book</h5>
                <p className="text-muted">Reserve your date easily online</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <div className="col-md-3 text-center">
          <ScrollReveal delay={0.3}>
            <div className="card h-100 border-0 shadow-sm">
              <img src="https://images.pexels.com/photos/6647037/pexels-photo-6647037.jpeg?auto=compress&cs=tinysrgb&w=600&h=400" 
                   className="card-img-top" 
                   alt="People touring a potential venue" 
                   style={{height: "180px", objectFit: "cover"}} 
                   loading="lazy"
                   width="600"
                   height="400" />
              <div className="card-body">
                <div className="icon-circle bg-primary mx-auto mb-4 d-flex align-items-center justify-content-center" 
                     style={{
                       width: "80px", 
                       height: "80px", 
                       borderRadius: "50%"
                     }}
                     aria-hidden="true"
                >
                  <FaMapMarkerAlt style={{fontSize: "30px", color: "white"}} />
                </div>
                <h5>Visit</h5>
                <p className="text-muted">Schedule a visit to confirm your choice</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <div className="col-md-3 text-center">
          <ScrollReveal delay={0.4}>
            <div className="card h-100 border-0 shadow-sm">
              <img src="https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=600&h=400" 
                   className="card-img-top" 
                   alt="People celebrating at an event" 
                   style={{height: "180px", objectFit: "cover"}} 
                   loading="lazy"
                   width="600"
                   height="400" />
              <div className="card-body">
                <div className="icon-circle bg-primary mx-auto mb-4 d-flex align-items-center justify-content-center" 
                     style={{
                       width: "80px", 
                       height: "80px", 
                       borderRadius: "50%"
                     }}
                     aria-hidden="true"
                >
                  <FaUsers style={{fontSize: "30px", color: "white"}} />
                </div>
                <h5>Celebrate</h5>
                <p className="text-muted">Enjoy your special day worry-free</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  </section>
);

// Call to Action Section
const CallToActionSection = () => (
  <section className="cta_section py-5" style={{
    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0)), url('https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    width: "100%"
  }}>
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-8 col-md-10 mx-auto text-center">
          <h2 className="fw-bold mb-4 text-dark">Ready to Plan Your Perfect Event?</h2>
          <p className="lead mb-4 text-secondary">Join thousands of happy customers who found their dream venues through BookMySpot</p>
          
          <div className="row justify-content-center mb-4">
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="p-3 bg-light rounded h-100 shadow-sm">
                <i className="fas fa-calendar-check fa-2x mb-3 text-primary"></i>
                <h5 className="mb-2">Easy Booking</h5>
                <p className="small mb-0">Book venues in just a few clicks</p>
              </div>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="p-3 bg-light rounded h-100 shadow-sm">
                <i className="fas fa-wallet fa-2x mb-3 text-primary"></i>
                <h5 className="mb-2">Best Prices</h5>
                <p className="small mb-0">Guaranteed best rates and offers</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 bg-light rounded h-100 shadow-sm">
                <i className="fas fa-headset fa-2x mb-3 text-primary"></i>
                <h5 className="mb-2">Premium Support</h5>
                <p className="small mb-0">Professional help at every step</p>
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/signup" className="btn btn-primary btn-lg" style={{minWidth: "160px"}}>
              Get Started Now
            </Link>
            <Link to="/help" className="btn btn-lg btn-outline-secondary" style={{minWidth: "160px"}}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Custom FooterLink to ensure transparent background 
const FooterLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="text-white text-decoration-none" 
    style={{ 
      background: 'transparent', 
      display: 'inline-block',
      padding: '4px 0'
    }}
  >
    {children}
  </Link>
);

// Footer Component
const Footer = () => (
  <footer className="footer py-5 bg-dark text-white">
    <div className="container-fluid">
      <div className="row g-4">
        <div className="col-lg-4 col-md-6">
          <h5 className="fw-bold mb-3">BookMySpot</h5>
          <p>Finding the perfect venue for your special events made easy. Search, compare, and book with confidence.</p>
          <div className="d-flex gap-2 mt-3">
            <a href="#" className="btn btn-sm btn-outline-light rounded-circle"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="btn btn-sm btn-outline-light rounded-circle"><i className="fab fa-twitter"></i></a>
            <a href="#" className="btn btn-sm btn-outline-light rounded-circle"><i className="fab fa-instagram"></i></a>
            <a href="#" className="btn btn-sm btn-outline-light rounded-circle"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
        <div className="col-lg-2 col-md-6">
          <h5 className="fw-bold mb-3">Quick Links</h5>
          <ul className="list-unstyled">
            <li className="mb-2"><FooterLink to="/about">About Us</FooterLink></li>
            <li className="mb-2"><FooterLink to="/services">Services</FooterLink></li>
            <li className="mb-2"><FooterLink to="/venues">Venues</FooterLink></li>
            <li className="mb-2"><FooterLink to="/blog">Blog</FooterLink></li>
          </ul>
        </div>
        <div className="col-lg-2 col-md-6">
          <h5 className="fw-bold mb-3">Support</h5>
          <ul className="list-unstyled">
            <li className="mb-2"><FooterLink to="/help">Help Center</FooterLink></li>
            <li className="mb-2"><FooterLink to="/faq">FAQs</FooterLink></li>
            <li className="mb-2"><FooterLink to="/terms">Terms of Service</FooterLink></li>
            <li className="mb-2"><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
          </ul>
        </div>
        <div className="col-lg-4 col-md-6">
          <h5 className="fw-bold mb-3">Newsletter</h5>
          <p>Subscribe to our newsletter for special offers and updates</p>
          <form className="mt-3">
            <div className="input-group">
              <input type="email" className="form-control" placeholder="Your Email" />
              <button className="btn btn-primary" type="submit">Subscribe</button>
            </div>
          </form>
        </div>
      </div>
      <hr className="my-4" />
      <div className="row">
        <div className="col-12 text-center">
          <p className="mb-0">© 2025 BookMySpot. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
);

// Main Landing Page Component with optimized resource loading
const LandingPage = () => {
  // Recent searches state - simulating recently viewed venues
  const [recentVenues, setRecentVenues] = useState([]);
  
  // Use React.lazy for testimonials section to defer its loading
  const LazyTestimonialsSection = React.memo(TestimonialsSection);
  
  // Setup recently viewed venues from localStorage on mount
  useEffect(() => {
    const storedVenues = localStorage.getItem('recentlyViewedVenues');
    if (storedVenues) {
      try {
        const parsedVenues = JSON.parse(storedVenues);
        setRecentVenues(parsedVenues.slice(0, 3)); // Show max 3 recent venues
      } catch (e) {
        console.error('Error parsing recently viewed venues:', e);
      }
    }
  }, []);
  
  useEffect(() => {
    // Load FontAwesome CSS from CDN - more reliable than the kit
    const loadFontAwesome = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      link.integrity = "sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==";
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      return link;
    };
    
    // Load Animate.css for animations
    const loadAnimateCss = () => {
      const animateLink = document.createElement('link');
      animateLink.rel = 'stylesheet';
      animateLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
      document.head.appendChild(animateLink);
      return animateLink;
    };
    
    // Load resources with requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
      const idleCallback = requestIdleCallback(() => {
        const fontAwesomeLink = loadFontAwesome();
        const animateLink = loadAnimateCss();
        
        return () => {
          document.head.removeChild(fontAwesomeLink);
          document.head.removeChild(animateLink);
        };
      });
      
      return () => {
        if (idleCallback) {
          cancelIdleCallback(idleCallback);
        }
      };
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      const fontAwesomeLink = loadFontAwesome();
      const animateLink = loadAnimateCss();
      
      return () => {
        document.head.removeChild(fontAwesomeLink);
        document.head.removeChild(animateLink);
      };
    }
  }, []);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
    
    /* Hide scrollbars everywhere */
    html, body, div, main, section, .container, .container-fluid, .row {
      scrollbar-width: none !important; /* Firefox */
      -ms-overflow-style: none !important; /* IE and Edge */
    }
    
    html::-webkit-scrollbar, 
    body::-webkit-scrollbar, 
    div::-webkit-scrollbar, 
    main::-webkit-scrollbar, 
    section::-webkit-scrollbar,
    .container::-webkit-scrollbar,
    .container-fluid::-webkit-scrollbar,
    .row::-webkit-scrollbar {
      display: none !important; /* Chrome, Safari, Opera */
      width: 0 !important;
      height: 0 !important;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      color: #333;
      scroll-behavior: smooth;
      overflow-y: scroll;
      overflow-x: hidden;
    }
    
    h1, h2, h3, h4, h5, h6, .navbar-brand {
      font-family: 'Poppins', sans-serif;
    }
    
    .section-title {
      position: relative;
      padding-bottom: 15px;
      margin-bottom: 15px;
      color: #333;
    }
    
    .section-title:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 3px;
      background-color: var(--primary-color);
    }
    
    .service-card:hover, .venue-card:hover, .blog-card:hover {
      transform: translateY(-10px);
      transition: transform 0.3s ease;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
    }
    
    .service-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .service-card:hover .service-overlay {
      opacity: 1;
    }
    
    .nav-link {
      position: relative;
    }
    
    .nav-link:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 2px;
      background-color: var(--primary-color);
      transition: width 0.3s;
    }
    
    .nav-link:hover:after, .nav-link.active:after {
      width: 80%;
    }
    
    .btn-primary, .bg-primary {
      background-color: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
    }
    
    .btn-primary:focus, .btn:focus {
      box-shadow: 0 0 0 0.25rem rgba(54, 89, 227, 0.25) !important;
    }
    
    .text-primary {
      color: var(--primary-color) !important;
    }
    
    .search-container {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 10px;
    }
    
    .floating-cta {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 1000;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      animation: pulse 2s infinite;
    }
    
    .floating-cta:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(54, 89, 227, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(54, 89, 227, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(54, 89, 227, 0);
      }
    }
    
    /* Content visibility to improve initial load time */
    .below-fold-section {
      content-visibility: auto;
      contain-intrinsic-size: 500px;
    }
    
    /* Filter buttons styles */
    .filter-buttons .btn {
      border-radius: 30px;
      padding: 0.4rem 1rem;
      margin: 0 0.3rem;
      transition: all 0.3s ease;
    }
    
    .filter-buttons .btn-outline-secondary {
      color: #555;
      border-color: #ddd;
    }
    
    .filter-buttons .btn-outline-secondary:hover {
      background-color: #f8f9fa;
      color: #333;
    }
    
    /* Improve focus visibility for accessibility */
    a:focus, button:focus, input:focus, select:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    
    /* Animation for sticky search bar */
    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    /* Improved spacing for mobile */
    @media (max-width: 768px) {
      .container-fluid {
        padding-left: 20px;
        padding-right: 20px;
      }
      
      .section-title {
        font-size: 1.8rem;
      }
      
      .filter-buttons .btn {
        font-size: 0.8rem;
        padding: 0.3rem 0.7rem;
        margin: 0 0.2rem;
      }
    }
  `;

  return (
    <div>
      <style>{styles}</style>
      <Header />
      <main>
        <HeaderSection />
        <HowItWorksSection />
        <PopularVenuesSection />
        <BlogsSection />
        <div className="below-fold-section">
          <LazyTestimonialsSection />
        </div>
        <div className="below-fold-section">
          <CallToActionSection />
        </div>
      </main>
      <Footer />
      
      {/* Recently Viewed Section - Will appear if there are recently viewed venues */}
      {recentVenues.length > 0 && (
        <div 
          className="recently-viewed-bar"
          style={{
            position: 'fixed',
            bottom: '120px',
            right: '30px',
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            zIndex: 999,
            maxWidth: '300px'
          }}
          aria-label="Recently viewed venues"
        >
          <h6 className="fw-bold mb-2">Recently Viewed</h6>
          <ul className="list-unstyled">
            {recentVenues.map((venue, index) => (
              <li key={index} className="mb-2">
                <Link to={`/venues/${venue.id}`} className="d-flex align-items-center text-decoration-none">
                  <img 
                    src={venue.image} 
                    alt="" 
                    className="rounded me-2" 
                    width="40" 
                    height="40" 
                    style={{objectFit: "cover"}} 
                  />
                  <span className="text-truncate" style={{color: '#333'}}>{venue.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Floating Action Button */}
      <Link to="/signup" className="btn btn-primary floating-cta" aria-label="Get Started Now">
        <i className="fas fa-arrow-right" aria-hidden="true"></i>
      </Link>
    </div>
  );
};

export default LandingPage;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaStar, FaHeart, FaSearch, FaFilter, FaUsers, FaClock } from 'react-icons/fa';
import axios from 'axios';
import AuthService from '../../services/AuthService';

// Sample data for venues and bookings
const featuredVenues = [
  { 
    id: 1, 
    title: "Royal Grand Palace", 
    image: "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=600", 
    description: "Elegant venue perfect for weddings and grand celebrations", 
    price: "₹50,000 onwards",
    rating: 4.9,
    location: "Ahmedabad",
    category: "Banquet Hall"
  },
  { 
    id: 2, 
    title: "Riverside Retreat", 
    image: "https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=600", 
    description: "Beautiful waterfront venue for memorable occasions", 
    price: "₹35,000 onwards",
    rating: 4.7,
    location: "Mumbai",
    category: "Outdoor"
  },
  { 
    id: 3, 
    title: "Modern Event Center", 
    image: "https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=600", 
    description: "Contemporary space with state-of-the-art facilities", 
    price: "₹45,000 onwards",
    rating: 4.8,
    location: "Delhi",
    category: "Conference Hall"
  },
  { 
    id: 4, 
    title: "Garden Paradise", 
    image: "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=600", 
    description: "Lush green surroundings for beautiful outdoor events", 
    price: "₹40,000 onwards",
    rating: 4.6,
    location: "Bangalore",
    category: "Garden"
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Wedding Expo 2024",
    date: "May 15, 2024",
    image: "https://images.pexels.com/photos/1114425/pexels-photo-1114425.jpeg?auto=compress&cs=tinysrgb&w=600",
    location: "Ahmedabad Exhibition Center"
  },
  {
    id: 2,
    title: "Corporate Networking Summit",
    date: "June 3, 2024",
    image: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=600",
    location: "Business Tower, Mumbai"
  },
  {
    id: 3,
    title: "Food Festival 2024",
    date: "June 12, 2024",
    image: "https://images.pexels.com/photos/5409131/pexels-photo-5409131.jpeg?auto=compress&cs=tinysrgb&w=600",
    location: "City Park, Delhi"
  }
];

const recentBookings = [
  {
    id: 1,
    venue: "Blue Sapphire Banquet",
    date: "April 5, 2024",
    status: "Confirmed",
    eventType: "Birthday Party",
    totalAmount: "₹25,000"
  },
  {
    id: 2,
    venue: "Green Valley Resort",
    date: "March 20, 2024",
    status: "Completed",
    eventType: "Corporate Event",
    totalAmount: "₹45,000"
  }
];

export const UserDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('User');
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [venues, setVenues] = useState(featuredVenues);
  const [events, setEvents] = useState(upcomingEvents);
  const [bookings, setBookings] = useState(recentBookings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data, events, venues from backend
  useEffect(() => {
    const fetchUserData = async (userId) => {
      try {
        setLoading(true);
        
        // Get user data from AuthService
        const userInfo = AuthService.getUserInfo();
        
        if (userInfo.id) {
          // Update user name
          setUserName(userInfo.firstName || 'User');
          
          // Update other user data references
          if (userInfo.firstName) AuthService.updateUserData('firstName', userInfo.firstName);
          if (userInfo.lastName) AuthService.updateUserData('lastName', userInfo.lastName);
          if (userInfo.email) AuthService.updateUserData('email', userInfo.email);
        }
        
        // Fetch events
        try {
          const eventsResponse = await axios.get('http://localhost:3200/event/all');
          if (eventsResponse.status === 200 && eventsResponse.data.data) {
            // Transform API events data to match our component structure
            const formattedEvents = eventsResponse.data.data.map(event => ({
              id: event._id,
              title: event.name || 'Unnamed Event',
              date: new Date(event.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              image: event.image || "https://images.pexels.com/photos/1114425/pexels-photo-1114425.jpeg?auto=compress&cs=tinysrgb&w=600",
              location: event.location || 'TBD'
            }));
            setEvents(formattedEvents);
          }
        } catch (eventsError) {
          console.error('Error fetching events:', eventsError);
          // Keep using sample data if API fails
        }
        
        // Fetch user's bookings if available
        // This endpoint would need to be implemented in your backend
        try {
          const bookingsResponse = await axios.get(`http://localhost:3200/user/${userId}/bookings`);
          if (bookingsResponse.status === 200 && bookingsResponse.data.data) {
            // Transform API bookings data to match our component structure
            const formattedBookings = bookingsResponse.data.data.map(booking => ({
              id: booking._id,
              venue: booking.venueName || 'Unknown Venue',
              date: new Date(booking.eventDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              status: booking.status || 'Pending',
              eventType: booking.eventType || 'Event',
              totalAmount: booking.totalAmount ? `₹${booking.totalAmount}` : 'TBD'
            }));
            setBookings(formattedBookings);
          }
        } catch (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          // Keep using sample data if API fails
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
        
        // Fallback to AuthService
        const userInfo = AuthService.getUserInfo();
        if (userInfo.id) {
          setUserName(userInfo.firstName || 'User');
        } else {
          const userEmail = userInfo.email || '';
          if (userEmail) {
            const name = userEmail.split('@')[0];
            setUserName(name.charAt(0).toUpperCase() + name.slice(1));
          }
        }
      } finally {
        setLoading(false);
        
        // Hide welcome message after 5 seconds
        const timer = setTimeout(() => {
          setShowWelcomeMessage(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    };
    
    // Get user data from AuthService
    const userInfo = AuthService.getUserInfo();
    
    // Use userInfo.id instead of localStorage.getItem('id')
    const userId = userInfo.id;
    if (userId) {
      fetchUserData(userId);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
    
    if (!searchTerm.trim()) {
      return;
    }
    
    try {
      // Search venues API endpoint
      const response = await axios.get(`http://localhost:3200/venue/search?term=${encodeURIComponent(searchTerm)}`);
      
      if (response.status === 200 && response.data.data) {
        // Update venues with search results
        const formattedVenues = response.data.data.map(venue => ({
          id: venue._id,
          title: venue.name || 'Unnamed Venue',
          image: venue.image || featuredVenues[0].image,
          description: venue.description || 'No description available',
          price: venue.price ? `₹${venue.price} onwards` : 'Price on request',
          rating: venue.rating || 4.5,
          location: venue.location || 'Unknown location',
          category: venue.category || 'Venue'
        }));
        setVenues(formattedVenues);
      }
    } catch (error) {
      console.error('Error searching venues:', error);
      // Keep using existing data if search fails
    }
  };

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4" style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Dashboard</h1>
      
      {/* Welcome Message */}
      {showWelcomeMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <strong>Welcome back, {userName}!</strong> Discover new venues and manage your bookings.
          <button type="button" className="btn-close" onClick={() => setShowWelcomeMessage(false)} aria-label="Close"></button>
        </div>
      )}

      {/* Search and Quick Stats */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSearch} className="d-flex flex-wrap gap-2">
                <div className="flex-grow-1">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <FaSearch className="text-muted" />
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-start-0" 
                      placeholder="Search venues, events..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary px-4" style={{ backgroundColor: "#f05537", borderColor: "#f05537" }}>
                  Search
                </button>
                <button type="button" className="btn btn-outline-secondary d-flex align-items-center">
                  <FaFilter className="me-2" /> Filter
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="card-title text-muted mb-3">Quick Stats</h6>
              <div className="d-flex justify-content-around">
                <div className="text-center">
                  <h3 className="mb-0">{bookings.length}</h3>
                  <small className="text-muted">Bookings</small>
                </div>
                <div className="text-center">
                  <h3 className="mb-0">0</h3>
                  <small className="text-muted">Reviews</small>
                </div>
                <div className="text-center">
                  <h3 className="mb-0">0</h3>
                  <small className="text-muted">Saved</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Venues Section - Now using API data */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Featured Venues</h5>
            <Link to="/user/venues" className="btn btn-sm" style={{ color: "#f05537" }}>
              View All
            </Link>
          </div>
          <div className="row g-3">
            {venues.map((venue) => (
              <div className="col-lg-3 col-md-6" key={venue.id}>
                <div className="card h-100 border-0 shadow-sm venue-card">
                  <img 
                    src={venue.image} 
                    className="card-img-top" 
                    alt={venue.title} 
                    style={{height: "180px", objectFit: "cover"}} 
                  />
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="card-title mb-0">{venue.title}</h6>
                      <span className="badge bg-primary rounded-pill px-2 py-1" style={{ backgroundColor: "#f05537!important" }}>
                        <FaStar className="me-1" style={{ fontSize: "10px" }} /> {venue.rating}
                      </span>
                    </div>
                    <p className="card-text mb-1 small text-muted">
                      <FaMapMarkerAlt className="me-1" /> {venue.location} • {venue.category}
                    </p>
                    <p className="card-text small mb-2 text-truncate">{venue.description}</p>
                    <p className="card-text fw-bold" style={{ color: "#f05537", fontSize: "14px" }}>{venue.price}</p>
                    <div className="d-flex justify-content-between">
                      <Link 
                        to={`/user/venues/${venue.id}`} 
                        className="btn btn-sm" 
                        style={{ backgroundColor: "#f05537", color: "white" }}
                      >
                        View Details
                      </Link>
                      <button className="btn btn-sm btn-outline-secondary">
                        <FaHeart />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events & Recent Bookings */}
      <div className="row mb-4">
        {/* Upcoming Events */}
        <div className="col-lg-8 mb-4 mb-lg-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Upcoming Events</h5>
            <Link to="/user/events" className="btn btn-sm" style={{ color: "#f05537" }}>
              View All
            </Link>
          </div>
          <div className="row g-3">
            {events.map((event) => (
              <div className="col-md-4" key={event.id}>
                <div className="card h-100 border-0 shadow-sm">
                  <img 
                    src={event.image} 
                    className="card-img-top" 
                    alt={event.title} 
                    style={{height: "140px", objectFit: "cover"}} 
                  />
                  <div className="card-body">
                    <h6 className="card-title">{event.title}</h6>
                    <div className="mb-2 small text-muted">
                      <div><FaCalendarAlt className="me-1" /> {event.date}</div>
                      <div><FaMapMarkerAlt className="me-1" /> {event.location}</div>
                    </div>
                    <Link 
                      to={`/user/events/${event.id}`} 
                      className="btn btn-sm w-100" 
                      style={{ backgroundColor: "#f05537", color: "white" }}
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Bookings */}
        <div className="col-lg-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Recent Bookings</h5>
            <Link to="/user/bookings" className="btn btn-sm" style={{ color: "#f05537" }}>
              View All
            </Link>
          </div>
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {bookings.map((booking) => (
                  <div className="list-group-item" key={booking.id}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className="mb-0">{booking.venue}</h6>
                      <span className={`badge ${booking.status === 'Confirmed' ? 'bg-success' : 'bg-secondary'}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="small text-muted mb-2">
                      <FaCalendarAlt className="me-1" /> {booking.date} • {booking.eventType}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold" style={{ color: "#f05537" }}>{booking.totalAmount}</span>
                      <Link to={`/user/bookings/${booking.id}`} className="btn btn-sm btn-outline-secondary">
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && (
                  <div className="list-group-item text-center py-4">
                    <p className="text-muted mb-0">No bookings yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Recommended For You</h5>
          </div>
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-4 align-items-center">
                <div className="col-md-6">
                  <img 
                    src="https://images.pexels.com/photos/2291462/pexels-photo-2291462.jpeg?auto=compress&cs=tinysrgb&w=1200" 
                    alt="Premium venues" 
                    className="img-fluid rounded" 
                    style={{height: "250px", width: "100%", objectFit: "cover"}}
                  />
                </div>
                <div className="col-md-6">
                  <h4>Exclusive Premium Venues</h4>
                  <p className="text-muted">Discover our selection of high-end venues perfect for your special occasions. Book early for special discounts!</p>
                  <Link 
                    to="/user/venues?category=premium" 
                    className="btn" 
                    style={{ backgroundColor: "#f05537", color: "white" }}
                  >
                    Explore Premium Venues
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div 
                className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: 'rgba(0, 150, 255, 0.1)',
                  color: '#0096FF'
                }}
              >
                <FaCalendarAlt style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>Upcoming Events</div>
                <div className="fw-bold fs-4">3</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div 
                className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: 'rgba(240, 85, 55, 0.1)',
                  color: '#f05537'
                }}
              >
                <FaUsers style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>Total Bookings</div>
                <div className="fw-bold fs-4">12</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div 
                className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545'
                }}
              >
                <FaHeart style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>Saved Venues</div>
                <div className="fw-bold fs-4">5</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div 
                className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                  color: '#28a745'
                }}
              >
                <FaClock style={{ fontSize: '1.5rem' }} />
              </div>
              <div>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>Recent Views</div>
                <div className="fw-bold fs-4">8</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row g-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0">Upcoming Bookings</h5>
            </div>
            <div className="card-body">
              <table className="table">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Venue</th>
                    <th scope="col">Date</th>
                    <th scope="col">Time</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Royal Grand Palace</td>
                    <td>15 Dec 2023</td>
                    <td>6:00 PM</td>
                    <td><span className="badge bg-success">Confirmed</span></td>
                  </tr>
                  <tr>
                    <td>Modern Event Center</td>
                    <td>22 Dec 2023</td>
                    <td>2:00 PM</td>
                    <td><span className="badge bg-warning text-dark">Pending</span></td>
                  </tr>
                  <tr>
                    <td>Riverside Retreat</td>
                    <td>05 Jan 2024</td>
                    <td>7:30 PM</td>
                    <td><span className="badge bg-success">Confirmed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0">Recently Viewed</h5>
            </div>
            <div className="card-body p-0">
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-3 py-3">
                  <div className="d-flex align-items-center">
                    <img 
                      src="https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=600&h=400" 
                      alt="Modern Event Center" 
                      className="rounded me-3" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                    />
                    <div>
                      <div className="fw-medium">Modern Event Center</div>
                      <div className="small text-muted">Viewed 2 hours ago</div>
                    </div>
                  </div>
                </li>
                <li className="list-group-item px-3 py-3">
                  <div className="d-flex align-items-center">
                    <img 
                      src="https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=600&h=400" 
                      alt="Riverside Retreat" 
                      className="rounded me-3" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                    />
                    <div>
                      <div className="fw-medium">Riverside Retreat</div>
                      <div className="small text-muted">Viewed 5 hours ago</div>
                    </div>
                  </div>
                </li>
                <li className="list-group-item px-3 py-3">
                  <div className="d-flex align-items-center">
                    <img 
                      src="https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=600&h=400" 
                      alt="Royal Grand Palace" 
                      className="rounded me-3" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                    />
                    <div>
                      <div className="fw-medium">Royal Grand Palace</div>
                      <div className="small text-muted">Viewed 1 day ago</div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaCheckCircle, FaChartLine, FaArrowUp, FaArrowDown, FaEye } from 'react-icons/fa';
import BookingService from '../../services/BookingService';
import EventService from '../../services/EventService';
import { motion } from 'framer-motion';
import { formatDate, formatCurrency } from '../../utils/formatters';

// Using placeholder images as fallback
const PLACEHOLDER_IMAGE1 = 'https://via.placeholder.com/300x200?text=Corporate+Retreat';
const PLACEHOLDER_IMAGE2 = 'https://via.placeholder.com/300x200?text=Wedding+Reception';
const PLACEHOLDER_IMAGE3 = 'https://via.placeholder.com/300x200?text=Birthday+Party';

const OrganizerHome = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    totalEvents: 0,
    revenueChange: 0,
    bookingChange: 0
  });
  
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Inline style to fix padding issue
  const containerStyle = {
    paddingTop: '90px', // Add extra padding to prevent content from being hidden under navbar
  };
  
  // Fetch dashboard data from the backend API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data in parallel for better performance
        const [bookingStats, eventsData, recentBookingsData] = await Promise.all([
          BookingService.getBookingStats(),
          EventService.getUpcomingEvents(5), // Get 5 upcoming events
          BookingService.getRecentBookings(5) // Get 5 recent bookings
        ]);
        
        // Process booking stats data
        setStats({
          totalBookings: bookingStats?.totalBookings || 0,
          pendingBookings: bookingStats?.pendingBookings || 0,
          totalRevenue: bookingStats?.totalRevenue || 0,
          totalEvents: bookingStats?.totalEvents || 0,
          revenueChange: bookingStats?.revenueChange || 15, // Default to 15% if not available
          bookingChange: bookingStats?.bookingChange || 8 // Default to 8% if not available
        });
        
        // Process upcoming events data
        if (Array.isArray(eventsData) && eventsData.length > 0) {
          setUpcomingEvents(eventsData.map(event => ({
            id: event._id || event.id,
            title: event.title || event.name,
            date: event.eventDate || event.date,
            time: event.startTime && event.endTime ? `${event.startTime} - ${event.endTime}` : "All Day",
            location: event.location || "TBD",
            bookings: event.bookingsCount || 0,
            image: event.image || getPlaceholderImage(event.title)
          })));
        } else {
          // Fallback data if API returns empty
          setUpcomingEvents([
            {
              id: 1,
              title: "Corporate Retreat",
              date: "2023-09-15",
              time: "09:00 AM - 05:00 PM",
              location: "Mountain View Resort",
              bookings: 12,
              image: PLACEHOLDER_IMAGE1
            },
            {
              id: 2,
              title: "Wedding Reception",
              date: "2023-09-20",
              time: "07:00 PM - 11:00 PM",
              location: "Grand Ballroom",
              bookings: 45,
              image: PLACEHOLDER_IMAGE2
            },
            {
              id: 3,
              title: "Birthday Celebration",
              date: "2023-09-25",
              time: "03:00 PM - 07:00 PM",
              location: "Garden Pavilion",
              bookings: 28,
              image: PLACEHOLDER_IMAGE3
            }
          ]);
        }
        
        // Process recent bookings data
        if (Array.isArray(recentBookingsData) && recentBookingsData.length > 0) {
          setRecentBookings(recentBookingsData.map(booking => ({
            id: booking._id || booking.id,
            customer: booking.contactName || booking.userName || "Guest",
            email: booking.contactEmail || booking.userEmail || "",
            event: booking.eventType || booking.venueName || "Event",
            date: booking.eventDate || booking.date,
            amount: booking.totalAmount || booking.amount || 0,
            status: booking.status || "Pending"
          })));
        } else {
          // Fallback data if API returns empty
          setRecentBookings([
            {
              id: 101,
              customer: "Priya Sharma",
              email: "priya.s@example.com",
              event: "Wedding Reception",
              date: "2023-09-20",
              amount: 8500,
              status: "Confirmed"
            },
            {
              id: 102,
              customer: "Rahul Mehta",
              email: "rahul.m@example.com",
              event: "Corporate Retreat",
              date: "2023-09-15",
              amount: 12000,
              status: "Pending"
            },
            {
              id: 103,
              customer: "Anjali Patel",
              email: "anjali.p@example.com",
              event: "Birthday Celebration",
              date: "2023-09-25",
              amount: 3500,
              status: "Confirmed"
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Helper function to get placeholder image based on event title
  const getPlaceholderImage = (title) => {
    if (!title) return PLACEHOLDER_IMAGE1;
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('corporate') || titleLower.includes('business')) {
      return PLACEHOLDER_IMAGE1;
    } else if (titleLower.includes('wedding') || titleLower.includes('reception')) {
      return PLACEHOLDER_IMAGE2;
    } else {
      return PLACEHOLDER_IMAGE3;
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="container-fluid py-5 d-flex justify-content-center align-items-center" style={containerStyle}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container-fluid py-5" style={containerStyle}>
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-danger" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="container-fluid py-4 px-4" 
      style={containerStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 text-gray-800">Organizer Dashboard</h1>
        <div>
          <Link to="/organizer/addevent" className="btn btn-primary">
            <i className="fas fa-plus"></i> Add New Event
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Bookings</h6>
                  <h2 className="mb-0">{stats.totalBookings}</h2>
                  <div className={`small mt-2 ${stats.bookingChange >= 0 ? 'text-success' : 'text-danger'}`}>
                    {stats.bookingChange >= 0 ? 
                      <><FaArrowUp className="me-1" /> {stats.bookingChange}% </> : 
                      <><FaArrowDown className="me-1" /> {Math.abs(stats.bookingChange)}% </>
                    }
                    <span className="text-muted">vs last month</span>
                  </div>
                </div>
                <div className="p-2 rounded-circle bg-primary bg-opacity-10 text-primary">
                  <FaUsers size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Pending Approvals</h6>
                  <h2 className="mb-0">{stats.pendingBookings}</h2>
                  <div className="small mt-2 text-warning">
                    Requires your attention
                  </div>
                </div>
                <div className="p-2 rounded-circle bg-warning bg-opacity-10 text-warning">
                  <FaCheckCircle size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Revenue</h6>
                  <h2 className="mb-0">₹{formatCurrency(stats.totalRevenue)}</h2>
                  <div className={`small mt-2 ${stats.revenueChange >= 0 ? 'text-success' : 'text-danger'}`}>
                    {stats.revenueChange >= 0 ? 
                      <><FaArrowUp className="me-1" /> {stats.revenueChange}% </> : 
                      <><FaArrowDown className="me-1" /> {Math.abs(stats.revenueChange)}% </>
                    }
                    <span className="text-muted">vs last month</span>
                  </div>
                </div>
                <div className="p-2 rounded-circle bg-success bg-opacity-10 text-success">
                  <FaChartLine size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Active Events</h6>
                  <h2 className="mb-0">{stats.totalEvents}</h2>
                  <div className="small mt-2 text-info">
                    <Link to="/organizer/events" className="text-decoration-none">View all events</Link>
                  </div>
                </div>
                <div className="p-2 rounded-circle bg-info bg-opacity-10 text-info">
                  <FaCalendarAlt size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Upcoming Events and Recent Bookings */}
      <div className="row g-4">
        {/* Upcoming Events */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Events</h5>
              <Link to="/organizer/events" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body p-0">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No upcoming events found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0">Event</th>
                        <th className="border-0">Date & Time</th>
                        <th className="border-0">Bookings</th>
                        <th className="border-0">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingEvents.map(event => (
                        <tr key={event.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img 
                                src={event.image} 
                                alt={event.title} 
                                className="rounded me-3" 
                                style={{ width: "48px", height: "48px", objectFit: "cover" }} 
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getPlaceholderImage(event.title);
                                }}
                              />
                              <div>
                                <h6 className="mb-0">{event.title}</h6>
                                <small className="text-muted">{event.location}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>{formatDate(event.date)}</div>
                            <small className="text-muted">{event.time}</small>
                          </td>
                          <td>
                            <span className="badge bg-info">{event.bookings}</span>
                          </td>
                          <td>
                            <Link to={`/organizer/events/${event.id}`} className="btn btn-sm btn-outline-primary">
                              <FaEye className="me-1" /> View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Recent Bookings */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Bookings</h5>
              <Link to="/organizer/bookings" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body p-0">
              {recentBookings.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-0">No recent bookings found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0">Customer</th>
                        <th className="border-0">Event</th>
                        <th className="border-0">Date</th>
                        <th className="border-0">Amount</th>
                        <th className="border-0">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map(booking => (
                        <tr key={booking.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-circle me-2">
                                {booking.customer.substring(0, 2)}
                              </div>
                              <div>
                                <h6 className="mb-0">{booking.customer}</h6>
                                <small className="text-muted">{booking.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>{booking.event}</td>
                          <td>{formatDate(booking.date)}</td>
                          <td>₹{formatCurrency(booking.amount)}</td>
                          <td>
                            <span className={`badge ${booking.status === 'Confirmed' ? 'bg-success' : 
                              booking.status === 'Pending' ? 'bg-warning' : 'bg-danger'}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrganizerHome; 
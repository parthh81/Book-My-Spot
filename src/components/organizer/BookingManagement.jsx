import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  FaSearch, 
  FaFilter, 
  FaChevronDown, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaQuestionCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaSortUp,
  FaSortDown,
  FaSort,
  FaCalendarAlt,
  FaCreditCard,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaDownload,
  FaPrint,
  FaTimes,
  FaTicketAlt,
  FaExclamationTriangle,
  FaMoneyBill,
  FaCheck,
  FaUserCircle,
  FaMapMarkerAlt,
  FaChevronUp,
  FaUserAlt,
  FaMoneyBillWave,
  FaPhone,
  FaTag,
  FaInfo,
  FaSpinner
} from "react-icons/fa";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faFilter, faEye, faEdit, faTrash, 
  faUser, faEnvelope, faPhone, faCalendar, faMoneyBill,
  faTicketAlt, faCheck, faClock, faTimes, faSort,
  faSortUp, faSortDown, faChevronLeft, faChevronRight,
  faUsers, faCheckCircle, faHourglassHalf, faBan
} from '@fortawesome/free-solid-svg-icons';
import { formatDate, formatCurrency } from '../../utils/formatters';
import '../../styles/bookings.css';
import '../../styles/organizer-common.css';
import { Dropdown } from 'react-bootstrap';
import EventService from '../../services/EventService';
import BookingService from '../../services/BookingService';
import AuthService from '../../services/AuthService';

const BookingManagement = () => {
  const { bookingId } = useParams(); // Get bookingId from URL params
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEvent, setFilterEvent] = useState("all");
  const [events, setEvents] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [totalStats, setTotalStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  
  // Add state for single booking view
  const [viewingSingleBooking, setViewingSingleBooking] = useState(false);
  const [singleBookingDetails, setSingleBookingDetails] = useState(null);
  const [singleBookingLoading, setSingleBookingLoading] = useState(false);
  
  // Inline style to fix padding issue
  const containerStyle = {
    paddingTop: '90px', // Add extra padding to prevent content from being hidden under navbar
  };

  // Configure axios to use the backend URL
  const API_BASE_URL = "http://localhost:3201";
  axios.defaults.baseURL = API_BASE_URL;

  useEffect(() => {
    // If bookingId is provided in URL, fetch that specific booking
    if (bookingId) {
      setViewingSingleBooking(true);
      fetchSingleBooking(bookingId);
    } else {
      setViewingSingleBooking(false);
      fetchBookingsAndEvents();
    }
  }, [bookingId, currentPage, itemsPerPage, sortField, sortDirection, filterStatus, filterEvent, searchTerm]);

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        // Use BookingService instead of EventService to get pending bookings
        const data = await BookingService.getPendingBookings();
        console.log('Pending approvals fetched:', data);
        
        // Check if data exists and has the right format
        if (Array.isArray(data)) {
          setPendingApprovals(data);
          console.log(`Found ${data.length} pending approvals to display`);
          
          // Debug the first approval if available
          if (data.length > 0) {
            console.log('First pending approval:', {
              id: data[0]._id,
              contactName: data[0].contactName,
              eventType: data[0].eventType,
              totalAmount: data[0].totalAmount
            });
          }
        } else {
          console.error('Unexpected data format for pending approvals:', data);
          setPendingApprovals([]);
        }
      } catch (error) {
        console.error('Error fetching pending approval requests:', error);
        setPendingApprovals([]);
      }
    };
    
    fetchPendingApprovals();
  }, []);

  // Add a refresh function to manually refresh pending approvals
  const refreshPendingApprovals = async () => {
    try {
      const data = await BookingService.getPendingBookings();
      setPendingApprovals(data || []);
      console.log(`Refreshed: Found ${data ? data.length : 0} pending approvals`);
      
      // Also refresh booking stats
      const stats = await BookingService.getBookingStats();
      setTotalStats(stats || {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0
      });
      
      return { pendingApprovals: data, stats };
    } catch (error) {
      console.error('Error refreshing pending approvals:', error);
      throw error;
    }
  };

  const fetchBookingsAndEvents = async () => {
    setLoading(true);
    try {
      // Fetch real events from API
      const eventsList = await EventService.getAllEvents();
      setEvents(eventsList || []);

      // Fetch booking stats
      const stats = await BookingService.getBookingStats();
      setTotalStats(stats || {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0
      });

      // Fetch all bookings
      const allBookings = await BookingService.getAllBookings();
      
      // If we have bookings, process and filter them
      let filteredBookings = [...allBookings];
      
      // Apply status filter
      if (filterStatus !== 'all') {
        filteredBookings = filteredBookings.filter(booking => booking.status === filterStatus);
      }
      
      // Apply event type filter
      if (filterEvent !== 'all') {
        filteredBookings = filteredBookings.filter(booking => 
          booking && booking.eventTypeId && booking.eventTypeId === parseInt(filterEvent)
        );
      }
      
      // Apply search term filter (search in name, venue, email, booking ID)
      if (searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        filteredBookings = filteredBookings.filter(booking =>
          (booking.id && booking.id.toLowerCase().includes(searchLower)) ||
          (booking.venueName && booking.venueName.toLowerCase().includes(searchLower)) ||
          (booking.customer?.name && booking.customer.name.toLowerCase().includes(searchLower)) ||
          (booking.customer?.email && booking.customer.email.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply sorting
      filteredBookings.sort((a, b) => {
        let comparison = 0;
        
        if (sortField === 'date') {
          // Handle cases where dates might be missing
          if (!a.date) return sortDirection === 'asc' ? -1 : 1;
          if (!b.date) return sortDirection === 'asc' ? 1 : -1;
          comparison = new Date(a.date) - new Date(b.date);
        } else if (sortField === 'price') {
          // Handle cases where prices might be missing
          const aPrice = a.price || 0;
          const bPrice = b.price || 0;
          comparison = aPrice - bPrice;
        } else if (sortField === 'name') {
          // Handle cases where customer names might be missing
          const aName = a.customer?.name || '';
          const bName = b.customer?.name || '';
          comparison = aName.localeCompare(bName);
        } else if (sortField === 'venue') {
          // Handle cases where venue names might be missing
          const aVenue = a.venueName || '';
          const bVenue = b.venueName || '';
          comparison = aVenue.localeCompare(bVenue);
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
      
      // Calculate pagination
      const totalItems = filteredBookings.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);
      
      // Update state
      setBookings(paginatedBookings);
      setTotalItems(totalItems);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (bookingId) => {
    if (selectedBooking === bookingId) {
      setSelectedBooking(null);
    } else {
      setSelectedBooking(bookingId);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setLoading(true);
      
      // Call the real API through BookingService
      await BookingService.updateBookingStatus(bookingId, newStatus);
      
      // Update local state
      setBookings(bookings.map(booking => 
        (booking.id === bookingId || booking._id === bookingId) ? { ...booking, status: newStatus } : booking
      ));
      
      // Refresh booking stats to get updated counts
      const updatedStats = await BookingService.getBookingStats();
      setTotalStats(updatedStats);
      
      setAlertMessage({
        type: 'success',
        message: `Booking ${bookingId} status updated to ${newStatus}`
      });
    } catch (error) {
      console.error(`Error updating booking status:`, error);
      setAlertMessage({
        type: 'danger',
        message: 'Failed to update booking status'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactCustomer = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    // The API call is triggered by useEffect when searchTerm changes
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleEventFilterChange = (eventId) => {
    setFilterEvent(eventId);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleApprovalRequest = async (bookingId, approved, reason = '') => {
    try {
      // Use BookingService instead of EventService for approval
      await BookingService.approveBooking(bookingId, approved, reason);
      
      // Refresh both the pending approvals and booking stats
      await refreshPendingApprovals();
      
      // Also refresh the main bookings list
      await fetchBookingsAndEvents();
      
      // Show success message
      setAlertMessage({
        type: 'success',
        message: `Booking ${approved ? 'approved' : 'rejected'} successfully`
      });
      
    } catch (error) {
      console.error(`Error ${approved ? 'approving' : 'rejecting'} booking:`, error);
      setAlertMessage({
        type: 'danger',
        message: `Failed to ${approved ? 'approve' : 'reject'} booking. Please try again.`
      });
    }
  };

  // New function to fetch a single booking
  const fetchSingleBooking = async (id) => {
    setSingleBookingLoading(true);
    try {
      // First check pending approvals
      const pendingData = await BookingService.getPendingBookings();
      const pendingBooking = pendingData?.find(booking => booking._id === id);
      
      if (pendingBooking) {
        setSingleBookingDetails(pendingBooking);
        setPendingApprovals([pendingBooking]); // Set this as the only pending approval
        setBookings([]); // Clear regular bookings list
      } else {
        // If not in pending, try regular bookings
        const allBookings = await BookingService.getAllBookings();
        const booking = allBookings?.find(b => b.id === id || b._id === id);
        
        if (booking) {
          setSingleBookingDetails(booking);
          setBookings([booking]); // Set this as the only booking
          setPendingApprovals([]); // Clear pending approvals
        } else {
          // Booking not found
          console.error(`Booking with ID ${id} not found`);
          setAlertMessage({
            type: 'danger',
            message: `Booking with ID ${id} not found. Redirecting to bookings list.`
          });
          
          // Redirect back to main bookings page after a delay
          setTimeout(() => {
            navigate('/organizer/bookings');
          }, 3000);
        }
      }
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error);
      setAlertMessage({
        type: 'danger',
        message: `Error loading booking: ${error.message}`
      });
    } finally {
      setSingleBookingLoading(false);
    }
  };

  // Add back button for single booking view
  const handleBackToList = () => {
    navigate('/organizer/bookings');
  };

  // Safe date formatter to handle undefined dates
  const formatDateSafe = (date) => {
    if (!date) return 'N/A';
    return formatDate(date);
  };

  return (
    <motion.div 
      className="organizer-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Add back button when viewing single booking */}
      {viewingSingleBooking && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button 
            className="btn btn-outline-secondary" 
            onClick={handleBackToList}
          >
            <FaChevronLeft className="me-2" /> Back to Bookings
          </button>
          <h1 className="page-title mb-0">Booking Details</h1>
          <div style={{ width: '100px' }}></div> {/* Empty div for balanced centering */}
        </div>
      )}
      
      {!viewingSingleBooking && <h1 className="page-title">Booking Management</h1>}
      
      {/* Stats Cards */}
      <div className="row stats-cards">
        <div className="col-md-3 mb-3">
          <div className="card stats-card primary-card">
            <div className="card-body">
              <h5 className="card-title">Total Bookings</h5>
              <p className="stats-value">{totalStats.totalBookings}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card stats-card success-card">
            <div className="card-body">
              <h5 className="card-title">Confirmed</h5>
              <p className="stats-value">{totalStats.confirmedBookings}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card stats-card warning-card">
            <div className="card-body">
              <h5 className="card-title">Pending</h5>
              <p className="stats-value">{totalStats.pendingBookings}</p>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card stats-card info-card">
            <div className="card-body">
              <h5 className="card-title">Total Revenue</h5>
              <p className="stats-value">{formatCurrency(totalStats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="row search-filter-container">
        <div className="col-md-4 mb-3">
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                <FaSearch />
              </button>
            </div>
          </form>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="dropdown">
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" className="w-100">
                <FaFilter className="me-2" />
                {filterStatus === 'all' ? 'All Statuses' : 
                 filterStatus === 'confirmed' ? 'Confirmed' :
                 filterStatus === 'pending' ? 'Pending' : 'Cancelled'}
              </Dropdown.Toggle>
              
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleFilterChange('all')}>All Statuses</Dropdown.Item>
                <Dropdown.Item onClick={() => handleFilterChange('confirmed')}>Confirmed</Dropdown.Item>
                <Dropdown.Item onClick={() => handleFilterChange('pending')}>Pending</Dropdown.Item>
                <Dropdown.Item onClick={() => handleFilterChange('cancelled')}>Cancelled</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        
        <div className="col-md-4 mb-3">
          <div className="dropdown">
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" className="w-100">
                <FaCalendarAlt className="me-2" />
                {filterEvent === 'all' ? 'All Event Types' : 
                 events.find(e => e.id === parseInt(filterEvent))?.title || 'Select Event Type'}
              </Dropdown.Toggle>
              
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleEventFilterChange('all')}>All Event Types</Dropdown.Item>
                {events.map(event => (
                  <Dropdown.Item 
                    key={event.id} 
                    onClick={() => handleEventFilterChange(event.id)}
                  >
                    {event.title}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>
      
      {/* Pending Approval Requests Section */}
      {pendingApprovals.length > 0 && (
        <div className="mb-5">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Pending Approval Requests</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table organizer-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Event Type</th>
                      <th>Contact</th>
                      <th>Guest Count</th>
                      <th>Total Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApprovals.map(booking => (
                      <tr key={booking._id || `booking-${Math.random()}`}>
                        <td>{booking.contactName || 'Unknown Customer'}</td>
                        <td>{booking.eventType || 'Unknown Event'}</td>
                        <td>
                          <div>{booking.contactEmail || 'No email'}</div>
                          <div>{booking.contactPhone || 'No phone'}</div>
                        </td>
                        <td>{booking.guestCount || '0'}</td>
                        <td>₹{(booking.totalAmount || 0).toLocaleString('en-IN')}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => handleApprovalRequest(booking._id, true)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => {
                              const reason = prompt('Please provide a reason for rejection:');
                              if (reason !== null) {
                                handleApprovalRequest(booking._id, false, reason);
                              }
                            }}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bookings Table */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <p className="mb-0">No bookings found. Try changing your filters.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table organizer-table">
            <thead>
              <tr>
                <th scope="col">Booking ID</th>
                <th 
                  scope="col" 
                  className="sortable"
                  onClick={() => handleSort('name')}
                >
                  Customer Name
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? <FaChevronUp className="ms-1" /> : <FaChevronDown className="ms-1" />
                  )}
                </th>
                <th 
                  scope="col" 
                  className="sortable"
                  onClick={() => handleSort('venue')}
                >
                  Venue
                  {sortField === 'venue' && (
                    sortDirection === 'asc' ? <FaChevronUp className="ms-1" /> : <FaChevronDown className="ms-1" />
                  )}
                </th>
                <th 
                  scope="col" 
                  className="sortable"
                  onClick={() => handleSort('date')}
                >
                  Event Date
                  {sortField === 'date' && (
                    sortDirection === 'asc' ? <FaChevronUp className="ms-1" /> : <FaChevronDown className="ms-1" />
                  )}
                </th>
                <th 
                  scope="col" 
                  className="sortable text-end"
                  onClick={() => handleSort('price')}
                >
                  Amount
                  {sortField === 'price' && (
                    sortDirection === 'asc' ? <FaChevronUp className="ms-1" /> : <FaChevronDown className="ms-1" />
                  )}
                </th>
                <th scope="col" className="text-center">Status</th>
                <th scope="col" className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => {
                // Get the booking ID, supporting both MongoDB style _id and regular id
                const bookingId = booking.id || booking._id;
                return (
                <React.Fragment key={bookingId}>
                  <tr className={selectedBooking === bookingId ? 'expanded-row' : ''}>
                    <td>{bookingId}</td>
                    <td>{booking.customer?.name || 'Unknown'}</td>
                    <td>{booking.venueName || 'N/A'}</td>
                    <td>{formatDateSafe(booking.date)}</td>
                    <td className="text-end">{formatCurrency(booking.price || 0)}</td>
                    <td className="text-center">
                      <span className={`badge badge-${booking.status || 'pending'}`}>
                        {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleViewDetails(bookingId)}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            Status
                          </Dropdown.Toggle>
                          
                          <Dropdown.Menu>
                            <Dropdown.Item 
                              onClick={() => handleStatusChange(bookingId, 'confirmed')}
                              disabled={booking.status === 'confirmed'}
                            >
                              <FaCheck className="text-success me-2" /> Confirm
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => handleStatusChange(bookingId, 'pending')}
                              disabled={booking.status === 'pending'}
                            >
                              <FaCalendarAlt className="text-warning me-2" /> Mark as Pending
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => handleStatusChange(bookingId, 'cancelled')}
                              disabled={booking.status === 'cancelled'}
                            >
                              <FaTimes className="text-danger me-2" /> Cancel
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                  
                  {selectedBooking === bookingId && (
                    <tr className="details-row">
                      <td colSpan="7">
                        <div className="booking-details">
                          <div className="row">
                            <div className="col-md-6">
                              <h5 className="details-heading">Customer Information</h5>
                              <div className="customer-info">
                                <p>
                                  <FaUserCircle className="me-2" /> 
                                  <strong>Name:</strong> {booking.customer?.name || 'Unknown'}
                                </p>
                                <p>
                                  <FaEnvelope className="me-2" /> 
                                  <strong>Email:</strong> {booking.customer?.email || 'N/A'}
                                  <button 
                                    className="btn btn-sm btn-link ms-2"
                                    onClick={() => handleContactCustomer(booking.customer?.email)}
                                    disabled={!booking.customer?.email}
                                  >
                                    Contact
                                  </button>
                                </p>
                                <p>
                                  <FaPhoneAlt className="me-2" /> 
                                  <strong>Phone:</strong> {booking.customer?.phone || 'N/A'}
                                </p>
                                <p>
                                  <FaMapMarkerAlt className="me-2" /> 
                                  <strong>Location:</strong> {booking.customer?.address || 'N/A'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="col-md-6">
                              <h5 className="details-heading">Booking Details</h5>
                              <div className="booking-info">
                                <p><strong>Event Type:</strong> {booking.eventType || 'N/A'}</p>
                                <p><strong>Venue:</strong> {booking.venueName || 'N/A'}</p>
                                <p><strong>Guest Count:</strong> {booking.bookingDetails?.guestCount || 'N/A'}</p>
                                <p><strong>Booking Date:</strong> {formatDateSafe(booking.bookingDetails?.bookingDate)}</p>
                                <p><strong>Event Date:</strong> {formatDateSafe(booking.date)}</p>
                                <p><strong>Amount:</strong> {formatCurrency(booking.price || 0)}</p>
                                <p><strong>Status:</strong> <span className={`badge badge-${booking.status || 'pending'}`}>
                                  {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending'}
                                </span></p>
                                {booking.bookingDetails?.notes && (
                                  <div className="notes-section">
                                    <p><strong>Notes:</strong></p>
                                    <p className="notes-text">{booking.bookingDetails.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-4">
        <div>
          Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} bookings
        </div>
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                    {pageNum}
                  </button>
                </li>
              );
            })}
            
            {totalPages > 5 && (
              <>
                {currentPage <= 3 && (
                  <>
                    <li className="page-item disabled"><span className="page-link">...</span></li>
                    <li className="page-item">
                      <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                      </button>
                    </li>
                  </>
                )}
                
                {currentPage > 3 && currentPage < totalPages - 2 && (
                  <>
                    <li className="page-item disabled"><span className="page-link">...</span></li>
                    <li className="page-item">
                      <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                      </button>
                    </li>
                  </>
                )}
                
                {currentPage >= totalPages - 2 && currentPage < totalPages && (
                  <>
                    <li className="page-item disabled"><span className="page-link">...</span></li>
                    <li className="page-item">
                      <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                      </button>
                    </li>
                  </>
                )}
              </>
            )}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Alert Messages */}
      {alertMessage && (
        <div className={`alert alert-${alertMessage.type} fade-in mb-4`}>
          {alertMessage.message}
          <button 
            type="button" 
            className="btn-close float-end" 
            onClick={() => setAlertMessage(null)}
          ></button>
        </div>
      )}
    </motion.div>
  );
};

export default BookingManagement; 
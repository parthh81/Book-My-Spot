import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaClock, FaTag, 
  FaCity, FaMapMarked, FaWifi, FaParking, FaUtensils, FaAccessibleIcon, 
  FaCheck, FaCreditCard, FaTicketAlt, FaUserAlt, FaRupeeSign, FaExclamationTriangle, 
  FaCheckCircle, FaHeart, FaInfo, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import EventService from '../../services/EventService';
import AuthService from '../../services/AuthService';
import './EventVenueDetails.css';
import { format } from 'date-fns';

// Simple loading spinner component
const LoadingSpinner = ({ message }) => (
  <div className="container mt-5 text-center">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="mt-3">{message || 'Loading...'}</p>
  </div>
);

const EventVenueDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get event data from location state or fetch it
  const [event, setEvent] = useState(location.state?.eventData || null);
  const [loading, setLoading] = useState(!location.state?.eventData);
  const [error, setError] = useState(null);
  const [venue, setVenue] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Get today's date as a string in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  // Set default date as the event start date if available
  const defaultDate = event?.startDate ? new Date(event.startDate).toISOString().split('T')[0] : today;
  // Get logged in user data
  const userData = AuthService.getUserInfo();
  
  // Booking form state
  const [bookingDetails, setBookingDetails] = useState({
    numberOfGuests: 1,
    startDate: defaultDate,
    endDate: defaultDate,
    numberOfDays: 1,
    name: userData?.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    additionalRequests: ''
  });
  
  // Fetch event data if not provided via location state
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (location.state?.eventData) return;
      
      setLoading(true);
      try {
        const eventData = await EventService.getEventById(eventId);
        
        if (eventData) {
          const formattedEvent = {
            id: eventData._id || eventData.id || eventId,
            title: eventData.name || eventData.title || 'Unnamed Event',
            description: eventData.description || 'No description available',
            image: eventData.image || 'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
            date: eventData.date ? new Date(eventData.date) : new Date(),
            location: eventData.location || 'Location not specified',
            category: eventData.category || eventData.eventType || 'Event',
            organizer: eventData.organizer || 'Event Organizer',
            duration: eventData.duration || '3 hours',
            price: eventData.price || 'Free',
            capacity: eventData.capacity || '100+ guests',
            attendees: eventData.attendees || [],
            venue: eventData.venue || {},
            cityId: eventData.cityId || {},
            areaId: eventData.areaId || {},
            venueName: eventData.venueName || (eventData.venue && eventData.venue.name ? eventData.venue.name : null),
            venueAddress: eventData.venueAddress || (eventData.venue && eventData.venue.address ? eventData.venue.address : null),
            venueCity: eventData.venueCity || (eventData.cityId && eventData.cityId.name ? eventData.cityId.name : null),
            venueArea: eventData.venueArea || (eventData.areaId && eventData.areaId.name ? eventData.areaId.name : null),
            status: eventData.status || 'active'
          };
          
          setEvent(formattedEvent);
          
          // Set default date to event date
          setBookingDetails(prev => ({
            ...prev,
            date: formattedEvent.date.toISOString().split('T')[0]
          }));
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error(`Error fetching event details for ID ${eventId}:`, err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, location.state]);
  
  // Set default date when event loads
  useEffect(() => {
    if (event?.date instanceof Date) {
      setBookingDetails(prev => ({
        ...prev,
        startDate: event.date.toISOString().split('T')[0],
        endDate: event.date.toISOString().split('T')[0]
      }));
    }
  }, [event]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`Input changed: ${name} = ${value}`);
    
    let updatedBookingDetails = { ...bookingDetails, [name]: value };
    
    // Auto-calculate days when start or end date changes
    if (name === 'startDate' || name === 'endDate') {
      const start = new Date(updatedBookingDetails.startDate);
      const end = new Date(updatedBookingDetails.endDate);
      
      console.log(`Date calculation: start=${start}, end=${end}`);
      
      // Calculate the difference in days
      if (start && end && start <= end) {
        const timeDiff = end.getTime() - start.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include the start day
        updatedBookingDetails.numberOfDays = daysDiff;
        console.log(`Days calculated: ${daysDiff}`);
      } else if (start > end) {
        // If start date is after end date, set end date equal to start date
        updatedBookingDetails.endDate = updatedBookingDetails.startDate;
        updatedBookingDetails.numberOfDays = 1;
        console.log('End date reset to match start date');
      }
    }
    
    setBookingDetails(updatedBookingDetails);
  };
  
  // Special handler for end date
  const handleEndDateChange = (e) => {
    console.log("End date change triggered");
    console.log("Event target:", e.target);
    console.log("Current value:", e.target.value);
    console.log("Current booking details:", bookingDetails);
    
    const newEndDate = e.target.value;
    console.log(`Setting end date directly to: ${newEndDate}`);
    
    const start = new Date(bookingDetails.startDate);
    const end = new Date(newEndDate);
    
    if (start && end && start <= end) {
      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      
      setBookingDetails({
        ...bookingDetails,
        endDate: newEndDate,
        numberOfDays: daysDiff
      });
      
      console.log(`Updated end date to ${newEndDate} with ${daysDiff} days`);
    } else {
      // If invalid dates, default to start date
      setBookingDetails({
        ...bookingDetails,
        endDate: bookingDetails.startDate,
        numberOfDays: 1
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!AuthService.isAuthenticated()) {
      // Redirect to login page with return URL
      navigate('/auth/login', { 
        state: { 
          returnUrl: `/events/${eventId}/booking`,
          message: 'Please log in to continue with your booking'
        } 
      });
      return;
    }
    
    try {
      setSubmitLoading(true);
      const priceDetails = calculateTotalPrice();
      
      // Get event ID from the URL parameter if it's not in the event object
      const effectiveEventId = event._id || event.id || eventId;
      
      if (!effectiveEventId) {
        throw new Error("Event ID is missing, cannot proceed with booking");
      }
      
      console.log("Event data available:", {
        urlEventId: eventId,
        eventObjectId: event._id,
        eventObjectIdAlt: event.id,
        effectiveEventId: effectiveEventId
      });
      
      // Prepare booking data
      const bookingData = {
        userId: userData?.id,
        eventId: effectiveEventId,
        venueId: venue?._id || event.venueId,
        venue: venue,
        eventTitle: event.title,
        venueTitle: venue?.name || event.venueName || event.title,
        image: event.image || venue?.images?.[0],
        startDate: bookingDetails.startDate,
        endDate: bookingDetails.endDate,
        numberOfDays: bookingDetails.numberOfDays,
        numberOfGuests: bookingDetails.numberOfGuests,
        location: event.location || venue?.location,
        name: bookingDetails.name,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        additionalRequests: bookingDetails.additionalRequests,
        ...priceDetails
      };
      
      console.log('Booking data prepared:', bookingData);
      
      // Redirect to payment page with booking data
      navigate('/payment', {
        state: {
          bookingDetails: {
            ...bookingDetails,
            isEvent: true  // Flag to indicate this is an event booking
          },
          eventTitle: event.title,
          venueTitle: venue?.name || event.venueName || event.title,
          totalAmount: priceDetails.totalAmount,
          bookingData: bookingData  // Pass the full booking data for processing after payment
        }
      });
      
    } catch (err) {
      console.error('Error preparing booking:', err);
      setError(`Failed to prepare booking: ${err.message || 'Please try again later'}`);
      setSubmitLoading(false);
    }
  };
  
  const calculateTotalPrice = () => {
    if (!event) return { basePrice: 0, serviceFee: 0, gstAmount: 0, totalAmount: 0 };
    
    // Parse the price from string format (e.g., "₹25000 onwards")
    let basePrice = 0;
    if (typeof event.price === 'number') {
      basePrice = event.price;
    } else if (typeof event.price === 'string') {
      // Extract numeric value from string like "₹25000 onwards"
      const priceMatch = event.price.match(/₹?(\d+)/);
      if (priceMatch && priceMatch[1]) {
        basePrice = parseInt(priceMatch[1], 10);
      }
    }
    
    // If venue has price and event doesn't, use venue price
    if (basePrice === 0 && venue && venue.price) {
      if (typeof venue.price === 'number') {
        basePrice = venue.price;
      } else if (typeof venue.price === 'string') {
        const priceMatch = venue.price.match(/₹?(\d+)/);
        if (priceMatch && priceMatch[1]) {
          basePrice = parseInt(priceMatch[1], 10);
        }
      }
    }
    
    // If we still have no price, set a default
    if (basePrice === 0) {
      basePrice = 25000; // Default price if nothing else works
    }
    
    // Always apply per-day pricing when the user selects multiple days
    const days = bookingDetails.numberOfDays || 1;
    let subtotal = basePrice * days;
    
    // If price is also per person, multiply by number of guests
    const isPerPerson = event.priceType === 'per_person' || (venue && venue.priceType === 'per_person');
    const guests = parseInt(bookingDetails.numberOfGuests) || 1;
    if (isPerPerson) {
      subtotal = subtotal * guests;
    }
    
    console.log(`Price calculation: Base price: ${basePrice}, Days: ${days}, Guests: ${guests}, Subtotal: ${subtotal}`);
    
    // Calculate service fee (fixed amount or percentage)
    const serviceFee = event.serviceFee || venue?.serviceFee || (subtotal * 0.05); // Default 5% service fee
    
    // Calculate GST (18% by default)
    const gstPercent = event.gstPercent || venue?.gstPercent || 18;
    const gstAmount = (subtotal + serviceFee) * (gstPercent / 100);
    
    // Total amount
    const total = subtotal + serviceFee + gstAmount;
    
    return {
      basePrice: subtotal,
      serviceFee,
      gstAmount,
      totalAmount: total
    };
  };
  
  const formatDate = (date) => {
    if (!(date instanceof Date)) return 'Date not available';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (date) => {
    if (!(date instanceof Date)) return 'Time not available';
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Gets appropriate icon for common amenities
  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <FaWifi className="text-primary me-2" />;
    if (amenityLower.includes('parking')) return <FaParking className="text-primary me-2" />;
    if (amenityLower.includes('food') || amenityLower.includes('catering')) return <FaUtensils className="text-primary me-2" />;
    if (amenityLower.includes('accessible') || amenityLower.includes('handicap')) return <FaAccessibleIcon className="text-primary me-2" />;
    return <FaCheck className="text-success me-2" />;
  };
  
  // Loading state
  if (loading) {
    return <LoadingSpinner message="Loading event details..." />;
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <FaExclamationTriangle className="me-2" />
          {error}
        </div>
      </div>
    );
  }
  
  // Not found state
  if (!event) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          <FaExclamationTriangle className="me-2" />
          Event not found
        </div>
      </div>
    );
  }
  
  // Show success message when booking is successful
  if (bookingSuccess) {
    return (
      <div className="container mt-5">
        <div className="alert alert-success">
          <FaCheckCircle className="me-2" />
          Booking submitted successfully! You will be redirected to your bookings page.
        </div>
      </div>
    );
  }
  
  // Calculate price details
  const priceDetails = calculateTotalPrice();
  
  return (
    <div className="booking-page">
      {/* Back Navigation */}
      <div className="back-nav">
        <button onClick={handleBack} className="back-btn">
          <FaArrowLeft /> Back
        </button>
        <div className="breadcrumbs">
          <Link to="/">Home</Link> / 
          <Link to="/events/browse">Events</Link> / 
          <span>{event.title || "Booking"}</span>
        </div>
      </div>
      
      {/* Main Page Heading */}
      <div className="booking-header">
        <div className="event-category">
          <span className="category-badge">{event.category || "Wedding"}</span>
        </div>
        <h1 className="event-title">{event.title}</h1>
        <p className="event-location">
          <FaMapMarkerAlt className="icon" /> {event.location || "Mumbai"}
        </p>
      </div>
      
      <div className="booking-container">
        {/* Event Details Section */}
        <div className="booking-content">
          {/* Event Information Section */}
          <div className="booking-info-section">
            <div className="event-details-card">
              <div className="card-header">
                <h2>Event Details</h2>
              </div>
              <div className="card-body">
                <div className="event-image">
                  <img src={event.image} alt={event.title} />
                </div>
                
                <div className="event-description">
                  <h3>About This Event</h3>
                  <p>{event.description || "Join us for this amazing event!"}</p>
                </div>
              </div>
            </div>
            
            {/* Venue Details */}
            <div className="venue-details-card">
              <div className="card-header">
                <h2>Venue Information</h2>
              </div>
              <div className="card-body">
                <h3 className="venue-name">{venue?.name || event.venueName || event.location}</h3>
                
                {/* Add venue images carousel if available */}
                {((venue && venue.images && venue.images.length > 0) || 
                  (event.venueImages && event.venueImages.length > 0)) && (
                  <div className="venue-images">
                    <div className="venue-image">
                      <img 
                        src={
                          venue && venue.images && venue.images.length > 0 
                            ? venue.images[0] 
                            : event.venueImages && event.venueImages.length > 0 
                              ? event.venueImages[0]
                              : event.image
                        } 
                        alt={`${venue?.name || event.venueName || 'Venue'}`} 
                      />
                    </div>
                  </div>
                )}
                
                <div className="venue-address">
                  <p><FaMapMarkerAlt className="icon" /> {venue?.address || event.location}</p>
                  {(venue?.city || event.city) && (
                    <p><FaCity className="icon" /> {venue?.city || event.city}</p>
                  )}
                </div>
                
                {venue?.amenities && venue.amenities.length > 0 && (
                  <div className="venue-amenities">
                    <h4>Amenities</h4>
                    <ul className="amenities-list">
                      {venue.amenities.map((amenity, index) => (
                        <li key={index}>{getAmenityIcon(amenity)} {amenity}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Booking Form Section */}
          <div className="booking-form-section">
            <div className="booking-form-card">
              <div className="card-header">
                <h2>Book This Event</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-section">
                    <h3>Contact Information</h3>
                    
                    <div className="form-group">
                      <label htmlFor="name">
                        <FaUserAlt className="icon" /> Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={bookingDetails.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">
                        <FaEnvelope className="icon" /> Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={bookingDetails.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phone">
                        <FaPhoneAlt className="icon" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={bookingDetails.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h3>Event Details</h3>
                    
                    <div className="form-group">
                      <label htmlFor="numberOfGuests">
                        <FaUsers className="icon" /> Number of Guests
                      </label>
                      <input
                        type="number"
                        id="numberOfGuests"
                        name="numberOfGuests"
                        min="1"
                        max={event.capacity || venue?.maxCapacity || 500}
                        value={bookingDetails.numberOfGuests}
                        onChange={handleInputChange}
                        required
                      />
                      {/* Show the default price for debugging */}
                      <small className="price-debug">
                        Base price: {typeof event.price === 'string' ? event.price : `₹${event.price || 0}`}
                      </small>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="startDate">
                          <FaCalendarAlt className="icon" /> Start Date
                        </label>
                        <input
                          type="date" 
                          id="startDate"
                          name="startDate"
                          value={bookingDetails.startDate}
                          onChange={handleInputChange}
                          placeholder="Select start date"
                          className="date-input"
                          min={today}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="endDate">
                          <FaCalendarAlt className="icon" /> End Date
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={bookingDetails.endDate}
                          onChange={handleEndDateChange}
                          placeholder="Select end date"
                          className="date-input"
                          min={bookingDetails.startDate}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="additionalRequests">
                        <FaInfo className="icon" /> Special Requests or Notes
                      </label>
                      <textarea
                        id="additionalRequests"
                        name="additionalRequests"
                        rows="3"
                        value={bookingDetails.additionalRequests}
                        onChange={handleInputChange}
                        placeholder="Any special requirements or notes for your booking"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <h3>Price Summary</h3>
                    
                    <div className="price-breakdown">
                      <div className="price-item">
                        <span>Base Price:</span>
                        <span>₹{priceDetails.basePrice.toFixed(2)}</span>
                      </div>
                      
                      <div className="price-item">
                        <span>Service Fee:</span>
                        <span>₹{priceDetails.serviceFee.toFixed(2)}</span>
                      </div>
                      
                      <div className="price-item">
                        <span>GST (18%):</span>
                        <span>₹{priceDetails.gstAmount.toFixed(2)}</span>
                      </div>
                      
                      <div className="price-total">
                        <span>Total Amount:</span>
                        <span>₹{priceDetails.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="booking-actions">
                    <button
                      type="submit"
                      className="booking-submit-btn"
                      disabled={submitLoading}
                    >
                      {submitLoading ? (
                        <>
                          <span className="spinner"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCreditCard className="icon" />
                          Proceed to Payment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventVenueDetails; 
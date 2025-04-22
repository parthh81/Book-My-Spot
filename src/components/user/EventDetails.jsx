import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaClock, FaTag, FaHeart, FaShareAlt, FaRegCalendarCheck, FaCheck, FaToggleOn, FaCity, FaMapMarked, FaWifi, FaParking, FaUtensils, FaAccessibleIcon } from 'react-icons/fa';
import EventService from '../../services/EventService';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInterested, setIsInterested] = useState(false);
  
  // Fetch event data
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        // Fetch event details from the API
        const eventData = await EventService.getEventById(eventId);
        
        if (eventData) {
          console.log("Event data received:", eventData);
          
          // Format the data as needed
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
            // Ensure venue details are properly captured
            venue: eventData.venue || {},
            cityId: eventData.cityId || {},
            areaId: eventData.areaId || {},
            // Capture other venue-related fields that might be at the top level
            venueName: eventData.venueName || (eventData.venue && eventData.venue.name ? eventData.venue.name : null),
            venueAddress: eventData.venueAddress || (eventData.venue && eventData.venue.address ? eventData.venue.address : null),
            venueCity: eventData.venueCity || (eventData.cityId && eventData.cityId.name ? eventData.cityId.name : null),
            venueArea: eventData.venueArea || (eventData.areaId && eventData.areaId.name ? eventData.areaId.name : null),
            status: eventData.status || 'active'
          };
          
          console.log("Formatted event:", formattedEvent);
          setEvent(formattedEvent);
        } else {
          // Use fallback data if API returns nothing
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
  }, [eventId]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const toggleInterest = () => {
    setIsInterested(!isInterested);
    // TODO: Implement interest tracking with API
  };
  
  const handleRegister = () => {
    console.log("Registering for event:", event);
    
    // Navigate to the combined event and venue details page
    navigate(`/event/${eventId}/booking`, {
      state: {
        eventData: event,
        fromEventDetails: true
      }
    });
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
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
        <button onClick={() => navigate('/events/browse')}>Browse Events</button>
      </div>
    );
  }
  
  // Not found state
  if (!event) {
    return (
      <div className="no-events-container">
        <h3>Event not found</h3>
        <p>Sorry, the event you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/events/browse')}>Browse Events</button>
      </div>
    );
  }
  
  return (
    <div className="event-details-container">
      {/* Back Button */}
      <div className="back-nav">
        <button className="back-btn" onClick={handleBack}>
          <FaArrowLeft /> Back
        </button>
        <div className="breadcrumbs">
          <Link to="/">Home</Link> / <Link to="/events/browse">Events</Link> / <span>{event.title}</span>
        </div>
      </div>
      
      {/* Event Header */}
      <div className="event-detail-header">
        <div className="event-header-image-container">
          <img src={event.image} alt={event.title} className="event-header-image" />
          <div className="event-category-badge">{event.category}</div>
        </div>
        
        <div className="event-header-content">
          <h1 className="event-title">{event.title}</h1>
          
          <div className="event-meta">
            <div className="event-meta-item">
              <FaMapMarkerAlt />
              <span>{event.location}</span>
            </div>
            
            <div className="event-meta-item">
              <FaUsers />
              <span>{event.capacity}</span>
            </div>
            
            <div className="event-meta-item">
              <FaTag />
              <span>{typeof event.price === 'number' ? `₹${event.price}` : event.price}</span>
            </div>
          </div>
          
          <div className="event-actions">
            <button className="register-btn" onClick={handleRegister}>
              <FaRegCalendarCheck /> Register Now
            </button>
          </div>
        </div>
      </div>
      
      {/* Event Body */}
      <div className="event-detail-body">
        <div className="event-main-content">
          <div className="event-detail-card">
            <h2>About This Event</h2>
            <div className="event-description-full">
              {event.description}
            </div>
          </div>
          
          {/* Event Schedule Section */}
          <div className="event-detail-card">
            <h2>Event Schedule</h2>
            <div className="event-schedule">
              {event.date instanceof Date ? (
                <div className="schedule-details">
                  <div className="schedule-item">
                    <FaCalendarAlt className="me-2" />
                    <div>
                      <strong>Date:</strong> {formatDate(event.date)}
                    </div>
                  </div>
                  
                  <div className="schedule-item mt-3">
                    <FaClock className="me-2" />
                    <div>
                      <strong>Time:</strong> {formatTime(event.date)}
                    </div>
                  </div>
                  
                  {event.duration && (
                    <div className="schedule-item mt-3">
                      <FaClock className="me-2" />
                      <div>
                        <strong>Duration:</strong> {event.duration}
                      </div>
                    </div>
                  )}
                  
                  {event.status && (
                    <div className="schedule-item mt-3">
                      <FaToggleOn className="me-2" />
                      <div>
                        <strong>Status:</strong> 
                        <span className={`ms-2 badge ${event.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {event.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p>No schedule information available for this event.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="event-sidebar">
          <div className="event-detail-card">
            <h2>Organizer</h2>
            <div className="organizer-info">
              <FaUsers className="organizer-icon" />
              <div>
                <h3>{event.organizer}</h3>
                <p>Event Organizer</p>
              </div>
            </div>
          </div>
          
          <div className="event-detail-card">
            <h2>Venue Information</h2>
            <div className="venue-info">
              {/* Venue Name */}
              {(event.venueName || (event.venue && event.venue.name)) && (
                <div className="venue-name mb-3">
                  <h4>{event.venueName || event.venue.name}</h4>
                </div>
              )}
              
              {/* Complete Address Information */}
              <div className="venue-address mb-3">
                <div className="address-line mb-2">
                  <FaMapMarkerAlt className="me-2 text-danger" /> 
                  <span>
                    {event.venueAddress || (event.venue && event.venue.address) || event.location}
                  </span>
                </div>
                
                {/* Area and City Information */}
                {(event.venueArea || event.venueCity || (event.areaId && event.areaId.name) || (event.cityId && event.cityId.name)) && (
                  <div className="address-city-area">
                    <FaCity className="me-2 text-primary" />
                    <span>
                      {event.venueArea || (event.areaId && event.areaId.name) ? 
                        `${event.venueArea || event.areaId.name}, ` : ''}
                      {event.venueCity || (event.cityId && event.cityId.name) || ''}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Venue Amenities */}
              {((event.venue && event.venue.amenities && event.venue.amenities.length > 0) || 
                (event.venue && event.venue.inclusions && event.venue.inclusions.length > 0)) && (
                <div className="venue-amenities mb-3">
                  <h5 className="mb-2">Venue Amenities:</h5>
                  <ul className="list-unstyled">
                    {/* Use amenities if available, otherwise use inclusions */}
                    {(event.venue.amenities && event.venue.amenities.length > 0 ? 
                      event.venue.amenities : 
                      (event.venue.inclusions || [])).map((amenity, index) => (
                      <li key={index} className="mb-1">
                        {getAmenityIcon(amenity)} {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Map Placeholder */}
              <div className="venue-map mt-3">
                <div className="map-placeholder">
                  <FaMapMarked className="map-icon" />
                  <p>Location Map</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventService from '../services/EventService';
import AuthService from '../services/AuthService';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/common/Loader';
import BookingForm from '../components/user/BookingForm';
import '../styles/eventDetails.css';
import { toast } from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [organizer, setOrganizer] = useState(null);

  // Helper to format the organizer information
  const formatOrganizerInfo = (eventData) => {
    if (!eventData) return null;
    
    // If organizer is already a proper string (not an ID), use it
    if (eventData.organizer && typeof eventData.organizer === 'string' && 
        !EventService.isValidObjectId(eventData.organizer)) {
      return eventData.organizer;
    }
    
    // Try to extract organizer info from userId if available
    if (eventData.userId && typeof eventData.userId === 'object') {
      const firstName = eventData.userId.firstName || '';
      const lastName = eventData.userId.lastName || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }
    
    // Default fallback
    return 'Event Organizer';
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const data = await EventService.getEventById(id);
        setEvent(data);
        
        // Format and set organizer information
        setOrganizer(formatOrganizerInfo(data));
        
        // Check if user is interested in this event
        const interested = await EventService.checkInterest(id, 'event');
        setIsInterested(interested);
      } catch (err) {
        setError('Failed to load event details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleToggleInterest = async () => {
    try {
      await EventService.toggleInterest(id, 'event');
      setIsInterested(!isInterested);
      toast.success(isInterested ? 'Removed from interested events' : 'Added to interested events');
    } catch (error) {
      toast.error('Failed to update interest status');
    }
  };

  const handleBookEvent = () => {
    setShowBookingForm(true);
  };

  if (loading) return <Loader />;
  
  if (error) return <div className="error-container">{error}</div>;
  
  if (!event) return <div className="not-found">Event not found</div>;

  return (
    <div className="event-details-page">
      <div className="event-details-container">
        <div className="event-image-container">
          <img 
            src={event.image || event.imageUrl || '/images/event-placeholder.jpg'} 
            alt={event.title || event.name}
            className="event-detail-image"
          />
        </div>
        
        <div className="event-info">
          <h1 className="event-title">{event.title || event.name}</h1>
          <div className="event-meta">
            <p className="event-date">
              <i className="fas fa-calendar"></i> {formatDate(event.date)}
            </p>
            <p className="event-location">
              <i className="fas fa-map-marker-alt"></i> {event.location}
            </p>
            <p className="event-category">
              <i className="fas fa-tag"></i> {event.category}
            </p>
            <p className="event-price">
              <i className="fas fa-ticket-alt"></i> {typeof event.price === 'number' ? `$${event.price}` : event.price}
            </p>
          </div>
          
          <div className="event-description">
            <h3>About this event</h3>
            <p>{event.description}</p>
          </div>
          
          <div className="event-capacity">
            <h3>Capacity</h3>
            <p>{event.capacity} people</p>
          </div>
          
          {organizer && (
            <div className="event-organizer">
              <h3>Organized by</h3>
              <p>{organizer}</p>
            </div>
          )}
          
          <div className="event-actions">
            <button 
              className={`interest-button ${isInterested ? 'interested' : ''}`}
              onClick={handleToggleInterest}
            >
              <i className={`fas fa-heart ${isInterested ? 'filled' : ''}`}></i>
              {isInterested ? 'Interested' : 'Add to Interests'}
            </button>
            
            <button className="book-button" onClick={handleBookEvent}>
              Book This Event
            </button>
          </div>
        </div>
      </div>
      
      {showBookingForm && (
        <div className="booking-section">
          <h2>Book This Event</h2>
          <BookingForm 
            data={event} 
            isEvent={true}
            onClose={() => setShowBookingForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default EventDetails; 
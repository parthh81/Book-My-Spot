import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaWifi, FaParking, FaSnowflake, FaMusic, FaUtensils, FaHeart, FaShareAlt, FaPhone, FaEnvelope, FaClock, FaTag, FaInfoCircle, FaRegHeart, FaShare } from 'react-icons/fa';
import EventService from '../../services/EventService';
import '../../styles/venueDetails.css';

// Fallback venue data if API fails
const fallbackVenue = {
  id: 1,
  title: "Royal Grand Palace",
  description: "Elegant venue perfect for weddings and grand celebrations with magnificent decor and spacious halls. This luxurious venue offers state-of-the-art amenities, expert staff, and customizable packages to make your event truly memorable.",
  fullDescription: "The Royal Grand Palace is one of the most prestigious venues in the city, known for its elegant architecture and luxurious ambiance. The grand ballroom features crystal chandeliers, marble flooring, and ornate decorations that create a sophisticated atmosphere for any event.\n\nOur venue can accommodate both intimate gatherings and large celebrations with multiple configuration options. The main hall can host up to 500 guests in banquet style seating, while smaller rooms are available for more intimate functions.\n\nOur team of experienced event planners will work closely with you to customize every aspect of your event, from decor to catering, ensuring a seamless and memorable experience for you and your guests.",
  images: [
    "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/3038424/pexels-photo-3038424.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/1045541/pexels-photo-1045541.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/3320529/pexels-photo-3320529.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ],
  price: "₹50,000 onwards",
  rating: 4.9,
  reviews: 36,
  location: "Ahmedabad",
  capacity: "50-500 guests",
  amenities: ["Catering", "Decoration", "Parking", "AC", "DJ", "WiFi", "Security", "Power Backup"],
  eventTypes: ["Wedding", "Reception", "Corporate Event", "Birthday Party", "Anniversary"],
  contactInfo: {
    phone: "+91 98765 43210",
    email: "bookings@royalgrandpalace.com",
    website: "www.royalgrandpalace.com"
  },
  availableDates: [],
  policies: {
    cancellation: "Full refund if cancelled 30 days before event. 50% refund if cancelled 15 days before event.",
    payment: "50% advance booking amount required. Balance due 7 days before event."
  }
};

function VenueDetails() {
  const { venueId, eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [itemType, setItemType] = useState('venue'); // 'venue' or 'event'
  const [showInterestConfirm, setShowInterestConfirm] = useState(false);
  const [interested, setInterested] = useState(false);
  
  // Check if we're coming from an event page with a pre-selected event type
  useEffect(() => {
    if (location.state && location.state.fromEvent) {
      console.log("Coming from event page with data:", location.state);
      // Set pre-selected event type
      if (location.state.selectedEventType) {
        setSelectedEventType(location.state.selectedEventType);
      }
      
      // Set a default date if none selected
      if (!selectedDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]);
      }
    }
  }, [location.state]);
  
  // Event types available 
  const eventTypes = [
    { id: 1, title: "Wedding", icon: "💍" },
    { id: 2, title: "Corporate Event", icon: "💼" },
    { id: 3, title: "Birthday Party", icon: "🎂" },
    { id: 4, title: "Anniversary", icon: "❤️" }
  ];

  // Helper function to get icon for amenity (moved inside the component)
  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <FaWifi />;
      case 'parking':
        return <FaParking />;
      case 'ac':
      case 'air conditioning':
        return <FaSnowflake />;
      case 'dj':
      case 'music':
        return <FaMusic />;
      case 'catering':
      case 'food':
        return <FaUtensils />;
      default:
        return null;
    }
  };

  // Fetch data based on URL parameters
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        // Determine if we're viewing a venue or an event
        const isEvent = location.pathname.startsWith('/event/') || !!eventId;
        const id = eventId || venueId;
        setItemType(isEvent ? 'event' : 'venue');
        
        // Check if we have event data in location state
        const eventDataFromState = location.state && location.state.eventData;
        
        // Fetch the appropriate data
        let data;
        if (isEvent) {
          data = await EventService.getEventById(id);
          console.log("Event data received:", data);
        } else {
          // Try to get venue details from API
          try {
            data = await EventService.getVenueDetails(id);
            console.log("Venue data received:", data);
          } catch (venueError) {
            console.error("Error fetching venue details:", venueError);
            data = null;
          }
          
          // If venue not found but we have event data in state, use venue data from the event
          if (!data && eventDataFromState && eventDataFromState.venue) {
            console.log("Using venue data from event state:", eventDataFromState.venue);
            
            // Convert venue data from event state into a format similar to what the API would return
            data = {
              _id: typeof eventDataFromState.venue === 'string' ? eventDataFromState.venue : (eventDataFromState.venue._id || id),
              name: eventDataFromState.venueName || (eventDataFromState.venue && eventDataFromState.venue.name) || eventDataFromState.title || "Venue",
              description: (eventDataFromState.venue && eventDataFromState.venue.description) || eventDataFromState.description || 'No description available',
              location: eventDataFromState.venueLocation || (eventDataFromState.venue && eventDataFromState.venue.address) || eventDataFromState.location || 'Location not specified',
              price: eventDataFromState.price || (eventDataFromState.venue && eventDataFromState.venue.price) || 'Price on request',
              capacity: eventDataFromState.capacity || (eventDataFromState.venue && eventDataFromState.venue.capacity) || '50-200 guests',
              amenities: (eventDataFromState.venue && eventDataFromState.venue.amenities) || [],
              inclusions: (eventDataFromState.venue && eventDataFromState.venue.inclusions) || ['Basic decoration', 'Sound system', 'Parking space', 'Backup power'],
              exclusions: (eventDataFromState.venue && eventDataFromState.venue.exclusions) || ['Food & beverages', 'Custom decoration', 'Photography'],
              images: (eventDataFromState.venue && eventDataFromState.venue.images) || (eventDataFromState.image ? [eventDataFromState.image] : [])
            };
            console.log("Created venue data from event:", data);
          }
        }
        
        if (data) {
          // Format the data based on type
          if (isEvent) {
            const formattedEvent = {
              id: data._id || data.id || id,
              title: data.name || data.title || 'Unnamed Event',
              description: data.description || 'No description available',
              fullDescription: data.fullDescription || data.description || 'No detailed description available',
              image: data.image || 'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
              images: data.images || (data.image ? [data.image] : []),
              date: data.date ? new Date(data.date) : new Date(),
              location: data.location || 'Location not specified',
              category: data.category || data.eventType || 'Event',
              organizer: data.organizer || 'Event Organizer',
              duration: data.duration || '3 hours',
              price: typeof data.price === 'number' ? `₹${data.price}` : (data.price || 'Free'),
              capacity: data.capacity || '100+ guests',
              isEvent: true
            };
            setItem(formattedEvent);
          } else {
            // Use existing venue formatting logic
            // Create images array for the venue
            let venueImages = [];
            
            // Check if we have an image or images property and process accordingly
            if (data.images && Array.isArray(data.images) && data.images.length > 0) {
              venueImages = data.images;
            } else if (data.image) {
              venueImages = [data.image];
            } else {
              // If no images are available, use fallback images
              venueImages = fallbackVenue.images;
            }
            
            // Format the data as needed
            const formattedVenue = {
              id: data._id || data.id || id,
              title: data.name || data.title || 'Unnamed Venue',
              description: data.description || 'No description available',
              fullDescription: data.fullDescription || data.description || 'No detailed description available',
              images: venueImages,
              price: typeof data.price === 'number' ? `₹${data.price} onwards` : (data.price || 'Price on request'),
              rating: data.rating || 4.5,
              reviews: data.reviews || 0,
              location: data.location || 'Location not specified',
              capacity: data.capacity || '50-200 guests',
              amenities: data.amenities || ["Parking", "Catering"],
              eventTypes: data.eventTypes || ["Wedding", "Birthday Party"],
              contactInfo: data.contactInfo || fallbackVenue.contactInfo,
              availableDates: data.availableDates || [],
              policies: data.policies || fallbackVenue.policies,
              isEvent: false
            };
            setItem(formattedVenue);
          }
        } else {
          // Use fallback data if API returns nothing
          if (isEvent) {
            setError('Event not found');
          } else {
            console.log("Using fallback venue data");
            setItem({...fallbackVenue, isEvent: false});
          }
        }
      } catch (err) {
        console.error(`Error fetching details:`, err);
        setError('Failed to load details. Please try again later.');
        
        // Use fallback data on error for venues only
        if (itemType === 'venue') {
          console.log("Using fallback venue data due to error");
          setItem({...fallbackVenue, isEvent: false});
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [venueId, eventId, location.pathname, location.state]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleDateSelect = (e) => {
    setSelectedDate(e.target.value);
  };
  
  const handleEventTypeSelect = (e) => {
    setSelectedEventType(e.target.value);
  };
  
  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    setInterested(!interested);
    setShowInterestConfirm(true);
    
    // Hide confirmation after 3 seconds
    setTimeout(() => {
      setShowInterestConfirm(false);
    }, 3000);
  };
  
  const handleBooking = () => {
    if (item.isEvent) {
      // Navigate to booking form with event details
      navigate(`/event/${item.id}/booking`, { 
        state: { 
          eventData: item,
          fromVenueDetails: true
        } 
      });
    } else {
      // For venues, require date and event type
      if (!selectedDate || !selectedEventType) {
        alert("Please select both a date and event type");
        return;
      }
      
      // Navigate to booking form with venue details
      navigate(`/event/${item.id}/booking`, { 
        state: { 
          eventData: {
            _id: item.id,
            title: item.title,
            description: item.description,
            image: item.images && item.images.length > 0 ? item.images[0] : null,
            price: item.price,
            location: item.location,
            capacity: item.capacity,
            venue: {
              name: item.title,
              address: item.location,
              amenities: item.amenities
            },
            startDate: selectedDate,
            venueId: item.id,
            category: selectedEventType
          },
          startDate: selectedDate,
          fromVenueDetails: true
        } 
      });
    }
  };
  
  const handleImageClick = (index) => {
    setActiveImageIndex(index);
  };
  
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out this ${item.isEvent ? 'event' : 'venue'}: ${item.title}`,
        url: window.location.href
      })
        .then(() => console.log('Shared successfully'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch((err) => console.error('Could not copy link:', err));
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading details...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }
  
  // Not found state
  if (!item) {
    return (
      <div className="no-events-container">
        <h3>{itemType === 'event' ? 'Event' : 'Venue'} not found</h3>
        <p>Sorry, the {itemType} you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }
  
  return (
    <div className={item.isEvent ? "event-details-container" : "container py-4"}>
      {/* Back Button and Breadcrumbs */}
      <div className={item.isEvent ? "back-nav" : "row mb-4"}>
        {item.isEvent ? (
          <>
            <button className="back-btn" onClick={handleBack}>
              <FaArrowLeft /> Back
            </button>
            <div className="breadcrumbs">
              <Link to="/">Home</Link> / <Link to="/events/browse">Events</Link> / <span>{item.title}</span>
            </div>
          </>
        ) : (
          <div className="col-12">
            <button 
              className="btn btn-sm btn-light mb-3"
              onClick={handleBack}
            >
              <FaArrowLeft className="me-1" /> Back
            </button>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/venues">Venues</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{item.title}</li>
              </ol>
            </nav>
          </div>
        )}
      </div>
      
      {/* Render based on item type */}
      {item.isEvent ? (
        /* Event Layout */
        <>
          {/* Event Header */}
          <div className="event-detail-header">
            <div className="event-header-image-container">
              <img 
                src={item.image} 
                alt={item.title} 
                className="event-header-image" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=600&h=400";
                }}
              />
              <div className="event-category-badge">{item.category}</div>
            </div>
            
            <div className="event-header-content">
              <h1 className="event-title">{item.title}</h1>
              
              <div className="event-meta">
                <div className="event-meta-item">
                  <FaCalendarAlt />
                  <span>{formatDate(item.date)}</span>
                </div>
                
                <div className="event-meta-item">
                  <FaClock />
                  <span>{formatTime(item.date)} • {item.duration}</span>
                </div>
                
                <div className="event-meta-item">
                  <FaMapMarkerAlt />
                  <span>{item.location}</span>
                </div>
                
                <div className="event-meta-item">
                  <FaUsers />
                  <span>{item.capacity}</span>
                </div>
                
                <div className="event-meta-item">
                  <FaTag />
                  <span>{item.price}</span>
                </div>
              </div>
              
              <div className="event-actions">
                <button 
                  className={`interest-btn ${isWishlisted ? 'interested' : ''}`}
                  onClick={toggleWishlist}
                >
                  <FaHeart /> {isWishlisted ? 'Interested' : 'Mark Interest'}
                </button>
                
                <button className="share-btn" onClick={handleShare}>
                  <FaShare /> Share
                </button>
                
                <button className="register-btn" onClick={handleBooking}>
                  Register Now
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
                  {item.fullDescription || item.description}
                </div>
              </div>
            </div>
            
            <div className="event-sidebar">
              <div className="event-detail-card">
                <h2>Organizer</h2>
                <div className="organizer-info">
                  <FaUsers className="organizer-icon" />
                  <div>
                    <h3>{item.organizer}</h3>
                    <p>Event Organizer</p>
                  </div>
                </div>
              </div>
              
              <div className="event-detail-card">
                <h2>Venue Information</h2>
                <div className="venue-info">
                  <p><FaMapMarkerAlt /> {item.location}</p>
                  <div className="venue-map">
                    <div className="map-placeholder">
                      <p>Location Map</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Venue Layout - Use existing markup */
        <>
          {/* Venue Showcase */}
          <div className="row mb-5">
            <div className="col-lg-8">
              {/* Main Image */}
              <div className="main-image-container mb-3">
                <img 
                  src={item.images && item.images.length > 0 ? item.images[activeImageIndex] : fallbackVenue.images[0]} 
                  className="img-fluid w-100 rounded shadow" 
                  alt={item.title}
                  style={{maxHeight: "500px", objectFit: "cover"}}
                  onError={(e) => {
                    console.log("Image failed to load, using fallback");
                    e.target.onerror = null;
                    e.target.src = fallbackVenue.images[0];
                  }}
                />
              </div>
              
              {/* Image Gallery */}
              <div className="image-gallery d-flex justify-content-start flex-wrap mb-4">
                {item.images && item.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`gallery-thumbnail mx-1 mb-2 ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => handleImageClick(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${item.title} view ${index + 1}`} 
                      className="img-fluid rounded" 
                      style={{
                        width: "80px", 
                        height: "60px", 
                        objectFit: "cover",
                        border: index === activeImageIndex ? "2px solid #f05537" : "2px solid transparent",
                        cursor: "pointer"
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackVenue.images[0];
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="venue-details p-4 rounded shadow-sm bg-white">
                <h2 className="mb-3 text-dark fw-bold">{item.title}</h2>
                
                {/* Rating */}
                <div className="venue-rating mb-3 d-flex align-items-center">
                  <div className="stars me-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        style={{
                          color: i < Math.floor(item.rating) ? "#FFD700" : "#e4e5e9",
                          marginRight: "2px"
                        }} 
                      />
                    ))}
                  </div>
                  <span className="fw-semibold text-muted">{item.rating} ({item.reviews} reviews)</span>
                </div>
                
                {/* Location */}
                <div className="venue-location mb-3 d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2 text-muted" />
                  <span className="text-muted">{item.location}</span>
                </div>
                
                {/* Price */}
                <div className="venue-price mb-3">
                  <h4 className="mb-1 text-primary">{item.price}</h4>
                  <p className="text-muted small m-0">For the entire venue</p>
                </div>
                
                {/* Capacity */}
                <div className="venue-capacity mb-3">
                  <p className="mb-0"><FaUsers className="me-2 text-muted" /> {item.capacity}</p>
                </div>
                
                {/* Booking Buttons */}
                <div className="booking-actions mt-4 d-flex flex-column">
                  <button 
                    className="btn mb-2" 
                    style={{backgroundColor: "#f05537", color: "white"}}
                    onClick={toggleWishlist}
                  >
                    {isWishlisted ? <FaHeart /> : <FaHeart style={{color: "#f05537", backgroundColor: "white", padding: "2px", borderRadius: "50%"}} />}
                    {' '}
                    {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
                  </button>
                  
                  <button 
                    className="btn" 
                    style={{backgroundColor: "#f05537", color: "white"}}
                    onClick={() => {
                      if (item.isEvent) {
                        // Navigate directly to booking for events
                        navigate(`/event/${item.id}/booking`, { 
                          state: { 
                            eventData: item,
                            fromVenueDetails: true
                          } 
                        });
                      } else {
                        // For venues, open the modal to select date and event type
                        document.getElementById('bookingModal').classList.add('show');
                        document.getElementById('bookingModal').style.display = 'block';
                      }
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Venue Description */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="venue-description rounded shadow-sm bg-white p-4">
                <h3 className="mb-3 fw-bold">About {item.title}</h3>
                <p className="mb-4 text-muted">{item.fullDescription}</p>
                
                {/* Amenities */}
                <h4 className="mb-3 fw-bold">Amenities</h4>
                <div className="amenities-container mb-4 d-flex flex-wrap">
                  {item.amenities && item.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-badge me-3 mb-3 px-3 py-2 rounded bg-light">
                      {getAmenityIcon(amenity)} {amenity}
                    </div>
                  ))}
                </div>
                
                {/* Suitable Events */}
                <h4 className="mb-3 fw-bold">Suitable For</h4>
                <div className="events-container d-flex flex-wrap">
                  {item.eventTypes && item.eventTypes.map((eventType, index) => (
                    <div key={index} className="event-badge me-3 mb-3 px-3 py-2 rounded text-white" style={{backgroundColor: "#f05537"}}>
                      {eventType}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="contact-info rounded shadow-sm bg-white p-4">
                <h3 className="mb-3 fw-bold">Contact Information</h3>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="contact-item mb-3 d-flex align-items-center">
                      <FaPhone className="me-3 text-muted" />
                      <div>
                        <h5 className="mb-1 fw-semibold">Phone</h5>
                        <p className="m-0 text-muted">{item.contactInfo.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="contact-item mb-3 d-flex align-items-center">
                      <FaEnvelope className="me-3 text-muted" />
                      <div>
                        <h5 className="mb-1 fw-semibold">Email</h5>
                        <p className="m-0 text-muted">{item.contactInfo.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Policies */}
          <div className="row mb-5">
            <div className="col-12">
              <div className="policies rounded shadow-sm bg-white p-4">
                <h3 className="mb-3 fw-bold">Policies</h3>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="policy-item mb-3">
                      <h5 className="mb-2 fw-semibold">Cancellation Policy</h5>
                      <p className="text-muted">{item.policies.cancellation}</p>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="policy-item mb-3">
                      <h5 className="mb-2 fw-semibold">Payment Policy</h5>
                      <p className="text-muted">{item.policies.payment}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modal for Booking */}
          <div className="modal fade" id="bookingModal" tabIndex="-1" aria-labelledby="bookingModalLabel" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="bookingModalLabel">Book {item.title}</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      document.getElementById('bookingModal').classList.remove('show');
                      document.getElementById('bookingModal').style.display = 'none';
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-info mb-3">
                    {location.state && location.state.fromEvent ? (
                      <small>Event type has been pre-selected from the event you were viewing. Please confirm the date to continue.</small>
                    ) : (
                      <small>Please select both a date and event type to proceed with your booking</small>
                    )}
                  </div>
                  <form>
                    <div className="mb-3">
                      <label htmlFor="bookingDate" className="form-label">Select Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        id="bookingDate" 
                        value={selectedDate}
                        onChange={handleDateSelect}
                        min={getMinDate()}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="eventType" className="form-label">Event Type</label>
                      <select 
                        className="form-select" 
                        id="eventType"
                        value={selectedEventType}
                        onChange={handleEventTypeSelect}
                        required
                      >
                        <option value="">Select Event Type</option>
                        {eventTypes.map(type => (
                          <option key={type.id} value={type.title}>
                            {type.icon} {type.title}
                          </option>
                        ))}
                      </select>
                      {location.state && location.state.fromEvent && location.state.selectedEventType && (
                        <div className="form-text text-success">
                          <small>Pre-selected from event: {location.state.selectedEventType}</small>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      document.getElementById('bookingModal').classList.remove('show');
                      document.getElementById('bookingModal').style.display = 'none';
                    }}
                  >Close</button>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{backgroundColor: "#f05537", color: "white"}}
                    onClick={handleBooking}
                  >
                    Proceed to Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Interest Confirmation Alert */}
      {showInterestConfirm && (
        <div className={`interest-alert ${interested ? 'interested' : 'not-interested'}`}>
          {interested ? 'Added to your interests!' : 'Removed from your interests'}
        </div>
      )}
    </div>
  );
}

export default VenueDetails; 
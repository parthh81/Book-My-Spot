import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaFilter, FaStar, FaArrowLeft, FaHeart, FaCalendarCheck } from 'react-icons/fa';
import EventService from '../../services/EventService';

// Fallback venues data if API fails
const fallbackVenues = [
  {
    id: 1,
    title: "Royal Grand Palace",
    description: "Elegant venue perfect for weddings and grand celebrations with magnificent decor and spacious halls",
    image: "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=600&h=400",
    price: "₹50,000 onwards",
    rating: 4.9,
    location: "Ahmedabad",
    capacity: "50-500 guests",
    suitableEvents: [1, 4, 6], // Wedding, Anniversary, Engagement
    amenities: ["Catering", "Decoration", "Parking", "AC", "DJ"]
  },
  {
    id: 2,
    title: "Riverside Retreat",
    description: "Beautiful waterfront venue for memorable occasions with panoramic views and serene atmosphere",
    image: "https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=600&h=400",
    price: "₹35,000 onwards",
    rating: 4.7,
    location: "Mumbai",
    capacity: "100-300 guests",
    suitableEvents: [1, 3, 4, 5], // Wedding, Birthday, Anniversary, Family
    amenities: ["Catering", "Parking", "AC", "Swimming Pool"]
  },
  {
    id: 3,
    title: "Modern Event Center",
    description: "Contemporary space with state-of-the-art facilities for corporate events and formal gatherings",
    image: "https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg?auto=compress&cs=tinysrgb&w=600&h=400",
    price: "₹45,000 onwards",
    rating: 4.8,
    location: "Delhi",
    capacity: "50-250 guests",
    suitableEvents: [2, 3], // Corporate, Birthday
    amenities: ["Projector", "Wifi", "Catering", "AC", "Parking"]
  },
  {
    id: 4,
    title: "Garden Paradise",
    description: "Beautiful outdoor venue with lush gardens perfect for ceremonies and photography",
    image: "https://images.pexels.com/photos/265947/pexels-photo-265947.jpeg?auto=compress&cs=tinysrgb&w=600&h=400",
    price: "₹40,000 onwards",
    rating: 4.6,
    location: "Bangalore",
    capacity: "100-400 guests",
    suitableEvents: [1, 4, 5, 6], // Wedding, Anniversary, Family, Engagement
    amenities: ["Open Air", "Catering", "Decoration", "Parking"]
  },
  {
    id: 5,
    title: "Conference Plaza",
    description: "Professional venue for business meetings, conferences and corporate events",
    image: "https://images.pexels.com/photos/53464/sheraton-palace-hotel-lobby-architecture-53464.jpeg?auto=compress&cs=tinysrgb&w=600&h=400",
    price: "₹30,000 onwards",
    rating: 4.5,
    location: "Delhi",
    capacity: "20-150 guests",
    suitableEvents: [2], // Corporate
    amenities: ["Projector", "Wifi", "Catering", "AC", "Microphone"]
  },
  {
    id: 6,
    title: "Beach View Resort",
    description: "Stunning beachfront venue for destination weddings and parties with sea views",
    image: "https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=600&h=400",
    price: "₹60,000 onwards",
    rating: 4.9,
    location: "Mumbai",
    capacity: "50-250 guests",
    suitableEvents: [1, 3, 4], // Wedding, Birthday, Anniversary
    amenities: ["Catering", "Decoration", "Accommodation", "Parking", "AC"]
  }
];

// Fallback event categories if API fails
const fallbackEventCategories = {
  1: {
    title: "Weddings",
    icon: "💍",
    description: "Perfect venues for your special day"
  },
  2: {
    title: "Corporate Events",
    icon: "💼",
    description: "Professional spaces for meetings and conferences"
  },
  3: {
    title: "Birthday Parties",
    icon: "🎂",
    description: "Fun venues for birthday celebrations"
  },
  4: {
    title: "Anniversary Celebrations",
    icon: "❤️",
    description: "Romantic settings for your milestone"
  },
  5: {
    title: "Family Gatherings",
    icon: "👨‍👩‍👧‍👦",
    description: "Spacious venues for family get-togethers"
  },
  6: {
    title: "Engagement Ceremonies",
    icon: "💍",
    description: "Beautiful venues to celebrate your engagement"
  }
};

const VenuesByEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const locationParam = queryParams.get('location');
  
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(locationParam || 'All Locations');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedEventCategory, setSelectedEventCategory] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventCategories, setEventCategories] = useState(fallbackEventCategories);
  
  // Fetch venues by event type and event categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch event categories first
        const categoriesData = await EventService.getEventCategories();
        if (categoriesData && categoriesData.length > 0) {
          // Convert array to object with ID as key
          const categoriesObj = {};
          categoriesData.forEach(cat => {
            categoriesObj[cat.id] = {
              title: cat.title,
              icon: cat.icon || '🎭',
              description: cat.description
            };
          });
          setEventCategories(categoriesObj);
        }
        
        if (eventId) {
          const eventIdNum = parseInt(eventId);
          
          // Set selected event category
          const categoryData = categoriesData && categoriesData.length > 0
            ? categoriesData.find(cat => cat.id === eventIdNum)
            : fallbackEventCategories[eventIdNum];
            
          setSelectedEventCategory(categoryData || fallbackEventCategories[eventIdNum]);
          
          // Fetch venues for this event category - this is more appropriate than getVenuesByEvent
          // since we're working with category IDs in the URL
          const venuesData = await EventService.getVenuesByCategory(eventIdNum);
          
          if (venuesData && venuesData.length > 0) {
            // Format the data as needed
            const formattedVenues = venuesData.map(venue => ({
              id: venue._id,
              title: venue.name || 'Unnamed Venue',
              description: venue.description || 'No description available',
              image: venue.image || fallbackVenues[0].image,
              price: venue.price ? `₹${venue.price} onwards` : 'Price on request',
              rating: venue.rating || 4.5,
              location: venue.location || 'Unknown location',
              capacity: venue.capacity || '50-200 guests',
              amenities: venue.amenities || ["Catering", "Parking"],
              suitableEvents: venue.suitableEvents || [eventIdNum]
            }));
            
            setVenues(formattedVenues);
            setFilteredVenues(formattedVenues);
          } else {
            // Filter fallback venues if no data
            const filtered = fallbackVenues.filter(venue => 
              venue.suitableEvents.includes(eventIdNum)
            );
            setVenues(filtered);
            setFilteredVenues(filtered);
          }
        } else {
          // No event ID, show all venues
          const allVenues = await EventService.getAllVenues();
          
          if (allVenues && allVenues.length > 0) {
            // Format the data as needed
            const formattedVenues = allVenues.map(venue => ({
              id: venue._id,
              title: venue.name || 'Unnamed Venue',
              description: venue.description || 'No description available',
              image: venue.image || fallbackVenues[0].image,
              price: venue.price ? `₹${venue.price} onwards` : 'Price on request',
              rating: venue.rating || 4.5,
              location: venue.location || 'Unknown location',
              capacity: venue.capacity || '50-200 guests',
              amenities: venue.amenities || ["Catering", "Parking"],
              suitableEvents: venue.suitableEvents || [1, 2]
            }));
            
            setVenues(formattedVenues);
            setFilteredVenues(formattedVenues);
          } else {
            // Use fallback data if no venues
            setVenues(fallbackVenues);
            setFilteredVenues(fallbackVenues);
          }
        }
      } catch (err) {
        console.error('Error fetching venues data:', err);
        setError('Failed to load venues. Please try again later.');
        
        // Use fallback data on error
        if (eventId) {
          const eventIdNum = parseInt(eventId);
          setSelectedEventCategory(fallbackEventCategories[eventIdNum]);
          
          // Filter venues that are suitable for this event type
          const filtered = fallbackVenues.filter(venue => 
            venue.suitableEvents.includes(eventIdNum)
          );
          
          setVenues(filtered);
          setFilteredVenues(filtered);
        } else {
          setVenues(fallbackVenues);
          setFilteredVenues(fallbackVenues);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [eventId]);
  
  // Filter venues based on search term, location, and price range
  useEffect(() => {
    let result = venues;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(venue => 
        venue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by location
    if (selectedLocation && selectedLocation !== 'All Locations') {
      result = result.filter(venue => venue.location === selectedLocation);
    }
    
    // Filter by price range
    if (priceRange && priceRange.length === 2) {
      result = result.filter(venue => {
        // Extract numeric price value from string (e.g. "₹50,000 onwards" -> 50000)
        const priceString = venue.price?.toString() || '';
        const numericPriceMatch = priceString.match(/\d+,?\d*/);
        if (!numericPriceMatch) return true; // Keep venues with no price info
        
        const numericPrice = parseInt(numericPriceMatch[0].replace(/,/g, ''));
        return numericPrice >= priceRange[0] && numericPrice <= priceRange[1];
      });
    }
    
    setFilteredVenues(result);
  }, [venues, searchTerm, selectedLocation, priceRange]);
  
  const handleVenueSelect = (venueId) => {
    // Navigate to venue details page
    navigate(`/venues/${venueId}`);
  };
  
  const getUniqueLocations = () => {
    const locations = venues.map(venue => venue.location);
    return ['All Locations', ...new Set(locations)];
  };
  
  const handleBackClick = () => {
    navigate('/events/browse');
  };
  
  const toggleFilters = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  // Loading state
  if (loading) {
    return (
      <div className="venues-by-event-container py-5 px-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading venues...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="venues-by-event-container py-5 px-4">
        <div className="alert alert-danger" role="alert">
          {error.includes('connection') || error.includes('fetch') 
            ? "Cannot connect to the server. Please make sure the backend server is running on port 3200." 
            : error}
        </div>
        {error.includes('connection') || error.includes('fetch') ? (
          <div className="mt-3 text-center">
            <p className="mb-3">To start the backend server:</p>
            <div className="bg-light p-3 rounded mb-3">
              <code>cd Backend</code><br/>
              <code>npm install</code><br/>
              <code>node app.js</code>
            </div>
            <button 
              className="btn" 
              style={{backgroundColor: "#f05537", color: "white"}}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <button 
            className="btn" 
            style={{backgroundColor: "#f05537", color: "white"}}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="venues-by-event-container py-4 px-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <button 
            className="btn btn-sm btn-light mb-3"
            onClick={handleBackClick}
          >
            <FaArrowLeft className="me-1" /> Back to Events
          </button>
        </div>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="row g-2">
                <div className="col-md-5">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-0">
                      <FaSearch className="text-muted" />
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-0"
                      placeholder="Search venues by name or features..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-0">
                      <FaMapMarkerAlt className="text-muted" />
                    </span>
                    <select 
                      className="form-select border-0"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      {getUniqueLocations().map((location, index) => (
                        <option key={index} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn w-100" 
                    style={{backgroundColor: "#f05537", color: "white"}}
                    onClick={toggleFilters}
                  >
                    <FaFilter className="me-2" /> Filters
                  </button>
                </div>
              </div>
              
              {/* Advanced Filters (Collapsible) */}
              {isFilterVisible && (
                <div className="advanced-filters mt-3 pt-3 border-top">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Price Range</label>
                      <div className="d-flex align-items-center">
                        <span className="me-2">₹{priceRange[0]}</span>
                        <input 
                          type="range" 
                          className="form-range flex-grow-1"
                          min="0"
                          max="100000"
                          step="5000"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        />
                        <span className="ms-2">₹{priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Event Type Info */}
      {selectedEventCategory && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  <div className="event-icon fs-1 me-3">
                    {selectedEventCategory.icon}
                  </div>
                  <div>
                    <h3 className="mb-1">{selectedEventCategory.title}</h3>
                    <p className="mb-0 text-muted">{selectedEventCategory.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Venues Grid */}
      <div className="row mb-4">
        <div className="col-12">
          <h3 className="mb-3">
            Available Venues 
            {filteredVenues.length > 0 && filteredVenues[0].categoryCount ? 
              ` (${filteredVenues[0].categoryCount} total)` : 
              ` (${filteredVenues.length})`
            }
          </h3>
          
          {loading ? (
            <div className="col-span-full flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center text-red-500 p-4 bg-red-50 rounded-lg">
              {error}
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="text-center p-5 bg-light rounded shadow-sm">
              <FaMapMarkerAlt className="text-muted mb-3" style={{ fontSize: "3rem" }} />
              <h3 className="fs-4 mb-2">No Venues Available</h3>
              <p className="text-muted mb-4">
                {selectedLocation !== 'All Locations' 
                  ? `There are no venues available for this event in ${selectedLocation}.` 
                  : 'There are no venues available for this event category.'}
              </p>
              <button 
                onClick={() => navigate(-1)} 
                className="btn" 
                style={{backgroundColor: "#f05537", color: "white"}}
              >
                <FaArrowLeft className="me-1" /> Go Back
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {filteredVenues.map(venue => (
                <div className="col-md-4" key={venue.id}>
                  <div className="card h-100 border-0 shadow-sm venue-card">
                    <div className="position-relative">
                      <img 
                        src={venue.image} 
                        className="card-img-top" 
                        alt={venue.title} 
                        style={{height: "200px", objectFit: "cover"}}
                        loading="lazy"
                      />
                      <div 
                        className="venue-rating position-absolute top-0 end-0 m-2 px-2 py-1 rounded-pill"
                        style={{backgroundColor: "rgba(255,255,255,0.9)"}}
                      >
                        <FaStar className="text-warning me-1" />
                        <span className="fw-bold">{venue.rating}</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title mb-2">{venue.title}</h5>
                      <p className="text-muted mb-2">
                        <FaMapMarkerAlt className="me-1" /> {venue.city || venue.location}
                      </p>
                      <p className="card-text small text-muted mb-3" style={{
                        height: "4.5rem", 
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: "3",
                        WebkitBoxOrient: "vertical",
                        textOverflow: "ellipsis"
                      }}>
                        {venue.description}
                      </p>
                      <div className="mb-3">
                        <div className="badge bg-light text-dark me-1 mb-1">
                          {venue.capacity}
                        </div>
                        {venue.amenities.slice(0, 3).map((amenity, index) => (
                          <div key={index} className="badge bg-light text-dark me-1 mb-1">
                            {amenity}
                          </div>
                        ))}
                        {venue.amenities.length > 3 && (
                          <div className="badge bg-light text-dark me-1 mb-1">
                            +{venue.amenities.length - 3} more
                          </div>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <div className="fw-bold" style={{color: "#f05537"}}>
                          {venue.price}
                        </div>
                        <button 
                          className="btn btn-sm" 
                          style={{backgroundColor: "#f05537", color: "white"}}
                          onClick={() => handleVenueSelect(venue.id)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenuesByEvent; 
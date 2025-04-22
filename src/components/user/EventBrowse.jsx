import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaStar, FaUsers, FaMapMarkerAlt, FaSearch, FaSyncAlt, FaSort, FaHeart, FaFilter } from 'react-icons/fa';
import EventService from '../../services/EventService';
import '../../styles/events.css';
import { PLACEHOLDER_IMAGE, handleImageError, getImageUrl } from '../../utils/imageUtils';

// Fallback event categories if API fails
const fallbackEventCategories = [
  {
    id: 1,
    title: "Weddings",
    description: "Find the perfect venue for your special day",
    image: PLACEHOLDER_IMAGE,
    count: 120
  },
  {
    id: 2,
    title: "Corporate Events",
    description: "Professional venues for meetings and conferences",
    image: PLACEHOLDER_IMAGE,
    count: 85
  },
  {
    id: 3,
    title: "Birthday Parties",
    description: "Celebrate your birthday at exciting venues",
    image: PLACEHOLDER_IMAGE,
    count: 64
  },
  {
    id: 4,
    title: "Anniversary Celebrations",
    description: "Romantic venues for your special milestone",
    image: PLACEHOLDER_IMAGE,
    count: 42
  },
  {
    id: 5,
    title: "Family Gatherings",
    description: "Spacious venues for family get-togethers",
    image: PLACEHOLDER_IMAGE,
    count: 56
  },
  {
    id: 6,
    title: "Engagement Ceremonies",
    description: "Beautiful venues to celebrate your engagement",
    image: PLACEHOLDER_IMAGE,
    count: 38
  }
];

// Updated fallback events without name and date
const fallbackUpcomingEvents = [
  {
    id: 101,
    description: "Explore the latest wedding trends and meet top vendors",
    image: PLACEHOLDER_IMAGE,
    location: "Royal Grand Palace, Ahmedabad",
    category: "Wedding"
  },
  {
    id: 102,
    description: "Network with industry leaders and learn from experts",
    image: PLACEHOLDER_IMAGE,
    location: "Modern Event Center, Delhi",
    category: "Corporate"
  },
  {
    id: 103,
    description: "Celebrate diverse cultures with music, dance, and food",
    image: PLACEHOLDER_IMAGE,
    location: "Riverside Retreat, Mumbai",
    category: "Festival"
  }
];

const EventBrowse = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [favorites, setFavorites] = useState({});
  
  // Available locations
  const locations = [
    'All Locations',
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Ahmedabad',
    'Chennai',
    'Kolkata',
    'Pune'
  ];

  // Event categories
  const categories = [
    'All Categories',
    'Wedding',
    'Corporate',
    'Birthday',
    'Anniversary',
    'Festival',
    'Conference',
    'Family Gathering',
    'Social'
  ];

  // Sort options
  const sortOptions = [
    'Newest First',
    'Price: Low to High',
    'Price: High to Low',
    'Rating: High to Low'
  ];
  
  // Fetch events from API
  const fetchEventData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all available events
      const eventsData = await EventService.getAllEvents();
      console.log('Fetched events from API:', eventsData);
      
      if (eventsData && eventsData.length > 0) {
        // Format the events data
        const formattedEvents = eventsData.map(event => {
          // Debug image paths
          console.log(`Event ${event._id} image path:`, event.image);
          if (event.image) {
            console.log(`Full image URL:`, getImageUrl(event.image));
          }
          
          // Format capacity to ensure it's reasonable (e.g. 200-500 guests)
          let capacity;
          if (event.capacity) {
            const minCapacity = Math.min(event.capacity, 2000); // Cap at 2000 for min
            const maxCapacity = Math.min(minCapacity + 300, 5000); // Reasonable max difference
            capacity = `${minCapacity}-${maxCapacity} guests`;
          } else {
            capacity = '50-200 guests'; // Default capacity
          }
          
          // Ensure we have standard amenities/features
          const standardFeatures = ["Catering", "Parking", "WiFi"];
          const existingFeatures = event.features || [];
          // Combine existing features with at least 1 standard feature if needed
          const features = existingFeatures.length > 0 
            ? existingFeatures 
            : standardFeatures.slice(0, 1 + Math.floor(Math.random() * 2)); // 1-3 features
          
          return {
            id: event._id,
            title: event.name || event.eventType || event.category || 'Event',
            description: event.description || 'No description available',
            image: getImageUrl(event.image),
            location: event.location || 'TBD',
            city: event.city || event.location?.split(',').pop()?.trim() || 'Mumbai',
            area: event.area || event.location?.split(',')[0]?.trim() || '',
            date: event.date ? new Date(event.date) : new Date(),
            formattedDate: event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD',
            category: event.category || event.eventType || 'Event',
            rating: (Math.random() * (5 - 4) + 4).toFixed(1), // Random rating between 4.0-5.0
            features: features,
            capacity: capacity, // Use formatted capacity
            price: `₹${event.price || 30000} onwards` // Use actual price from backend
          };
        });
        setEvents(formattedEvents);
      } else {
        console.log('No events found from API');
        setEvents([]);
      }
    } catch (err) {
      console.error('Error fetching event data:', err);
      setError('Failed to load events. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchEventData();
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('eventFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error loading favorites from localStorage:', e);
      }
    }
  }, []);
  
  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('eventFavorites', JSON.stringify(favorites));
  }, [favorites]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    setRefreshing(true);
    fetchEventData();
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle location change
  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Handle sort order change
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };
  
  // Filter events 
  const filteredEvents = events.filter(event => {
    // Filter by location
    const locationMatch = selectedLocation === 'All Locations' || 
                          event.city === selectedLocation || 
                          event.location.includes(selectedLocation);
    
    // Filter by search term
    const search = searchTerm.toLowerCase();
    const searchMatch = !searchTerm || 
                       (event.title && event.title.toLowerCase().includes(search)) ||
                       (event.description && event.description.toLowerCase().includes(search)) ||
                       (event.category && event.category.toLowerCase().includes(search));
                       
    // Filter by category
    const categoryMatch = selectedCategory === 'All Categories' ||
                         (event.category && event.category.toLowerCase() === selectedCategory.toLowerCase()) || 
                         (event.category && event.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    
    return locationMatch && searchMatch && categoryMatch;
  }).sort((a, b) => {
    // Apply sorting based on selected sort order
    switch(sortOrder) {
      case 'Newest First':
        return new Date(b.date) - new Date(a.date);
      case 'Price: Low to High':
        const priceA = parseInt(a.price?.replace(/[^\d]/g, '')) || 0;
        const priceB = parseInt(b.price?.replace(/[^\d]/g, '')) || 0;
        return priceA - priceB;
      case 'Price: High to Low':
        const priceLowA = parseInt(a.price?.replace(/[^\d]/g, '')) || 0;
        const priceLowB = parseInt(b.price?.replace(/[^\d]/g, '')) || 0;
        return priceLowB - priceLowA;
      case 'Rating: High to Low':
        return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
      default:
        return 0;
    }
  });
  
  // Toggle favorite for an event
  const toggleFavorite = (eventId) => (e) => {
    e.preventDefault();
    setFavorites(prevFavorites => ({
      ...prevFavorites,
      [eventId]: !prevFavorites[eventId]
    }));
    // Here you could also save the favorite status to localStorage or API
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedLocation('All Locations');
    setSelectedCategory('All Categories');
    setSortOrder('Newest First');
  };
  
  // Clear specific filter
  const clearFilter = (filterType) => {
    switch(filterType) {
      case 'search':
        setSearchTerm('');
        break;
      case 'location':
        setSelectedLocation('All Locations');
        break;
      case 'category':
        setSelectedCategory('All Categories');
        break;
      case 'sort':
        setSortOrder('Newest First');
        break;
      default:
        break;
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading events...</span>
        </div>
        <p className="mt-3">Loading available events...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button className="btn btn-primary" onClick={fetchEventData}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header with refresh button */}
      <div className="d-flex justify-content-end align-items-center mb-4">
        <button 
          className="btn btn-outline-primary d-flex align-items-center"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FaSyncAlt className={`me-2 ${refreshing ? 'fa-spin' : ''}`} />
          Refresh Events
        </button>
      </div>
      
      {/* Search, location and filter section */}
      <div className="row g-3 mb-4">
        {/* Search input */}
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search for events..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        {/* Location dropdown */}
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <FaMapMarkerAlt className="text-muted" />
            </span>
            <select 
              className="form-select"
              value={selectedLocation}
              onChange={handleLocationChange}
            >
              {locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Category dropdown */}
        <div className="col-md-3">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <FaFilter className="text-muted" />
            </span>
            <select 
              className="form-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Sort dropdown */}
        <div className="col-md-2">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <FaSort className="text-muted" />
            </span>
            <select 
              className="form-select"
              value={sortOrder}
              onChange={handleSortChange}
            >
              {sortOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Active filters */}
      <div className="mb-4">
        {(searchTerm || selectedLocation !== 'All Locations' || selectedCategory !== 'All Categories' || sortOrder !== 'Newest First') && (
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span className="text-muted">Active filters:</span>
            
            {searchTerm && (
              <div className="badge bg-light text-dark p-2 d-flex align-items-center">
                <span>Search: {searchTerm}</span>
                <button 
                  className="btn-close ms-2" 
                  style={{ fontSize: '0.6rem' }} 
                  onClick={() => clearFilter('search')}
                  aria-label="Clear search filter"
                ></button>
              </div>
            )}
            
            {selectedLocation !== 'All Locations' && (
              <div className="badge bg-light text-dark p-2 d-flex align-items-center">
                <span>Location: {selectedLocation}</span>
                <button 
                  className="btn-close ms-2" 
                  style={{ fontSize: '0.6rem' }} 
                  onClick={() => clearFilter('location')}
                  aria-label="Clear location filter"
                ></button>
              </div>
            )}
            
            {selectedCategory !== 'All Categories' && (
              <div className="badge bg-light text-dark p-2 d-flex align-items-center">
                <span>Category: {selectedCategory}</span>
                <button 
                  className="btn-close ms-2" 
                  style={{ fontSize: '0.6rem' }} 
                  onClick={() => clearFilter('category')}
                  aria-label="Clear category filter"
                ></button>
              </div>
            )}
            
            {sortOrder !== 'Newest First' && (
              <div className="badge bg-light text-dark p-2 d-flex align-items-center">
                <span>Sort: {sortOrder}</span>
                <button 
                  className="btn-close ms-2" 
                  style={{ fontSize: '0.6rem' }} 
                  onClick={() => clearFilter('sort')}
                  aria-label="Clear sort filter"
                ></button>
              </div>
            )}
            
            <button 
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={clearAllFilters}
              aria-label="Clear all filters"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
      
      {/* Events heading */}
      <h3 className="section-title mb-4">Available Events ({filteredEvents.length})</h3>
      
      {/* Events cards */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-5">
          <FaCalendarAlt size={48} className="text-muted mb-3" />
          <h4>No events found</h4>
          <p className="text-muted">Try adjusting your search criteria or check back later.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredEvents.map(event => {
            return (
              <div key={event.id} className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 shadow-sm venue-card">
                  <div className="position-relative">
                    <img 
                      src={getImageUrl(event.image)} 
                      className="card-img-top" 
                      alt={event.title}
                      style={{height: "250px", objectFit: "cover"}} 
                      loading="lazy"
                      onError={(e) => handleImageError(e)}
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title fw-bold mb-1">{event.title}</h5>
                    <p className="small mb-2">
                      <FaMapMarkerAlt className="me-1" aria-hidden="true" /> {event.city || event.area || 'Location not specified'}
                    </p>
                    <p className="card-text text-muted mb-2">{event.description.substring(0, 80)}{event.description.length > 80 ? '...' : ''}</p>
                    <p className="text-primary fw-bold">{event.price}</p>
                    
                    <div className="mt-3">
                      <Link 
                        to={`/event/${event.id}/booking`} 
                        className="btn" 
                        style={{
                          backgroundColor: "#f05537", 
                          color: "white", 
                          padding: "0.5rem 1.5rem"
                        }}
                        state={{
                          eventData: event,
                          fromEventBrowse: true,
                          selectedEventType: event.category || 'Wedding',
                          eventId: event.id,
                          eventTitle: event.title,
                          image: event.image,
                          venueImageToShow: true,
                          price: parseInt(event.price?.replace(/[^\d]/g, '')) || 30000,
                          location: event.location || event.city || 'Location not specified'
                        }}
                      >
                        Check Availability
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventBrowse;
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EventService from '../../services/EventService';
import { FaArrowLeft, FaArrowRight, FaCalendarAlt, FaBuilding, FaCheckCircle, FaBug, FaExclamationTriangle } from 'react-icons/fa';

// Debug component to display state
const DebugPanel = ({ data, title }) => (
  <div className="debug-panel bg-gray-100 p-4 mt-4 rounded border border-gray-300">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-gray-700">
        <FaBug className="inline mr-2" /> {title || 'Debug Info'}
      </h3>
    </div>
    <pre className="text-xs overflow-auto bg-gray-900 text-green-500 p-3 rounded">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

// Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in event flow component:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-8 bg-red-50 rounded-lg border border-red-200 text-center">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
          <p className="mb-4 text-red-600">{this.state.error?.toString()}</p>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
          <button 
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
          {this.props.showDebugInfo && this.state.errorInfo && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-left overflow-auto max-h-40">
              <pre className="text-xs">{this.state.errorInfo.componentStack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// The main component wrapped in an error boundary
const EventCategoryVenueFlowWithErrorBoundary = () => {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  return (
    <ErrorBoundary showDebugInfo={showDebugInfo}>
      {/* Only show debug buttons in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4">
          <button 
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded text-xs"
          >
            {showDebugInfo ? "Hide Error Details" : "Show Error Details"}
          </button>
        </div>
      )}
      <EventCategoryVenueFlow />
    </ErrorBoundary>
  );
};

const EventCategoryVenueFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    imageUrl: '',
    categoryId: null,
    venueId: null,
    price: '',
    capacity: '',
    status: 'upcoming',
  });
  
  // Debug state
  const [showDebug, setShowDebug] = useState(false);
  const [apiLogs, setApiLogs] = useState([]);

  const logApiCall = (message) => {
    setApiLogs(prev => [...prev, { time: new Date().toISOString(), message }]);
  };

  // Step 1: Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      logApiCall('Fetching event categories...');
      try {
        const categories = await EventService.getEventCategories();
        logApiCall(`Fetched ${categories.length} categories successfully`);
        console.log('Fetched categories:', categories);
        setCategories(categories);
      } catch (error) {
        logApiCall(`Error fetching categories: ${error.message}`);
        console.error('Error fetching categories:', error);
        setError('Failed to load event categories');
        // Add fallback categories if API fails
        const fallbackCategories = [
          { id: 1, title: 'Weddings', description: 'Find the perfect venue for your special day', icon: '💍', count: 120 },
          { id: 2, title: 'Corporate Events', description: 'Professional venues for meetings and conferences', icon: '💼', count: 85 },
          { id: 3, title: 'Birthday Parties', description: 'Celebrate your birthday at exciting venues', icon: '🎂', count: 64 },
          { id: 4, title: 'Anniversary Celebrations', description: 'Romantic venues for your special milestone', icon: '❤️', count: 42 },
          { id: 5, title: 'Family Gatherings', description: 'Spacious venues for family get-togethers', icon: '👨‍👩‍👧‍👦', count: 56 }
        ];
        logApiCall(`Using ${fallbackCategories.length} fallback categories`);
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Step 2: Fetch venues when category is selected
  useEffect(() => {
    if (selectedCategory) {
      const fetchVenues = async () => {
        setLoading(true);
        try {
          const venues = await EventService.getVenuesByCategory(selectedCategory.id);
          console.log('Fetched venues:', venues);
          setVenues(venues);
        } catch (error) {
          console.error('Error fetching venues:', error);
          setError('Failed to load venues for this category');
          // Add fallback venues if API fails
          setVenues([
            {
              _id: 'venue-1',
              name: 'Grand Ballroom',
              description: 'A luxurious venue for your special event',
              image: 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
              price: 50000,
              capacity: '200-500 guests',
              location: 'Mumbai',
              amenities: ['Catering', 'Decoration', 'Parking', 'AC', 'WiFi']
            },
            {
              _id: 'venue-2',
              name: 'Seaside Resort',
              description: 'Beautiful beachfront venue with stunning views',
              image: 'https://images.pexels.com/photos/265980/pexels-photo-265980.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
              price: 35000,
              capacity: '100-300 guests',
              location: 'Goa',
              amenities: ['Catering', 'Parking', 'AC', 'Swimming Pool']
            }
          ]);
        } finally {
          setLoading(false);
        }
      };

      fetchVenues();
    }
  }, [selectedCategory]);

  // More robust category selection handler using useCallback
  const handleCategorySelect = useCallback((category) => {
    if (!category || !category.id) {
      console.error('Invalid category selected:', category);
      setError('Invalid category selected. Please try again.');
      return;
    }
    
    console.log('Category selected:', category);
    setSelectedCategory(category);
    setEventData(prev => ({
      ...prev,
      categoryId: category.id
    }));
    
    // Force update using setTimeout to ensure state updates complete
    setTimeout(() => {
      setCurrentStep(2);
      console.log('Current step set to:', 2);
    }, 0);
  }, []);

  const handleVenueSelect = (venue) => {
    console.log('Selected venue:', venue);
    setSelectedVenue(venue);
    setEventData(prev => ({
      ...prev,
      venueId: venue._id,
      // Store the complete venue object as well for easier access
      venue: {
        _id: venue._id,
        name: venue.name,
        location: venue.location,
        price: venue.price,
        capacity: venue.capacity,
        amenities: venue.amenities || [],
        images: venue.images || []
      }
    }));
    setCurrentStep(3);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Format the data properly for the backend
      const formattedEventData = {
        ...eventData,
        // Ensure date is in proper format
        date: new Date(eventData.date),
        // Make sure venue ID is properly included
        venueId: selectedVenue._id,
        // Include complete venue details to ensure all data is stored
        venue: {
          _id: selectedVenue._id,
          name: selectedVenue.name,
          location: selectedVenue.location,
          price: selectedVenue.price,
          capacity: selectedVenue.capacity,
          description: selectedVenue.description || '',
          amenities: selectedVenue.amenities || [],
          images: selectedVenue.images || [],
          // Include any other venue fields that might be needed for booking
          address: selectedVenue.address,
          city: selectedVenue.city
        },
        // Add the venue location as the event location
        location: selectedVenue.location,
        // Set a name field that matches the title (for compatibility)
        name: eventData.title
      };

      console.log('Creating event with data:', formattedEventData);
      
      // Use the EventService instead of direct axios call
      const response = await EventService.createEvent(formattedEventData);
      console.log('Event created successfully:', response);
      
      alert('Event created successfully!');
      navigate('/organizer/dashboard');
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoriesStep = () => (
    <div className="categories-container">
      <h2 className="text-2xl font-bold mb-4">Select Event Category</h2>
      <p className="mb-4">Choose a category for your event to find suitable venues:</p>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="loader"></div>
        </div>
      ) : error ? (
        <div className="error-message p-4 bg-red-100 text-red-700 rounded">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.length > 0 ? (
            categories.map(category => (
              <div 
                key={category.id} 
                className="category-card p-4 border rounded-lg cursor-pointer hover:shadow-lg transition hover:border-blue-500 active:bg-blue-50"
                onClick={() => handleCategorySelect(category)}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-center mb-2">
                  <span className="text-3xl mr-2">{category.icon || '🎭'}</span>
                  <h3 className="text-xl font-semibold">{category.title}</h3>
                </div>
                <p className="text-gray-600">{category.description}</p>
                <p className="mt-2 text-sm text-gray-500">{category.count || 0} venues available</p>
                
                <div className="mt-3 text-right">
                  <button 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategorySelect(category);
                    }}
                  >
                    Select Category →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center p-8">
              <p className="mb-4">No categories found. Please check your backend connection.</p>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderVenuesStep = () => (
    <div className="venues-container">
      <div className="flex items-center mb-4">
        <button 
          className="mr-4 flex items-center text-blue-600 hover:underline"
          onClick={() => setCurrentStep(1)}
        >
          <FaArrowLeft className="mr-1" /> Back to Categories
        </button>
        <h2 className="text-2xl font-bold">Select a Venue for {selectedCategory?.title}</h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="loader"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : venues.length === 0 ? (
        <div className="text-center p-8">
          <p className="mb-4">No venues available for this category.</p>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setCurrentStep(1)}
          >
            Choose Another Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map(venue => (
            <div 
              key={venue._id} 
              className="venue-card border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition"
              onClick={() => handleVenueSelect(venue)}
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={venue.image || 'https://via.placeholder.com/400x200?text=Venue'} 
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{venue.name}</h3>
                <p className="text-gray-600 mb-2">{venue.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    <strong>Capacity:</strong> {venue.capacity}
                  </span>
                  <span className="text-gray-700">
                    <strong>Price:</strong> ₹{venue.price}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  <strong>Location:</strong> {venue.location}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {venue.amenities && venue.amenities.slice(0, 3).map(amenity => (
                    <span key={amenity} className="bg-gray-200 text-xs px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                  {venue.amenities && venue.amenities.length > 3 && (
                    <span className="bg-gray-200 text-xs px-2 py-1 rounded">
                      +{venue.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEventDetailsStep = () => (
    <div className="event-details-container">
      <div className="flex items-center mb-4">
        <button 
          className="mr-4 flex items-center text-blue-600 hover:underline"
          onClick={() => setCurrentStep(2)}
        >
          <FaArrowLeft className="mr-1" /> Back to Venues
        </button>
        <h2 className="text-2xl font-bold">Create Event at {selectedVenue?.name}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="title" className="block mb-1 font-medium">Event Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={eventData.title}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
                placeholder="Enter event title"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description" className="block mb-1 font-medium">Description</label>
              <textarea
                id="description"
                name="description"
                value={eventData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full p-2 border rounded"
                placeholder="Describe your event"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="date" className="block mb-1 font-medium">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time" className="block mb-1 font-medium">Time</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={eventData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="price" className="block mb-1 font-medium">Ticket Price (₹)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={eventData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full p-2 border rounded"
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="capacity" className="block mb-1 font-medium">Capacity</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={eventData.capacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full p-2 border rounded"
                  placeholder="Number of attendees"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="imageUrl" className="block mb-1 font-medium">Event Image URL</label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={eventData.imageUrl}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-sm text-gray-500 mt-1">Leave blank to use venue image</p>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="venue-summary bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Selected Venue</h3>
          
          {selectedVenue && (
            <div>
              <img 
                src={selectedVenue.image || 'https://via.placeholder.com/400x200?text=Venue'} 
                alt={selectedVenue.name}
                className="w-full h-32 object-cover rounded mb-3"
              />
              <h4 className="font-medium">{selectedVenue.name}</h4>
              <p className="text-sm text-gray-600">{selectedVenue.location}</p>
              <div className="mt-2 text-sm">
                <div><strong>Capacity:</strong> {selectedVenue.capacity}</div>
                <div><strong>Price:</strong> ₹{selectedVenue.price}</div>
              </div>
              
              {selectedVenue.amenities && selectedVenue.amenities.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium">Amenities:</h5>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedVenue.amenities.map(amenity => (
                      <span key={amenity} className="bg-gray-200 text-xs px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t">
            <h3 className="text-lg font-semibold mb-2">Category</h3>
            <div className="flex items-center">
              <span className="text-2xl mr-2">{selectedCategory?.icon || '🎭'}</span>
              <div>
                <h4 className="font-medium">{selectedCategory?.title}</h4>
                <p className="text-xs text-gray-600">{selectedCategory?.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center my-8">
      <div className={`step-circle ${currentStep >= 1 ? 'active' : ''}`}>
        <FaCalendarAlt />
        <span className="step-label">Category</span>
      </div>
      <div className="step-line"></div>
      <div className={`step-circle ${currentStep >= 2 ? 'active' : ''}`}>
        <FaBuilding />
        <span className="step-label">Venue</span>
      </div>
      <div className="step-line"></div>
      <div className={`step-circle ${currentStep >= 3 ? 'active' : ''}`}>
        <FaCheckCircle />
        <span className="step-label">Create Event</span>
      </div>
    </div>
  );

  return (
    <div className="organizer-event-flow container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Create New Event</h1>
      
      {/* Debug toggle button - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded text-xs flex items-center"
          >
            <FaBug className="mr-1" /> {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>
      )}
      
      {showDebug && (
        <DebugPanel 
          title="Component State" 
          data={{
            currentStep,
            selectedCategory,
            selectedVenue,
            categoriesCount: categories.length,
            venuesCount: venues.length,
            error,
            loading
          }} 
        />
      )}
      
      {renderStepIndicator()}
      
      <div className="content-container">
        {currentStep === 1 && renderCategoriesStep()}
        {currentStep === 2 && renderVenuesStep()}
        {currentStep === 3 && renderEventDetailsStep()}
      </div>
      
      {showDebug && apiLogs.length > 0 && (
        <DebugPanel title="API Logs" data={apiLogs} />
      )}
      
      <style jsx>{`
        .step-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: #6b7280;
        }
        
        .step-circle.active {
          background-color: #3b82f6;
          color: white;
        }
        
        .step-line {
          height: 2px;
          width: 80px;
          background-color: #e5e7eb;
          margin: 0 10px;
        }
        
        .step-label {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 5px;
          font-size: 12px;
          white-space: nowrap;
        }
        
        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EventCategoryVenueFlowWithErrorBoundary; 
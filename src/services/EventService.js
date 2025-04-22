import ApiService from './ApiService';
import ConfigService from './ConfigService';
import AuthService from './AuthService';
import axios from 'axios';

/**
 * EventService provides methods for interacting with event and venue related API endpoints
 */
class EventService {
  /**
   * Fetch all events from the API
   * @returns {Promise<Array>} List of events
   */
  static async getAllEvents() {
    try {
      console.log('Making request to fetch all events');
      // Use ApiService instead of direct axios
      const response = await ApiService.get('/api/events');
      console.log('Events fetched successfully:', response);
      
      // Debug: Log some image paths from the response
      if (response && response.length > 0) {
        response.forEach((event, index) => {
          if (index < 5) { // Limit to first 5 events to avoid too much logging
            console.log(`Event ${event._id || index} - Image path:`, event.image);
          }
        });
      }
      
      return response || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      
      // Handle different types of errors with specific messages
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('Network error detected. Backend server may not be running.');
      } else if (error.response && error.response.status === 500) {
        console.warn('Server error (500) detected. Backend may have internal issues.');
      } else if (error.response && error.response.status === 404) {
        console.warn('Not found (404) error detected. API endpoint may not exist.');
      }
      
      // No fallback to mock data - throw the error
      throw error;
    }
  }

  /**
   * Fetch events by category ID
   * @param {string} categoryId The category ID to filter events by
   * @returns {Promise<Array>} List of events matching the category
   */
  static async getEventsByCategory(categoryId) {
    try {
      const response = await ApiService.get(`/api/events/category/${categoryId}`);
      return response || [];
    } catch (error) {
      console.error(`Error fetching events for category ${categoryId}:`, error);
      return [];
    }
  }

  /**
   * Fetch event categories
   * @returns {Promise<Array>} List of event categories
   */
  static async getEventCategories() {
    try {
      console.log('Requesting event categories...');
      
      // Try first with the API path, then with legacy path if the first one fails
      try {
        const response = await ApiService.get('/api/categories');
        console.log('Categories fetched successfully from /api/categories:', response);
        return response || [];
      } catch (firstError) {
        console.warn('Error fetching from /api/categories, trying legacy path:', firstError.message);
        const response = await ApiService.get('/category');
        console.log('Categories fetched successfully from legacy path:', response);
        return response || [];
      }
    } catch (error) {
      console.error('Error fetching event categories (all attempts failed):', error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('Network error - is the backend running?');
        throw new Error('Could not connect to the server. Please make sure the backend server is running on port 3200.');
      }
      
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Fetch venues by event ID
   * @param {string} eventId The event ID to filter venues by
   * @returns {Promise<Array>} List of venues for this event
   */
  static async getVenuesByEvent(eventId) {
    try {
      const response = await ApiService.get(`/api/events/${eventId}/venues`);
      return response || [];
    } catch (error) {
      console.error(`Error fetching venues for event ${eventId}:`, error);
      return [];
    }
  }

  /**
   * Fetch venues by event category
   * @param {number} categoryId The category ID to filter venues by
   * @returns {Promise<Array>} List of venues for this category
   */
  static async getVenuesByCategory(categoryId) {
    try {
      console.log(`Requesting venues for category ${categoryId}...`);
      
      // Try first with the API path, then with legacy path if the first one fails
      try {
        const response = await ApiService.get(`/api/venues/event/${categoryId}`);
        console.log(`Venues fetched successfully from API path for category ${categoryId}:`, response);
        return response || [];
      } catch (firstError) {
        console.warn(`Error fetching from API path for category ${categoryId}, trying legacy path:`, firstError.message);
        const response = await ApiService.get(`/venue/event/${categoryId}`);
        console.log(`Venues fetched successfully from legacy path for category ${categoryId}:`, response);
        return response || [];
      }
    } catch (error) {
      console.error(`Error fetching venues for category ${categoryId} (all attempts failed):`, error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('Network error - is the backend running?');
        throw new Error('Could not connect to the server. Please make sure the backend server is running on port 3200.');
      }
      
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Get all venues
   * @returns {Promise<Array>} List of all venues
   */
  static async getAllVenues() {
    try {
      console.log('Fetching all venues');
      const response = await ApiService.get('/api/venues');
      return response || [];
    } catch (error) {
      console.error('Error fetching all venues:', error);
      
      // No fallback to mock data - throw the error
      throw error;
    }
  }
  
  /**
   * Get details for a specific venue
   * @param {string} venueId The venue ID
   * @returns {Promise<Object>} Venue details
   */
  static async getVenueDetails(venueId) {
    try {
      console.log(`Requesting venue details for ID: ${venueId}`);
      const response = await ApiService.get(`/api/venues/${venueId}`);
      return response || null;
    } catch (error) {
      console.error(`Error fetching venue ${venueId}:`, error);
      
      // If venue not found (404) but there are alternative venues
      if (error.response && error.response.status === 404 && error.response.data.alternativeVenues) {
        console.log(`Venue with ID ${venueId} not found, but alternatives are available:`, error.response.data.alternativeVenues);
        
        // Return the first alternative venue if available
        if (error.response.data.alternativeVenues.length > 0) {
          console.log("Using first alternative venue");
          return error.response.data.alternativeVenues[0];
        }
      }
      
      // If venue not found (404) and ID is numeric, use fallback data
      if (error.response && error.response.status === 404) {
        console.log(`Venue with ID ${venueId} not found`);
        return null;
      }
      
      return null;
    }
  }

  /**
   * Search venues by keyword
   * @param {string} searchTerm The search keyword
   * @returns {Promise<Array>} List of venues matching the search term
   */
  static async searchVenues(searchTerm) {
    try {
      const response = await ApiService.get('/api/venues/search', { term: searchTerm });
      return response || [];
    } catch (error) {
      console.error(`Error searching venues with term "${searchTerm}":`, error);
      return [];
    }
  }

  /**
   * Filter venues by multiple criteria
   * @param {Object} filters Object containing filter criteria
   * @returns {Promise<Array>} Filtered list of venues
   */
  static async filterVenues(filters) {
    try {
      const response = await ApiService.get('/api/venues/filter', filters);
      return response || [];
    } catch (error) {
      console.error('Error filtering venues:', error);
      return [];
    }
  }
  
  /**
   * Get venues by category and location
   * @param {number} categoryId The category ID to filter venues by
   * @param {string} location The location to filter venues by (optional)
   * @returns {Promise<Array>} List of venues matching the criteria
   */
  static async getVenuesByCategoryAndLocation(categoryId, location = null) {
    try {
      const params = { categoryId };
      if (location && location !== 'All Locations') {
        params.location = location;
      }
      
      const response = await ApiService.get('/api/events/venues/filter', params);
      return response || [];
    } catch (error) {
      console.error(`Error fetching venues for category ${categoryId} and location ${location || 'any'}:`, error);
      return [];
    }
  }

  /**
   * Create a new event
   * @param {Object} eventData The event data to create
   * @returns {Promise<Object>} The created event
   */
  static async createEvent(eventData) {
    try {
      // Get organizer ID from session storage
      const organizerId = sessionStorage.getItem('id');
      if (!organizerId) {
        console.warn('No organizer ID found in session storage');
        throw new Error('You must be logged in as an organizer to create events');
      }
      
      // Add organizer ID to the event data
      const eventWithOrganizer = {
        ...eventData,
        userId: organizerId,
        organizer: organizerId
      };
      
      // Add a unique pincode to fix the MongoDB duplicate key error
      const uniquePincode = parseInt(Date.now().toString().slice(-9));
      eventWithOrganizer.pincode = uniquePincode;
      
      // Also add the pincode to venue if present
      if (eventWithOrganizer.venue) {
        eventWithOrganizer.venue.pincode = uniquePincode;
      }
      
      console.log('Creating event with data:', eventWithOrganizer);
      const response = await ApiService.post('/api/events', eventWithOrganizer);
      return response;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Create a new venue
   * @param {Object} venueData Venue data to be saved
   * @returns {Promise<Object>} Created venue data
   */
  static async createVenue(venueData) {
    try {
      // Ensure price is a number
      if (venueData.price && typeof venueData.price === 'string') {
        venueData.price = parseInt(venueData.price);
      }
      
      // Ensure suitableEvents contains numbers
      if (venueData.suitableEvents && Array.isArray(venueData.suitableEvents)) {
        venueData.suitableEvents = venueData.suitableEvents.map(id => 
          typeof id === 'string' ? parseInt(id) : id
        );
      }
      
      // Use ApiService which will automatically include the auth token
      const response = await ApiService.post('/api/venues', venueData);
      return response || null;
    } catch (error) {
      console.error('Error creating venue:', error);
      throw error;
    }
  }

  /**
   * Update an existing event
   * @param {string} eventId Event ID to update
   * @param {Object} eventData Updated event data
   * @returns {Promise<Object>} Updated event data
   */
  static async updateEvent(eventId, eventData) {
    try {
      console.log(`Updating event ${eventId} with data:`, eventData);
      
      // Check if we have a FormData object for handling file uploads
      if (eventData.formData) {
        try {
          // We have form data with files, use multipart/form-data approach
          const formData = eventData.formData;
          
          // Add the event ID to the form data
          formData.append('_id', eventId);
          
          // Make sure status is included
          if (!formData.get('status')) {
            formData.append('status', 'active');
          }
          
          // Use ApiService to send multipart/form-data
          console.log('Attempting to update event with images');
          const response = await ApiService.putFormData(`/api/events/${eventId}/with-images`, formData);
          console.log(`Event ${eventId} update with images response:`, response);
          return response || null;
        } catch (uploadError) {
          // If we get a 404, the endpoint might not exist yet
          if (uploadError.response && uploadError.response.status === 404) {
            console.warn('Image upload endpoint not found. Falling back to standard update method.');
            
            // Extract standard fields from FormData for a regular update
            const standardData = {
              name: eventData.formData.get('name'),
              eventType: eventData.formData.get('eventType'),
              date: eventData.formData.get('date'),
              capacity: eventData.formData.get('capacity') ? parseInt(eventData.formData.get('capacity')) : undefined,
              price: eventData.formData.get('price') ? parseInt(eventData.formData.get('price')) : undefined,
              description: eventData.formData.get('description'),
              status: eventData.formData.get('status') || 'active',
              cityName: eventData.formData.get('cityName'),
              areaName: eventData.formData.get('areaName'),
              venueName: eventData.formData.get('venueName'),
              venueAddress: eventData.formData.get('venueAddress'),
              // Keep existing venue data but update with form values
              venue: {
                ...eventData.venue,
                name: eventData.formData.get('venueName') || eventData.venue?.name,
                address: eventData.formData.get('venueAddress') || eventData.venue?.address,
                // Explicitly preserve the venue image
                image: eventData.venue?.image
              },
              location: eventData.formData.get('venueAddress') || 
                        eventData.formData.get('cityName') || 
                        eventData.location || '',
              city: eventData.formData.get('cityName') || eventData.city || '',
              area: eventData.formData.get('areaName') || eventData.area || ''
            };
            
            console.log('Falling back to standard update with data:', standardData);
            
            // Fall back to the standard update method
            const standardResponse = await ApiService.put(`/api/events/${eventId}`, standardData);
            console.log(`Fallback event update response:`, standardResponse);
            return standardResponse;
          } else {
            // For other errors, rethrow
            throw uploadError;
          }
        }
      } else {
        // Regular update without files - use the standard approach
        // Ensure status is included in the update
        const dataToUpdate = {
          ...eventData,
          status: eventData.status || 'active' // Default to active if not provided
        };
        
        // Use ApiService which will automatically include the auth token
        const response = await ApiService.put(`/api/events/${eventId}`, dataToUpdate);
        console.log(`Event ${eventId} update response:`, response);
        
        return response || null;
      }
    } catch (error) {
      console.error(`Error updating event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Delete an event
   * @param {string} eventId Event ID to delete
   * @returns {Promise<Object>} Response data
   */
  static async deleteEvent(eventId) {
    try {
      // Use ApiService which will automatically include the auth token
      const response = await ApiService.delete(`/api/events/${eventId}`);
      return response || { success: true };
    } catch (error) {
      console.error(`Error deleting event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Get pending booking requests for an organizer
   * @returns {Promise<Array>} List of pending booking requests
   */
  static async getPendingBookings() {
    try {
      const response = await ApiService.get('/booking/pending');
      return response || [];
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      return [];
    }
  }

  /**
   * Approve or reject a booking request
   * @param {string} bookingId Booking ID to approve/reject
   * @param {boolean} approved Whether to approve the booking
   * @param {string} reason Reason for rejection (only needed if approved is false)
   * @returns {Promise<Object>} Updated booking data
   */
  static async approveBooking(bookingId, approved, reason = '') {
    try {
      const response = await ApiService.put(`/booking/approve/${bookingId}`, {
        approved,
        reason
      });
      return response || null;
    } catch (error) {
      console.error(`Error ${approved ? 'approving' : 'rejecting'} booking ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Delete all events (admin only)
   * @returns {Promise<Object>} Response data
   */
  static async deleteAllEvents() {
    try {
      // First clear all related data from localStorage
      localStorage.removeItem('organizer_events');
      localStorage.removeItem('events');
      // Remove the sample_events reference
      localStorage.removeItem('eventCategories');
      localStorage.removeItem('venues');
      localStorage.removeItem('selectedCategoryId');
      localStorage.removeItem('selectedCategoryTitle');
      
      // Also clear sessionStorage
      sessionStorage.removeItem('selectedCategoryId');
      sessionStorage.removeItem('selectedCategoryTitle');
      sessionStorage.removeItem('events');
      
      // Then try to use the API to delete server-side events
      try {
        // Use ApiService which will automatically include the auth token
        const response = await ApiService.delete('/api/events/admin/all');
        return response || { success: true, message: 'All events deleted successfully' };
      } catch (apiError) {
        console.warn('API request to delete all events failed:', apiError.message);
        // Return error since we shouldn't use local fallbacks
        throw apiError;
      }
    } catch (error) {
      console.error('Error in deleteAllEvents:', error);
      throw error;
    }
  }

  // Helper method to check if a string looks like a MongoDB ObjectId
  static isValidObjectId(id) {
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    return objectIdPattern.test(id);
  }

  /**
   * Fetch event by ID
   * @param {string} eventId The event ID to fetch
   * @returns {Promise<Object>} Event details
   */
  static async getEventById(eventId) {
    try {
      console.log(`Requesting event details for ID: ${eventId}`);
      
      // Try first with the API path, then with legacy path if the first one fails
      try {
        const response = await ApiService.get(`/api/events/${eventId}`);
        console.log(`Event details fetched successfully from API path for ID ${eventId}:`, response);
        
        // Process organizer data if it's an ID
        if (response && response.organizer && (typeof response.organizer === 'string') && 
            this.isValidObjectId(response.organizer)) {
          try {
            // Try to get user info from AuthService cache/storage
            const currentUser = AuthService.getUser();
            
            // If organizer ID matches current user, use current user's name
            if (currentUser && currentUser._id === response.organizer) {
              response.organizer = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'You';
            } else {
              // Otherwise, try to get organizer info from userId field if it's populated
              if (response.userId && response.userId.firstName) {
                response.organizer = `${response.userId.firstName || ''} ${response.userId.lastName || ''}`.trim();
              } else {
                // If no name is found, use a default name
                if (!response.organizer || response.organizer.trim().length === 0) {
                  response.organizer = 'Event Organizer';
                }
              }
            }
          } catch (err) {
            console.error('Error formatting organizer name:', err);
            response.organizer = 'Event Organizer';
          }
        }
        
        return response || null;
      } catch (firstError) {
        console.warn(`Error fetching from API path for event ${eventId}, trying legacy path:`, firstError.message);
        const response = await ApiService.get(`/event/${eventId}`);
        console.log(`Event details fetched successfully from legacy path for ID ${eventId}:`, response);
        
        // Apply the same organizer name formatting for legacy path
        if (response && response.organizer && (typeof response.organizer === 'string')) {
          if (!response.organizer || response.organizer.trim().length === 0) {
            response.organizer = 'Event Organizer';
          }
        }
        
        return response || null;
      }
    } catch (error) {
      console.error(`Error fetching event ${eventId} (all attempts failed):`, error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.error('Network error - is the backend running?');
        throw new Error('Could not connect to the server. Please make sure the backend server is running on port 3200.');
      }
      
      // Return null if event not found
      return null;
    }
  }

  /**
   * Format eventType for consistency between frontend and backend
   * @param {string} eventType The event type to format
   * @param {string} venueName Optional venue name to help determine correct event type
   * @returns {string} Formatted event type
   */
  static formatEventType(eventType, venueName = '') {
    if (!eventType && !venueName) return 'Wedding';
    
    // First check if venue name contains corporate
    if (venueName && venueName.toString().toLowerCase().includes('corporate')) {
      console.log(`Venue name "${venueName}" contains "corporate", setting event type to Corporate Event`);
      return 'Corporate Event';
    }
    
    // Then check event type
    if (!eventType) return 'Wedding';
    
    const lowerType = eventType.toString().toLowerCase().trim();
    
    if (lowerType === 'corporate' || lowerType.includes('corporate')) {
      return 'Corporate Event';
    } else if (lowerType.includes('wedding')) {
      return 'Wedding';
    } else if (lowerType.includes('birthday')) {
      return 'Birthday Party';
    } else if (lowerType.includes('conference')) {
      return 'Conference';
    } else if (lowerType.includes('anniversary')) {
      return 'Anniversary';
    }
    
    return eventType;
  }

  /**
   * Book an event 
   * @param {Object} bookingData Event booking details
   * @returns {Promise<Object>} Booking response
   */
  static async bookEvent(bookingData) {
    try {
      console.log('Booking event with data:', bookingData);
      
      // Extract data we need for API
      const userId = bookingData.userId;
      const eventId = bookingData.eventId;
      const startDate = new Date(bookingData.startDate);
      const endDate = new Date(bookingData.endDate);
      const numberOfDays = bookingData.numberOfDays || 1;
      const basePrice = bookingData.basePrice || 0;
      const serviceFee = bookingData.serviceFee || 0;
      const gstAmount = bookingData.gstAmount || 0;
      const totalAmount = bookingData.totalAmount || basePrice + serviceFee + gstAmount;
      
      if (!userId) {
        throw new Error('User ID is required for booking');
      }
      
      if (!eventId) {
        throw new Error('Event ID is required for booking');
      }
      
      // Format the event type correctly based on venue name and provided event type
      const venueName = bookingData.venueTitle || bookingData.venue?.name || bookingData.eventTitle || "";
      const formattedEventType = this.formatEventType(bookingData.eventType, venueName);
      console.log(`Event type formatted: '${bookingData.eventType}' → '${formattedEventType}' (venue: '${venueName}')`);
      
      // Prepare the data in the format the backend expects
      const formattedData = {
        userId: bookingData.userId,
        eventId: bookingData.eventId,
        venueId: bookingData.venueId || bookingData.venue?._id || bookingData.eventId || "event_venue", // Required by schema
        venueName: bookingData.venueTitle || bookingData.venue?.name || bookingData.eventTitle || "Event Venue", // Required by schema
        venueImage: bookingData.image || bookingData.venue?.images?.[0] || "",
        bookingDate: new Date(), // Current date as booking date
        eventDate: startDate, // Start date for the event
        endDate: endDate, // End date (might be same as start for single-day events)
        numberOfDays: numberOfDays,
        startTime: bookingData.startTime || "10:00 AM",
        endTime: bookingData.endTime || "01:00 PM",
        eventType: formattedEventType,
        guestCount: parseInt(bookingData.numberOfGuests) || 1,
        totalAmount: totalAmount,
        basePrice: basePrice,
        serviceFee: serviceFee,
        gstAmount: gstAmount,
        specialRequests: bookingData.additionalRequests || "",
        contactName: bookingData.name,
        contactEmail: bookingData.email,
        contactPhone: bookingData.phone,
        location: bookingData.location || bookingData.venue?.location || "",
        inclusions: bookingData.inclusions || bookingData.venue?.inclusions || ['Basic decoration', 'Sound system', 'Parking space', 'Backup power'],
        exclusions: bookingData.exclusions || bookingData.venue?.exclusions || ['Food & beverages', 'Custom decoration', 'Photography'],
        cancellationPolicy: bookingData.cancellationPolicy || bookingData.venue?.cancellationPolicy || {
          fullRefund: 7,
          partialRefund: 3,
          partialRefundPercent: 50
        },
        // Store complete venue data
        venue: bookingData.venue || {
          _id: bookingData.venueId,
          name: bookingData.venueTitle,
          description: "",
          location: bookingData.location,
          price: basePrice
        }
      };
      
      console.log('Formatted event booking data:', formattedData);
      
      // Use ApiService post method which handles auth headers
      const response = await ApiService.post('/booking/create', formattedData);
      return response;
    } catch (error) {
      console.error('Error booking event:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error
        const errorMsg = error.response.data.message || 'Failed to book event';
        throw new Error(errorMsg);
      } else if (error.request) {
        // No response received
        throw new Error('No response from server. Please check your internet connection.');
      } else {
        // Request setup error
        throw error;
      }
    }
  }
  
  /**
   * Book a venue
   * @param {Object} bookingData Venue booking details
   * @returns {Promise<Object>} Booking response
   */
  static async bookVenue(bookingData) {
    try {
      console.log('Booking venue with data:', bookingData);
      
      // Extract data we need for API
      const userId = bookingData.userId;
      const venueId = bookingData.venueId;
      const startDate = new Date(bookingData.startDate);
      const endDate = new Date(bookingData.endDate);
      const numberOfDays = bookingData.numberOfDays || 1;
      const basePrice = bookingData.basePrice || 0;
      const serviceFee = bookingData.serviceFee || 0;
      const gstAmount = bookingData.gstAmount || 0;
      const totalAmount = bookingData.totalAmount || basePrice + serviceFee + gstAmount;
      
      if (!userId) {
        throw new Error('User ID is required for booking');
      }
      
      if (!venueId) {
        throw new Error('Venue ID is required for booking');
      }
      
      // Format the event type correctly based on venue name and provided event type
      const venueName = bookingData.venueTitle || bookingData.venue?.name || "";
      const formattedEventType = this.formatEventType(bookingData.eventType, venueName);
      console.log(`Event type formatted: '${bookingData.eventType}' → '${formattedEventType}' (venue: '${venueName}')`);
      
      // Prepare the data in the format the backend expects
      const formattedData = {
        userId: bookingData.userId,
        eventId: null, // No event for venue booking
        venueId: bookingData.venueId || bookingData.venue?._id || "venue_id",
        venueName: bookingData.venueTitle || bookingData.venue?.name || "Venue",
        venueImage: bookingData.image || bookingData.venue?.images?.[0] || "",
        bookingDate: new Date(), // Current date as booking date
        eventDate: startDate, // Start date for the booking
        endDate: endDate, // End date for the booking
        numberOfDays: numberOfDays,
        startTime: bookingData.startTime || "10:00 AM",
        endTime: bookingData.endTime || "06:00 PM",
        eventType: formattedEventType,
        guestCount: parseInt(bookingData.numberOfGuests) || 2,
        totalAmount: totalAmount,
        basePrice: basePrice,
        serviceFee: serviceFee,
        gstAmount: gstAmount,
        specialRequests: bookingData.additionalRequests || "",
        contactName: bookingData.name,
        contactEmail: bookingData.email,
        contactPhone: bookingData.phone,
        location: bookingData.location || bookingData.venue?.location || "",
        inclusions: bookingData.inclusions || bookingData.venue?.inclusions || ['Basic decoration', 'Sound system', 'Parking space', 'Backup power'],
        exclusions: bookingData.exclusions || bookingData.venue?.exclusions || ['Food & beverages', 'Custom decoration', 'Photography'],
        cancellationPolicy: bookingData.cancellationPolicy || bookingData.venue?.cancellationPolicy || {
          fullRefund: 7,
          partialRefund: 3,
          partialRefundPercent: 50
        },
        // Store complete venue data
        venue: bookingData.venue || {
          _id: bookingData.venueId,
          name: bookingData.venueTitle,
          description: "",
          location: bookingData.location,
          price: basePrice
        }
      };
      
      console.log('Formatted venue booking data:', formattedData);
      
      // Use ApiService post method which handles auth headers
      const response = await ApiService.post('/booking/create', formattedData);
      return response;
    } catch (error) {
      console.error('Error booking venue:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error
        const errorMsg = error.response.data.message || 'Failed to book venue';
        throw new Error(errorMsg);
      } else if (error.request) {
        // No response received
        throw new Error('No response from server. Please check your internet connection.');
      } else {
        // Request setup error
        throw error;
      }
    }
  }
  
  /**
   * Toggle interest in an event or venue
   * @param {string} itemId ID of the event or venue
   * @param {string} itemType Type of item ('event' or 'venue')
   * @returns {Promise<Object>} Response data
   */
  static async toggleInterest(itemId, itemType='event') {
    try {
      const token = AuthService.getToken();
      
      if (!token) {
        throw new Error('Authentication required to show interest');
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Ensure itemType is lowercase
      const type = itemType.toLowerCase();
      const response = await axios.post(`${ConfigService.getApiUrl()}/api/interest/${type}/${itemId}`, {}, config);
      return response.data;
    } catch (error) {
      console.error(`Error toggling interest for ${itemType} ${itemId}:`, error);
      throw error;
    }
  }
  
  /**
   * Check if user is interested in an item
   * @param {string} itemId ID of the event or venue
   * @param {string} itemType Type of item ('event' or 'venue')
   * @returns {Promise<boolean>} Whether the user is interested
   */
  static async checkInterest(itemId, itemType='event') {
    try {
      const token = AuthService.getToken();
      
      if (!token) {
        return false;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Ensure itemType is lowercase
      const type = itemType.toLowerCase();
      const response = await axios.get(`${ConfigService.getApiUrl()}/api/interest/${type}/${itemId}/check`, config);
      return response.data.interested || false;
    } catch (error) {
      console.error(`Error checking interest for ${itemType} ${itemId}:`, error);
      return false;
    }
  }

  /**
   * Get events created by the current logged-in organizer
   * @returns {Promise<Array>} List of events created by the current organizer
   */
  static async getOrganizerEvents() {
    try {
      // Get the current organizer's ID from session storage
      const organizerId = sessionStorage.getItem('id');
      const token = AuthService.getToken();
      
      // If no organizer ID or token is found, return empty array
      if (!organizerId) {
        console.warn('No organizer ID found in session storage');
        return [];
      }
      
      if (!token) {
        console.warn('No auth token found, user may not be authenticated');
        return [];
      }
      
      console.log(`Fetching events for organizer ID: ${organizerId}`);
      
      // Make sure ApiService has the token before making the request
      ApiService.setAuthToken(token);
      
      const response = await ApiService.get('/api/events/organizer');
      console.log('Organizer events response:', response);
      return response || [];
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      // Return empty array instead of throwing the error to prevent UI crashes
      return [];
    }
  }

  /**
   * Get upcoming events
   * @param {number} limit - Number of events to fetch
   * @returns {Promise<Array>} List of upcoming events
   */
  static async getUpcomingEvents(limit = 5) {
    try {
      const response = await ApiService.get('/api/events/upcoming', { limit });
      return response || [];
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  /**
   * Get event statistics
   * @returns {Promise<Object>} Event statistics
   */
  static async getEventStats() {
    try {
      const response = await ApiService.get('/api/events/stats');
      return response || {
        totalEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0
      };
    } catch (error) {
      console.error('Error fetching event statistics:', error);
      throw error;
    }
  }

  /**
   * Get details for a specific event
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Event details
   */
  static async getEventDetails(eventId) {
    try {
      const response = await ApiService.get(`/api/events/${eventId}`);
      return response || null;
    } catch (error) {
      console.error(`Error fetching event details for ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Get bookings for a specific event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} List of bookings for the event
   */
  static async getEventBookings(eventId) {
    try {
      const response = await ApiService.get(`/api/events/${eventId}/bookings`);
      return response || [];
    } catch (error) {
      console.error(`Error fetching bookings for event ${eventId}:`, error);
      throw error;
    }
  }

  static async getVenueById(venueId) {
    try {
      if (!venueId) {
        throw new Error('Venue ID is required');
      }
      
      console.log(`Requesting venue details for ID: ${venueId}`);
      
      // Use ApiService get method which handles auth headers
      const response = await ApiService.get(`/api/venues/${venueId}`);
      console.log(`Venue data received for ID ${venueId}:`, response);
      
      // If backend doesn't yet support inclusions/exclusions, add them
      if (!response.inclusions || !response.exclusions) {
        return {
          ...response,
          inclusions: response.amenities || ['Basic decoration', 'Sound system', 'Parking space', 'Backup power'],
          exclusions: ['Food & beverages', 'Custom decoration', 'Photography'],
          cancellationPolicy: {
            fullRefund: 7, // Days before event for full refund
            partialRefund: 3, // Days before event for partial refund
            partialRefundPercent: 50 // Percentage for partial refund
          },
          serviceFee: 3000,
          gstPercent: 18
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching venue details:', error);
      throw new Error(`Venue not found. Please check the venue ID: ${venueId}`);
    }
  }

  /**
   * Get bookings for the organizer
   * @returns {Promise<Array>} List of bookings for the organizer
   */
  static async getOrganizerBookings() {
    try {
      const userId = AuthService.getUserInfo()?.id;
      if (!userId) {
        console.warn('No user ID found in session storage');
        return [];
      }
      
      console.log('Fetching bookings for organizer ID:', userId);
      
      try {
        // Use ApiService which will automatically include the auth token
        const response = await ApiService.get('/api/organizer/bookings');
        return response || [];
      } catch (apiError) {
        console.warn('API request to get organizer bookings failed:', apiError.message);
        
        // Return empty array instead of mock data
        return [];
      }
    } catch (error) {
      console.error('Error in getOrganizerBookings:', error);
      return [];
    }
  }

  /**
   * Get event category by ID
   * @param {number} categoryId The event category ID
   * @returns {Object|null} The event category object or null if not found
   */
  static getEventCategoryById(categoryId) {
    // Default categories if needed
    const defaultCategories = [
      { id: 1, title: "Wedding" },
      { id: 2, title: "Corporate Event" },
      { id: 3, title: "Birthday Party" },
      { id: 4, title: "Anniversary" },
      { id: 5, title: "Conference" },
      { id: 6, title: "Family Gathering" },
      { id: 7, title: "Engagement" },
      { id: 8, title: "Other" }
    ];
    
    try {
      // First check our cached categories if available
      if (this.eventCategories && this.eventCategories.length > 0) {
        const category = this.eventCategories.find(cat => cat.id === categoryId || cat.categoryId === categoryId);
        if (category) {
          return category;
        }
      }
      
      // Fall back to default categories
      const defaultCategory = defaultCategories.find(cat => cat.id === categoryId);
      if (defaultCategory) {
        return defaultCategory;
      }
      
      // If no match found, return basic object with the ID
      return { id: categoryId, title: `Event Type ${categoryId}` };
    } catch (error) {
      console.error(`Error getting category ${categoryId}:`, error);
      return null;
    }
  }
}

export default EventService; 
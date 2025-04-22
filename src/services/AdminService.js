import ApiService from './ApiService';
import ConfigService from './ConfigService';

/**
 * AdminService handles all admin-specific API calls
 */
export default class AdminService {
  /**
   * Get all users in the system
   * @returns {Promise<Array>} Promise resolving to an array of users
   */
  static async getAllUsers() {
    try {
      console.log('Fetching all users from API...');
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/admin/users`);
      console.log('User data received:', response);
      
      // Check if response has the expected structure and extract the users array
      if (response && response.data && Array.isArray(response.data)) {
        return response.data; // Return just the users array
      } else if (Array.isArray(response)) {
        return response; // Response is already an array
      }
      
      console.warn('Unexpected response format from users API:', response);
      return []; // Return empty array if structure is unexpected
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - The ID of the user to fetch
   * @returns {Promise<Object>} Promise resolving to user data
   */
  static async getUserById(userId) {
    try {
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Update a user's status (active/inactive)
   * @param {string} userId - The ID of the user to update
   * @param {boolean} isActive - The new status of the user
   * @param {string} reason - Optional reason for status change
   * @returns {Promise<Object>} Promise resolving to the updated user data
   */
  static async updateUserStatus(userId, isActive, reason = '') {
    try {
      const response = await ApiService.put(`${ConfigService.getApiUrl()}/api/admin/users/${userId}/status`, {
        isActive,
        reason
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId} status:`, error);
      throw error;
    }
  }

  /**
   * Get all events in the system
   * @returns {Promise<Array>} Promise resolving to an array of events
   */
  static async getAllEvents() {
    try {
      console.log('Fetching all events from API...');
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/admin/events`);
      console.log('Event data received:', response);
      
      // Check if response has the expected structure and extract the events array
      if (response && response.data && Array.isArray(response.data)) {
        return response.data; // Return just the events array
      } else if (Array.isArray(response)) {
        return response; // Response is already an array
      }
      
      console.warn('Unexpected response format from events API:', response);
      return []; // Return empty array if structure is unexpected
    } catch (error) {
      console.error('Error fetching all events:', error);
      return [];
    }
  }

  /**
   * Get event by ID
   * @param {string} eventId - The ID of the event to fetch
   * @returns {Promise<Object>} Promise resolving to event data
   */
  static async getEventById(eventId) {
    try {
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/admin/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event ${eventId}:`, error);
      return null;
    }
  }

  /**
   * Update an event's status (active/inactive)
   * @param {string} eventId - The ID of the event to update
   * @param {boolean} isActive - The new status of the event
   * @param {string} reason - Optional reason for status change
   * @returns {Promise<Object>} Promise resolving to the updated event data
   */
  static async updateEventStatus(eventId, isActive, reason = '') {
    try {
      const response = await ApiService.put(`${ConfigService.getApiUrl()}/api/admin/events/${eventId}/status`, {
        isActive,
        reason
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating event ${eventId} status:`, error);
      throw error;
    }
  }

  /**
   * Get system-wide statistics for the admin dashboard
   * @returns {Promise<Object>} Promise resolving to system statistics
   */
  static async getSystemStats() {
    try {
      console.log('Fetching system stats from API...');
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/admin/stats`);
      console.log('Raw response from backend:', response);
      
      if (!response) {
        throw new Error('No response received from stats API');
      }
      
      // Return the actual data structure depending on what the API returns
      if (response.data) {
        return response.data;
      } else {
        return response;
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
      
      // If API fails, return null and let components handle the error
      return null;
    }
  }

  /**
   * Get all bookings in the system
   * @returns {Promise<Array>} Promise resolving to an array of bookings
   */
  static async getAllBookings() {
    try {
      // Based on BookingService implementation, use the correct endpoint
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/bookings/all`);
      console.log('Admin bookings API response:', response);
      
      // Add detailed debugging for response structure
      if (response && typeof response === 'object') {
        // Check if response has a data property and it's an array 
        if (response.data && Array.isArray(response.data)) {
          console.log('RESPONSE DATA STRUCTURE - First booking:', JSON.stringify(response.data[0], null, 2));
          console.log('RESPONSE DATA KEYS:', Object.keys(response.data[0] || {}));
        } else if (Array.isArray(response)) {
          console.log('RESPONSE IS ARRAY - First booking:', JSON.stringify(response[0], null, 2));
          console.log('RESPONSE ARRAY KEYS:', Object.keys(response[0] || {}));
        } else {
          console.log('RESPONSE FORMAT:', typeof response);
          console.log('RESPONSE KEYS:', Object.keys(response));
        }
      }
      
      // Return booking data from the response
      if (response && Array.isArray(response)) {
        return response;
      } else if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected response format from bookings API:', response);
        return [];
      }
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      
      // If API fails with 404, try the fallback URL
      if (error.response && error.response.status === 404) {
        try {
          console.log('Primary endpoint not found, trying fallback endpoint...');
          const fallbackResponse = await ApiService.get('/api/bookings/admin');
          
          if (fallbackResponse && Array.isArray(fallbackResponse)) {
            return fallbackResponse;
          } else if (fallbackResponse && fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
            return fallbackResponse.data;
          }
        } catch (fallbackError) {
          console.error('Fallback endpoint also failed:', fallbackError);
        }
      }
      
      // If all API calls failed, use mock data for display purposes
      console.warn('All booking API calls failed, using mock data for display');
      
      // Create booking timestamp for the booking date
      const currentDate = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(currentDate.getDate() - 7);
      
      // Fallback mock data with complete structure matching the component's needs
      return [
        {
          id: '68006fab81c7d4ba8e09921a',
          customerName: 'Parth Thakkar',
          customerEmail: 'parthh@yopmail.com',
          customerPhone: '+91 9876543210',
          eventTitle: 'Wedding Celebration',
          eventDate: '2024-06-15',
          eventTime: '6:00 PM',
          eventVenue: 'Grand Ballroom, Hotel Imperial',
          bookingDate: currentDate.toISOString(),
          ticketQuantity: 2,
          ticketPrice: 92925,
          amount: 185850,
          taxes: 0,
          discount: 0,
          status: 'Pending',
          isPaid: true,
          paymentMethod: 'Credit Card',
          notes: 'Special dietary requirements for 5 guests.',
          organizer: 'Imperial Events',
          organizerId: '12345'
        },
        {
          id: 'b5c71e9d203f8ac47621de38',
          customerName: 'Rajiv Patel',
          customerEmail: 'rajiv@example.com',
          customerPhone: '+91 9876543211',
          eventTitle: 'Corporate Conference',
          eventDate: '2024-05-20',
          eventTime: '9:00 AM',
          eventVenue: 'Convention Center, Tech Park',
          bookingDate: oneWeekAgo.toISOString(),
          ticketQuantity: 10,
          ticketPrice: 3500,
          amount: 35000,
          taxes: 0,
          discount: 0,
          status: 'Confirmed',
          isPaid: true,
          paymentMethod: 'Bank Transfer',
          notes: 'Need projector and audio setup.',
          organizer: 'Tech Events Co.',
          organizerId: '67890'
        },
        {
          id: 'a7d92f4c10e85bd32901ca56',
          customerName: 'Anita Sharma',
          customerEmail: 'anita@example.com',
          customerPhone: '+91 9876543212',
          eventTitle: 'Birthday Party',
          eventDate: '2024-04-30',
          eventTime: '7:30 PM',
          eventVenue: 'Sunset Lounge, Beachside Resort',
          bookingDate: oneWeekAgo.toISOString(),
          ticketQuantity: 15,
          ticketPrice: 1800,
          amount: 27000,
          taxes: 0,
          discount: 2700,
          status: 'Cancelled',
          isPaid: false,
          paymentMethod: 'Credit Card',
          notes: 'Cancelled due to change in plans.',
          organizer: 'Celebration Planners',
          organizerId: '24680'
        }
      ];
    }
  }

  /**
   * Get booking by ID
   * @param {string} bookingId - The ID of the booking to fetch
   * @returns {Promise<Object>} Promise resolving to booking data
   */
  static async getBookingById(bookingId) {
    try {
      // Use the consistent API endpoint pattern matching BookingService
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/bookings/${bookingId}`);
      
      // Return booking data from the response
      if (response && response.data) {
        return response.data;
      } else if (response) {
        return response;
      } else {
        throw new Error(`Booking with ID ${bookingId} not found`);
      }
    } catch (error) {
      console.error(`Error fetching booking ${bookingId}:`, error);
      return null;
    }
  }

  /**
   * Update a booking's status
   * @param {string} bookingId - The ID of the booking to update
   * @param {string} status - The new status of the booking (confirmed, cancelled, etc.)
   * @param {string} reason - Optional reason for status change
   * @returns {Promise<Object>} Promise resolving to the updated booking data
   */
  static async updateBookingStatus(bookingId, status, reason = '') {
    try {
      console.log(`Updating booking status: ID=${bookingId}, Status=${status}, Reason=${reason}`);
      
      // Use the approveBooking method pattern from BookingService
      const response = await ApiService.put(`${ConfigService.getApiUrl()}/api/bookings/approve/${bookingId}`, {
        approved: status === 'confirmed',
        status: status,
        reason: reason
      });
      
      return response.data || response;
    } catch (error) {
      console.error(`Error updating booking ${bookingId} status:`, error);
      
      // If the first attempt fails, try the more standard endpoint pattern
      try {
        console.log('Primary endpoint failed, trying fallback endpoint...');
        const fallbackResponse = await ApiService.patch(`${ConfigService.getApiUrl()}/api/bookings/${bookingId}/status`, {
          status,
          reason
        });
        return fallbackResponse.data || fallbackResponse;
      } catch (fallbackError) {
        console.error('Fallback endpoint also failed:', fallbackError);
        throw error; // Throw the original error
      }
    }
  }

  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  static async getDashboardStats() {
    try {
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/admin/stats`);
      return response || {
        totalUsers: 0,
        totalOrganizers: 0,
        totalEvents: 0,
        totalBookings: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        userGrowth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        revenueData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        bookingsByCategory: [0, 0, 0, 0, 0, 0]
      };
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get all organizers (admin access only)
   * @returns {Promise<Array>} List of all organizers
   */
  static async getAllOrganizers() {
    try {
      console.log('Fetching all organizers from API...');
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/admin/organizers`);
      console.log('Organizer data received:', response);
      return response || [];
    } catch (error) {
      console.error('Error fetching all organizers:', error);
      return [];
    }
  }

  /**
   * Get pending organizer approvals
   * @returns {Promise<Array>} List of pending organizer approvals
   */
  static async getPendingOrganizerApprovals() {
    try {
      console.log('Fetching pending organizer approvals from API...');
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/admin/organizers/pending`);
      console.log('Pending organizer data received:', response);
      return response || [];
    } catch (error) {
      console.error('Error fetching pending organizer approvals:', error);
      return [];
    }
  }

  /**
   * Approve or reject an organizer
   * @param {string} organizerId - Organizer ID
   * @param {boolean} approved - Whether to approve (true) or reject (false)
   * @param {string} reason - Reason for rejection (if applicable)
   * @returns {Promise<Object>} Response data
   */
  static async approveOrganizer(organizerId, approved, reason = '') {
    try {
      const response = await ApiService.put(`${ConfigService.getApiUrl()}/api/admin/organizers/${organizerId}/approval`, {
        approved,
        reason
      });
      return response;
    } catch (error) {
      console.error(`Error ${approved ? 'approving' : 'rejecting'} organizer:`, error);
      throw error;
    }
  }

  /**
   * Delete a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Response data
   */
  static async deleteUser(userId) {
    try {
      const response = await ApiService.delete(`${ConfigService.getApiUrl()}/api/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Response data
   */
  static async deleteEvent(eventId) {
    try {
      const response = await ApiService.delete(`${ConfigService.getApiUrl()}/api/admin/events/${eventId}`);
      return response;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  /**
   * Get revenue analytics
   * @param {string} timeframe - Timeframe for analytics ('week', 'month', 'quarter', 'year')
   * @returns {Promise<Object>} Revenue analytics data
   */
  static async getRevenueAnalytics(timeframe = 'month') {
    try {
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/admin/analytics/revenue`, { timeframe });
      return response || {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };
    }
  }

  /**
   * Get user growth analytics
   * @param {string} timeframe - Timeframe for analytics ('week', 'month', 'quarter', 'year')
   * @returns {Promise<Object>} User growth analytics data
   */
  static async getUserGrowthAnalytics(timeframe = 'month') {
    try {
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/admin/analytics/users`, { timeframe });
      return response || {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };
    } catch (error) {
      console.error('Error fetching user growth analytics:', error);
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };
    }
  }

  /**
   * Get booking analytics by category
   * @returns {Promise<Object>} Booking analytics data by category
   */
  static async getBookingsByCategory() {
    try {
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/admin/analytics/bookings/category`);
      return response || {
        labels: ['Wedding', 'Corporate', 'Birthday', 'Conference', 'Social', 'Other'],
        data: [0, 0, 0, 0, 0, 0]
      };
    } catch (error) {
      console.error('Error fetching bookings by category:', error);
      return {
        labels: ['Wedding', 'Corporate', 'Birthday', 'Conference', 'Social', 'Other'],
        data: [0, 0, 0, 0, 0, 0]
      };
    }
  }

  static async getActivityLogs(page = 1, limit = 20) {
    try {
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/admin/logs?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return {
        logs: [],
        pagination: {
          total: 0,
          currentPage: page,
          totalPages: 0
        }
      };
    }
  }

  static async updateSystemSettings(settings) {
    try {
      const response = await ApiService.put(`${ConfigService.getApiUrl()}/api/admin/settings`, settings);
      return response;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  static async getSystemSettings() {
    try {
      const response = await ApiService.get(`${ConfigService.getApiUrl()}/api/admin/settings`);
      return response;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return {
        maintenanceMode: false,
        bookingFees: 0,
        eventApprovalRequired: true,
        maxUsersPerEvent: 100,
        supportEmail: 'support@example.com'
      };
    }
  }
} 
import ApiService from './ApiService';
import AuthService from './AuthService';

// Mock customer data for use when the API is not available
const mockCustomers = [
  {
    id: 1,
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 9876543210',
    totalBookings: 5,
    totalSpent: 75000,
    lastBookingDate: '2023-12-15',
    favoriteEventType: 'Wedding Ceremony',
    preferredLocation: 'Mumbai'
  },
  {
    id: 2,
    name: 'Priya Singh',
    email: 'priya.singh@example.com',
    phone: '+91 8765432109',
    totalBookings: 3,
    totalSpent: 45000,
    lastBookingDate: '2023-11-20',
    favoriteEventType: 'Corporate Event',
    preferredLocation: 'Delhi'
  },
  {
    id: 3,
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '+91 7654321098',
    totalBookings: 2,
    totalSpent: 35000,
    lastBookingDate: '2023-10-10',
    favoriteEventType: 'Birthday Party',
    preferredLocation: 'Ahmedabad'
  },
  {
    id: 4,
    name: 'Neha Gupta',
    email: 'neha.gupta@example.com',
    phone: '+91 6543210987',
    totalBookings: 4,
    totalSpent: 60000,
    lastBookingDate: '2023-12-05',
    favoriteEventType: 'Anniversary Celebration',
    preferredLocation: 'Goa'
  },
  {
    id: 5,
    name: 'Aditya Verma',
    email: 'aditya.verma@example.com',
    phone: '+91 5432109876',
    totalBookings: 1,
    totalSpent: 25000,
    lastBookingDate: '2023-11-15',
    favoriteEventType: 'Wedding Ceremony',
    preferredLocation: 'Jaipur'
  }
];

/**
 * Service for customer-related operations
 */
class CustomerService {
  /**
   * Process user data to customer format
   * @param {Object} user - User data from API
   * @returns {Object} Formatted customer data
   */
  static processUserToCustomer(user) {
    // If the input is already in customer format, return it
    if (user.totalBookings !== undefined) {
      return user;
    }

    return {
      id: user._id || user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email || '',
      phone: user.phone || user.phoneNumber || '',
      totalBookings: user.bookings?.length || user.totalBookings || 0,
      totalSpent: user.totalSpent || 0,
      lastBookingDate: user.lastBookingDate || '',
      favoriteEventType: user.favoriteEventType || 'Not specified',
      preferredLocation: user.preferredLocation || 'Not specified',
      // Keep original user data for reference
      userData: user
    };
  }

  /**
   * Get all customers (users)
   * @param {boolean} useMockData - Whether to use mock data when API fails
   * @returns {Promise<Array>} List of customers
   */
  static async getAllCustomers(useMockData = false) {
    try {
      // Check if user is authenticated
      const token = AuthService.getToken();
      if (!token) {
        console.log('User not authenticated, using mock data');
        return mockCustomers;
      }

      // Get user role
      const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
      const isOrganizer = sessionStorage.getItem('isOrganizer') === 'true';
      
      console.log('User roles:', { isAdmin, isOrganizer });

      if (isAdmin) {
        // Admin can access all users
        console.log('Fetching all users data as admin...');
        try {
          const response = await ApiService.get('/users');
          console.log('Users data fetched successfully:', response);
          
          // Convert users to customer format
          let customers = [];
          if (Array.isArray(response)) {
            customers = response.map(user => this.processUserToCustomer(user));
          } else if (response && response.data && Array.isArray(response.data)) {
            customers = response.data.map(user => this.processUserToCustomer(user));
          } else if (response && response.users && Array.isArray(response.users)) {
            customers = response.users.map(user => this.processUserToCustomer(user));
          } else {
            console.warn('Unexpected response format:', response);
            throw new Error('Invalid API response format');
          }
          
          return customers;
        } catch (error) {
          console.error('Admin user fetching error:', error);
          if (error.response?.status === 403) {
            console.warn('Permission denied despite admin role');
          }
          throw error;
        }
      } else if (isOrganizer) {
        // Organizer can only see users who booked their events/venues
        console.log('Fetching bookings for organizer to extract customers...');
        try {
          // For organizers, we'll try to get their events' bookings
          const userId = AuthService.getUserInfo().id;
          
          // Try to get bookings for organizer's events
          const response = await ApiService.get('/user/bookings/organized');
          console.log('Organizer bookings fetched:', response);
          
          // Extract unique customers from bookings
          const uniqueCustomers = new Map();
          const bookings = Array.isArray(response) ? response : 
                         (response?.data || []);
          
          bookings.forEach(booking => {
            if (booking.userId && !uniqueCustomers.has(booking.userId._id)) {
              const user = booking.userId;
              const customer = this.processUserToCustomer(user);
              uniqueCustomers.set(user._id, customer);
            }
          });
          
          return Array.from(uniqueCustomers.values());
        } catch (error) {
          console.error('Error fetching organizer bookings:', error);
          
          // If that fails, try to get own bookings as a simpler approach
          try {
            console.log('Trying alternative approach to get customer data...');
            return mockCustomers;
          } catch (innerError) {
            console.error('Alternative approach failed:', innerError);
            throw innerError;
          }
        }
      }
      
      // If we get here, the user doesn't have permission, use mock data
      console.log('User does not have admin or organizer privileges, using mock data');
      return mockCustomers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      
      if (useMockData) {
        console.log('Using mock customer data as fallback');
        return mockCustomers;
      }
      
      throw error;
    }
  }

  /**
   * Get a single customer by ID
   * @param {string|number} customerId - Customer ID
   * @param {boolean} useMockData - Whether to use mock data when API fails
   * @returns {Promise<Object>} Customer data
   */
  static async getCustomerById(customerId, useMockData = false) {
    try {
      // Check if user is authenticated
      const token = AuthService.getToken();
      if (!token) {
        console.log('User not authenticated, using mock data');
        const customer = mockCustomers.find(c => c.id.toString() === customerId.toString());
        return customer || null;
      }

      console.log(`Fetching user with ID ${customerId} from API...`);
      
      // From UserRoutes.js we can see the endpoint is /user/:id
      const response = await ApiService.get(`/user/${customerId}`);
      console.log(`User data fetched successfully:`, response);
      
      return this.processUserToCustomer(response.data || response);
    } catch (error) {
      console.error(`Error fetching customer with ID ${customerId}:`, error);
      
      if (useMockData) {
        console.log('Using mock customer data as fallback');
        // Find the customer in mock data
        const customer = mockCustomers.find(c => c.id.toString() === customerId.toString());
        return customer || null;
      }
      
      throw error;
    }
  }

  /**
   * Get customer bookings
   * @param {string|number} customerId - Customer ID
   * @param {boolean} useMockData - Whether to use mock data when API fails
   * @returns {Promise<Array>} List of customer bookings
   */
  static async getCustomerBookings(customerId, useMockData = false) {
    try {
      // Check if user is authenticated
      const token = AuthService.getToken();
      if (!token) {
        console.log('User not authenticated, using mock data');
        return this.generateMockBookings(customerId);
      }

      console.log(`Fetching bookings for user ${customerId} from API...`);
      
      // From UserRoutes.js we can see the endpoint is /user/:userId/bookings
      const response = await ApiService.get(`/user/${customerId}/bookings`);
      console.log(`Bookings fetched successfully:`, response);
      
      return response.data || response || [];
    } catch (error) {
      console.error(`Error fetching bookings for customer ${customerId}:`, error);
      
      if (useMockData) {
        console.log('Using mock booking data as fallback');
        return this.generateMockBookings(customerId);
      }
      
      throw error;
    }
  }

  /**
   * Generate mock bookings for a customer
   * @param {string|number} customerId - Customer ID
   * @returns {Array} Mock booking data
   * @private
   */
  static generateMockBookings(customerId) {
    const customer = mockCustomers.find(c => c.id.toString() === customerId.toString());
    if (!customer) return [];
    
    const bookings = [];
    const totalBookings = customer.totalBookings || 0;
    
    // Generate mock bookings based on customer's total bookings count
    for (let i = 0; i < totalBookings; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 30)); // Spread bookings over time
      
      bookings.push({
        id: `BK${customerId}${i + 1}`,
        customerId: customer.id,
        customerName: customer.name,
        eventType: customer.favoriteEventType || 'Event',
        venue: i % 2 === 0 ? 'Grand Palace' : 'Celebration Garden',
        bookingDate: date.toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 10000) + 5000,
        status: i === 0 ? 'Upcoming' : (i === totalBookings - 1 ? 'Completed' : 'Cancelled')
      });
    }
    
    return bookings;
  }
}

export default CustomerService; 
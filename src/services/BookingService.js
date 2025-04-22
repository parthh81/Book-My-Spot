import { API_BASE_URL } from '../config/constants';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getSessionItem } from '../utils/storage';
import AuthService from './AuthService';
import ApiService from './ApiService';

/**
 * BookingService provides methods for interacting with booking related API endpoints
 */
class BookingService {
  /**
   * Create a new booking
   * @param {Object} bookingData - The booking data
   * @returns {Promise} Promise resolving to the created booking
   */
  async createBooking(bookingData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Get a booking by its ID
   * @param {string} bookingId - The booking ID
   * @returns {Promise} Promise resolving to the booking details
   */
  async getBookingById(bookingId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  }

  /**
   * Get all bookings for a user
   * @param {string} userId - The user ID
   * @returns {Promise} Promise resolving to the user's bookings
   */
  async getUserBookings(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}/bookings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  }

  /**
   * Get all bookings for an event
   * @param {string} eventId - The event ID
   * @returns {Promise} Promise resolving to the event's bookings
   */
  async getEventBookings(eventId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}/bookings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event bookings:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   * @param {string} bookingId - The booking ID
   * @returns {Promise} Promise resolving to the cancelled booking
   */
  async cancelBooking(bookingId) {
    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   * @param {string} bookingId - The booking ID
   * @param {string} status - The new status
   * @returns {Promise} Promise resolving to the updated booking
   */
  async updateBookingStatus(bookingId, status) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  /**
   * Generate PDF receipt for a booking
   * @param {string} bookingId - The booking ID
   * @returns {Promise} Promise resolving to the PDF data
   */
  async generateReceipt(bookingId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}/receipt`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw error;
    }
  }

  /**
   * Get all bookings for the organizer
   * @returns {Promise<Array>} List of bookings
   */
  async getAllBookings() {
    try {
      // Check if user is admin
      const user = AuthService.getUserInfo();
      const isAdmin = user && user.role === 'admin';
      
      if (isAdmin) {
        // Admin access - use the admin endpoint
        console.log('User has admin privileges, fetching all bookings');
        const response = await ApiService.get('/api/bookings/all');
        return response || [];
      } else {
        // Organizer access - fetch all organizer bookings
        console.log('User is organizer, fetching all organizer bookings');
        // Use the correct endpoint to get all bookings for the organizer
        const response = await ApiService.get('/api/bookings/organizer');
        return response || [];
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  /**
   * Get pending bookings that need approval
   * @returns {Promise<Array>} List of pending bookings
   */
  async getPendingBookings() {
    try {
      const response = await ApiService.get('/api/bookings/pending');
      return response || [];
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      return [];
    }
  }

  /**
   * Get bookings statistics summary
   * @returns {Promise<Object>} Booking statistics
   */
  async getBookingStats() {
    try {
      const response = await ApiService.get('/api/bookings/stats');
      return response || {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0
      };
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      return {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0
      };
    }
  }

  /**
   * Get recent bookings
   * @param {number} limit - Number of bookings to fetch
   * @returns {Promise<Array>} List of recent bookings
   */
  async getRecentBookings(limit = 5) {
    try {
      const response = await ApiService.get('/api/bookings/recent', { limit });
      return response || [];
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      return [];
    }
  }

  /**
   * Approve or reject a booking
   * @param {string} bookingId - Booking ID
   * @param {boolean} approved - Whether to approve the booking
   * @param {string} reason - Reason for rejection (only if approved is false)
   * @returns {Promise<Object>} Updated booking
   */
  async approveBooking(bookingId, approved, reason = '') {
    try {
      const response = await ApiService.put(`/api/bookings/approve/${bookingId}`, {
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
   * Generate a booking report for the organizer
   * @param {string} timeframe - The timeframe for the report (week, month, quarter, year)
   * @param {string} format - The format of the report (csv, pdf)
   * @returns {Promise<boolean>} Success status of the report generation
   */
  async generateBookingReport(timeframe = 'month', format = 'csv') {
    try {
      // Get booking stats
      const stats = await this.getBookingStats();
      
      // Get recent bookings
      const bookings = await this.getAllBookings();
      
      // Format the current date for the filename
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];
      
      if (format === 'pdf') {
        return await this.generatePdfReport(stats, bookings, timeframe, dateString);
      } else {
        return await this.generateCsvReport(stats, bookings, timeframe, dateString);
      }
    } catch (error) {
      console.error('Error generating organizer booking report:', error);
      toast.error('Failed to generate report. Please try again.');
      return false;
    }
  }
  
  /**
   * Generate and download a CSV report for organizer bookings
   * @param {Object} stats - The booking statistics
   * @param {Array} bookings - The bookings data
   * @param {string} timeframe - The timeframe for the report
   * @param {string} dateString - The formatted date string for the filename
   * @returns {boolean} Success status of the report generation
   */
  async generateCsvReport(stats, bookings, timeframe, dateString) {
    try {
      const user = AuthService.getUserInfo();
      const organizerName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : 'Organizer';
      
      // Create CSV content starting with headers
      let csvContent = 'BookMySpot Organizer Booking Report\n';
      csvContent += `Organizer: ${organizerName}\n`;
      csvContent += `Generated on: ${new Date().toLocaleString()}\n`;
      csvContent += `Timeframe: ${timeframe}\n\n`;
      
      // Add summary statistics
      csvContent += 'Summary Statistics\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Bookings,${stats.totalBookings || 0}\n`;
      csvContent += `Confirmed Bookings,${stats.confirmedBookings || 0}\n`;
      csvContent += `Pending Bookings,${stats.pendingBookings || 0}\n`;
      csvContent += `Cancelled Bookings,${stats.cancelledBookings || 0}\n`;
      csvContent += `Total Revenue,₹${stats.totalRevenue || 0}\n\n`;
      
      // Add booking details
      if (bookings && bookings.length > 0) {
        csvContent += 'Booking Details\n';
        csvContent += 'Booking ID,Customer Name,Customer Email,Event,Date,Amount,Status\n';
        
        bookings.forEach(booking => {
          const customerId = booking.id || '';
          const customerName = booking.customerName || booking.customer?.name || '';
          const customerEmail = booking.customerEmail || booking.customer?.email || '';
          const event = booking.eventTitle || booking.eventName || '';
          const date = booking.eventDate || booking.date || '';
          const amount = booking.totalAmount || booking.amount || 0;
          const status = booking.status || booking.bookingStatus || '';
          
          csvContent += `${customerId},${customerName},${customerEmail},${event},${date},₹${amount},${status}\n`;
        });
      }
      
      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookmyspot_bookings_${timeframe}_${dateString}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Booking report generated successfully');
      return true;
    } catch (error) {
      console.error('Error generating CSV report:', error);
      toast.error('Failed to generate CSV report');
      return false;
    }
  }
  
  /**
   * Generate and download a PDF report for organizer bookings
   * @param {Object} stats - The booking statistics
   * @param {Array} bookings - The bookings data
   * @param {string} timeframe - The timeframe for the report
   * @param {string} dateString - The formatted date string for the filename
   * @returns {boolean} Success status of the report generation
   */
  async generatePdfReport(stats, bookings, timeframe, dateString) {
    try {
      // Check if jspdf is available
      if (typeof window.jspdf === 'undefined') {
        // Load jsPDF dynamically
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      const user = AuthService.getUserInfo();
      const organizerName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : 'Organizer';
      
      // Create a new jsPDF instance
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Add report title and metadata
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('BookMySpot Organizer Booking Report', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Organizer: ${organizerName}`, 105, 30, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 40, { align: 'center' });
      doc.text(`Timeframe: ${timeframe}`, 105, 45, { align: 'center' });
      
      // Add a divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 50, 190, 50);
      
      // Add summary statistics section
      doc.setFontSize(14);
      doc.text('Summary Statistics', 20, 60);
      
      doc.setFontSize(10);
      let yPosition = 70;
      
      // Create a simple 2-column table for stats
      doc.setTextColor(100, 100, 100);
      doc.text('Metric', 25, yPosition);
      doc.text('Value', 100, yPosition);
      yPosition += 5;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 8;
      
      doc.setTextColor(40, 40, 40);
      
      // Add each statistic
      const statsArray = [
        { label: 'Total Bookings', value: stats.totalBookings || 0 },
        { label: 'Confirmed Bookings', value: stats.confirmedBookings || 0 },
        { label: 'Pending Bookings', value: stats.pendingBookings || 0 },
        { label: 'Cancelled Bookings', value: stats.cancelledBookings || 0 },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue || 0}` }
      ];
      
      statsArray.forEach(stat => {
        doc.text(stat.label, 25, yPosition);
        doc.text(String(stat.value), 100, yPosition);
        yPosition += 8;
      });
      
      // Add a divider
      yPosition += 5;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 15;
      
      // Add booking details if available
      if (bookings && bookings.length > 0) {
        doc.setFontSize(14);
        doc.text('Booking Details', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        
        // Column headers with positions
        doc.text('Customer', 20, yPosition);
        doc.text('Event', 65, yPosition);
        doc.text('Date', 110, yPosition);
        doc.text('Amount', 140, yPosition);
        doc.text('Status', 170, yPosition);
        yPosition += 5;
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 8;
        
        doc.setTextColor(40, 40, 40);
        
        // Add each booking
        bookings.forEach(booking => {
          if (yPosition > 270) {
            // Add a new page if we're running out of space
            doc.addPage();
            yPosition = 20;
          }
          
          const customerName = booking.customerName || booking.customer?.name || '';
          const event = booking.eventTitle || booking.eventName || '';
          const date = booking.eventDate || booking.date || '';
          const amount = booking.totalAmount || booking.amount || 0;
          const status = booking.status || booking.bookingStatus || '';
          
          // Truncate long values to fit in columns
          const truncatedName = customerName.length > 20 ? customerName.substring(0, 18) + '...' : customerName;
          const truncatedEvent = event.length > 20 ? event.substring(0, 18) + '...' : event;
          
          doc.text(truncatedName, 20, yPosition);
          doc.text(truncatedEvent, 65, yPosition);
          doc.text(date.toString(), 110, yPosition);
          doc.text(`₹${amount}`, 140, yPosition);
          doc.text(status, 170, yPosition);
          
          yPosition += 8;
        });
      }
      
      // Save the PDF and trigger download
      doc.save(`bookmyspot_bookings_${timeframe}_${dateString}.pdf`);
      
      toast.success('Booking report generated successfully');
      return true;
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast.error('Failed to generate PDF report. If you tried PDF format, try CSV instead.');
      return false;
    }
  }
}

export default new BookingService(); 
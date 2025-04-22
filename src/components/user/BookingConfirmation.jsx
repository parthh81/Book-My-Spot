import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import { formatDate, formatCurrency } from '../../utils/formatters';
import BookingService from '../../services/BookingService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import '../../styles/BookingConfirmation.css';

const BookingConfirmation = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state?.bookingData;

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (bookingData) {
          // If booking data was passed via location state, use it directly
          setBooking(bookingData);
          setLoading(false);
        } else if (bookingId) {
          // Otherwise fetch from API using the booking ID
          const data = await BookingService.getBookingById(bookingId);
          setBooking(data);
          setLoading(false);
        } else {
          console.error('No booking ID or data provided');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, bookingData]);

  // Add redirect handler to fix potential incorrect navigation
  useEffect(() => {
    // The setTimeout allows the UI to render first before redirecting
    const redirectTimer = setTimeout(() => {
      // Check if we're on a non-existent path that might be attempted
      if (window.location.pathname === '/my-bookings') {
        console.warn('Detected navigation to incorrect path "/my-bookings"');
        console.info('Redirecting to correct path: "/user/bookings"');
        navigate('/user/bookings', { replace: true });
      }
    }, 300);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h2>
          <p className="text-gray-700 mb-6">We couldn't find the booking details you're looking for.</p>
          <Link to="/user/bookings" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            View My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const { venue, event, contactInfo, totalPrice, bookingDate, bookingStatus, paymentStatus, bookingReference } = booking;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-6 text-white text-center">
          <FaCheckCircle className="text-5xl mx-auto mb-3" />
          <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
          <p className="text-lg mt-2">Your booking has been successfully processed</p>
          <p className="text-sm mt-2 bg-white/10 inline-block px-3 py-1 rounded-full">Booking Reference: {bookingReference || 'BMS-' + (bookingId || Math.random().toString(36).substring(2, 10).toUpperCase())}</p>
        </div>

        {/* Booking Details */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Event Details */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Event Details</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex items-start">
                  <FaCalendarAlt className="text-primary mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-700">Event Date</p>
                    <p className="text-gray-600">{formatDate(event?.eventDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-primary mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-700">Venue</p>
                    <p className="text-gray-600">{venue?.name}</p>
                    <p className="text-gray-500 text-sm">{venue?.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FaUsers className="text-primary mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-700">Guest Count</p>
                    <p className="text-gray-600">{event?.guestCount} people</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Contact Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-700">{contactInfo?.name}</p>
                <p className="text-gray-600">{contactInfo?.email}</p>
                <p className="text-gray-600">{contactInfo?.phone}</p>
              </div>
            </div>

            {/* Right Column - Payment Details */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Payment Details</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium">{formatCurrency(venue?.basePrice || 0)}</span>
                </div>
                
                {venue?.additionalGuestPrice > 0 && event?.guestCount > venue?.baseGuestCount && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      Additional Guests ({event?.guestCount - venue?.baseGuestCount} × {formatCurrency(venue?.additionalGuestPrice)}):
                    </span>
                    <span className="font-medium">
                      {formatCurrency((event?.guestCount - venue?.baseGuestCount) * venue?.additionalGuestPrice)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Service Fee:</span>
                  <span className="font-medium">{formatCurrency(booking?.serviceFee || 0)}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">GST (18%):</span>
                  <span className="font-medium">{formatCurrency(booking?.taxAmount || 0)}</span>
                </div>
                
                <div className="border-t border-gray-300 my-2"></div>
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(totalPrice)}</span>
                </div>
                
                <div className="mt-4 flex items-center">
                  <FaMoneyBillWave className="text-green-500 mr-2" />
                  <span className="font-medium">
                    Payment Status: <span className={`${paymentStatus === 'PAID' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {paymentStatus || 'PAID'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Booking Status */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Booking Status</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${
                      bookingStatus === 'CONFIRMED' ? 'bg-green-500' : 
                      bookingStatus === 'PENDING' ? 'bg-yellow-500' : 
                      bookingStatus === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="font-medium">{bookingStatus || 'CONFIRMED'}</span>
                  </div>
                  <p className="text-gray-600 mt-2">
                    Booked on {formatDate(bookingDate || new Date())}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps and Buttons */}
          <div className="mt-10 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Next Steps</h2>
            <p className="text-gray-600 mb-6">
              We have sent a confirmation email to <span className="font-medium">{contactInfo?.email}</span> with all your booking details.
              For any changes or inquiries, please contact our support team with your booking reference.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Link to="/user/bookings" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors">
                View My Bookings
              </Link>
              
              <button 
                onClick={() => window.print()} 
                className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingService from '../services/BookingService';
import '../styles/BookingConfirmation.css';

const BookingConfirmation = () => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { bookingId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const data = await BookingService.getBookingById(bookingId);
        setBooking(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load booking details. Please try again later.');
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const handleDownloadReceipt = async () => {
    try {
      const pdfBlob = await BookingService.generateReceipt(bookingId);
      
      // Create a blob URL and download the PDF
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `receipt-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError('Failed to download receipt. Please try again later.');
    }
  };

  const handleCancelBooking = async () => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        await BookingService.cancelBooking(bookingId);
        // Refresh booking data
        const updatedBooking = await BookingService.getBookingById(bookingId);
        setBooking(updatedBooking);
      } catch (err) {
        setError('Failed to cancel booking. Please try again later.');
      }
    }
  };

  const handleBackToBookings = () => {
    navigate('/user/bookings');
  };

  if (loading) {
    return (
      <div className="booking-confirmation loading">
        <div className="spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-confirmation error">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn-secondary" onClick={handleBackToBookings}>
          Back to My Bookings
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-confirmation not-found">
        <h2>Booking Not Found</h2>
        <p>We couldn't find the booking you're looking for.</p>
        <button className="btn-secondary" onClick={handleBackToBookings}>
          Back to My Bookings
        </button>
      </div>
    );
  }

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="booking-confirmation">
      <div className="confirmation-header">
        <h1>Booking Confirmation</h1>
        <div className={`booking-status ${getStatusClass(booking.status)}`}>
          {booking.status}
        </div>
      </div>
      
      <div className="booking-reference">
        <h3>Booking Reference</h3>
        <p className="reference-number">{booking.referenceNumber || booking.id}</p>
      </div>

      <div className="booking-details-container">
        <div className="booking-details">
          <div className="detail-group">
            <h3>Event Details</h3>
            <h4>{booking.event.title}</h4>
            <p>{booking.event.description}</p>
            <p><strong>Date & Time:</strong> {formatDate(booking.event.startDateTime)}</p>
            <p><strong>Duration:</strong> {booking.event.duration} minutes</p>
          </div>

          <div className="detail-group">
            <h3>Venue</h3>
            <h4>{booking.venue.name}</h4>
            <p>{booking.venue.address}</p>
            <p>{booking.venue.city}, {booking.venue.state} {booking.venue.zipCode}</p>
          </div>

          <div className="detail-group">
            <h3>Ticket Details</h3>
            <p><strong>Ticket Type:</strong> {booking.ticketType}</p>
            <p><strong>Quantity:</strong> {booking.quantity}</p>
            <p><strong>Price per Ticket:</strong> ${booking.pricePerTicket.toFixed(2)}</p>
            <p><strong>Total Amount:</strong> ${booking.totalAmount.toFixed(2)}</p>
            {booking.discountCode && (
              <p><strong>Discount Applied:</strong> {booking.discountCode}</p>
            )}
          </div>

          <div className="detail-group">
            <h3>Booking Information</h3>
            <p><strong>Booked On:</strong> {formatDate(booking.createdAt)}</p>
            <p><strong>Booking Status:</strong> {booking.status}</p>
            {booking.status === 'Cancelled' && booking.cancellationReason && (
              <p><strong>Cancellation Reason:</strong> {booking.cancellationReason}</p>
            )}
          </div>
        </div>
      </div>

      <div className="booking-actions">
        <button className="btn-primary" onClick={handleDownloadReceipt}>
          Download Receipt
        </button>
        <button className="btn-secondary" onClick={handleBackToBookings}>
          Back to My Bookings
        </button>
        {booking.status !== 'Cancelled' && (
          <button className="btn-danger" onClick={handleCancelBooking}>
            Cancel Booking
          </button>
        )}
      </div>

      <div className="booking-notes">
        <h3>Important Information</h3>
        <ul>
          <li>Please arrive 15 minutes before the event starts.</li>
          <li>Bring a copy of your booking confirmation or receipt.</li>
          <li>For any queries, please contact our support team.</li>
          {booking.event.additionalInformation && (
            <li className="additional-info">{booking.event.additionalInformation}</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default BookingConfirmation; 
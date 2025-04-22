import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaLock, FaCreditCard, FaCalendarAlt, FaArrowLeft, FaCheck } from 'react-icons/fa';
import EventService from '../../services/EventService';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Add redirect for incorrect /my-bookings path
  useEffect(() => {
    if (window.location.pathname === '/my-bookings') {
      console.log('Redirecting from /my-bookings to correct path /user/bookings');
      // Add more detailed logging
      console.warn('Navigation issue detected: Attempted to navigate to non-existent path "/my-bookings"');
      console.info('Automatically redirecting to the correct path: "/user/bookings"');
      navigate('/user/bookings', { replace: true });
    }
  }, [navigate]);
  
  // States for payment processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Extract booking details from location state
  const {
    bookingId,
    eventTitle,
    venueTitle,
    totalAmount,
    bookingDetails,
    bookingData
  } = location.state || {};
  
  const isEvent = bookingDetails?.isEvent;
  const title = isEvent ? eventTitle : venueTitle;
  
  // Use received data or fallback if missing
  const bookingInfo = location.state ? {
    title: title || "Unknown Event/Venue",
    bookingId: bookingId || "BK" + Math.floor(Math.random() * 1000000),
    totalAmount: totalAmount || 0,
    date: bookingDetails?.date || new Date().toISOString(),
    endDate: bookingDetails?.endDate,
    guestCount: bookingDetails?.numberOfGuests || 1,
    name: bookingDetails?.name || "",
    email: bookingDetails?.email || "",
    phone: bookingDetails?.phone || "",
    image: bookingDetails?.image || "",
    isEvent: isEvent
  } : {
    title: "Sample Booking",
    bookingId: "BK1234567",
    totalAmount: 65540,
    date: new Date().toISOString(),
    guestCount: 2,
    isEvent: false
  };
  
  // Payment form state
  const [paymentData, setPaymentData] = useState({
    cardholderName: bookingInfo.name || '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/\D/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim()
        .substring(0, 19);
      
      setPaymentData(prev => ({
        ...prev,
        cardNumber: formattedValue
      }));
    } 
    // Format expiry date (MM/YY)
    else if (name === 'expiryDate') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .substring(0, 5);
      
      setPaymentData(prev => ({
        ...prev,
        expiryDate: formattedValue
      }));
    }
    // Format CVV (numbers only)
    else if (name === 'cvv') {
      const formattedValue = value.replace(/\D/g, '').substring(0, 3);
      
      setPaymentData(prev => ({
        ...prev,
        cvv: formattedValue
      }));
    }
    else {
      setPaymentData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error message when field is corrected
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    // Cardholder name
    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required";
    }
    
    // Card number
    const cardNumberDigits = paymentData.cardNumber.replace(/\D/g, '');
    if (!cardNumberDigits) {
      newErrors.cardNumber = "Card number is required";
    } else if (cardNumberDigits.length < 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }
    
    // Expiry date
    if (!paymentData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      newErrors.expiryDate = "Expiry date format should be MM/YY";
    } else {
      const [month, year] = paymentData.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = "Invalid month";
      } else if (
        (parseInt(year) < currentYear) || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        newErrors.expiryDate = "Card has expired";
      }
    }
    
    // CVV
    if (!paymentData.cvv) {
      newErrors.cvv = "CVV is required";
    } else if (paymentData.cvv.length < 3) {
      newErrors.cvv = "CVV must be 3 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Process payment (simulated for now)
      console.log("Processing payment with data:", paymentData);
      
      // If we have booking data, process the actual booking
      if (bookingData) {
        console.log('Original booking data:', bookingData);
        
        // Ensure booking data has all the required fields in correct format
        const enhancedBookingData = {
          ...bookingData,
          // Ensure dates are properly formatted
          startDate: bookingData.startDate, 
          endDate: bookingData.endDate,
          // Ensure price information is numeric
          basePrice: parseFloat(bookingData.basePrice) || 25000,
          serviceFee: parseFloat(bookingData.serviceFee) || 1250,
          gstAmount: parseFloat(bookingData.gstAmount) || 4725,
          totalAmount: parseFloat(bookingData.totalAmount) || 30975,
          // Add default start/end times if not present
          startTime: bookingData.startTime || "10:00 AM",
          endTime: bookingData.endTime || "01:00 PM",
          // Ensure numberOfDays is a number
          numberOfDays: parseInt(bookingData.numberOfDays) || 1,
          // Ensure number of guests is a number
          numberOfGuests: parseInt(bookingData.numberOfGuests) || 1
        };
        
        console.log('Submitting enhanced booking data:', enhancedBookingData);
        // Call the EventService to book the event
        const response = await EventService.bookEvent(enhancedBookingData);
        console.log('Booking response:', response);
      }
      
      setPaymentSuccess(true);
      
      // Wait a moment to show success message before navigating
      setTimeout(() => {
        // Navigate to confirmation page with booking and payment details
        navigate('/booking-confirmation', {
          state: {
            bookingData: {
              event: {
                eventDate: bookingData?.startDate || new Date().toISOString(),
                endDate: bookingData?.endDate,
                guestCount: bookingData?.numberOfGuests || 1,
                duration: bookingData?.numberOfDays || 1
              },
              venue: {
                name: bookingData?.venueTitle || venueTitle,
                address: bookingData?.location || "Venue Address",
                basePrice: bookingData?.basePrice || 0
              },
              contactInfo: {
                name: bookingData?.name || bookingDetails?.name,
                email: bookingData?.email || bookingDetails?.email,
                phone: bookingData?.phone || bookingDetails?.phone
              },
              totalPrice: bookingData?.totalAmount || totalAmount,
              bookingDate: new Date().toISOString(),
              bookingStatus: "CONFIRMED",
              paymentStatus: "PAID",
              serviceFee: bookingData?.serviceFee || 0,
              taxAmount: bookingData?.gstAmount || 0,
              bookingReference: `BMS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            },
            paymentDetails: {
              cardNumber: paymentData.cardNumber.replace(/\d(?=\d{4})/g, '*'),
              cardholderName: paymentData.cardholderName,
              paymentId: 'PY' + Math.floor(1000000 + Math.random() * 9000000),
              paymentDate: new Date().toISOString(),
              paymentStatus: 'PAID'
            }
          }
        });
      }, 2000);
    } catch (error) {
      console.error('Payment or booking error:', error);
      setErrors({
        submit: `Payment failed: ${error.message || 'Please try again later'}`
      });
      setIsProcessing(false);
    }
  };
  
  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };
  
  // Format amount with commas
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(parseInt(amount));
  };
  
  // If payment is successful, show success message
  if (paymentSuccess) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card border-0 shadow-sm p-4">
              <div className="success-icon mb-4">
                <FaCheck className="text-success" style={{ fontSize: '4rem', padding: '1rem', borderRadius: '50%', backgroundColor: '#e6f7e6' }} />
              </div>
              <h2 className="mb-3">Booking Successful!</h2>
              <p className="mb-3">Your payment of {formatAmount(bookingInfo.totalAmount)} has been processed successfully.</p>
              <p className="mb-4">A confirmation email has been sent to {bookingInfo.email || 'your email address'}.</p>
              <p className="text-muted">Redirecting to booking confirmation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <button 
            className="btn btn-sm btn-light mb-3"
            onClick={handleBack}
          >
            <FaArrowLeft className="me-1" /> Back to Booking Form
          </button>
          <h2 className="mb-1">Complete Your Payment</h2>
          <p className="text-muted">Your booking is almost done!</p>
        </div>
      </div>
      
      <div className="row">
        {/* Payment Form */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h4 className="card-title mb-4">Payment Details</h4>
              
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Cardholder Name */}
                  <div className="col-12">
                    <label htmlFor="cardholderName" className="form-label">Cardholder Name</label>
                    <input 
                      type="text" 
                      id="cardholderName"
                      name="cardholderName"
                      className={`form-control ${errors.cardholderName ? 'is-invalid' : ''}`}
                      placeholder="Name on card"
                      value={paymentData.cardholderName}
                      onChange={handleChange}
                      required
                    />
                    {errors.cardholderName && <div className="invalid-feedback">{errors.cardholderName}</div>}
                  </div>
                  
                  {/* Card Number */}
                  <div className="col-12">
                    <label htmlFor="cardNumber" className="form-label">Card Number</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaCreditCard />
                      </span>
                      <input 
                        type="text" 
                        id="cardNumber"
                        name="cardNumber"
                        className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`}
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {errors.cardNumber && <div className="invalid-feedback d-block">{errors.cardNumber}</div>}
                  </div>
                  
                  {/* Expiry Date and CVV */}
                  <div className="col-md-6">
                    <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaCalendarAlt />
                      </span>
                      <input 
                        type="text" 
                        id="expiryDate"
                        name="expiryDate"
                        className={`form-control ${errors.expiryDate ? 'is-invalid' : ''}`}
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {errors.expiryDate && <div className="invalid-feedback d-block">{errors.expiryDate}</div>}
                  </div>
                  
                  <div className="col-md-6">
                    <label htmlFor="cvv" className="form-label">CVV</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <input 
                        type="password" 
                        id="cvv"
                        name="cvv"
                        className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {errors.cvv && <div className="invalid-feedback d-block">{errors.cvv}</div>}
                  </div>
                  
                  {/* Security Note */}
                  <div className="col-12 mt-3">
                    <div className="alert alert-light border d-flex align-items-center" role="alert">
                      <FaLock className="text-success me-2" />
                      <div>
                        <small className="fw-medium">Secure Payment</small>
                        <p className="mb-0 small text-muted">
                          Your payment information is encrypted and secure. We never store your full card details.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Form Buttons */}
                  <div className="form-group mt-4">
                    {errors.submit && (
                      <div className="alert alert-danger mb-3">
                        {errors.submit}
                      </div>
                    )}
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg w-100"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          Pay {formatAmount(bookingInfo.totalAmount)}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="d-flex align-items-center justify-content-center mb-4">
            <img src="https://cdn.pixabay.com/photo/2018/05/08/21/32/paypal-3384015_640.png" alt="PayPal" className="mx-2" style={{height: "25px"}} />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png" alt="Visa" className="mx-2" style={{height: "25px"}} />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="mx-2" style={{height: "25px"}} />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" alt="American Express" className="mx-2" style={{height: "25px"}} />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/RuPay.svg/1200px-RuPay.svg.png" alt="RuPay" className="mx-2" style={{height: "25px"}} />
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
            <div className="card-body p-4">
              <h4 className="card-title mb-4">Order Summary</h4>
              
              {/* Payment Summary */}
              <div className="payment-summary mt-4 p-3 border rounded bg-light">
                <h5 className="mb-3">Booking Summary</h5>
                
                <div className="booking-details mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-medium">Booking ID:</span>
                    <span>{bookingInfo.bookingId}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-medium">{bookingInfo.isEvent ? 'Event' : 'Venue'}:</span>
                    <span>{bookingInfo.title}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-medium">Type:</span>
                    <span>{bookingInfo.isEvent ? "Event Registration" : "Venue Booking"}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-medium">Date:</span>
                    <span>{new Date(bookingInfo.date).toLocaleDateString()}</span>
                  </div>
                  {bookingInfo.endDate && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-medium">End Date:</span>
                      <span>{new Date(bookingInfo.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between mb-2">
                    <span className="fw-medium">Guests:</span>
                    <span>{bookingInfo.guestCount}</span>
                  </div>
                </div>
                
                <hr />
                
                <div className="payment-details">
                  <div className="d-flex justify-content-between mb-2 fw-bold">
                    <span>Total Amount:</span>
                    <span>{formatAmount(bookingInfo.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 
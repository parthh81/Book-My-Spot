import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaCreditCard, FaCheck, FaCheckCircle, FaArrowLeft, FaClock } from 'react-icons/fa';

const BookingConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    eventType: 'wedding',
    specialRequests: '',
    paymentMethod: 'creditCard',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  // Event type options
  const eventTypes = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate Event' },
    { value: 'birthday', label: 'Birthday Party' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'conference', label: 'Conference' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    // Check if state is passed from venue details page
    if (location.state) {
      setBookingData(location.state);
      
      // If user is logged in, pre-fill their info
      const userEmail = localStorage.getItem('email');
      if (userEmail) {
        setFormData(prev => ({
          ...prev,
          email: userEmail,
          // You can set other user info from localStorage if available
        }));
      }
    } else {
      // No booking data, redirect back to venues
      navigate('/user/venues');
    }
    setLoading(false);
  }, [location, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    // Terms agreement
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateForm()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call with setTimeout
      setTimeout(() => {
        // Create booking object to send to backend
        const bookingPayload = {
          ...bookingData,
          ...formData,
          bookingDate: new Date().toISOString(),
          bookingStatus: 'confirmed',
          paymentStatus: 'pending'
        };
        
        console.log('Booking successful:', bookingPayload);
        
        // Show success message and redirect after delay
        setSuccessMessage('Your booking has been confirmed! Redirecting to your bookings...');
        
        setTimeout(() => {
          navigate('/user/bookings', { state: { newBooking: true } });
        }, 3000);
        
        setIsSubmitting(false);
      }, 1500);
    }
  };

  if (loading) {
    return <div style={{ display: 'none' }}></div>;
  }

  if (!bookingData) return null;

  if (successMessage) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm py-5">
          <div className="card-body text-center">
            <div className="mb-4">
              <FaCheckCircle className="text-success" style={{ fontSize: '4rem' }} />
            </div>
            <h2 className="mb-3">Booking Confirmed!</h2>
            <p className="mb-4 lead">{successMessage}</p>
            <div className="d-flex justify-content-center">
              <p className="mb-0">Redirecting to your bookings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Confirm Your Booking</h4>
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/user">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/user/venues">Venues</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Confirm Booking</li>
          </ol>
        </nav>
      </div>
      
      {/* Progress Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-8 mx-auto">
              <div className="position-relative mb-4">
                <div className="progress" style={{ height: '2px' }}>
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ 
                      width: step === 1 ? '50%' : '100%',
                      backgroundColor: "#f05537" 
                    }} 
                    aria-valuenow={step === 1 ? 50 : 100} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                <div className="position-absolute top-0 start-0 translate-middle bg-white border rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderColor: '#f05537' }}>
                  <FaCheck className="text-success" />
                </div>
                <div className="position-absolute top-0 start-50 translate-middle bg-white border rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderColor: step === 1 ? '#dee2e6' : '#f05537' }}>
                  {step === 1 ? <span className="text-muted">2</span> : <FaCheck className="text-success" />}
                </div>
                <div className="position-absolute top-0 end-0 translate-middle bg-white border rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderColor: step === 2 ? '#f05537' : '#dee2e6' }}>
                  <span className="text-muted">3</span>
                </div>
              </div>
              <div className="d-flex justify-content-between text-center">
                <div>
                  <p className="mb-0 small text-muted">Venue Selected</p>
                </div>
                <div>
                  <p className="mb-0 small" style={{ color: step >= 1 ? '#f05537' : '#6c757d' }}>Your Details</p>
                </div>
                <div>
                  <p className="mb-0 small" style={{ color: step >= 2 ? '#f05537' : '#6c757d' }}>Confirmation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        {/* Booking Form */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              {step === 1 && (
                <>
                  <h5 className="card-title mb-4">Your Details</h5>
                  <form>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label htmlFor="firstName" className="form-label">First Name *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="lastName" className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                      </div>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label">Email *</label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="phone" className="form-label">Phone Number *</label>
                        <input
                          type="tel"
                          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="e.g., 9876543210"
                          required
                        />
                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="eventType" className="form-label">Event Type</label>
                      <select
                        className="form-select"
                        id="eventType"
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleInputChange}
                      >
                        {eventTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="specialRequests" className="form-label">Special Requests (Optional)</label>
                      <textarea
                        className="form-control"
                        id="specialRequests"
                        name="specialRequests"
                        rows="3"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        placeholder="Any specific requirements or arrangements you need for your event..."
                      ></textarea>
                    </div>
                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        className={`form-check-input ${errors.agreeTerms ? 'is-invalid' : ''}`}
                        id="agreeTerms"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleInputChange}
                        required
                      />
                      <label className="form-check-label" htmlFor="agreeTerms">
                        I agree to the <a href="#" target="_blank">terms and conditions</a>
                      </label>
                      {errors.agreeTerms && <div className="invalid-feedback">{errors.agreeTerms}</div>}
                    </div>
                  </form>
                </>
              )}
              
              {step === 2 && (
                <>
                  <h5 className="card-title mb-4">Review and Confirm</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-4">
                        <h6 className="fw-bold">Personal Information</h6>
                        <p className="mb-1">{formData.firstName} {formData.lastName}</p>
                        <p className="mb-1">{formData.email}</p>
                        <p className="mb-1">{formData.phone}</p>
                      </div>
                      <div className="mb-4">
                        <h6 className="fw-bold">Event Details</h6>
                        <p className="mb-1">Type: {eventTypes.find(t => t.value === formData.eventType)?.label}</p>
                        <p className="mb-1">Date: {new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="mb-1">Guests: {bookingData.guestCount}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-4">
                        <h6 className="fw-bold">Venue</h6>
                        <p className="mb-1">{bookingData.venueName}</p>
                      </div>
                      {formData.specialRequests && (
                        <div className="mb-4">
                          <h6 className="fw-bold">Special Requests</h6>
                          <p className="mb-1">{formData.specialRequests}</p>
                        </div>
                      )}
                      <div className="mb-4">
                        <h6 className="fw-bold">Payment Method</h6>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="creditCard"
                            value="creditCard"
                            checked={formData.paymentMethod === 'creditCard'}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="creditCard">
                            Credit/Debit Card
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="upi"
                            value="upi"
                            checked={formData.paymentMethod === 'upi'}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="upi">
                            UPI Payment
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="netBanking"
                            value="netBanking"
                            checked={formData.paymentMethod === 'netBanking'}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="netBanking">
                            Net Banking
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="alert alert-info d-flex align-items-center" role="alert">
                    <FaClock className="me-2" />
                    <div>
                      <strong>Note:</strong> A 30% advance payment is required to confirm your booking. The remaining amount can be paid 7 days before the event.
                    </div>
                  </div>
                </>
              )}
              
              <div className="mt-4 d-flex justify-content-between">
                {step === 1 ? (
                  <>
                    <Link to={`/user/venues/${bookingData.venueId}`} className="btn btn-outline-secondary">
                      <FaArrowLeft className="me-2" /> Back to Venue
                    </Link>
                    <button
                      type="button"
                      className="btn"
                      onClick={nextStep}
                      style={{ backgroundColor: "#f05537", color: "white" }}
                    >
                      Continue to Review
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={prevStep}
                    >
                      <FaArrowLeft className="me-2" /> Back to Details
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      style={{ backgroundColor: "#f05537", color: "white" }}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCreditCard className="me-2" /> Confirm & Pay
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Booking Summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4 sticky-lg-top" style={{ top: '20px' }}>
            <div className="card-body">
              <h5 className="card-title mb-4">Booking Summary</h5>
              
              <div className="d-flex mb-3">
                <img 
                  src={bookingData.venueImage} 
                  alt={bookingData.venueName}
                  className="rounded me-3"
                  style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="mb-1">{bookingData.venueName}</h6>
                  <div className="small text-muted mb-0">ID: BKID-{bookingData.venueId}-{new Date().getTime().toString().slice(-6)}</div>
                </div>
              </div>
              
              <div className="border-top pt-3 mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaCalendarAlt className="text-muted me-2" />
                  <div>
                    <div className="small text-muted">Date</div>
                    <div>{new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <FaUsers className="text-muted me-2" />
                  <div>
                    <div className="small text-muted">Number of Guests</div>
                    <div>{bookingData.guestCount}</div>
                  </div>
                </div>
              </div>
              
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Base Price</span>
                  <span>{bookingData.estimatedPrice}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>GST (18%)</span>
                  <span>₹9,000</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-success">Discount</span>
                  <span className="text-success">- ₹5,000</span>
                </div>
                <div className="d-flex justify-content-between fw-bold mt-3 pt-3 border-top">
                  <span>Total Amount</span>
                  <span style={{ color: "#f05537" }}>₹54,000</span>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <span>Advance Payment (30%)</span>
                  <span style={{ color: "#f05537" }}>₹16,200</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="alert alert-success d-flex align-items-center" role="alert">
                  <FaCheckCircle className="me-2" />
                  <div className="small">
                    Free cancellation available up to 30 days before your event date
                  </div>
                </div>
              </div>
              
              <div className="card bg-light border-0 mt-3">
                <div className="card-body">
                  <h6 className="card-title">Need Help?</h6>
                  <p className="small mb-2">Our booking specialists are available 24/7</p>
                  <div className="d-grid">
                    <a href="tel:+919876543210" className="btn btn-outline-secondary btn-sm">
                      Call +91 98765 43210
                    </a>
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

export default BookingConfirm; 
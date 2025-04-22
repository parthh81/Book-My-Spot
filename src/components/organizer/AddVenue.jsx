import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaPlus, 
  FaTrash,
  FaImage,
  FaWifi,
  FaParking,
  FaAccessibleIcon,
  FaSnowflake,
  FaUtensils,
  FaMusic,
  FaSave,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import EventService from '../../services/EventService';

const AddVenue = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [imagePreview, setImagePreview] = useState([]);
  const [eventCategories, setEventCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    image: null,
    images: [],
    price: '',
    capacity: '',
    amenities: [],
    suitableEvents: [],
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    },
    inclusions: ['Basic decoration', 'Sound system', 'Parking space', 'Backup power'],
    exclusions: ['Food & beverages', 'Custom decoration', 'Photography'],
    cancellationPolicy: {
      fullRefund: 7, // Days before event for full refund
      partialRefund: 3, // Days before event for partial refund
      partialRefundPercent: 50 // Percentage for partial refund
    },
    serviceFee: 3000, // Default service fee
    gstPercent: 18 // GST percentage
  });

  useEffect(() => {
    fetchEventCategories();
    fetchCities();
  }, []);

  const fetchEventCategories = async () => {
    try {
      const categories = await EventService.getEventCategories();
      if (categories && categories.length > 0) {
        setEventCategories(categories);
        console.log('Fetched event categories for venue:', categories);
      } else {
        // Use fallback categories if API fails
        setEventCategories([
          { id: 1, title: "Weddings", description: "Wedding ceremonies and receptions" },
          { id: 2, title: "Corporate Events", description: "Business meetings and conferences" },
          { id: 3, title: "Birthday Parties", description: "Birthday celebrations" },
          { id: 4, title: "Anniversary Celebrations", description: "Anniversary parties" },
          { id: 5, title: "Family Gatherings", description: "Family get-togethers" },
          { id: 6, title: "Engagement Ceremonies", description: "Engagement celebrations" }
        ]);
      }
    } catch (error) {
      console.error("Error fetching event categories:", error);
    }
  };

  const fetchCities = async () => {
    try {
      // In a real app, fetch from API
      // const response = await axios.get(`${API_BASE_URL}/api/cities`);
      // setCities(response.data);
      
      // Demo data - this should eventually be replaced with API call
      setCities([
        { id: 1, name: "Mumbai" },
        { id: 2, name: "Delhi" },
        { id: 3, name: "Bangalore" },
        { id: 4, name: "Hyderabad" },
        { id: 5, name: "Chennai" },
        { id: 6, name: "Kolkata" },
        { id: 7, name: "Ahmedabad" },
        { id: 8, name: "Pune" }
      ]);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      contactInfo: {
        ...formData.contactInfo,
        [name]: value
      }
    });
  };

  const handleAmenityToggle = (amenity) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(a => a !== amenity)
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      });
    }
  };

  const handleEventTypeToggle = (eventId) => {
    if (formData.suitableEvents.includes(eventId)) {
      setFormData({
        ...formData,
        suitableEvents: formData.suitableEvents.filter(id => id !== eventId)
      });
    } else {
      setFormData({
        ...formData,
        suitableEvents: [...formData.suitableEvents, eventId]
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview([reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData({
        ...formData,
        images: [...formData.images, ...files]
      });
      
      // Preview images
      const previews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result);
          if (previews.length === files.length) {
            setImagePreview([...imagePreview, ...previews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    
    const updatedPreviews = [...imagePreview];
    updatedPreviews.splice(index + 1, 1); // +1 because the first preview is the main image
    
    setFormData({ ...formData, images: updatedImages });
    setImagePreview(updatedPreviews);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Venue name is required";
      if (!formData.description.trim()) newErrors.description = "Description is required";
      if (!formData.location.trim()) newErrors.location = "Location is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
    } else if (step === 2) {
      if (!formData.price) newErrors.price = "Price is required";
      if (isNaN(formData.price)) newErrors.price = "Price must be a number";
      if (!formData.capacity) newErrors.capacity = "Capacity is required";
      if (isNaN(formData.capacity)) newErrors.capacity = "Capacity must be a number";
    } else if (step === 3) {
      if (formData.amenities.length === 0) newErrors.amenities = "Select at least one amenity";
      if (formData.suitableEvents.length === 0) newErrors.suitableEvents = "Select at least one event type";
    } else if (step === 4) {
      if (!formData.serviceFee) newErrors.serviceFee = "Service fee is required";
      if (isNaN(formData.serviceFee)) newErrors.serviceFee = "Service fee must be a number";
      if (!formData.gstPercent) newErrors.gstPercent = "GST percentage is required";
      if (isNaN(formData.gstPercent)) newErrors.gstPercent = "GST percentage must be a number";
      if (formData.inclusions.length === 0) newErrors.inclusions = "At least one inclusion is required";
    }
    
    return newErrors;
  };

  const handleNext = () => {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length === 0) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      setErrors(errors);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare data for API
      const venueData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        price: parseInt(formData.price) || 0,
        capacity: formData.capacity,
        amenities: formData.amenities,
        // Ensure we're using the proper category IDs
        suitableEvents: formData.suitableEvents.map(id => parseInt(id)),
        contact: {
          email: formData.contactInfo.email,
          phone: formData.contactInfo.phone,
          website: formData.contactInfo.website
        },
        // Convert image files to base64 if needed
        image: imagePreview[0] || null
      };
      
      // Add gallery images if available
      if (imagePreview.length > 1) {
        venueData.images = imagePreview.slice(1);
      }
      
      // Use EventService to create venue
      const response = await EventService.createVenue(venueData);
      console.log('Venue created:', response);
      
      // Success message explaining the flow
      const eventTypes = formData.suitableEvents.map(id => {
        const category = eventCategories.find(cat => cat.id === id);
        return category ? category.title : id;
      }).join(', ');
      
      alert(`Venue "${formData.name}" was added successfully!\n\nIt will now appear in the following event categories: ${eventTypes}\n\nUsers browsing these categories will be able to see and book your venue.`);
      
      // Redirect back to venues list
      navigate('/organizer/venues');
    } catch (error) {
      console.error('Error creating venue:', error);
      alert('Failed to create venue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add these new handler functions for inclusions and exclusions
  const handleInclusionToggle = (item) => {
    if (formData.inclusions.includes(item)) {
      setFormData({
        ...formData,
        inclusions: formData.inclusions.filter(i => i !== item)
      });
    } else {
      setFormData({
        ...formData,
        inclusions: [...formData.inclusions, item]
      });
    }
  };

  const handleExclusionToggle = (item) => {
    if (formData.exclusions.includes(item)) {
      setFormData({
        ...formData,
        exclusions: formData.exclusions.filter(e => e !== item)
      });
    } else {
      setFormData({
        ...formData,
        exclusions: [...formData.exclusions, item]
      });
    }
  };

  const handleCancellationPolicyChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      cancellationPolicy: {
        ...formData.cancellationPolicy,
        [name]: parseInt(value)
      }
    });
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Render form steps
  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h2 className="step-title">Basic Information</h2>
            
            <div className="mb-3">
              <label className="form-label">Venue Name*</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                name="name"
                value={formData.name}
                onChange={handleBasicInfoChange}
                placeholder="e.g. Royal Grand Palace"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            
            <div className="mb-3">
              <label className="form-label">Description*</label>
              <textarea
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                name="description"
                value={formData.description}
                onChange={handleBasicInfoChange}
                rows="4"
                placeholder="Describe your venue in detail"
              ></textarea>
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>
            
            <div className="mb-3">
              <label className="form-label">Location/City*</label>
              <select
                className={`form-select ${errors.location ? 'is-invalid' : ''}`}
                name="location"
                value={formData.location}
                onChange={handleBasicInfoChange}
              >
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city.id} value={city.name}>{city.name}</option>
                ))}
              </select>
              {errors.location && <div className="invalid-feedback">{errors.location}</div>}
            </div>
            
            <div className="mb-3">
              <label className="form-label">Full Address*</label>
              <textarea
                className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                name="address"
                value={formData.address}
                onChange={handleBasicInfoChange}
                rows="2"
                placeholder="Street address, landmarks, etc."
              ></textarea>
              {errors.address && <div className="invalid-feedback">{errors.address}</div>}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="form-step">
            <h2 className="step-title">Capacity and Pricing</h2>
            
            <div className="mb-3">
              <label className="form-label">Capacity*</label>
              <input
                type="text"
                className={`form-control ${errors.capacity ? 'is-invalid' : ''}`}
                name="capacity"
                value={formData.capacity}
                onChange={handleBasicInfoChange}
                placeholder="e.g. 50-500 guests"
              />
              {errors.capacity && <div className="invalid-feedback">{errors.capacity}</div>}
            </div>
            
            <div className="mb-3">
              <label className="form-label">Price (₹)*</label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <input
                  type="number"
                  className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                  name="price"
                  value={formData.price}
                  onChange={handleBasicInfoChange}
                  placeholder="Base price"
                />
                <span className="input-group-text">onwards</span>
              </div>
              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="form-step">
            <h2 className="step-title">Amenities and Event Types</h2>
            
            <div className="mb-4">
              <label className="form-label">Amenities*</label>
              <div className="amenities-container">
                {["Wifi", "Parking", "Catering", "AC", "Decoration", "DJ", "Security", "Power Backup"].map((amenity) => (
                  <div 
                    key={amenity} 
                    className={`amenity-item ${formData.amenities.includes(amenity) ? 'selected' : ''}`}
                    onClick={() => handleAmenityToggle(amenity)}
                  >
                    {getAmenityIcon(amenity)}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
              {errors.amenities && <div className="text-danger mt-2">{errors.amenities}</div>}
            </div>
            
            <div className="mb-3">
              <label className="form-label">Suitable for Event Types* <span className="text-danger fw-bold">(Important: Select at least one event category)</span></label>
              <p className="text-muted mb-2">
                Venues will be shown to users browsing these event categories. Selecting the right categories helps users find your venue.
              </p>
              <div className="event-types-container">
                {eventCategories.map(category => (
                  <div 
                    key={category.id}
                    className={`event-type-item ${formData.suitableEvents.includes(category.id) ? 'selected' : ''}`}
                    onClick={() => handleEventTypeToggle(category.id)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">{category.title}</span>
                      {formData.suitableEvents.includes(category.id) && (
                        <span className="badge bg-success">Selected</span>
                      )}
                    </div>
                    <small className="d-block mt-1 text-muted">
                      {category.description || 'Suitable for this event type'}
                    </small>
                  </div>
                ))}
              </div>
              {errors.suitableEvents && <div className="text-danger mt-2">{errors.suitableEvents}</div>}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="form-section">
            <h3 className="section-title">Pricing & Policies</h3>
            
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label htmlFor="price">Base Price (₹)</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                      id="price"
                      name="price"
                      placeholder="e.g., 50000"
                      value={formData.price}
                      onChange={handleBasicInfoChange}
                    />
                  </div>
                  {errors.price && <div className="invalid-feedback d-block">{errors.price}</div>}
                  <small className="text-muted">Base price for the venue</small>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label htmlFor="serviceFee">Service Fee (₹)</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className={`form-control ${errors.serviceFee ? 'is-invalid' : ''}`}
                      id="serviceFee"
                      name="serviceFee"
                      placeholder="e.g., 3000"
                      value={formData.serviceFee}
                      onChange={handlePricingChange}
                    />
                  </div>
                  {errors.serviceFee && <div className="invalid-feedback d-block">{errors.serviceFee}</div>}
                  <small className="text-muted">Platform service fee</small>
                </div>
              </div>
            </div>
            
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label htmlFor="gstPercent">GST Percentage (%)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className={`form-control ${errors.gstPercent ? 'is-invalid' : ''}`}
                      id="gstPercent"
                      name="gstPercent"
                      placeholder="e.g., 18"
                      value={formData.gstPercent}
                      onChange={handlePricingChange}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                  {errors.gstPercent && <div className="invalid-feedback d-block">{errors.gstPercent}</div>}
                  <small className="text-muted">Current GST percentage for venue bookings</small>
                </div>
              </div>
            </div>
            
            <h4 className="mb-3">What's Included</h4>
            {errors.inclusions && <div className="text-danger mb-2">{errors.inclusions}</div>}
            <div className="row mb-4">
              {['Basic decoration', 'Sound system', 'Parking space', 'Backup power', 'Security', 'Cleaning', 'Chairs & Tables', 'Basic lighting'].map((item) => (
                <div className="col-md-3 col-6 mb-2" key={item}>
                  <div 
                    className={`amenity-item ${formData.inclusions.includes(item) ? 'selected' : ''}`}
                    onClick={() => handleInclusionToggle(item)}
                  >
                    <FaCheck className={formData.inclusions.includes(item) ? 'visible' : 'invisible'} />
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <h4 className="mb-3">What's Excluded</h4>
            <div className="row mb-4">
              {['Food & beverages', 'Custom decoration', 'Photography', 'Videography', 'DJ services', 'Catering', 'Alcohol', 'Transportation'].map((item) => (
                <div className="col-md-3 col-6 mb-2" key={item}>
                  <div 
                    className={`amenity-item ${formData.exclusions.includes(item) ? 'selected' : ''}`}
                    onClick={() => handleExclusionToggle(item)}
                  >
                    <FaCheck className={formData.exclusions.includes(item) ? 'visible' : 'invisible'} />
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <h4 className="mb-3">Cancellation Policy</h4>
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="form-group mb-3">
                  <label htmlFor="fullRefund">Full Refund (days before event)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="fullRefund"
                    name="fullRefund"
                    min="0"
                    max="30"
                    value={formData.cancellationPolicy.fullRefund}
                    onChange={handleCancellationPolicyChange}
                  />
                  <small className="text-muted">Number of days before event for full refund</small>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="form-group mb-3">
                  <label htmlFor="partialRefund">Partial Refund (days before event)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="partialRefund"
                    name="partialRefund"
                    min="0"
                    max={formData.cancellationPolicy.fullRefund}
                    value={formData.cancellationPolicy.partialRefund}
                    onChange={handleCancellationPolicyChange}
                  />
                  <small className="text-muted">Number of days before event for partial refund</small>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="form-group mb-3">
                  <label htmlFor="partialRefundPercent">Partial Refund Percentage (%)</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      id="partialRefundPercent"
                      name="partialRefundPercent"
                      min="0"
                      max="100"
                      value={formData.cancellationPolicy.partialRefundPercent}
                      onChange={handleCancellationPolicyChange}
                    />
                    <span className="input-group-text">%</span>
                  </div>
                  <small className="text-muted">Percentage of refund for partial cancellations</small>
                </div>
              </div>
            </div>
            
            <div className="cancellation-policy-preview mb-4 p-3 border rounded">
              <h5 className="mb-3">Preview of Cancellation Policy</h5>
              <p>
                <strong>Free cancellation up to {formData.cancellationPolicy.fullRefund} days before the event.</strong><br />
                {formData.cancellationPolicy.partialRefundPercent}% refund for cancellations between {formData.cancellationPolicy.fullRefund}-{formData.cancellationPolicy.partialRefund} days before the event.<br />
                No refund for cancellations less than {formData.cancellationPolicy.partialRefund} days before the event.
              </p>
            </div>
            
            <div className="form-navigation">
              <button type="button" className="btn btn-secondary" onClick={handlePrevious}>
                <FaArrowLeft className="me-2" /> Previous
              </button>
              <button type="button" className="btn btn-primary ms-2" onClick={handleSubmit}>
                <FaSave className="me-2" /> Save Venue
              </button>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="form-step">
            <h2 className="step-title">Contact Information</h2>
            
            <div className="mb-3">
              <label className="form-label">Phone Number*</label>
              <input
                type="tel"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                name="phone"
                value={formData.contactInfo.phone}
                onChange={handleContactInfoChange}
                placeholder="e.g. +91 9876543210"
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
            
            <div className="mb-3">
              <label className="form-label">Email Address*</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                name="email"
                value={formData.contactInfo.email}
                onChange={handleContactInfoChange}
                placeholder="e.g. bookings@venue.com"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            
            <div className="mb-3">
              <label className="form-label">Website (Optional)</label>
              <input
                type="url"
                className="form-control"
                name="website"
                value={formData.contactInfo.website}
                onChange={handleContactInfoChange}
                placeholder="e.g. www.venue.com"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <FaWifi />;
      case 'parking':
        return <FaParking />;
      case 'ac':
        return <FaSnowflake />;
      case 'catering':
        return <FaUtensils />;
      case 'dj':
        return <FaMusic />;
      default:
        return <FaBuilding />;
    }
  };

  return (
    <div className="add-venue-container">
      <div className="page-header mb-4">
        <button 
          type="button"
          className="btn btn-link back-button"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft /> Back
        </button>
        <h1>Add New Venue</h1>
      </div>
      
      <div className="form-container">
        {/* Progress Steps */}
        <div className="progress-steps">
          {[1, 2, 3, 4, 5].map((step) => (
            <div 
              key={step} 
              className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Capacity & Price'}
                {step === 3 && 'Amenities'}
                {step === 4 && 'Pricing & Policies'}
                {step === 5 && 'Contact'}
              </div>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit}>
          {renderFormStep()}
          
          <div className="form-navigation">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={handlePrevious}
              >
                Previous
              </button>
            )}
            
            {currentStep < 5 ? (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" /> Save Venue
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .add-venue-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .back-button {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #6c757d;
          text-decoration: none;
          margin-bottom: 10px;
        }
        
        .progress-steps {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          position: relative;
        }
        
        .progress-steps::before {
          content: '';
          position: absolute;
          top: 15px;
          left: 0;
          right: 0;
          height: 2px;
          background: #e9ecef;
          z-index: 1;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }
        
        .step-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 5px;
          font-weight: bold;
          color: #6c757d;
        }
        
        .step.active .step-number {
          background-color: #007bff;
          color: white;
        }
        
        .step.completed .step-number {
          background-color: #28a745;
          color: white;
        }
        
        .step-label {
          font-size: 0.8rem;
          color: #6c757d;
        }
        
        .form-container {
          background: white;
          border-radius: 5px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .step-title {
          font-size: 1.5rem;
          margin-bottom: 20px;
          color: #343a40;
        }
        
        .form-navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }
        
        .file-upload-container {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }
        
        .file-upload-box {
          position: relative;
          width: 150px;
          height: 150px;
        }
        
        .file-input {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 2;
        }
        
        .file-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          border: 2px dashed #ced4da;
          border-radius: 5px;
          cursor: pointer;
          background: #f8f9fa;
        }
        
        .upload-icon {
          font-size: 2rem;
          color: #6c757d;
          margin-bottom: 10px;
        }
        
        .image-preview {
          width: 150px;
          height: 150px;
          border-radius: 5px;
          overflow: hidden;
        }
        
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .gallery-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 15px;
        }
        
        .gallery-item {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 5px;
          overflow: hidden;
        }
        
        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .remove-image-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        
        .amenities-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .amenity-item {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 15px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .amenity-item.selected {
          background: #e3f2fd;
          border-color: #90caf9;
          color: #1976d2;
        }
        
        .event-types-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .event-type-item {
          padding: 8px 15px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .event-type-item.selected {
          background: #e3f2fd;
          border-color: #90caf9;
          color: #1976d2;
        }
      `}</style>
    </div>
  );
};

export default AddVenue; 
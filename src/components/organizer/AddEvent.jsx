import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaArrowRight,
  FaCheck,
  FaImage,
  FaPlus,
  FaTrash,
  FaWifi,
  FaParking,
  FaSnowflake, 
  FaUtensils,
  FaMusic,
  FaBuilding,
  FaSave,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaMoneyBillWave,
  FaClock,
  FaInfoCircle,
  FaUpload,
  FaTimes,
  FaExclamationTriangle,
  FaPercent
} from 'react-icons/fa';
import EventService from '../../services/EventService';
import './AddEvent.css'; // Import the CSS file

export const AddEvent = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [eventImagePreview, setEventImagePreview] = useState(null);
  const [venueImagePreviews, setVenueImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState(null);
  
  // State for event categories
  const [eventCategories, setEventCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Event Details
    title: '',
    eventType: '',
    categoryId: '',
    description: '',
    eventImage: null,
    
    // Step 2: Venue Details
    venue: {
      name: '',
      location: '',
    city: '',
    capacity: '',
    price: '',
      description: '',
      pincode: '',
      images: []
    },
    
    // Step 3: Event Settings
    inclusions: [],
    exclusions: [],
    serviceFee: 3000,
    gstPercent: 18,
    cancellationPolicy: {
      fullRefund: 7,
      partialRefund: 3,
      partialRefundPercent: 50
    },
    
    // Step 4: Additional Info
    requirements: '',
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    },
    
    // Note: date and time fields removed as customers will provide these when booking
    isDateTimeFlexible: true
  });
  
  // Fetch event categories on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingCategories(true);
      try {
        // Fetch categories
        const categories = await EventService.getEventCategories();
        if (categories && categories.length > 0) {
          setEventCategories(categories);
          console.log('Fetched event categories:', categories);
        } else {
          // Use fallback categories if API fails
          setEventCategories([
            { id: 1, title: 'Wedding', description: 'Wedding ceremonies and receptions' },
            { id: 2, title: 'Corporate Event', description: 'Business meetings and conferences' },
            { id: 3, title: 'Birthday Party', description: 'Birthday celebrations' },
            { id: 4, title: 'Anniversary Celebration', description: 'Anniversary parties' },
            { id: 5, title: 'Family Gathering', description: 'Family get-togethers' },
            { id: 6, title: 'Engagement Ceremony', description: 'Engagement celebrations' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Available event types from categories
  const eventTypes = eventCategories.map(category => category.title);
  
  // List of cities
  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Ahmedabad',
    'Pune'
  ];
  
  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      // Special handling for eventType to also set categoryId
      if (name === 'eventType') {
        const selectedCategory = eventCategories.find(cat => cat.title === value);
        setFormData({
          ...formData,
          [name]: value,
          categoryId: selectedCategory ? selectedCategory.id : ''
        });
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    }
  };
  
  // Handle event image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        eventImage: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setEventImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle venue image selection
  const handleVenueImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Check total image count
    const totalImages = formData.venue.images.length + files.length;
    if (totalImages > 5) {
      alert("You can upload a maximum of 5 images");
      return;
    }
    
    // Add the new files to existing images
    const updatedImages = [...formData.venue.images, ...files];
    
      setFormData({
        ...formData,
      venue: {
        ...formData.venue,
        images: updatedImages
      }
      });
    
    // Create previews for the new images
    const newPreviews = [];
      
      files.forEach(file => {
        const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result);
        
        // When all new previews are created, update state
        if (newPreviews.length === files.length) {
          setVenueImagePreviews([...venueImagePreviews, ...newPreviews]);
        }
        };
        reader.readAsDataURL(file);
      });
  };
  
  // Remove event image
  const removeImage = () => {
    setFormData({
      ...formData,
      eventImage: null
    });
    setEventImagePreview(null);
  };
  
  // Remove venue image
  const removeVenueImage = (index) => {
    const updatedImages = [...formData.venue.images];
    updatedImages.splice(index, 1);
    
    const updatedPreviews = [...venueImagePreviews];
    updatedPreviews.splice(index, 1);
    
    setFormData({
      ...formData,
      venue: {
        ...formData.venue,
        images: updatedImages
      }
    });
    
    setVenueImagePreviews(updatedPreviews);
  };
  
  // Toggle inclusions selection
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
  
  // Toggle exclusions selection
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
  
  // Handle cancellation policy change
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
  
  // Form validation - remove pincode validation
  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.title) newErrors.title = "Event title is required";
      if (!formData.eventType) newErrors.eventType = "Event type is required";
      if (!formData.description) newErrors.description = "Description is required";
    } else if (step === 2) {
      if (!formData.venue.name) newErrors['venue.name'] = "Venue name is required";
      if (!formData.venue.location) newErrors['venue.location'] = "Venue location is required";
      if (!formData.venue.city) newErrors['venue.city'] = "City is required";
      if (!formData.venue.capacity) newErrors['venue.capacity'] = "Venue capacity is required";
      if (!formData.venue.price) newErrors['venue.price'] = "Venue price is required";
    } else if (step === 3) {
      if (formData.inclusions.length === 0) newErrors.inclusions = "At least one inclusion is required";
    }
    
    return newErrors;
  };
  
  // Function to render step indicators
  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Event Details' },
      { number: 2, label: 'Venue Details' },
      { number: 3, label: 'Event Settings' },
      { number: 4, label: 'Additional Info' }
    ];
    
    return (
      <div className="steps-container">
        <div className="steps-wrapper">
          <div className="step-indicator">
            {steps.map((step) => (
              <div 
                key={step.number} 
                className={`step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
              >
                <div className="step-number">
                  {currentStep > step.number ? <FaCheck /> : step.number}
                </div>
                <div className="step-label">{step.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Function to render alert message
  const renderAlert = () => {
    if (!alertMessage) return null;
    
    return (
      <div className={`alert ${alertMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
        {alertMessage.type === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
        <span className="ml-2">{alertMessage.message}</span>
      </div>
    );
  };

  // Function to render the content for the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderEventDetailsStep();
      case 2:
        return renderVenueDetailsStep();
      case 3:
        return renderEventSettingsStep();
      case 4:
        return renderAdditionalInfoStep();
      default:
        return null;
    }
  };

  // Step 1: Event Details
  const renderEventDetailsStep = () => {
    return (
      <div className="add-event-container">
        <h2 className="step-title">Event Details</h2>
        {renderAlert()}
        
        <div className="form-card">
          <div className="form-row">
            <div className="form-group col-md-6">
              <label className="form-label">
                Event Title <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                    </div>
            
            <div className="form-group col-md-6">
              <label className="form-label">
                Event Type <span className="required">*</span>
              </label>
                  <select
                className={`form-control ${errors.eventType ? 'is-invalid' : ''}`}
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                  >
                <option value="">Select event type</option>
                {eventTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                    ))}
                  </select>
                {errors.eventType && <div className="invalid-feedback">{errors.eventType}</div>}
            </div>
              </div>
              
          <div className="form-group">
            <label className="form-label">
              Description <span className="required">*</span>
            </label>
                <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
              rows="4"
                  placeholder="Describe your event"
                ></textarea>
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>
              
          <div className="form-group">
            <label className="form-label">
              Event Image <span className="required">*</span>
            </label>
            <div className="image-upload-container">
                <input
                  type="file"
                id="eventImage"
                name="eventImage"
                  accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              
              {!eventImagePreview ? (
                <label htmlFor="eventImage" className="image-upload-area">
                  <div className="upload-placeholder">
                    <FaUpload className="upload-icon" />
                    <p>Click to upload an image</p>
                    <small>JPG, PNG or GIF (max. 10MB)</small>
                  </div>
                </label>
              ) : (
                <div className="image-preview">
                  <img src={eventImagePreview} alt="Event preview" />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    <FaTimes />
                  </button>
                  </div>
                )}
            </div>
            {errors.eventImage && <div className="invalid-feedback">{errors.eventImage}</div>}
          </div>
              </div>
            </div>
          );
  };

  // Step 2: Venue Details
  const renderVenueDetailsStep = () => {
    return (
      <div className="add-event-container">
        <h2 className="step-title">Venue Details</h2>
        {renderAlert()}
        
        <div className="form-card">
          <div className="form-row">
            <div className="form-group col-md-6">
              <label className="form-label">
                Venue Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors['venue.name'] ? 'is-invalid' : ''}`}
                name="venue.name"
                value={formData.venue.name}
                onChange={handleChange}
                placeholder="Enter venue name"
              />
              {errors['venue.name'] && <div className="invalid-feedback">{errors['venue.name']}</div>}
            </div>
            
            <div className="form-group col-md-6">
              <label className="form-label">
                City <span className="required">*</span>
              </label>
                <select
                className={`form-control ${errors['venue.city'] ? 'is-invalid' : ''}`}
                name="venue.city"
                value={formData.venue.city}
                  onChange={handleChange}
                >
                  <option value="">Select city</option>
                  {cities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                  ))}
                </select>
              {errors['venue.city'] && <div className="invalid-feedback">{errors['venue.city']}</div>}
            </div>
              </div>
              
          <div className="form-group">
            <label className="form-label">
              Venue Address <span className="required">*</span>
            </label>
            <textarea
              className={`form-control ${errors['venue.location'] ? 'is-invalid' : ''}`}
              name="venue.location"
              value={formData.venue.location}
              onChange={handleChange}
              rows="2"
              placeholder="Enter full venue address"
            ></textarea>
            {errors['venue.location'] && <div className="invalid-feedback">{errors['venue.location']}</div>}
          </div>
          
          <div className="form-row">
            <div className="form-group col-md-4">
              <label className="form-label">
                Venue Capacity <span className="required">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaUsers />
                </span>
                <input
                  type="number"
                  className={`form-control ${errors['venue.capacity'] ? 'is-invalid' : ''}`}
                  name="venue.capacity"
                  value={formData.venue.capacity}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                />
              </div>
              {errors['venue.capacity'] && <div className="invalid-feedback">{errors['venue.capacity']}</div>}
            </div>
            
            <div className="form-group col-md-4">
              <label className="form-label">
                Venue Price per Day (₹) <span className="required">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <input
                  type="number"
                  className={`form-control ${errors['venue.price'] ? 'is-invalid' : ''}`}
                  name="venue.price"
                  value={formData.venue.price}
                  onChange={handleChange}
                  placeholder="e.g., 25000"
                />
              </div>
              {errors['venue.price'] && <div className="invalid-feedback">{errors['venue.price']}</div>}
            </div>
              </div>
              
          <div className="form-group">
            <label className="form-label">
              Venue Description
            </label>
                <textarea
                  className="form-control"
              name="venue.description"
              value={formData.venue.description}
                  onChange={handleChange}
              rows="3"
              placeholder="Describe the venue features and amenities"
                ></textarea>
              </div>
              
          <div className="form-group">
            <label className="form-label">
              Venue Images (Maximum 5)
            </label>
            <div className="venue-image-container">
              <div className="image-upload-area mb-3">
                <input
                  type="file"
                  id="venueImages"
                  name="venueImages"
                  accept="image/*"
                  onChange={handleVenueImageChange}
                  style={{ display: 'none' }}
                  multiple
                />
                
                <label htmlFor="venueImages" className="btn btn-outline-primary mb-3">
                  <FaUpload className="me-2" /> Add Images ({venueImagePreviews.length}/5)
                </label>
                
                <small className="d-block text-muted mb-3">JPG, PNG or GIF (max. 10MB each)</small>
                
                {venueImagePreviews.length > 0 && (
                  <div className="venue-image-previews row">
                    {venueImagePreviews.map((preview, index) => (
                      <div className="col-md-4 mb-3" key={index}>
                        <div className="position-relative">
                          <img 
                            src={preview} 
                            alt={`Venue preview ${index + 1}`} 
                            className="img-thumbnail" 
                            style={{ height: '150px', objectFit: 'cover' }}
                          />
                          <button 
                            type="button" 
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            onClick={() => removeVenueImage(index)}
                          >
                            <FaTimes />
                          </button>
              </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Step 3: Event Settings
  const renderEventSettingsStep = () => {
    return (
      <div className="add-event-container">
        <h2 className="step-title">Event Settings</h2>
        {renderAlert()}
        
        <div className="form-card">
          <div className="row mb-4">
                <div className="col-md-6">
              <label className="form-label">Service Fee</label>
              <div className="d-flex align-items-center mb-2">
                <div className="me-2">₹</div>
                  <input
                  type="number"
                  className="form-control"
                  id="serviceFee"
                  name="serviceFee"
                  placeholder="3000"
                  value={formData.serviceFee}
                    onChange={handleChange}
                  />
                </div>
              <small className="text-muted">Platform service fee</small>
            </div>
            
                <div className="col-md-6">
              <label className="form-label">GST Percentage</label>
              <div className="d-flex align-items-center mb-2">
                  <input
                  type="number"
                  className="form-control"
                  id="gstPercent"
                  name="gstPercent"
                  placeholder="18"
                  value={formData.gstPercent}
                    onChange={handleChange}
                  />
                <div className="ms-2">%</div>
              </div>
              <small className="text-muted">Current GST percentage for event bookings</small>
                </div>
              </div>
              
          <h4 className="mb-3">What's Included</h4>
          {formData.inclusions.length === 0 && (
            <div className="text-danger mb-3">At least one inclusion is required</div>
          )}
          
          <div className="row mb-4">
            <div className="col-md-3">
              <div 
                className="d-flex align-items-center mb-2 inclusion-item" 
                onClick={() => handleInclusionToggle('Basic decoration')}
                style={{ cursor: 'pointer' }}
              >
                {formData.inclusions.includes('Basic decoration') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Basic decoration</span>
              </div>
              
              <div 
                className="d-flex align-items-center mb-2 inclusion-item" 
                onClick={() => handleInclusionToggle('Security')}
                style={{ cursor: 'pointer' }}
              >
                {formData.inclusions.includes('Security') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Security</span>
                </div>
              </div>
              
            <div className="col-md-3">
              <div 
                className="d-flex align-items-center mb-2 inclusion-item" 
                onClick={() => handleInclusionToggle('Sound system')}
                style={{ cursor: 'pointer' }}
              >
                {formData.inclusions.includes('Sound system') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Sound system</span>
                </div>
              
              <div 
                className="d-flex align-items-center mb-2 inclusion-item" 
                onClick={() => handleInclusionToggle('Cleaning')}
                style={{ cursor: 'pointer' }}
              >
                {formData.inclusions.includes('Cleaning') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Cleaning</span>
              </div>
            </div>
            
            <div className="col-md-3">
              <div 
                className="d-flex align-items-center mb-2 inclusion-item" 
                onClick={() => handleInclusionToggle('Parking space')}
                style={{ cursor: 'pointer' }}
              >
                {formData.inclusions.includes('Parking space') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Parking space</span>
              </div>
              
              <div 
                className="d-flex align-items-center mb-2 inclusion-item" 
                onClick={() => handleInclusionToggle('Chairs & Tables')}
                style={{ cursor: 'pointer' }}
              >
                {formData.inclusions.includes('Chairs & Tables') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Chairs & Tables</span>
              </div>
            </div>
            
            <div className="col-md-3">
              <div 
                className="d-flex align-items-center mb-2 inclusion-item" 
                onClick={() => handleInclusionToggle('Backup power')}
                style={{ cursor: 'pointer' }}
              >
                {formData.inclusions.includes('Backup power') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Backup power</span>
              </div>
              
              <div 
                className="d-flex align-items-center mb-2 inclusion-item" 
                onClick={() => handleInclusionToggle('Basic lighting')}
                style={{ cursor: 'pointer' }}
              >
                {formData.inclusions.includes('Basic lighting') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Basic lighting</span>
              </div>
            </div>
          </div>
          
          <h4 className="mb-3">What's Excluded</h4>
          <div className="row mb-4">
            <div className="col-md-3">
              <div 
                className="d-flex align-items-center mb-2 exclusion-item" 
                onClick={() => handleExclusionToggle('Food & beverages')}
                style={{ cursor: 'pointer' }}
              >
                {formData.exclusions.includes('Food & beverages') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Food & beverages</span>
              </div>
              
              <div 
                className="d-flex align-items-center mb-2 exclusion-item" 
                onClick={() => handleExclusionToggle('DJ services')}
                style={{ cursor: 'pointer' }}
              >
                {formData.exclusions.includes('DJ services') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>DJ services</span>
              </div>
            </div>
            
            <div className="col-md-3">
              <div 
                className="d-flex align-items-center mb-2 exclusion-item" 
                onClick={() => handleExclusionToggle('Custom decoration')}
                style={{ cursor: 'pointer' }}
              >
                {formData.exclusions.includes('Custom decoration') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Custom decoration</span>
              </div>
              
              <div 
                className="d-flex align-items-center mb-2 exclusion-item" 
                onClick={() => handleExclusionToggle('Catering')}
                style={{ cursor: 'pointer' }}
              >
                {formData.exclusions.includes('Catering') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Catering</span>
              </div>
            </div>
            
            <div className="col-md-3">
              <div 
                className="d-flex align-items-center mb-2 exclusion-item" 
                onClick={() => handleExclusionToggle('Photography')}
                style={{ cursor: 'pointer' }}
              >
                {formData.exclusions.includes('Photography') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Photography</span>
              </div>
              
              <div 
                className="d-flex align-items-center mb-2 exclusion-item" 
                onClick={() => handleExclusionToggle('Alcohol')}
                style={{ cursor: 'pointer' }}
              >
                {formData.exclusions.includes('Alcohol') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Alcohol</span>
              </div>
            </div>
            
            <div className="col-md-3">
              <div 
                className="d-flex align-items-center mb-2 exclusion-item" 
                onClick={() => handleExclusionToggle('Videography')}
                style={{ cursor: 'pointer' }}
              >
                {formData.exclusions.includes('Videography') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Videography</span>
              </div>
              
              <div 
                className="d-flex align-items-center mb-2 exclusion-item" 
                onClick={() => handleExclusionToggle('Transportation')}
                style={{ cursor: 'pointer' }}
              >
                {formData.exclusions.includes('Transportation') && (
                  <span className="me-2" style={{ color: '#333' }}>✓</span>
                )}
                <span>Transportation</span>
              </div>
            </div>
          </div>
          
          <h4 className="mb-3">Cancellation Policy</h4>
          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label">Full Refund (days before event)</label>
                <input
                type="number"
                className="form-control"
                id="fullRefund"
                name="fullRefund"
                min="0"
                max="30"
                placeholder="7"
                value={formData.cancellationPolicy.fullRefund}
                onChange={handleCancellationPolicyChange}
              />
              <small className="text-muted">Number of days before event for full refund</small>
            </div>
            
            <div className="col-md-4">
              <label className="form-label">Partial Refund (days before event)</label>
              <input
                type="number"
                className="form-control"
                id="partialRefund"
                name="partialRefund"
                min="0"
                max={formData.cancellationPolicy.fullRefund}
                placeholder="3"
                value={formData.cancellationPolicy.partialRefund}
                onChange={handleCancellationPolicyChange}
              />
              <small className="text-muted">Number of days before event for partial refund</small>
                      </div>
            
            <div className="col-md-4">
              <label className="form-label">Partial Refund Percentage (%)</label>
              <div className="d-flex align-items-center mb-2">
                <input
                  type="number"
                  className="form-control"
                  id="partialRefundPercent"
                  name="partialRefundPercent"
                  min="0"
                  max="100"
                  placeholder="50"
                  value={formData.cancellationPolicy.partialRefundPercent}
                  onChange={handleCancellationPolicyChange}
                />
                <div className="ms-2">%</div>
                  </div>
              <small className="text-muted">Percentage of refund for partial cancellations</small>
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
        </div>
      </div>
    );
  };

  // Step 4: Additional Info
  const renderAdditionalInfoStep = () => {
    return (
      <div className="add-event-container">
        <h2 className="step-title">Additional Information</h2>
        {renderAlert()}
        
        <div className="form-card">
          <div className="form-group">
            <label className="form-label">Special Requirements/Notes (Optional)</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              className="form-control"
              rows="4"
              placeholder="Any special requirements or notes for attendees..."
            ></textarea>
          </div>
          
          <h4 className="mb-3">Contact Information</h4>
          
          <div className="form-row">
            <div className="form-group col-md-6">
              <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="contactInfo.phone"
                  value={formData.contactInfo.phone}
                  onChange={handleChange}
                className="form-control"
                placeholder="Contact phone number"
                />
              </div>
              
            <div className="form-group col-md-6">
              <label className="form-label">Email</label>
                <input
                  type="email"
                  name="contactInfo.email"
                  value={formData.contactInfo.email}
                  onChange={handleChange}
                className="form-control"
                placeholder="Contact email address"
                />
            </div>
              </div>
              
          <div className="form-group">
            <label className="form-label">Website (Optional)</label>
                <input
                  type="url"
                  name="contactInfo.website"
                  value={formData.contactInfo.website}
                  onChange={handleChange}
              className="form-control"
              placeholder="Event website if available"
                />
          </div>
              </div>
            </div>
          );
  };

  // Navigation between steps
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  // Validation for each step
  const validateCurrentStep = () => {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate a truly unique pincode - this is required because of the database constraint
      const uniquePincode = Date.now().toString() + Math.floor(Math.random() * 1000000);
      
      // Prepare event data for API - modified to match backend schema
      const eventData = {
        // Top-level fields from Event model
        name: formData.title,  // Using 'name' instead of 'title' to match backend
        description: formData.description,
        location: formData.venue.location, // Required top-level field
        image: eventImagePreview,
        category: formData.eventType,
        categoryId: formData.categoryId,
        price: parseInt(formData.venue.price) || 0,
        capacity: formData.venue.capacity,
        eventType: formData.eventType,
        pincode: uniquePincode, // Add unique pincode to satisfy database constraint
        
        // Additional venue details
        venue: {
          name: formData.venue.name,
          location: formData.venue.location,
          description: formData.venue.description,
          images: venueImagePreviews, // Use all image previews
          price: parseInt(formData.venue.price) || 0,
          capacity: formData.venue.capacity,
          city: formData.venue.city,
          pincode: uniquePincode // Add unique pincode to venue object as well
        },

        // Other event details
        inclusions: formData.inclusions,
        exclusions: formData.exclusions,
        serviceFee: formData.serviceFee,
        gstPercent: formData.gstPercent,
        cancellationPolicy: formData.cancellationPolicy,
        requirements: formData.requirements,
        
        // Contact details
        contact: {
          email: formData.contactInfo.email,
          phone: formData.contactInfo.phone
        },
        
        // Flag for flexible date/time
        isDateTimeFlexible: true
      };
      
      console.log('Creating event with data:', eventData);
      
      // Call API to create event
      const response = await EventService.createEvent(eventData);
      console.log('Event created successfully:', response);
      
      // Show success message and redirect
      setAlertMessage({
        type: 'success',
        message: 'Event template created successfully! Redirecting to events list...'
      });
      
      setTimeout(() => {
        navigate('/organizer/events');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating event:', error);
      
      setAlertMessage({
        type: 'error',
        message: error.message || 'Failed to create event. Please try again.'
      });
      
    } finally {
      setLoading(false);
    }
  };

  // Render the form navigation buttons
  const renderFormNavigation = () => {
    return (
      <div className="form-navigation">
        {currentStep > 1 && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
            onClick={prevStep}
          >
            <FaArrowLeft className="btn-icon" /> Previous
                </button>
              )}
              
        {currentStep < 4 ? (
                <button 
                  type="button" 
                  className="btn btn-primary" 
            onClick={nextStep}
                >
            Next <FaArrowRight className="btn-icon" />
                </button>
              ) : (
                <button 
            type="button" 
            className="btn btn-success" 
            onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating...
                    </>
                  ) : (
                    <>
                <FaSave className="btn-icon" /> Create Event Template
                    </>
                  )}
                </button>
              )}
            </div>
    );
  };

  return (
    <div className="add-event-page">
      <div className="add-event-header">
        <h1>Create Event Template</h1>
        <p className="text-muted">
          Create an event template with venue details. Customers will select their preferred date and time during booking.
        </p>
        </div>
      
      {renderStepIndicator()}
      
      <div className="form-container">
        {renderStepContent()}
        {renderFormNavigation()}
      </div>
    </div>
  );
};

export default AddEvent;
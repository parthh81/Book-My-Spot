import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaChevronRight,
  FaWifi,
  FaParking,
  FaAccessibleIcon,
  FaVideo,
  FaUtensils,
  FaAirFreshener,
  FaPlus,
  FaTrash
} from 'react-icons/fa';

export const AddPlace = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  
  const [placeData, setPlaceData] = useState({
    name: '',
    description: '',
    address: '',
    cityId: '',
    areaId: '',
    capacity: '',
    price: '',
    type: '',
    images: [],
    coverImage: null,
    amenities: {
      wifi: false,
      parking: false,
      audioVisual: false,
      catering: false,
      accessibility: false,
      airConditioning: false
    },
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    fetchCities();
  }, []);
  
  useEffect(() => {
    if (selectedCity) {
      fetchAreas(selectedCity);
    } else {
      setAreas([]);
    }
  }, [selectedCity]);

  const fetchCities = async () => {
    try {
      // In a real app, you would fetch cities from your API
      // const response = await axios.get('/api/cities');
      // setCities(response.data);
      
      // Demo data
      setCities([
        { _id: 'city1', name: 'Mumbai' },
        { _id: 'city2', name: 'Delhi' },
        { _id: 'city3', name: 'Bangalore' },
        { _id: 'city4', name: 'Hyderabad' },
        { _id: 'city5', name: 'Chennai' },
        { _id: 'city6', name: 'Kolkata' },
        { _id: 'city7', name: 'Pune' },
        { _id: 'city8', name: 'Ahmedabad' }
      ]);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };
  
  const fetchAreas = async (cityId) => {
    try {
      // In a real app, you would fetch areas for the selected city
      // const response = await axios.get(`/api/areas?cityId=${cityId}`);
      // setAreas(response.data);
      
      // Demo data based on selected city
      const areasByCity = {
        'city1': [
          { _id: 'area1', name: 'Bandra' },
          { _id: 'area2', name: 'Andheri' },
          { _id: 'area3', name: 'Colaba' },
          { _id: 'area4', name: 'Worli' }
        ],
        'city2': [
          { _id: 'area5', name: 'Connaught Place' },
          { _id: 'area6', name: 'South Delhi' },
          { _id: 'area7', name: 'Dwarka' }
        ],
        'city3': [
          { _id: 'area8', name: 'Indiranagar' },
          { _id: 'area9', name: 'Koramangala' },
          { _id: 'area10', name: 'Whitefield' }
        ],
        'city4': [
          { _id: 'area11', name: 'Banjara Hills' },
          { _id: 'area12', name: 'Hitech City' },
          { _id: 'area13', name: 'Jubilee Hills' }
        ],
        'city5': [
          { _id: 'area14', name: 'T. Nagar' },
          { _id: 'area15', name: 'Adyar' },
          { _id: 'area16', name: 'Anna Nagar' }
        ]
      };
      
      setAreas(areasByCity[cityId] || []);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cityId') {
      setSelectedCity(value);
      setPlaceData({
        ...placeData,
        cityId: value,
        areaId: '' // Reset area when city changes
      });
    } else {
      setPlaceData({
        ...placeData,
        [name]: value
      });
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    setPlaceData({
      ...placeData,
      amenities: {
        ...placeData.amenities,
        [name]: checked
      }
    });
  };
  
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // In a real app, you would upload these to your server/cloud storage
      // For this demo, we'll just store them locally
      setPlaceData({
        ...placeData,
        images: [...placeData.images, ...files]
      });
    }
  };
  
  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPlaceData({
        ...placeData,
        coverImage: file
      });
    }
  };
  
  const removeImage = (index) => {
    const updatedImages = [...placeData.images];
    updatedImages.splice(index, 1);
    setPlaceData({
      ...placeData,
      images: updatedImages
    });
  };
  
  const nextStep = () => {
    const newErrors = validateStep(step);
    
    if (Object.keys(newErrors).length === 0) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      setErrors(newErrors);
    }
  };
  
  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };
  
  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!placeData.name.trim()) newErrors.name = 'Venue name is required';
      if (!placeData.description.trim()) newErrors.description = 'Description is required';
      if (!placeData.type) newErrors.type = 'Please select a venue type';
    } else if (currentStep === 2) {
      if (!placeData.address.trim()) newErrors.address = 'Address is required';
      if (!placeData.cityId) newErrors.cityId = 'City is required';
      if (!placeData.areaId) newErrors.areaId = 'Area is required';
    } else if (currentStep === 3) {
      if (!placeData.capacity) newErrors.capacity = 'Capacity is required';
      if (placeData.capacity && isNaN(placeData.capacity)) newErrors.capacity = 'Capacity must be a number';
      if (!placeData.price) newErrors.price = 'Price is required';
      if (placeData.price && isNaN(placeData.price)) newErrors.price = 'Price must be a number';
    } else if (currentStep === 4) {
      if (!placeData.contactName.trim()) newErrors.contactName = 'Contact name is required';
      if (!placeData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
      if (placeData.contactEmail && !/\S+@\S+\.\S+/.test(placeData.contactEmail)) {
        newErrors.contactEmail = 'Invalid email format';
      }
      if (!placeData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateStep(step);
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      
      try {
        // In a real app, you would send this data to your backend
        // For demo purposes, we'll just simulate an API call
        console.log('Submitting place data:', placeData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Redirect to places page on success
        navigate("/organizer/places");
      } catch (error) {
        console.error('Error creating place:', error);
        setErrors({ submit: 'Failed to create place. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };
  
  // Progress bar calculation
  const progress = (step / 5) * 100;

  // Render steps based on current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h4 className="mb-4">Basic Information</h4>
            <div className="mb-4">
              <label htmlFor="name" className="form-label fw-medium fs-5">Venue Name <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
                id="name"
                name="name"
                value={placeData.name}
                onChange={handleChange}
                placeholder="Enter venue name"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              <div className="form-text">Enter the official name of your venue.</div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="type" className="form-label fw-medium fs-5">Venue Type <span className="text-danger">*</span></label>
              <select
                className={`form-select form-select-lg ${errors.type ? 'is-invalid' : ''}`}
                id="type"
                name="type"
                value={placeData.type}
                onChange={handleChange}
              >
                <option value="">Select venue type</option>
                <option value="Hotel">Hotel</option>
                <option value="Conference Center">Conference Center</option>
                <option value="Banquet Hall">Banquet Hall</option>
                <option value="Resort">Resort</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Garden/Outdoor">Garden/Outdoor</option>
                <option value="Rooftop">Rooftop</option>
                <option value="Auditorium">Auditorium</option>
                <option value="Corporate Space">Corporate Space</option>
                <option value="Other">Other</option>
              </select>
              {errors.type && <div className="invalid-feedback">{errors.type}</div>}
              <div className="form-text">Select the category that best describes your venue.</div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="form-label fw-medium fs-5">Description <span className="text-danger">*</span></label>
              <textarea
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                id="description"
                name="description"
                rows="8"
                value={placeData.description}
                onChange={handleChange}
                placeholder="Describe your venue in detail..."
              ></textarea>
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              <div className="form-text">Provide a detailed description of your venue, including special features, ambiance, etc.</div>
            </div>
            
            <div className="d-flex justify-content-end mt-5">
              <button
                type="button"
                className="btn btn-primary btn-lg px-5 py-3"
                onClick={nextStep}
              >
                Next <FaChevronRight className="ms-2" />
              </button>
            </div>
          </>
        );
      
      case 2:
        return (
          <>
            <h4 className="mb-4">Location Details</h4>
            <div className="mb-4">
              <label htmlFor="address" className="form-label fw-medium fs-5">Full Address <span className="text-danger">*</span></label>
              <textarea
                className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                id="address"
                name="address"
                rows="3"
                value={placeData.address}
                onChange={handleChange}
                placeholder="Enter detailed address"
              ></textarea>
              {errors.address && <div className="invalid-feedback">{errors.address}</div>}
              <div className="form-text">Provide the complete address of your venue.</div>
            </div>
            
            <div className="row mb-4">
              <div className="col-md-6 mb-3 mb-md-0">
                <label htmlFor="cityId" className="form-label fw-medium fs-5">City <span className="text-danger">*</span></label>
                <select
                  className={`form-select ${errors.cityId ? 'is-invalid' : ''}`}
                  id="cityId"
                  name="cityId"
                  value={placeData.cityId}
                  onChange={handleChange}
                >
                  <option value="">Select city</option>
                  {cities.map(city => (
                    <option key={city._id} value={city._id}>{city.name}</option>
                  ))}
                </select>
                {errors.cityId && <div className="invalid-feedback">{errors.cityId}</div>}
              </div>
              
              <div className="col-md-6">
                <label htmlFor="areaId" className="form-label fw-medium fs-5">Area <span className="text-danger">*</span></label>
                <select
                  className={`form-select ${errors.areaId ? 'is-invalid' : ''}`}
                  id="areaId"
                  name="areaId"
                  value={placeData.areaId}
                  onChange={handleChange}
                  disabled={!selectedCity}
                >
                  <option value="">Select area</option>
                  {areas.map(area => (
                    <option key={area._id} value={area._id}>{area.name}</option>
                  ))}
                </select>
                {errors.areaId && <div className="invalid-feedback">{errors.areaId}</div>}
                {!selectedCity && <div className="form-text text-muted">Please select a city first</div>}
              </div>
            </div>
            
            <div className="mt-4 mb-2">
              <label className="form-label fw-medium fs-5">Location on Map</label>
              <div className="border rounded p-3 bg-light text-center">
                <FaMapMarkerAlt className="text-danger mb-2" size={24} />
                <p className="mb-1">Map integration will be available in the next update.</p>
                <small className="text-muted">You'll be able to pin your venue location on a map.</small>
              </div>
            </div>
            
            <div className="d-flex justify-content-between mt-5">
              <button
                type="button"
                className="btn btn-outline-secondary btn-lg px-4"
                onClick={prevStep}
              >
                <FaArrowLeft className="me-2" /> Back
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg px-5"
                onClick={nextStep}
              >
                Next <FaChevronRight className="ms-2" />
              </button>
            </div>
          </>
        );
      
      case 3:
        return (
          <>
            <h4 className="mb-4">Capacity & Pricing</h4>
            <div className="row mb-4">
              <div className="col-md-6 mb-3 mb-md-0">
                <label htmlFor="capacity" className="form-label fw-medium fs-5">Maximum Capacity <span className="text-danger">*</span></label>
                <div className="input-group">
                  <input
                    type="number"
                    className={`form-control ${errors.capacity ? 'is-invalid' : ''}`}
                    id="capacity"
                    name="capacity"
                    value={placeData.capacity}
                    onChange={handleChange}
                    placeholder="Enter maximum capacity"
                    min="1"
                  />
                  <span className="input-group-text">People</span>
                </div>
                {errors.capacity && <div className="invalid-feedback">{errors.capacity}</div>}
                <div className="form-text">Maximum number of people the venue can accommodate.</div>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="price" className="form-label fw-medium fs-5">Base Price (₹) <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                    id="price"
                    name="price"
                    value={placeData.price}
                    onChange={handleChange}
                    placeholder="Enter base price"
                    min="0"
                  />
                  <span className="input-group-text">Per Day</span>
                </div>
                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                <div className="form-text">The standard daily rate for booking this venue.</div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-medium fs-5">Available Amenities</label>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="wifi"
                      name="wifi"
                      checked={placeData.amenities.wifi}
                      onChange={handleAmenityChange}
                    />
                    <label className="form-check-label" htmlFor="wifi">
                      <FaWifi className="me-2 text-primary" /> WiFi Available
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="parking"
                      name="parking"
                      checked={placeData.amenities.parking}
                      onChange={handleAmenityChange}
                    />
                    <label className="form-check-label" htmlFor="parking">
                      <FaParking className="me-2 text-primary" /> Parking Available
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="audioVisual"
                      name="audioVisual"
                      checked={placeData.amenities.audioVisual}
                      onChange={handleAmenityChange}
                    />
                    <label className="form-check-label" htmlFor="audioVisual">
                      <FaVideo className="me-2 text-primary" /> Audio/Visual Equipment
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="catering"
                      name="catering"
                      checked={placeData.amenities.catering}
                      onChange={handleAmenityChange}
                    />
                    <label className="form-check-label" htmlFor="catering">
                      <FaUtensils className="me-2 text-primary" /> Catering Services
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="accessibility"
                      name="accessibility"
                      checked={placeData.amenities.accessibility}
                      onChange={handleAmenityChange}
                    />
                    <label className="form-check-label" htmlFor="accessibility">
                      <FaAccessibleIcon className="me-2 text-primary" /> Wheelchair Accessible
                    </label>
                  </div>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="airConditioning"
                      name="airConditioning"
                      checked={placeData.amenities.airConditioning}
                      onChange={handleAmenityChange}
                    />
                    <label className="form-check-label" htmlFor="airConditioning">
                      <FaAirFreshener className="me-2 text-primary" /> Air Conditioning
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="d-flex justify-content-between mt-5">
              <button
                type="button"
                className="btn btn-outline-secondary btn-lg px-4"
                onClick={prevStep}
              >
                <FaArrowLeft className="me-2" /> Back
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg px-5"
                onClick={nextStep}
              >
                Next <FaChevronRight className="ms-2" />
              </button>
            </div>
          </>
        );
      
      case 4:
        return (
          <>
            <h4 className="mb-4">Contact Information</h4>
            <div className="mb-4">
              <label htmlFor="contactName" className="form-label fw-medium fs-5">Contact Person <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.contactName ? 'is-invalid' : ''}`}
                id="contactName"
                name="contactName"
                value={placeData.contactName}
                onChange={handleChange}
                placeholder="Enter contact person's name"
              />
              {errors.contactName && <div className="invalid-feedback">{errors.contactName}</div>}
              <div className="form-text">The primary person to contact for bookings or inquiries.</div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="contactEmail" className="form-label fw-medium fs-5">Email <span className="text-danger">*</span></label>
              <input
                type="email"
                className={`form-control ${errors.contactEmail ? 'is-invalid' : ''}`}
                id="contactEmail"
                name="contactEmail"
                value={placeData.contactEmail}
                onChange={handleChange}
                placeholder="Enter contact email"
              />
              {errors.contactEmail && <div className="invalid-feedback">{errors.contactEmail}</div>}
              <div className="form-text">Email address for booking confirmations and inquiries.</div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="contactPhone" className="form-label fw-medium fs-5">Phone Number <span className="text-danger">*</span></label>
              <input
                type="tel"
                className={`form-control ${errors.contactPhone ? 'is-invalid' : ''}`}
                id="contactPhone"
                name="contactPhone"
                value={placeData.contactPhone}
                onChange={handleChange}
                placeholder="Enter contact phone number"
              />
              {errors.contactPhone && <div className="invalid-feedback">{errors.contactPhone}</div>}
              <div className="form-text">Phone number for direct contact.</div>
            </div>
            
            <div className="d-flex justify-content-between mt-5">
              <button
                type="button"
                className="btn btn-outline-secondary btn-lg px-4"
                onClick={prevStep}
              >
                <FaArrowLeft className="me-2" /> Back
              </button>
              <button
                type="button"
                className="btn btn-primary btn-lg px-5"
                onClick={nextStep}
              >
                Next <FaChevronRight className="ms-2" />
              </button>
            </div>
          </>
        );
      
      case 5:
        return (
          <>
            <h4 className="mb-4">Venue Images</h4>
            <div className="mb-4">
              <label htmlFor="coverImage" className="form-label fw-medium fs-5">Cover Image</label>
              <div className="mb-3">
                {placeData.coverImage ? (
                  <div className="position-relative mb-3">
                    <img
                      src={URL.createObjectURL(placeData.coverImage)}
                      alt="Venue Cover"
                      className="img-fluid rounded"
                      style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                      onClick={() => setPlaceData({ ...placeData, coverImage: null })}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ) : (
                  <div className="d-flex justify-content-center align-items-center border rounded p-5 bg-light mb-3">
                    <div className="text-center">
                      <FaBuilding className="text-muted mb-3" size={48} />
                      <p className="mb-3">Upload a high-quality cover image for your venue</p>
                      <label htmlFor="coverImageInput" className="btn btn-primary">
                        <FaPlus className="me-2" /> Select Cover Image
                      </label>
                      <input
                        type="file"
                        id="coverImageInput"
                        accept="image/*"
                        className="d-none"
                        onChange={handleCoverImageUpload}
                      />
                    </div>
                  </div>
                )}
                <div className="form-text">This will be the main image displayed for your venue.</div>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="images" className="form-label fw-medium fs-5">Additional Images</label>
              <input
                type="file"
                className="form-control mb-3"
                id="images"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
              />
              <div className="form-text mb-3">You can upload multiple images to showcase different areas of your venue.</div>
              
              {placeData.images.length > 0 ? (
                <div className="row g-3">
                  {placeData.images.map((image, index) => (
                    <div className="col-md-4 col-6" key={index}>
                      <div className="position-relative">
                        <img
                          src={URL.createObjectURL(image)}
                          className="img-fluid rounded"
                          alt={`Venue ${index + 1}`}
                          style={{ height: '150px', width: '100%', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                          onClick={() => removeImage(index)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 border rounded bg-light">
                  <p className="text-muted mb-0">No additional images uploaded yet</p>
                </div>
              )}
            </div>
            
            <div className="d-flex justify-content-between mt-5">
              <button
                type="button"
                className="btn btn-outline-secondary btn-lg px-4"
                onClick={prevStep}
              >
                <FaArrowLeft className="me-2" /> Back
              </button>
              <button
                type="button"
                className="btn btn-success btn-lg px-5"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  <>Submit Venue</>
                )}
              </button>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{width: '100%'}}>
      <div style={{padding: '0 1.5rem', marginBottom: '1.5rem'}}>
        <Link to="/organizer/places" className="text-decoration-none d-inline-flex align-items-center mb-3">
          <FaArrowLeft className="me-2" /> Back to Places
        </Link>
        <h2 className="mb-1">Add New Venue</h2>
        <p className="text-muted">Complete the form below to add a new venue to your portfolio</p>
      </div>
      
      {/* Progress bar and steps */}
      <div style={{padding: '0 1.5rem', marginBottom: '1.5rem'}}>
        <div className="progress mb-3" style={{ height: "8px" }}>
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: `${progress}%` }} 
            aria-valuenow={progress} 
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>
        
        <div className="d-flex justify-content-between">
          <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
            <button 
              className={`btn btn-sm rounded-circle ${step >= 1 ? 'btn-primary' : 'btn-light border'}`}
              style={{ width: "40px", height: "40px" }}
              onClick={() => step > 1 && setStep(1)}
              disabled={step === 1}
            >
              <FaBuilding />
            </button>
            <div className="mt-1 small">Basic Info</div>
          </div>
          
          <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
            <button 
              className={`btn btn-sm rounded-circle ${step >= 2 ? 'btn-primary' : 'btn-light border'}`}
              style={{ width: "40px", height: "40px" }}
              onClick={() => step > 2 && setStep(2)}
              disabled={step < 2}
            >
              <FaMapMarkerAlt />
            </button>
            <div className="mt-1 small">Location</div>
          </div>
          
          <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
            <button 
              className={`btn btn-sm rounded-circle ${step >= 3 ? 'btn-primary' : 'btn-light border'}`}
              style={{ width: "40px", height: "40px" }}
              onClick={() => step > 3 && setStep(3)}
              disabled={step < 3}
            >
              <FaUsers />
            </button>
            <div className="mt-1 small">Capacity</div>
          </div>
          
          <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
            <button 
              className={`btn btn-sm rounded-circle ${step >= 4 ? 'btn-primary' : 'btn-light border'}`}
              style={{ width: "40px", height: "40px" }}
              onClick={() => step > 4 && setStep(4)}
              disabled={step < 4}
            >
              <FaPhoneAlt />
            </button>
            <div className="mt-1 small">Contact</div>
          </div>
          
          <div className={`step-item ${step >= 5 ? 'active' : ''}`}>
            <button 
              className={`btn btn-sm rounded-circle ${step >= 5 ? 'btn-primary' : 'btn-light border'}`}
              style={{ width: "40px", height: "40px" }}
              onClick={() => step > 5 && setStep(5)}
              disabled={step < 5}
            >
              <FaImage />
            </button>
            <div className="mt-1 small">Images</div>
          </div>
        </div>
      </div>
      
      {/* Form content */}
      <div style={{padding: '1.5rem', borderTop: '1px solid #dee2e6', width: '100%'}}>
        {errors.submit && (
          <div className="alert alert-danger mb-4">
            {errors.submit}
          </div>
        )}
        
        {renderStep()}
      </div>
    </div>
  );
};

export default AddPlace; 
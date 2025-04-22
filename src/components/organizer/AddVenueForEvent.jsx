import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
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
  FaSave
} from 'react-icons/fa';
import EventService from '../../services/EventService';

const AddVenueForEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [imagePreview, setImagePreview] = useState([]);
  const [eventCategories, setEventCategories] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
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
    suitableEvents: eventId ? [parseInt(eventId)] : [],
    contactInfo: {
      phone: '',
      email: '',
      website: ''
    }
  });

  useEffect(() => {
    fetchEventCategories();
    fetchCities();

    // If eventId is provided, fetch the event details
    if (eventId) {
      fetchEventDetails(eventId);
    }
  }, [eventId]);

  const fetchEventDetails = async (id) => {
    try {
      // In a real app, fetch event details from API
      // const response = await axios.get(`${API_BASE_URL}/api/events/${id}`);
      // setSelectedEvent(response.data);
      
      // For now, find the event from categories
      const event = eventCategories.find(e => e.id === parseInt(id));
      if (event) {
        setSelectedEvent(event);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const fetchEventCategories = async () => {
    try {
      // In a real app, fetch from API
      // const response = await EventService.getEventCategories();
      // setEventCategories(response);
      
      // Demo data
      const categories = [
        { id: 1, title: "Weddings", icon: "💍", description: "Perfect venues for your special day" },
        { id: 2, title: "Corporate Events", icon: "💼", description: "Professional spaces for meetings and conferences" },
        { id: 3, title: "Birthday Parties", icon: "🎂", description: "Fun venues for birthday celebrations" },
        { id: 4, title: "Anniversary Celebrations", icon: "❤️", description: "Romantic settings for your milestone" },
        { id: 5, title: "Family Gatherings", icon: "👨‍👩‍👧‍👦", description: "Spacious venues for family get-togethers" },
        { id: 6, title: "Engagement Ceremonies", icon: "💍", description: "Beautiful venues to celebrate your engagement" }
      ];
      
      setEventCategories(categories);
      
      // If eventId is provided, pre-select that event
      if (eventId) {
        const event = categories.find(e => e.id === parseInt(eventId));
        if (event) {
          setSelectedEvent(event);
        }
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
      
      // Demo data
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
      if (!formData.capacity) newErrors.capacity = "Capacity is required";
    } else if (step === 3) {
      if (!formData.contactInfo.phone) newErrors.phone = "Phone number is required";
      if (!formData.contactInfo.email) newErrors.email = "Email is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    
    try {
      // In a real app, submit to API
      // const formDataToSend = new FormData();
      // formDataToSend.append('name', formData.name);
      // formDataToSend.append('description', formData.description);
      // formDataToSend.append('location', formData.location);
      // formDataToSend.append('address', formData.address);
      // formDataToSend.append('price', formData.price);
      // formDataToSend.append('capacity', formData.capacity);
      // formDataToSend.append('amenities', JSON.stringify(formData.amenities));
      // formDataToSend.append('suitableEvents', JSON.stringify(formData.suitableEvents));
      // formDataToSend.append('contactInfo', JSON.stringify(formData.contactInfo));
      
      // if (formData.image) {
      //   formDataToSend.append('image', formData.image);
      // }
      
      // formData.images.forEach((image, index) => {
      //   formDataToSend.append(`images[${index}]`, image);
      // });
      
      // const response = await axios.post(`${API_BASE_URL}/api/venues`, formDataToSend, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });
      
      // console.log('Venue created:', response.data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      alert("Venue successfully created!");
      
      // Redirect to venue management page or venue details page
      if (eventId) {
        navigate('/organizer/venue-event-linker');
      } else {
        navigate('/organizer/dashboard');
      }
    } catch (error) {
      console.error("Error creating venue:", error);
      alert("Error creating venue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h4 className="mb-4">Basic Information</h4>
            
            <Form.Group className="mb-3">
              <Form.Label>Venue Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleBasicInfoChange}
                isInvalid={!!errors.name}
                placeholder="E.g., Royal Grand Palace"
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleBasicInfoChange}
                isInvalid={!!errors.description}
                placeholder="Describe your venue, its ambiance, unique features, etc."
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>City</Form.Label>
                  <Form.Select
                    name="location"
                    value={formData.location}
                    onChange={handleBasicInfoChange}
                    isInvalid={!!errors.location}
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.location}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Full Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleBasicInfoChange}
                    isInvalid={!!errors.address}
                    placeholder="Street address, locality, landmark"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Main Image</Form.Label>
              <div className="d-flex align-items-center mb-2">
                <Button
                  variant="outline-secondary"
                  className="me-3"
                  onClick={() => document.getElementById('imageUpload').click()}
                >
                  <FaImage className="me-2" /> Choose Image
                </Button>
                <small className="text-muted">Recommended size: 1200x800px</small>
              </div>
              <Form.Control
                type="file"
                id="imageUpload"
                className="d-none"
                accept="image/*"
                onChange={handleImageChange}
              />
              
              {imagePreview.length > 0 && (
                <div className="mt-3">
                  <img
                    src={imagePreview[0]}
                    alt="Venue preview"
                    className="img-thumbnail"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
            </Form.Group>
            
            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="light"
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft className="me-2" /> Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                style={{backgroundColor: "#f05537", borderColor: "#f05537"}}
              >
                Next
              </Button>
            </div>
          </>
        );
        
      case 2:
        return (
          <>
            <h4 className="mb-4">Venue Details</h4>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Price (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleBasicInfoChange}
                    isInvalid={!!errors.price}
                    placeholder="Base price in INR"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.price}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Enter the base price for booking this venue
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Capacity</Form.Label>
                  <Form.Control
                    type="text"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleBasicInfoChange}
                    isInvalid={!!errors.capacity}
                    placeholder="E.g., 50-500 guests"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.capacity}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-4">
              <Form.Label>Amenities</Form.Label>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {['Catering', 'Parking', 'WiFi', 'AC', 'Projector', 'Decoration', 'DJ', 'Open Air'].map(amenity => (
                  <Button
                    key={amenity}
                    variant={formData.amenities.includes(amenity) ? "primary" : "outline-secondary"}
                    className="d-flex align-items-center"
                    onClick={() => handleAmenityToggle(amenity)}
                    style={formData.amenities.includes(amenity) ? {backgroundColor: "#f05537", borderColor: "#f05537"} : {}}
                  >
                    <span className="me-2">{getAmenityIcon(amenity)}</span>
                    {amenity}
                  </Button>
                ))}
              </div>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Event Category</Form.Label>
              <p className="text-muted mb-2">
                {selectedEvent ? (
                  <>This venue will be available for <strong>{selectedEvent.title}</strong></>
                ) : (
                  <>Select which types of events this venue is suitable for</>
                )}
              </p>
              
              {!selectedEvent && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {eventCategories.map(category => (
                    <Button
                      key={category.id}
                      variant={formData.suitableEvents.includes(category.id) ? "primary" : "outline-secondary"}
                      className="d-flex align-items-center"
                      onClick={() => {
                        if (formData.suitableEvents.includes(category.id)) {
                          setFormData({
                            ...formData,
                            suitableEvents: formData.suitableEvents.filter(id => id !== category.id)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            suitableEvents: [...formData.suitableEvents, category.id]
                          });
                        }
                      }}
                      style={formData.suitableEvents.includes(category.id) ? {backgroundColor: "#f05537", borderColor: "#f05537"} : {}}
                    >
                      <span className="me-2">{category.icon}</span>
                      {category.title}
                    </Button>
                  ))}
                </div>
              )}
            </Form.Group>
            
            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="light"
                onClick={handlePrevious}
              >
                <FaArrowLeft className="me-2" /> Back
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                style={{backgroundColor: "#f05537", borderColor: "#f05537"}}
              >
                Next
              </Button>
            </div>
          </>
        );
        
      case 3:
        return (
          <>
            <h4 className="mb-4">Contact Information</h4>
            
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.contactInfo.phone}
                onChange={handleContactInfoChange}
                isInvalid={!!errors.phone}
                placeholder="Contact number for bookings"
              />
              <Form.Control.Feedback type="invalid">
                {errors.phone}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.contactInfo.email}
                onChange={handleContactInfoChange}
                isInvalid={!!errors.email}
                placeholder="Email address for inquiries"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Website (Optional)</Form.Label>
              <Form.Control
                type="url"
                name="website"
                value={formData.contactInfo.website}
                onChange={handleContactInfoChange}
                placeholder="Your venue's website if available"
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Additional Images (Optional)</Form.Label>
              <div className="d-flex align-items-center mb-2">
                <Button
                  variant="outline-secondary"
                  className="me-3"
                  onClick={() => document.getElementById('galleryUpload').click()}
                >
                  <FaPlus className="me-2" /> Add Photos
                </Button>
                <small className="text-muted">Upload up to 5 additional images</small>
              </div>
              <Form.Control
                type="file"
                id="galleryUpload"
                className="d-none"
                accept="image/*"
                multiple
                onChange={handleGalleryImagesChange}
              />
              
              {imagePreview.length > 1 && (
                <div className="d-flex flex-wrap gap-3 mt-3">
                  {imagePreview.slice(1).map((preview, index) => (
                    <div key={index} className="position-relative">
                      <img
                        src={preview}
                        alt={`Gallery preview ${index + 1}`}
                        className="img-thumbnail"
                        style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>
            
            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="light"
                onClick={handlePrevious}
              >
                <FaArrowLeft className="me-2" /> Back
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit}
                style={{backgroundColor: "#f05537", borderColor: "#f05537"}}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" /> Save Venue
                  </>
                )}
              </Button>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  const getAmenityIcon = (amenity) => {
    switch(amenity) {
      case 'WiFi': return <FaWifi />;
      case 'Parking': return <FaParking />;
      case 'AC': return <FaSnowflake />;
      case 'Catering': return <FaUtensils />;
      case 'DJ': return <FaMusic />;
      case 'Accessible': return <FaAccessibleIcon />;
      default: return <FaBuilding />;
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="light" 
          className="me-3" 
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
        </Button>
        <div>
          <h2 className="mb-0">
            {selectedEvent ? `Add Venue for ${selectedEvent.title}` : 'Add New Venue'}
          </h2>
          {selectedEvent && (
            <p className="text-muted mb-0">{selectedEvent.description}</p>
          )}
        </div>
      </div>
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="progress-indicator mb-4">
            <div className="d-flex justify-content-between">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                1. Basic Info
              </div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                2. Venue Details
              </div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                3. Contact & Gallery
              </div>
            </div>
            <div className="progress mt-2">
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{
                  width: `${(currentStep / 3) * 100}%`,
                  backgroundColor: "#f05537"
                }}
                aria-valuenow={(currentStep / 3) * 100} 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
          </div>
          
          <Form>
            {renderFormStep()}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddVenueForEvent; 
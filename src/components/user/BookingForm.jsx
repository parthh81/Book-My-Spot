import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaClock, FaCheck, FaTimes, FaArrowLeft, FaCreditCard, FaMapMarkerAlt, FaTag, FaRupeeSign, FaBuilding, FaConciergeBell, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import AuthService from '../../services/AuthService';
import EventService from '../../services/EventService';
import { PLACEHOLDER_IMAGE, handleImageError, getImageUrl } from '../../utils/imageUtils';
import '../../styles/bookingForm.css';
import { toast } from 'react-hot-toast';

const BookingForm = () => {
  const { venueId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract booking details from location state
  const { 
    isEvent, 
    eventId, 
    venueId: locationVenueId, 
    eventTitle, 
    venueTitle, 
    price, 
    image, 
    date, 
    category,
    eventType,
    venueLocation,
    eventData
  } = location.state || {};
  
  // Check for debug mode in URL
  const urlParams = new URLSearchParams(window.location.search);
  const isDebugMode = urlParams.get('debug') === 'true';
  
  // Debug the event type received from location state
  console.log('Event type from location state:', eventType);
  console.log('Full location state:', location.state);
  if (isDebugMode) {
    console.log('DEBUG MODE ENABLED - Using debug data');
  }
  
  // Validate if we have required data
  useEffect(() => {
    if (!location.state || (!eventId && !locationVenueId)) {
      navigate('/');
      alert('Invalid booking request. Please try again.');
    }
  }, [location.state, navigate, eventId, locationVenueId]);
  
  // Get venue details
  const [venueDetails, setVenueDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTemporaryVenue, setIsTemporaryVenue] = useState(false);
  const [error, setError] = useState(null);
  const [noVenueAvailable, setNoVenueAvailable] = useState(false);
  
  // Track if venue images are available
  const [venueImagesAvailable, setVenueImagesAvailable] = useState(false);
  
  useEffect(() => {
    const fetchVenueDetails = async () => {
      setLoading(true);
      
      try {
        // In debug mode, use mock data
        if (isDebugMode) {
          console.log('DEBUG MODE: Using mock venue data');
          
          const mockVenueData = {
            _id: 'mock-venue-123',
            name: venueTitle || "Royal Wedding Palace",
            description: "Celebrate love in the most memorable way with our premium wedding event services. From elegant venues and stunning decorations to top-notch catering and seamless coordination, we ensure every detail of your special day is perfect.",
            location: venueLocation || "Ahmedabad",
            price: price || 25000,
            capacity: "50-200 guests",
            image: "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg",
            images: [
              "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg",
              "https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg",
              "https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg"
            ],
            amenities: ['Air conditioning', 'Free parking', 'WiFi', 'Catering services', 'Banquet hall', 'Stage', 'Lighting system'],
            suitableEvents: ['Wedding', 'Corporate Event', 'Birthday Party', 'Anniversary'],
            inclusions: ['Basic decoration', 'Sound system', 'Parking space', 'Backup power', 'Reception area', 'Stage setup'],
            exclusions: ['Food & beverages', 'Custom decoration', 'Photography', 'Videography', 'DJ services'],
            serviceFee: 3000,
            gstPercent: 18,
            cancellationPolicy: {
              fullRefund: 7,
              partialRefund: 3,
              partialRefundPercent: 50
            },
            rules: [
              'No outside food allowed',
              'Music must end by 10 PM',
              'No smoking inside the venue',
              'Decorations must be removed after the event'
            ],
            additionalInfo: 'We offer additional services like valet parking and guest accommodation at extra cost. Please contact us for more details.'
          };
          
          setVenueDetails(mockVenueData);
          setVenueImagesAvailable(true);
          setLoading(false);
          return;
        }
        
        // Determine which venue ID to use based on what's available
        const venueIdToUse = venueId || locationVenueId || (eventData && eventData.venue && eventData.venue._id);
        
        if (!venueIdToUse) {
          console.error('No venue ID available for fetching details');
          setError('Venue information not available. Please try a different venue.');
          setLoading(false);
          return;
        }
        
        console.log('Fetching venue details for venue ID:', venueIdToUse);
        
        // First, check if we already have complete venue data in the eventData
        if (eventData && eventData.venue && Object.keys(eventData.venue).length > 3) {
          console.log('Using embedded venue data from event:', eventData.venue);
          const venueFromEvent = eventData.venue;
          
          // Make sure all required fields are available
          const completeVenueData = {
            _id: venueFromEvent._id,
            name: venueFromEvent.name || venueTitle || "Venue",
            description: venueFromEvent.description || "",
            location: venueFromEvent.location || eventData.location || "",
            price: venueFromEvent.price || price || 0,
            capacity: venueFromEvent.capacity || "50-200 guests",
            // Properly handle images - ensure we have at least one image
            image: venueFromEvent.image || image || (eventData?.image ? eventData.image : undefined),
            images: venueFromEvent.images?.length > 0 ? venueFromEvent.images : 
                   (image ? [image] : (eventData?.images?.length > 0 ? eventData.images : [])),
            amenities: venueFromEvent.amenities || [],
            inclusions: venueFromEvent.inclusions || ['Basic decoration', 'Sound system', 'Parking space', 'Backup power'],
            exclusions: venueFromEvent.exclusions || ['Food & beverages', 'Custom decoration', 'Photography'],
            serviceFee: venueFromEvent.serviceFee || 3000,
            gstPercent: venueFromEvent.gstPercent || 18,
            cancellationPolicy: venueFromEvent.cancellationPolicy || {
              fullRefund: 7,
              partialRefund: 3,
              partialRefundPercent: 50
            }
          };
          
          console.log('Created complete venue data with images:', 
                      venueFromEvent.image || image, 
                      venueFromEvent.images, 
                      completeVenueData.images);
          
          setVenueDetails(completeVenueData);
          // Ensure the venueImagesAvailable flag is set correctly
          setVenueImagesAvailable(!!(completeVenueData.image || (completeVenueData.images && completeVenueData.images.length > 0)));
          setLoading(false);
          return;
        }
        
        // For event view page scenario
        if (eventData && !venueId) {
          if (eventData.venue && (eventData.venue._id || typeof eventData.venue === 'string')) {
            const venueIdForFetch = typeof eventData.venue === 'string' ? eventData.venue : eventData.venue._id;
            console.log('Fetching venue from event data with ID:', venueIdForFetch);
            
            try {
              const venue = await EventService.getVenueById(venueIdForFetch);
              console.log('Venue details received from API:', venue);
              setVenueDetails(venue);
            } catch (error) {
              console.error('Error fetching venue from event:', error);
              setError('The requested venue could not be found. It may have been removed or is temporarily unavailable.');
              setNoVenueAvailable(true);
            }
          }
        } else {
          // Use the direct venue ID from parameters
          console.log('Fetching venue details for direct ID:', venueIdToUse);
          
          try {
            const data = await EventService.getVenueById(venueIdToUse);
            console.log('Venue details received from API:', data);
            setVenueDetails(data);
          } catch (error) {
            console.error('Error fetching venue details:', error);
            setError('The requested venue could not be found. It may have been removed or is temporarily unavailable.');
            setNoVenueAvailable(true);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching venue details:', error);
        setError('An error occurred while fetching venue details. Please try again later.');
        setLoading(false);
        setNoVenueAvailable(true);
      }
    };

    fetchVenueDetails();
  }, [locationVenueId, venueId, venueTitle, eventData, image, price]);
  
  // Check and log venue images when venueDetails changes
  useEffect(() => {
    if (venueDetails) {
      const hasImages = venueDetails.images && venueDetails.images.length > 0;
      const hasImage = venueDetails.image && typeof venueDetails.image === 'string';
      
      console.log('Venue details:', venueDetails);
      console.log('Venue images available:', hasImages || hasImage);
      console.log('Venue image data:', hasImages ? venueDetails.images : (hasImage ? venueDetails.image : 'No image'));
      
      setVenueImagesAvailable(hasImages || hasImage);
      
      // If venueImageToShow flag is true but no images were found, try to fetch venue details again
      if (location.state?.venueImageToShow && !hasImages && !hasImage && eventData?.venue?._id) {
        console.log('Trying to fetch venue details again to get images');
        
        // Only try once to avoid infinite loop
        if (!venueImagesAvailable) {
          const fetchVenueImage = async () => {
            try {
              console.log('Fetching venue images for venue ID:', eventData.venue._id);
              const venueData = await EventService.getVenueById(eventData.venue._id);
              console.log('Fetched venue data:', venueData);
              
              if (venueData && (venueData.images?.length > 0 || venueData.image)) {
                console.log('Found venue images, updating venue details');
                setVenueDetails(prevDetails => ({
                  ...prevDetails,
                  images: venueData.images || [],
                  image: venueData.image || ''
                }));
                setVenueImagesAvailable(true);
              } else {
                console.log('No venue images found in fetched data');
                // Fall back to event image if available
                if (eventData.image) {
                  console.log('Using event image as fallback for venue');
                  setVenueDetails(prevDetails => ({
                    ...prevDetails,
                    image: eventData.image
                  }));
                  setVenueImagesAvailable(true);
                }
              }
            } catch (error) {
              console.error('Failed to fetch venue images:', error);
            }
          };
          
          fetchVenueImage();
        }
      } else if (!hasImages && !hasImage && location.state?.image) {
        // If there are no venue images but we have an image in location state, use it
        console.log('Using image from location state as fallback');
        setVenueDetails(prevDetails => ({
          ...prevDetails,
          image: location.state.image
        }));
        setVenueImagesAvailable(true);
      }
    }
  }, [venueDetails, location.state, eventData, venueImagesAvailable]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: eventType || 'Wedding',
    guests: isEvent ? 1 : 2,
    startDate: location.state?.suggestedDate ? new Date(location.state.suggestedDate).toISOString().split('T')[0] : (date || getMinDate()),
    endDate: location.state?.suggestedDate ? new Date(location.state.suggestedDate).toISOString().split('T')[0] : (date || getMinDate()),
    startTime: '12:00',
    endTime: '15:00',
    additionalRequests: '',
    agreeTerms: false
  });
  
  // Direct fix for venue image issues
  useEffect(() => {
    // If we have event image but no venue image, use event image as fallback
    if (location.state?.image && (!venueDetails?.image && (!venueDetails?.images || venueDetails.images.length === 0))) {
      console.log('DIRECT FIX: Adding event image as venue image');
      setVenueDetails(prevDetails => ({
        ...prevDetails || {},
        image: location.state.image
      }));
      setVenueImagesAvailable(true);
    }
    
    // If venue details is completely missing, add fallback data
    if (!venueDetails && eventData) {
      console.log('DIRECT FIX: Adding fallback venue data');
      setVenueDetails({
        name: venueTitle || eventData.title || "Wedding Venue",
        description: "Celebrate love in the most memorable way with our premium wedding event services. From elegant venues and stunning decorations to top-notch catering and seamless coordination, we ensure every detail of your special day is perfect.",
        location: venueLocation || eventData.location || "Ahmedabad",
        price: price || 25000,
        capacity: "50-200 guests",
        image: image || eventData.image || "",
        amenities: ['Air conditioning', 'Free parking', 'WiFi', 'Catering services'],
        inclusions: ['Basic decoration', 'Sound system', 'Parking space', 'Backup power'],
        exclusions: ['Food & beverages', 'Custom decoration', 'Photography'],
        serviceFee: 3000,
        gstPercent: 18,
        cancellationPolicy: {
          fullRefund: 7,
          partialRefund: 3,
          partialRefundPercent: 50
        }
      });
    }
  }, [location.state, venueDetails, eventData, venueTitle, venueLocation, price, image]);
  
  // Event types
  const eventTypes = [
    'Wedding',
    'Corporate Event',
    'Birthday Party',
    'Anniversary',
    'Conference',
    'Family Gathering',
    'Other'
  ];
  
  // Format event type for display and proper type detection
  const formatEventType = (type, venueName = '') => {
    return EventService.formatEventType(type, venueName);
  };
  
  // Derived states
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Get user data from AuthService on component mount
  useEffect(() => {
    const userInfo = AuthService.getUserInfo();
    
    if (userInfo.id) {
      setFormData(prev => ({
        ...prev,
        name: userInfo.firstName && userInfo.lastName ? `${userInfo.firstName} ${userInfo.lastName}` : prev.name,
        email: userInfo.email || prev.email
      }));
    } else {
      console.warn('User ID not found in session storage');
    }
  }, []);
  
  // Ensure dropdowns work correctly
  useEffect(() => {
    // Fix for the dropdown issue
    const formSelects = document.querySelectorAll('.form-select');
    formSelects.forEach(select => {
      select.addEventListener('click', function(e) {
        // Ensure the click reaches the select element
        e.stopPropagation();
      });
    });
    
    return () => {
      // Clean up event listeners on unmount
      formSelects.forEach(select => {
        select.removeEventListener('click', function(e) {
          e.stopPropagation();
        });
      });
    };
  }, []);
  
  // Calculate number of days whenever dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      // Check if dates are valid
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        // Calculate difference in days
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        
        setNumberOfDays(diffDays > 0 ? diffDays : 1);
      }
    }
  }, [formData.startDate, formData.endDate]);
  
  // Price calculations - enhanced version to handle all scenarios
  function calculateBasePrice() {
    console.log('PRICE DEBUG - Inputs:', { 
      price, 
      venueDetails: venueDetails?.price, 
      eventDataPrice: eventData?.price,
      numberOfDays,
      numberOfGuests: formData.guests
    });
    
    // Get base price from any available source
    let basePrice = 0;
    
    // First try price from params
    if (price) {
      // If price is a string with currency symbol
      if (typeof price === 'string' && price.includes('₹')) {
        basePrice = parseInt(price.replace(/[^\d]/g, '')) || 0;
      } 
      // If price is a number
      else if (typeof price === 'number') {
        basePrice = price;
      }
    } 
    // Then try venue details price
    else if (venueDetails?.price) {
      if (typeof venueDetails.price === 'string' && venueDetails.price.includes('₹')) {
        basePrice = parseInt(venueDetails.price.replace(/[^\d]/g, '')) || 0;
      } else if (typeof venueDetails.price === 'number') {
        basePrice = venueDetails.price;
      }
    }
    // Finally try event data price
    else if (eventData?.price) {
      if (typeof eventData.price === 'string' && eventData.price.includes('₹')) {
        basePrice = parseInt(eventData.price.replace(/[^\d]/g, '')) || 0;
      } else if (typeof eventData.price === 'number') {
        basePrice = eventData.price;
      }
    }
    
    // If no price found, use default
    if (basePrice === 0) {
      basePrice = 25000; // Default price if no price available
    }
    
    // Calculate subtotal based on days and guests
    const daysMultiplier = Math.max(numberOfDays, 1);
    
    // Log the price calculation
    console.log('PRICE DEBUG - Calculation:', { 
      basePrice,
      daysMultiplier,
      subtotal: basePrice * daysMultiplier
    });
    
    return basePrice * daysMultiplier;
  }
  
  // After the calculateBasePrice function is defined, add these lines:
  const basePrice = calculateBasePrice();
  const serviceFee = venueDetails?.serviceFee || 3000;
  const gstPercent = venueDetails?.gstPercent || 18;
  const gstAmount = Math.round(((basePrice + serviceFee) * gstPercent) / 100);
  const totalAmount = basePrice + serviceFee + gstAmount;
  
  console.log('PRICE DEBUG - Final values:', {
    basePrice,
    serviceFee,
    gstPercent,
    gstAmount,
    totalAmount
  });
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for event type dropdown
    if (name === 'eventType') {
      console.log('Event type changed to:', value);
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Clear any validation error
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: null
        });
      }
      return;
    }
    
    // For guest count, validate against venue capacity
    if (name === 'guests') {
      // Parse the capacity string (e.g., "50-200 guests" or "100")
      let maxCapacity = 1000; // Default max capacity
      
      if (venueDetails?.capacity) {
        // Try to parse the venue capacity
        const capacityString = venueDetails.capacity.toString().toLowerCase();
        
        if (capacityString.includes('-')) {
          // Format like "50-200 guests"
          const parts = capacityString.split('-');
          if (parts.length > 1) {
            const maxPart = parts[1].trim().split(' ')[0];
            maxCapacity = parseInt(maxPart, 10) || 1000;
          }
        } else if (!isNaN(parseInt(capacityString, 10))) {
          // Format is just a number like "200"
          maxCapacity = parseInt(capacityString, 10);
        }
      }
      
      // Ensure guest count doesn't exceed max capacity
      const guestCount = parseInt(value, 10);
      if (guestCount > maxCapacity) {
        setErrors(prev => ({
          ...prev,
          guests: `Guest count cannot exceed venue capacity of ${maxCapacity}`
        }));
        // Set the value to the max capacity
        setFormData(prev => ({ ...prev, [name]: maxCapacity }));
        return;
      } else {
        // Clear error if it exists
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.guests;
          return newErrors;
        });
      }
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
    
    // Adjust end date if start date is changed to a date after end date
    if (name === 'startDate' && formData.endDate && new Date(value) > new Date(formData.endDate)) {
      setFormData(prev => ({
        ...prev,
        endDate: value
      }));
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    
    // Only validate eventType if it's not pre-selected from navigation
    if (!eventType && !formData.eventType) newErrors.eventType = 'Event type is required';
    
    // Guest count validation against venue capacity
    if (!formData.guests || formData.guests < 1) {
      newErrors.guests = 'Guest count must be at least 1';
    } else {
      // Parse the capacity string (e.g., "50-200 guests" or "100")
      let maxCapacity = 1000; // Default max capacity
      
      if (venueDetails?.capacity) {
        // Try to parse the venue capacity
        const capacityString = venueDetails.capacity.toString().toLowerCase();
        
        if (capacityString.includes('-')) {
          // Format like "50-200 guests"
          const parts = capacityString.split('-');
          if (parts.length > 1) {
            const maxPart = parts[1].trim().split(' ')[0];
            maxCapacity = parseInt(maxPart, 10) || 1000;
          }
        } else if (!isNaN(parseInt(capacityString, 10))) {
          // Format is just a number like "200"
          maxCapacity = parseInt(capacityString, 10);
        }
      }
      
      if (parseInt(formData.guests, 10) > maxCapacity) {
        newErrors.guests = `Guest count cannot exceed venue capacity of ${maxCapacity}`;
      }
    }
    
    // Date validation
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    else if (new Date(formData.endDate) < new Date(formData.startDate)) 
      newErrors.endDate = 'End date cannot be before start date';
    
    // Time validation
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    
    // Terms agreement
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms and conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create booking data object with all required fields
      const bookingData = {
        userId: AuthService.getUserInfo()?.id,
        eventId: isEvent ? eventId : null,
        venueId: !isEvent ? (locationVenueId || venueId) : null,
        venueTitle: venueTitle || venueDetails?.name,
        eventTitle: eventTitle,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        // Use the EventService helper to ensure consistent event type handling
        eventType: formData.eventType,
        numberOfGuests: parseInt(formData.guests),
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        numberOfDays: numberOfDays,
        location: venueDetails?.location || venueLocation || 'Venue location not specified',
        image: venueDetails?.images?.[0] || image || '',
        category: category || 'General Event',
        basePrice: basePrice,
        serviceFee: serviceFee,
        gstAmount: gstAmount,
        totalAmount: totalAmount,
        additionalRequests: formData.additionalRequests,
        status: 'pending',
        
        // Include complete venue details to ensure consistent experience
        venue: {
          _id: venueDetails?._id || locationVenueId || venueId,
          name: venueDetails?.name || venueTitle,
          description: venueDetails?.description || '',
          location: venueDetails?.location || venueLocation,
          address: venueDetails?.address || '',
          city: venueDetails?.city || '',
          price: venueDetails?.price || basePrice,
          capacity: venueDetails?.capacity || '',
          amenities: venueDetails?.amenities || [],
          inclusions: venueDetails?.inclusions || ['Basic decoration', 'Sound system', 'Parking space', 'Backup power'],
          exclusions: venueDetails?.exclusions || ['Food & beverages', 'Custom decoration', 'Photography'],
          images: venueDetails?.images || [image],
          serviceFee: venueDetails?.serviceFee || serviceFee,
          gstPercent: venueDetails?.gstPercent || gstPercent
        }
      };
      
      console.log('Sending booking data:', bookingData);
      console.log('Venue name:', venueTitle || venueDetails?.name);
      console.log('Event type being sent to backend:', bookingData.eventType);
      
      // Send to appropriate API endpoint
      let response;
      if (isEvent) {
        response = await EventService.bookEvent(bookingData);
      } else {
        response = await EventService.bookVenue(bookingData);
      }
      
      console.log('Booking response:', response);
      
      // Handle success
      setSuccess(true);
      toast.success(`${isEvent ? 'Event' : 'Venue'} booked successfully! Proceeding to payment...`);
      
      // Redirect to payment page with booking details
      setTimeout(() => {
        navigate('/payment', { 
          state: { 
            bookingId: response._id || response.id,
            eventTitle: isEvent ? eventTitle : null,
            venueTitle: !isEvent ? venueTitle : null,
            totalAmount: totalAmount,
            bookingDetails: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              date: formData.startDate,
              endDate: formData.endDate,
              startTime: formData.startTime,
              endTime: formData.endTime,
              eventType: formData.eventType,
              numberOfGuests: formData.guests,
              isEvent: isEvent,
              image: image
            }
          }
        });
      }, 2000);
      
    } catch (error) {
      console.error('Booking error:', error);
      setErrors({
        submit: error.message || `Failed to book ${isEvent ? 'event' : 'venue'}. Please try again.`
      });
      toast.error(error.message || `Failed to book ${isEvent ? 'event' : 'venue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  // Format price display
  const formatPrice = (priceValue) => {
    if (!priceValue && priceValue !== 0) return '₹0';
    
    // If it's already a string like "₹50,000", return as is
    if (typeof priceValue === 'string' && priceValue.includes('₹')) {
      return priceValue;
    }
    
    // If it's a number, format it
    return `₹${Number(priceValue).toLocaleString('en-IN')}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  // Add new JSX for temporary venue notification
  const TemporaryVenueNotice = () => (
    <div className="alert alert-warning mb-4" role="alert">
      You are booking with a temporary venue profile. The actual venue details may differ. Our system has created this profile to allow your booking to proceed. For more details, please contact our support team.
    </div>
  );
  
  // Inside the useEffect for initializing form data
  useEffect(() => {
    if (location.state) {
      console.log("Booking form received state:", location.state);
      // Capture all the data sent from event details page
      const eventData = location.state.eventData || {};
      
      // Check if an event type was passed and log it
      if (location.state.eventType) {
        console.log("Pre-selected event type detected:", location.state.eventType);
      }
      
      // Set initial form data with full details from the event page
      setFormData(prevState => ({
        ...prevState,
        eventId: location.state.eventId || '',
        eventTitle: location.state.eventTitle || '',
        price: location.state.price || '',
        category: location.state.category || '',
        isEvent: location.state.isEvent || false,
        venueLocation: location.state.venueLocation || '',
        image: location.state.image || '',
        // Make sure to set eventType from location state
        eventType: location.state.eventType || eventData.eventType || prevState.eventType,
        // Add more detailed venue information
        venue: {
          id: location.state.venueId || eventData.venue?.id || eventData.venue || '',
          name: location.state.venueName || eventData.venue?.name || eventData.venueName || '',
          address: location.state.venueAddress || eventData.venue?.address || eventData.venueAddress || eventData.location || '',
          city: location.state.venueCity || eventData.venue?.city || (eventData.cityId && eventData.cityId.name) || eventData.venueCity || '',
          area: location.state.venueArea || eventData.venue?.area || (eventData.areaId && eventData.areaId.name) || eventData.venueArea || '',
          amenities: eventData.venue?.amenities || eventData.amenities || [],
          inclusions: eventData.venue?.inclusions || eventData.inclusions || [],
          exclusions: eventData.venue?.exclusions || eventData.exclusions || []
        },
        organizer: eventData.organizer || '',
        description: eventData.description || '',
        // Better date handling with fallbacks
        bookingDate: location.state.suggestedDate instanceof Date 
          ? location.state.suggestedDate 
          : location.state.suggestedDate 
            ? new Date(location.state.suggestedDate) 
            : new Date(),
        allowCustomDate: location.state.allowCustomDate || false,
      }));

      // Log the enhanced venue data
      console.log("Enhanced venue data:", {
        venueId: location.state.venueId,
        venueName: location.state.venueName,
        venueAddress: location.state.venueAddress,
        venueCity: location.state.venueCity,
        venueArea: location.state.venueArea,
        venue: eventData.venue
      });
      
      // Log event type selection 
      console.log("Event type set to:", location.state.eventType || eventData.eventType || "default value");
    }
  }, [location]);
  
  // Create an error message component for venue not found
  const VenueNotFoundError = () => (
    <div className="alert alert-danger" role="alert">
      <h4 className="alert-heading">Venue Not Available</h4>
      <p>{error || 'The requested venue could not be found. It may have been removed or is temporarily unavailable.'}</p>
      <hr />
      <p className="mb-0">
        <button 
          className="btn btn-outline-danger"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
        {' '}
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/venues')}
        >
          Browse Available Venues
        </button>
      </p>
    </div>
  );
  
  // Make sure we don't use "General" as event type
  useEffect(() => {
    if (formData.eventType === 'General') {
      console.log('Replacing "General" event type with "Wedding"');
      setFormData(prevState => ({
        ...prevState,
        eventType: 'Wedding'
      }));
    }
  }, [formData.eventType]);
  
  // Use this helper when initializing the form
  useEffect(() => {
    // Check if venue name contains "corporate" and set event type accordingly
    const venueName = venueTitle || venueDetails?.name || "";
    let detectedEventType = eventType;
    
    // Auto-detect corporate venues
    if (venueName.toLowerCase().includes('corporate')) {
      detectedEventType = 'Corporate Event';
      console.log('Auto-detected corporate venue, setting event type to Corporate Event');
    }
    
    // Format the event type correctly
    const formattedEventType = detectedEventType ? formatEventType(detectedEventType, venueName) : 'Wedding';
    
    setFormData(prev => ({
      ...prev,
      eventType: formattedEventType
    }));
  }, [eventType, venueTitle, venueDetails]);
  
  // Check venue details loading
  useEffect(() => {
    if (venueDetails) {
      console.log('VENUE DETAILS DEBUG:', venueDetails);
      console.log('Venue details keys:', Object.keys(venueDetails));
      console.log('Venue description:', venueDetails.description);
      console.log('Venue location:', venueDetails.location);
      console.log('Venue capacity:', venueDetails.capacity);
      console.log('Venue amenities:', venueDetails.amenities);
      console.log('Venue inclusions:', venueDetails.inclusions);
      console.log('Venue exclusions:', venueDetails.exclusions);
    } else {
      console.log('No venue details available yet');
    }
  }, [venueDetails]);
  
  // Enhanced fallback function to safely display venue data
  const getVenueData = (field, defaultValue = '') => {
    if (!venueDetails) return defaultValue;
    return venueDetails[field] || defaultValue;
  };
  
  // Force venue data initialization early
  useEffect(() => {
    // If there's no venue details after a short delay, initialize with fallback
    const timer = setTimeout(() => {
      if (!venueDetails && (location.state || eventData)) {
        console.log('FORCE INIT: Creating venue details from available data');
        
        const fallbackData = {
          name: venueTitle || eventData?.title || eventData?.venue?.name || "Royal Wedding Palace",
          description: eventData?.description || "Celebrate love in the most memorable way with our premium wedding event services. From elegant venues and stunning decorations to top-notch catering and seamless coordination, we ensure every detail of your special day is perfect.",
          location: venueLocation || eventData?.location || eventData?.venue?.location || "Ahmedabad",
          price: price || eventData?.price || 25000,
          capacity: eventData?.capacity || eventData?.venue?.capacity || "50-200 guests",
          image: image || eventData?.image || eventData?.venue?.image || "",
          images: eventData?.images || eventData?.venue?.images || [],
          amenities: eventData?.amenities || eventData?.venue?.amenities || ['Air conditioning', 'Free parking', 'WiFi', 'Catering services'],
          inclusions: eventData?.inclusions || eventData?.venue?.inclusions || ['Basic decoration', 'Sound system', 'Parking space', 'Backup power'],
          exclusions: eventData?.exclusions || eventData?.venue?.exclusions || ['Food & beverages', 'Custom decoration', 'Photography'],
          serviceFee: eventData?.venue?.serviceFee || 3000,
          gstPercent: eventData?.venue?.gstPercent || 18,
          cancellationPolicy: eventData?.venue?.cancellationPolicy || {
            fullRefund: 7,
            partialRefund: 3,
            partialRefundPercent: 50
          }
        };
        
        console.log('FORCE INIT: Fallback data created:', fallbackData);
        setVenueDetails(fallbackData);
        setVenueImagesAvailable(!!(image || eventData?.image));
        setLoading(false);
      }
    }, 1000); // Wait 1 second for normal loading to happen first
    
    return () => clearTimeout(timer);
  }, [venueDetails, location.state, eventData, venueTitle, venueLocation, price, image]);
  
  // Add a new function to ensure valid image URLs
  const ensureValidImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already an absolute URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Check for data URI
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // Fix image paths with just /uploads, add API URL
    if (imageUrl.startsWith('/uploads')) {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:3200';
      return `${apiUrl}${imageUrl}`;
    }
    
    // For debugging and emergency use, try these default images if all else fails
    const defaultImages = [
      "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg",
      "https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg"
    ];
    
    // If we have a string but not a valid URL format, try to use it as is
    if (typeof imageUrl === 'string' && imageUrl.length > 0) {
      return imageUrl;
    }
    
    // Last resort - use a default image
    return defaultImages[0];
  };
  
  return (
    <div className="booking-page">
      <div className="container py-4">
        <div className="d-flex align-items-center mb-4">
          <button 
            className="btn btn-link text-decoration-none p-0 me-3"
            onClick={handleBack}
          >
            <FaArrowLeft /> Back to Venue Details
          </button>
        </div>
        
        <h1 className="mb-2">Book Your Event</h1>
        <p className="text-muted mb-4">Complete the form below to reserve your spot</p>
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading venue details...</p>
          </div>
        ) : noVenueAvailable ? (
          <VenueNotFoundError />
        ) : (
          <>
            {isTemporaryVenue && <TemporaryVenueNotice />}
            
            <div className="row">
              <div className="col-lg-8">
                <div className="card shadow-sm mb-4">
                  <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                      <h2 className="mb-4">Event Details</h2>
                      
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <label className="form-label">Event Type</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FaTag />
                            </span>
                            {eventType ? (
                              <input
                                type="text"
                                className="form-control"
                                value={formData.eventType === 'General' ? 'Wedding' : formData.eventType}
                                readOnly
                              />
                            ) : (
                              <select
                                className={`form-select ${errors.eventType ? 'is-invalid' : ''}`}
                                name="eventType"
                                value={formData.eventType === 'General' ? 'Wedding' : formData.eventType}
                                onChange={handleChange}
                                style={{ zIndex: 100, position: 'relative' }}
                              >
                                {!formData.eventType && <option value="">Select Event Type</option>}
                                {eventTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                          {errors.eventType && <div className="invalid-feedback d-block">{errors.eventType}</div>}
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label">Selected Venue</label>
                          <input
                            type="text"
                            className="form-control"
                            value={venueDetails?.name || venueTitle || "Temporary Venue"}
                            readOnly
                          />
                        </div>
                      </div>
                      
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <label className="form-label">Event Date</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FaCalendarAlt />
                            </span>
                            <input
                              type="date"
                              className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                              name="startDate"
                              value={formData.startDate}
                              onChange={handleChange}
                              min={getMinDate()}
                            />
                          </div>
                          {errors.startDate && <div className="invalid-feedback d-block">{errors.startDate}</div>}
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label">Number of Guests</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FaUsers />
                            </span>
                            <input
                              type="number"
                              className={`form-control ${errors.guests ? 'is-invalid' : ''}`}
                              placeholder="E.g., 100"
                              name="guests"
                              value={formData.guests}
                              onChange={handleChange}
                              min="1"
                            />
                          </div>
                          {errors.guests && <div className="invalid-feedback d-block">{errors.guests}</div>}
                        </div>
                      </div>
                      
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <label className="form-label">Start Time</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FaClock />
                            </span>
                            <input
                              type="time"
                              className={`form-control ${errors.startTime ? 'is-invalid' : ''}`}
                              name="startTime"
                              value={formData.startTime}
                              onChange={handleChange}
                            />
                          </div>
                          {errors.startTime && <div className="invalid-feedback d-block">{errors.startTime}</div>}
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label">End Time</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FaClock />
                            </span>
                            <input
                              type="time"
                              className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
                              name="endTime"
                              value={formData.endTime}
                              onChange={handleChange}
                            />
                          </div>
                          {errors.endTime && <div className="invalid-feedback d-block">{errors.endTime}</div>}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="form-label">Special Requests (Optional)</label>
                        <textarea
                          className="form-control"
                          rows="4"
                          placeholder="Any special accommodations or requests..."
                          name="additionalRequests"
                          value={formData.additionalRequests}
                          onChange={handleChange}
                        ></textarea>
                      </div>
                      
                      <h2 className="mb-4">Contact Information</h2>
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <label className="form-label">Full Name</label>
                          <input
                            type="text"
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                            placeholder="Your full name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                          />
                          {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label">Email Address</label>
                          <input
                            type="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Your email address"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                          {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                        </div>
                      </div>
                      
                      <div className="row mb-4">
                        <div className="col-md-6">
                          <label className="form-label">Phone Number</label>
                          <input
                            type="tel"
                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                            placeholder="Your phone number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                          {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
                        </div>
                      </div>
                      
                      <div className="form-check mb-4">
                        <input
                          type="checkbox"
                          className={`form-check-input ${errors.agreeTerms ? 'is-invalid' : ''}`}
                          id="agreeTerms"
                          name="agreeTerms"
                          checked={formData.agreeTerms}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="agreeTerms">
                          I agree to the terms and conditions
                        </label>
                        {errors.agreeTerms && (
                          <div className="invalid-feedback d-block">{errors.agreeTerms}</div>
                        )}
                      </div>
                      
                      <div className="d-grid gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Processing...
                            </>
                          ) : (
                            'Complete Booking'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-4">
                <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
                  <div className="card-body p-4">
                    <h3 className="mb-4">Booking Summary</h3>
                    
                    <div className="venue-details mb-4">
                      {/* Always show a beautiful venue image */}
                      <div className="venue-image-container mb-3">
                        <img 
                          src={ensureValidImageUrl(venueDetails?.image) || "https://images.pexels.com/photos/931887/pexels-photo-931887.jpeg?auto=compress&cs=tinysrgb&w=600&h=400"}
                          alt={`${venueDetails?.name || 'Wedding Venue'}`} 
                          className="img-fluid rounded"
                          style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                        />
                      </div>
                      
                      {/* Gallery with multiple venue views */}
                      <div className="venue-gallery mb-3">
                        <div className="d-flex overflow-auto pb-2 gap-2" style={{ scrollbarWidth: 'thin' }}>
                          <div style={{ minWidth: '100px' }}>
                            <img 
                              src="https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=600&h=400" 
                              alt="Wedding venue view 1" 
                              className="img-fluid rounded cursor-pointer"
                              style={{ height: '70px', objectFit: 'cover' }}
                              onClick={() => {
                                const mainImage = document.querySelector('.venue-image-container img');
                                if (mainImage) mainImage.src = "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=600&h=400";
                              }}
                            />
                          </div>
                          <div style={{ minWidth: '100px' }}>
                            <img 
                              src="https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=600&h=400" 
                              alt="Wedding venue view 2" 
                              className="img-fluid rounded cursor-pointer"
                              style={{ height: '70px', objectFit: 'cover' }}
                              onClick={() => {
                                const mainImage = document.querySelector('.venue-image-container img');
                                if (mainImage) mainImage.src = "https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=600&h=400";
                              }}
                            />
                          </div>
                          <div style={{ minWidth: '100px' }}>
                            <img 
                              src="https://images.pexels.com/photos/2291462/pexels-photo-2291462.jpeg?auto=compress&cs=tinysrgb&w=600&h=400" 
                              alt="Wedding venue view 3" 
                              className="img-fluid rounded cursor-pointer"
                              style={{ height: '70px', objectFit: 'cover' }}
                              onClick={() => {
                                const mainImage = document.querySelector('.venue-image-container img');
                                if (mainImage) mainImage.src = "https://images.pexels.com/photos/2291462/pexels-photo-2291462.jpeg?auto=compress&cs=tinysrgb&w=600&h=400";
                              }}
                            />
                          </div>
                        </div>
                        <p className="small text-muted mb-0 mt-1">Click on thumbnail to view larger image</p>
                      </div>
                      
                      <h5 className="mb-3">{venueDetails?.name || venueTitle || "Selected Venue"}</h5>
                      
                      {/* Always display venue description, even if empty */}
                      <div className="venue-description mb-3" style={{ minHeight: '80px' }}>
                        <p className="text-muted mb-0">
                          {getVenueData('description', 'Celebrate love in the most memorable way with our premium wedding event services. From elegant venues and stunning decorations to top-notch catering and seamless coordination, we ensure every detail of your special day is perfect.')}
                        </p>
                      </div>

                      {/* Always display location */}
                      <div className="venue-location mb-3">
                        <div className="d-flex align-items-start">
                          <FaMapMarkerAlt className="mt-1 me-2 text-primary" />
                          <p className="mb-0">{getVenueData('location', venueDetails?.venue?.location || venueLocation || 'Ahmedabad')}</p>
                        </div>
                      </div>

                      {/* Always display capacity */}
                      <div className="venue-capacity mb-3">
                        <div className="d-flex align-items-start">
                          <FaUsers className="mt-1 me-2 text-primary" />
                          <p className="mb-0">Capacity: {getVenueData('capacity', '50-200 guests')}</p>
                        </div>
                      </div>

                      {/* Suitable event types */}
                      <div className="venue-event-types mb-3">
                        <h6 className="mb-2">Suitable For:</h6>
                        <div className="d-flex flex-wrap gap-1">
                          {venueDetails?.suitableEvents?.length > 0 ? 
                            venueDetails.suitableEvents.map((eventType, index) => (
                              <span key={index} className="badge bg-light text-dark">{
                                typeof eventType === 'number' ? 
                                  EventService.getEventCategoryById(eventType)?.title || `Event Type ${eventType}` : 
                                  eventType
                              }</span>
                            )) : 
                            ['Wedding', 'Corporate Event', 'Birthday Party'].map((type, index) => (
                              <span key={index} className="badge bg-light text-dark">{type}</span>
                            ))
                          }
                        </div>
                      </div>

                      {/* Amenities section */}
                      <div className="venue-amenities mb-3">
                        <h6 className="mb-2">Amenities:</h6>
                        <div className="row">
                          {(venueDetails?.amenities && venueDetails.amenities.length > 0) ? 
                            venueDetails.amenities.map((amenity, index) => (
                              <div key={index} className="col-6 mb-1">
                                <span><FaCheck className="text-success me-1" size={12} /> {amenity}</span>
                              </div>
                            )) : 
                            ['Air conditioning', 'Free parking', 'WiFi', 'Catering services'].map((amenity, index) => (
                              <div key={index} className="col-6 mb-1">
                                <span><FaCheck className="text-success me-1" size={12} /> {amenity}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                      
                      <div className="booking-price-details mb-4">
                        <div className="price-row d-flex justify-content-between mb-2">
                          <span>Base Price:</span>
                          <span>{formatPrice(basePrice)} onwards</span>
                        </div>
                        <div className="price-row d-flex justify-content-between mb-2">
                          <span>Service Fee:</span>
                          <span>{formatPrice(serviceFee)}</span>
                        </div>
                        <div className="price-row d-flex justify-content-between mb-2">
                          <span>GST ({gstPercent}%):</span>
                          <span>{formatPrice(gstAmount)}</span>
                        </div>
                        <hr />
                        <div className="price-row d-flex justify-content-between fw-bold">
                          <span>Total Amount:</span>
                          <span>{formatPrice(totalAmount)}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="mb-3">Inclusions</h5>
                        <ul className="list-unstyled">
                          {(venueDetails?.inclusions && venueDetails.inclusions.length > 0) ? 
                            venueDetails.inclusions.map((item, index) => (
                              <li key={index} className="mb-2">
                                <FaCheck className="text-success me-2" /> {item}
                              </li>
                            )) : 
                            ['Basic decoration', 'Sound system', 'Parking space', 'Backup power'].map((item, index) => (
                              <li key={index} className="mb-2">
                                <FaCheck className="text-success me-2" /> {item}
                              </li>
                            ))
                          }
                        </ul>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="mb-3">Exclusions</h5>
                        <ul className="list-unstyled">
                          {(venueDetails?.exclusions && venueDetails.exclusions.length > 0) ? 
                            venueDetails.exclusions.map((item, index) => (
                              <li key={index} className="mb-2">
                                <FaTimes className="text-danger me-2" /> {item}
                              </li>
                            )) : 
                            ['Food & beverages', 'Custom decoration', 'Photography'].map((item, index) => (
                              <li key={index} className="mb-2">
                                <FaTimes className="text-danger me-2" /> {item}
                              </li>
                            ))
                          }
                        </ul>
                      </div>
                      
                      {/* Rules section - only if available */}
                      {venueDetails?.rules?.length > 0 && (
                        <div className="venue-rules mb-4">
                          <h5 className="mb-3">Venue Rules</h5>
                          <ul className="list-unstyled">
                            {venueDetails.rules.map((rule, index) => (
                              <li key={index} className="mb-2">
                                <FaInfoCircle className="text-primary me-2" /> {rule}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Additional info - only if available */}
                      {venueDetails?.additionalInfo && (
                        <div className="additional-info mb-4">
                          <h5 className="mb-3">Additional Information</h5>
                          <p className="small text-muted">{venueDetails.additionalInfo}</p>
                        </div>
                      )}
                      
                      <div className="cancellation-policy mb-3">
                        <h5 className="mb-2">Cancellation Policy:</h5>
                        <p className="small text-muted">
                          Free cancellation up to {venueDetails?.cancellationPolicy?.fullRefund || 7} days before the event.<br />
                          {venueDetails?.cancellationPolicy?.partialRefundPercent || 50}% refund for cancellations between {venueDetails?.cancellationPolicy?.fullRefund || 7}-{venueDetails?.cancellationPolicy?.partialRefund || 3} days.<br />
                          No refund for cancellations less than {venueDetails?.cancellationPolicy?.partialRefund || 3} days before the event.
                        </p>
                      </div>
                      
                      <div className="secure-booking-badge">
                        <div className="d-flex align-items-center justify-content-center bg-light p-2 rounded">
                          <FaCheck className="text-success me-2" />
                          <span>Secure booking · No hidden fees</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingForm; 
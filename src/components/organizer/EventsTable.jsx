import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ConfigService from '../../services/ConfigService';
import { 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaPlus, 
  FaFilter, 
  FaEye, 
  FaCalendarAlt, 
  FaChevronDown, 
  FaChevronLeft, 
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEllipsisV,
  FaCheck,
  FaTimes,
  FaDownload,
  FaCopy,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaUsers,
  FaMoneyBillWave,
  FaArrowRight,
  FaInfoCircle,
  FaClipboardList,
  FaCalendarDay,
  FaToggleOn,
  FaAlignLeft,
  FaSave,
  FaImage,
  FaUpload
} from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '../../utils/formatters';
import '../../styles/events.css';
import EventService from '../../services/EventService';
import Swal from 'sweetalert2';
import { PLACEHOLDER_IMAGE, handleImageError, getImageUrl } from '../../utils/imageUtils';

// Sample event data that will be used if no events are returned from the API


// Define styles object for consistent styling
const customStyles = {
  cardContainer: {
    border: 'none',
    borderRadius: '0.5rem',
    boxShadow: '0 .125rem .25rem rgba(0, 0, 0, 0.075)',
    marginBottom: '1rem',
    overflow: 'hidden'
  },
  cardHeader: {
    backgroundColor: '#fff',
    borderBottom: '1px solid rgba(0,0,0,.125)',
    padding: '1rem 1.25rem'
  },
  cardFooter: {
    backgroundColor: '#fff',
    borderTop: '1px solid rgba(0,0,0,.125)',
    padding: '0.75rem 1.25rem'
  },
  tableResponsive: {
    width: '100%',
    overflowX: 'auto'
  },
  pagination: {
    display: 'flex',
    padding: '0',
    margin: '0',
    listStyle: 'none'
  },
  pageItem: {
    margin: '0 2px'
  },
  pageLink: {
    position: 'relative',
    display: 'block',
    padding: '0.375rem 0.75rem',
    color: '#0d6efd',
    backgroundColor: '#fff',
    border: '1px solid #dee2e6',
    borderRadius: '0.25rem',
    textDecoration: 'none'
  },
  pageItemActive: {
    zIndex: 3,
    color: '#fff',
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd'
  },
  badge: {
    display: 'inline-block',
    padding: '0.35em 0.65em',
    fontSize: '0.75em',
    fontWeight: '700',
    lineHeight: '1',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    verticalAlign: 'baseline',
    borderRadius: '0.25rem'
  },
  primaryButton: {
    backgroundColor: '#4c6ef5',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.625rem 1.25rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }
};

const EventsTable = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filters, setFilters] = useState({
    eventType: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [viewMode, setViewMode] = useState("grid"); // Always use grid view
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [useSampleData, setUseSampleData] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);

  // Inline style to fix padding issue
  const containerStyle = {
    paddingTop: '90px', // Add extra padding to prevent content from being hidden under navbar
  };

  const navigate = useNavigate();
  const location = useLocation(); // Get access to location state

  // Configure axios to use the backend URL
  const API_BASE_URL = "http://localhost:3200";
  axios.defaults.baseURL = API_BASE_URL;

  // Add a state to track if the component is mounted
  const [isMounted, setIsMounted] = useState(false);

  // Check for location state and refresh events if coming back from event creation
  useEffect(() => {
    if (location.state && location.state.eventCreated) {
      console.log("Detected return from event creation, refreshing events list");
      fetchEvents();
      
      // Clear the location state to prevent repeated fetches
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  // Fetch events when component mounts and when dependencies change
  useEffect(() => {
    fetchEvents();
    setIsMounted(true);

    // Clean up when the component unmounts
    return () => {
      setIsMounted(false);
    };
  }, [currentPage, itemsPerPage, sortField, sortDirection, filters.eventType, filters.status, useSampleData]);

  const fetchEvents = async () => {
    setLoading(true);
    
    try {
      // Get events from the API without using mock data
      const eventsData = await EventService.getOrganizerEvents();
      
      if (eventsData && eventsData.length > 0) {
        console.log("Loading events for current organizer:", eventsData);
        
        // Convert date strings back to Date objects for proper sorting
        const formattedEvents = eventsData.map(event => ({
          ...event,
          date: event.date ? new Date(event.date) : new Date(),
          // Add any missing fields needed by the UI
          _id: event._id || `event_${Date.now()}`,
          status: event.status || 'active'
        }));
        
        // Extract unique event types and statuses for filter dropdowns
        const extractedTypes = [...new Set(formattedEvents.map(event => event.eventType || event.category || 'Event'))];
        // Always include both active and inactive status options
        const extractedStatuses = [...new Set(['active', 'inactive', ...formattedEvents.map(event => event.status || 'active')])];
        
        // Set state
        setEvents(formattedEvents);
        setTotalItems(formattedEvents.length);
        setEventTypes(extractedTypes);
        setStatuses(extractedStatuses);
      } else {
        // Don't use sample data, just set empty arrays
        console.log("No events found for current organizer");
        setEvents([]);
        setTotalItems(0);
        setEventTypes([]);
        // Still provide basic status options even with no events
        setStatuses(['active', 'inactive']);
      }
    } catch (error) {
      console.error("Error fetching organizer events:", error);
      // Don't use sample data on error either
      setEvents([]);
      setTotalItems(0);
      setEventTypes([]);
      // Still provide basic status options even on error
      setStatuses(['active', 'inactive']);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleChangePage = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(totalItems / itemsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  const handleChangeItemsPerPage = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSelectEvent = (eventId) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter(id => id !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const handleSelectAllEvents = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events.map(event => event._id));
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
    console.log("View details for event:", event.name);
  };

  const handleEdit = (eventId) => {
    // Find the event to edit
    const eventToEdit = events.find(event => event._id === eventId);
    if (eventToEdit) {
      setEditingEvent(eventToEdit);
      setShowEditModal(true);
      
      // Close details modal if it's open
      if (showModal) {
        setShowModal(false);
      }
    }
  };

  const handleSaveEvent = async (updatedEvent) => {
    try {
      console.log("Saving event with status:", updatedEvent.status);
      console.log("Venue data before save:", updatedEvent.venue);
      console.log("Venue image before save:", updatedEvent.venue?.image);
      
      // Create a clean copy of the event with explicit status field
      const cleanEvent = {
        ...updatedEvent,
        status: updatedEvent.status || 'active', // Ensure status is set
      };
      
      // First try to update the event via API
      if (cleanEvent._id && !cleanEvent._id.startsWith('event_')) {
        // This is an existing event with a real ID from the database
        console.log("Updating existing event via API:", cleanEvent._id);
        const response = await EventService.updateEvent(cleanEvent._id, cleanEvent);
        console.log("API update response:", response);
        
        // Debug image paths
        if (response) {
          console.log("Image paths in response:");
          console.log("Event image:", response.image);
          console.log("Venue image:", response.venue?.image);
          
          // Make sure venue images are properly synced if they exist in the response
          if (response.venue && response.venue.image) {
            console.log("Setting venue image from response:", response.venue.image);
            cleanEvent.venue = {
              ...cleanEvent.venue,
              image: response.venue.image
            };
          } else if (response.venue && response.venue.images && response.venue.images.length > 0) {
            console.log("Setting venue image from images array:", response.venue.images[0]);
            cleanEvent.venue = {
              ...cleanEvent.venue,
              image: response.venue.images[0],
              images: response.venue.images
            };
          }
        } else {
          console.warn("No response data received from update");
        }
      } else {
        // This is a local event that hasn't been saved to the database yet
        // We'll use createEvent to save it properly
        console.log("Creating new event:", cleanEvent);
        const newEvent = await EventService.createEvent(cleanEvent);
        cleanEvent._id = newEvent._id || cleanEvent._id;
        console.log("New event created with ID:", cleanEvent._id);
        
        // If the new event has venue image info, make sure we capture it
        if (newEvent && newEvent.venue && newEvent.venue.image) {
          console.log("Setting venue image from new event response:", newEvent.venue.image);
          cleanEvent.venue = {
            ...cleanEvent.venue,
            image: newEvent.venue.image
          };
        }
      }
      
      // Also update localStorage as a backup
      const savedEvents = JSON.parse(localStorage.getItem('organizer_events') || '[]');
      const updatedEvents = savedEvents.map(event => 
        event._id === cleanEvent._id ? cleanEvent : event
      );
      
      // If the event wasn't in the array (new event), add it
      if (!updatedEvents.some(e => e._id === cleanEvent._id)) {
        updatedEvents.push(cleanEvent);
      }
      
      localStorage.setItem('organizer_events', JSON.stringify(updatedEvents));
      console.log("Updated events in localStorage:", updatedEvents);
      
      // Update the event in local state with the clean event object
      const updatedLocalEvents = events.map(event => 
        event._id === cleanEvent._id ? cleanEvent : event
      );
      
      // If the event wasn't in the array (new event), add it
      if (!updatedLocalEvents.some(e => e._id === cleanEvent._id)) {
        updatedLocalEvents.push(cleanEvent);
      }
      
      setEvents(updatedLocalEvents);
      setTotalItems(updatedLocalEvents.length);
      setShowEditModal(false);
      
      // Set a success message
      setAlertMessage({
        type: 'success',
        text: 'Event updated successfully!'
      });
      
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
      
      // Refresh events list from the server to ensure we have the latest data
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      
      // Show error message
      setAlertMessage({
        type: 'danger',
        text: `Error updating event: ${error.message || 'Unknown error'}`
      });
      
      // Still update localStorage as a fallback
      const savedEvents = JSON.parse(localStorage.getItem('organizer_events') || '[]');
      const updatedEvents = savedEvents.map(event => 
        event._id === updatedEvent._id ? updatedEvent : event
      );
      
      if (!updatedEvents.some(e => e._id === updatedEvent._id)) {
        updatedEvents.push(updatedEvent);
      }
      
      localStorage.setItem('organizer_events', JSON.stringify(updatedEvents));
      
      // Also update local state
      const updatedLocalEvents = events.map(event => 
        event._id === updatedEvent._id ? updatedEvent : event
      );
      
      if (!updatedLocalEvents.some(e => e._id === updatedEvent._id)) {
        updatedLocalEvents.push(updatedEvent);
      }
      
      setEvents(updatedLocalEvents);
      setTotalItems(updatedLocalEvents.length);
      setShowEditModal(false);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      const result = await Swal.fire({
        title: 'Delete Event?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f05537',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!'
      });
      
      if (result.isConfirmed) {
        // Delete event
        await EventService.deleteEvent(eventId);
        
        // Filter out the deleted event
        setEvents(events.filter(event => event._id !== eventId));
        
        // Show success message
        setAlertMessage({
          type: 'success',
          text: 'Event deleted successfully!'
        });
        
        // Auto-dismiss alert after 3 seconds
        setTimeout(() => {
          setAlertMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setAlertMessage({
        type: 'danger',
        text: `Error deleting event: ${error.message || 'Unknown error'}`
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return (
      <div className="organizer-pagination-container">
        <div className="organizer-pagination-info">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} events
        </div>
        
        <div className="organizer-pagination">
          <button 
            className="organizer-pagination-btn" 
            onClick={() => handleChangePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
          </button>
          
          {[...Array(totalPages)].map((_, index) => {
            // Show first page, last page, and pages around current page
            const pageNumber = index + 1;
            if (
              pageNumber === 1 || 
              pageNumber === totalPages || 
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <button 
                  key={pageNumber}
                  className={`organizer-pagination-btn ${pageNumber === currentPage ? 'active' : ''}`}
                  onClick={() => handleChangePage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            } else if (
              (pageNumber === currentPage - 2 && currentPage > 3) || 
              (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
            ) {
              return <span key={pageNumber} className="organizer-pagination-ellipsis">...</span>;
            } else {
              return null;
            }
          })}
          
          <button 
            className="organizer-pagination-btn" 
            onClick={() => handleChangePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaChevronRight />
          </button>
        </div>
        
        <div className="organizer-pagination-perpage">
          <select 
            value={itemsPerPage} 
            onChange={handleChangeItemsPerPage}
            className="organizer-select"
          >
            <option value={6}>6 per page</option>
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
            <option value={48}>48 per page</option>
          </select>
        </div>
      </div>
    );
  };

  const renderEvents = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading events...</span>
          </div>
        </div>
      );
    }

    if (events.length === 0) {
      return (
        <div className="text-center py-5" style={{ border: 'none', outline: 'none' }}>
          <FaCalendarAlt size={48} className="text-muted mb-3" />
          <h4>No events found</h4>
          <p className="text-muted">Create your first event or adjust your filters.</p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => navigate('/organizer/addevent')}
            style={{ backgroundColor: "#f05537", borderColor: "#f05537", border: 'none' }}
          >
            <FaPlus className="me-2" /> Create New Event
          </button>
        </div>
      );
    }

    // Apply filters and search
    let filteredEvents = [...events];
    
    // Apply search
    if (searchTerm) {
      filteredEvents = filteredEvents.filter(event => 
        event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply event type filter
    if (filters.eventType !== 'all') {
      filteredEvents = filteredEvents.filter(event => 
        event.eventType === filters.eventType || event.category === filters.eventType
      );
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.status === filters.status);
    }
    
    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      if (filters.dateRange === 'upcoming') {
        filteredEvents = filteredEvents.filter(event => new Date(event.date) > now);
      } else if (filters.dateRange === 'past') {
        filteredEvents = filteredEvents.filter(event => new Date(event.date) < now);
      } else if (filters.dateRange === 'today') {
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.getDate() === now.getDate() && 
                 eventDate.getMonth() === now.getMonth() && 
                 eventDate.getFullYear() === now.getFullYear();
        });
      } else if (filters.dateRange === 'week') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate > now && eventDate <= weekFromNow;
        });
      } else if (filters.dateRange === 'month') {
        const monthFromNow = new Date();
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate > now && eventDate <= monthFromNow;
        });
      }
    }
    
    // If we have no matching events after filtering
    if (filteredEvents.length === 0) {
      return (
        <div className="text-center py-5" style={{ border: 'none', outline: 'none' }}>
          <FaCalendarAlt size={48} className="text-muted mb-3" />
          <h4>No matching events found</h4>
          <p className="text-muted">Try adjusting your filters or search terms.</p>
          <button 
            className="btn btn-outline-secondary mt-3"
            onClick={() => {
              setSearchTerm('');
              setFilters({
                eventType: 'all',
                status: 'all',
                dateRange: 'all'
              });
            }}
            style={{ border: '1px solid #e2e8f0' }}
          >
            Clear Filters
          </button>
        </div>
      );
    }
    
    // Apply sorting
    filteredEvents.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? (a.name || '').localeCompare(b.name || '') 
          : (b.name || '').localeCompare(a.name || '');
      } else if (sortField === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date) - new Date(b.date) 
          : new Date(b.date) - new Date(a.date);
      } else if (sortField === 'price') {
        return sortDirection === 'asc' 
          ? (a.price || 0) - (b.price || 0) 
          : (b.price || 0) - (a.price || 0);
      } else if (sortField === 'capacity') {
        return sortDirection === 'asc' 
          ? (a.capacity || 0) - (b.capacity || 0) 
          : (b.capacity || 0) - (a.capacity || 0);
      }
      return 0;
    });
    
    // Paginate events
    const indexOfLastEvent = currentPage * itemsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
    const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
    
    return (
      <div className="container-fluid p-3">
        <div className="row g-3">
          {currentEvents.map((event) => (
            <div className="col-md-4 col-sm-6" key={event._id}>
              <div className="card event-card h-100 shadow-sm">
                {/* Top badges */}
                <div className="position-relative">
                  <div className="position-absolute top-0 start-0 m-2 z-index-1">
                    <span className="badge bg-danger px-2 py-1">
                      {event.eventType || event.category || 'Event'}
                    </span>
                  </div>
                  <div className="position-absolute top-0 end-0 m-2 z-index-1">
                    <span className={`badge px-2 py-1 ${event.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                      {event.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {/* Event image */}
                  <div className="card-img-container">
                    <img
                      src={getImageUrl(event.image) || PLACEHOLDER_IMAGE}
                      alt={event.name}
                      className="card-img-top"
                      onError={(e) => handleImageError(e)}
                    />
                  </div>
                </div>
                
                {/* Event details */}
                <div className="card-body p-3">
                  {/* Event title */}
                  <h5 className="card-title fw-bold mb-2">{event.name}</h5>
                  
                  {/* Location with icon */}
                  <div className="event-location mb-1">
                    <FaMapMarkerAlt className="text-muted me-1" style={{ fontSize: "0.8rem" }} />
                    <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {event.city ? (
                        event.city.length > 35 ? event.city.substring(0, 35) + '...' : event.city
                      ) : (event.venue?.city ? event.venue.city : (event.area ? event.area : 'Location not specified'))}
                    </small>
                  </div>
                  
                  {/* Date with icon */}
                  <div className="event-date mb-2">
                    <FaCalendarAlt className="text-muted me-1" style={{ fontSize: "0.8rem" }} />
                    <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {new Date(event.date).getDate()} {new Date(event.date).toLocaleString('default', { month: 'short' })} {new Date(event.date).getFullYear()}
                    </small>
                  </div>
                  
                  {/* Price and capacity */}
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <div>
                      <FaMoneyBillWave className="text-muted me-1" style={{ fontSize: "0.8rem" }} />
                      <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                        ₹{formatCurrency(event.price) || 'Free'}
                      </small>
                    </div>
                    <div>
                      <FaUsers className="text-muted me-1" style={{ fontSize: "0.8rem" }} />
                      <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                        {event.capacity || 'Unlimited'}
                      </small>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons in footer */}
                <div className="card-footer d-flex justify-content-center">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-danger px-3"
                      onClick={() => handleViewDetails(event)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleEdit(event._id)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleDelete(event._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Create a form component for editing events
  const EditEventForm = ({ event, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: event.name,
      eventType: event.eventType,
      date: new Date(event.date).toISOString().split('T')[0],
      capacity: event.capacity,
      cityName: event.cityId?.name || '',
      areaName: event.areaId?.name || '',
      venueName: event.venue?.name || '',
      venueAddress: event.venue?.address || event.city || '',
      price: event.price,
      description: event.description || '',
      status: event.status || 'active',
      eventImage: null,
      venueImage: null
    });
    
    // Get venue image path for debugging
    const venueImagePath = event.venue?.image || (event.venue?.images && event.venue.images.length > 0 ? event.venue.images[0] : '');
    const processedVenueImageUrl = getImageUrl(venueImagePath);
    
    // Initialize with event image, processed through getImageUrl
    const [eventImagePreview, setEventImagePreview] = useState(getImageUrl(event.image) || null);
    // Initialize with venue image, processed through getImageUrl
    const [venueImagePreview, setVenueImagePreview] = useState(processedVenueImageUrl || null);
    
    // Debug logging for venue image
    useEffect(() => {
      console.log("--- Venue Image Debug Info ---");
      console.log("Event venue data:", event.venue);
      console.log("Raw venue image path:", venueImagePath);
      console.log("Processed venue image URL:", processedVenueImageUrl);
      console.log("Initial venue image preview state:", venueImagePreview);
      console.log("PLACEHOLDER_IMAGE constant:", PLACEHOLDER_IMAGE);
      console.log("Is venue image preview the placeholder?", venueImagePreview === PLACEHOLDER_IMAGE);
      console.log("-----------------------------");
    }, []);
    
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
    };
    
    // Handle event image selection
    const handleEventImageChange = (e) => {
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
      const file = e.target.files[0];
      if (file) {
        console.log("Venue image file selected:", file.name);
        setFormData({
          ...formData,
          venueImage: file
        });
        
        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
          console.log("Venue image preview created");
          setVenueImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
    
    // Remove event image
    const removeEventImage = () => {
      setFormData({
        ...formData,
        eventImage: null
      });
      setEventImagePreview(event.image || null);
    };
    
    // Remove venue image
    const removeVenueImage = () => {
      setFormData({
        ...formData,
        venueImage: null
      });
      setVenueImagePreview(getImageUrl(event.venue?.image) || null);
    };
    
    // Submit form data
    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Create FormData object to handle file uploads
      const formDataObj = new FormData();
      
      // Append all text data
      formDataObj.append('name', formData.name);
      formDataObj.append('eventType', formData.eventType);
      formDataObj.append('date', new Date(formData.date).toISOString());
      formDataObj.append('capacity', formData.capacity);
      formDataObj.append('cityName', formData.cityName);
      formDataObj.append('areaName', formData.areaName);
      formDataObj.append('venueName', formData.venueName);
      formDataObj.append('venueAddress', formData.venueAddress);
      formDataObj.append('price', formData.price);
      formDataObj.append('description', formData.description);
      formDataObj.append('status', formData.status);
      
      // Append image files if selected
      if (formData.eventImage) {
        console.log("Adding event image to form data");
        formDataObj.append('eventImage', formData.eventImage);
      }
      
      if (formData.venueImage) {
        console.log("Adding venue image to form data");
        formDataObj.append('venueImage', formData.venueImage);
        // Add flag to indicate venue image has been updated
        formDataObj.append('venueImageUpdated', 'true');
      } else if (venueImagePreview && !formData.venueImage) {
        // If we have a preview but no file, it means we're using existing image
        console.log("Preserving existing venue image:", venueImagePreview);
        formDataObj.append('preserveVenueImage', 'true');
        // Handle both formats: single image and images array
        if (event.venue?.image) {
          formDataObj.append('existingVenueImage', event.venue.image);
        } else if (event.venue?.images && event.venue.images.length > 0) {
          formDataObj.append('existingVenueImage', event.venue.images[0]);
        }
      }
      
      // Keep existing venue and event data for fallback
      const updatedEvent = {
        ...event,
        name: formData.name,
        eventType: formData.eventType,
        date: new Date(formData.date),
        capacity: parseInt(formData.capacity),
        cityName: formData.cityName,
        areaName: formData.areaName,
        venueName: formData.venueName,
        venueAddress: formData.venueAddress,
        cityId: event.cityId,
        areaId: event.areaId,
        venue: { 
          ...event.venue,
          name: formData.venueName,
          address: formData.venueAddress,
          city: formData.cityName,
          // Use the new venue image preview if available, otherwise keep existing
          image: formData.venueImage ? undefined : (venueImagePreview || event.venue?.image || (event.venue?.images && event.venue.images.length > 0 ? event.venue.images[0] : undefined))
        },
        location: formData.venueAddress || formData.cityName || 'Location not specified',
        city: formData.cityName || event.city || '',
        area: formData.areaName || event.area || '',
        price: parseInt(formData.price),
        description: formData.description,
        status: formData.status,
        // Add formData for file uploads
        formData: formDataObj
      };
      
      onSave(updatedEvent);
    };
    
    return (
      <form onSubmit={handleSubmit} className="edit-event-form">
        <div className="form-card p-4">
          {/* Basic Info Section */}
          <h4 className="section-title mb-3"><FaInfoCircle className="me-2" /> Basic Information</h4>
          <div className="row mb-4">
            <div className="col-md-12">
              <label className="form-label">
                Event Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="Enter event name"
              />
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label">
                <FaCalendarAlt className="me-2" /> Event Type
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="form-select"
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
              
            <div className="col-md-6">
              <label className="form-label">
                <FaToggleOn className="me-2" /> Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Event Image Section */}
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label">
                <FaImage className="me-2" /> Event Image
              </label>
              <div className="image-upload-container border rounded p-3">
                <input
                  type="file"
                  id="eventImage"
                  name="eventImage"
                  accept="image/*"
                  onChange={handleEventImageChange}
                  style={{ display: 'none' }}
                />
                
                <div className="d-flex mb-2">
                  <label htmlFor="eventImage" className="btn btn-sm btn-outline-primary me-2">
                    <FaUpload className="me-1" /> Upload Image
                  </label>
                  {eventImagePreview && (
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger"
                      onClick={removeEventImage}
                    >
                      <FaTimes className="me-1" /> Remove
                    </button>
                  )}
                </div>
                
                {eventImagePreview ? (
                  <div className="image-preview">
                    <img 
                      src={eventImagePreview} 
                      alt="Event preview" 
                      className="img-fluid rounded"
                      style={{ maxHeight: '150px' }}
                      onError={(e) => handleImageError(e)}
                    />
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <FaImage size={32} className="mb-2" />
                    <p className="mb-0">No image selected</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="col-md-6">
              <label className="form-label">
                <FaImage className="me-2" /> Venue Image
              </label>
              <div className="image-upload-container border rounded p-3">
                <input
                  type="file"
                  id="venueImage"
                  name="venueImage"
                  accept="image/*"
                  onChange={handleVenueImageChange}
                  style={{ display: 'none' }}
                />
                
                <div className="d-flex mb-2">
                  <label htmlFor="venueImage" className="btn btn-sm btn-outline-primary me-2">
                    <FaUpload className="me-1" /> Upload Image
                  </label>
                  {venueImagePreview && (
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger"
                      onClick={removeVenueImage}
                    >
                      <FaTimes className="me-1" /> Remove
                    </button>
                  )}
                </div>
                
                {venueImagePreview ? (
                  <div className="image-preview">
                    <img 
                      src={venueImagePreview} 
                      alt="Venue preview" 
                      className="img-fluid rounded"
                      style={{ maxHeight: '150px' }}
                      onError={(e) => handleImageError(e)}
                    />
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <FaImage size={32} className="mb-2" />
                    <p className="mb-0">No image selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Details Section */}
          <h4 className="section-title mb-3 mt-4"><FaClipboardList className="me-2" /> Event Details</h4>
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label">
                <FaCalendarDay className="me-2" /> Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">
                <FaUsers className="me-2" /> Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className="form-control"
                placeholder="Number of attendees"
              />
            </div>
          </div>
          
          {/* Location Section */}
          <h4 className="section-title mb-3 mt-4"><FaMapMarkerAlt className="me-2" /> Venue Details</h4>
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label">Venue Name</label>
              <input
                type="text"
                name="venueName"
                value={formData.venueName}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter venue name"
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Venue Address</label>
              <input
                type="text"
                name="venueAddress"
                value={formData.venueAddress}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter full address"
              />
            </div>
          </div>
          
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label">City</label>
              <input
                type="text"
                name="cityName"
                value={formData.cityName}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter city name"
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Area</label>
              <input
                type="text"
                name="areaName"
                value={formData.areaName}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter area name"
              />
            </div>
          </div>
          
          {/* Price Section */}
          <h4 className="section-title mb-3 mt-4"><FaMoneyBillWave className="me-2" /> Pricing</h4>
          <div className="row mb-4">
            <div className="col-md-12">
              <label className="form-label">Price (₹)</label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  className="form-control"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          {/* Description Section */}
          <h4 className="section-title mb-3 mt-4"><FaAlignLeft className="me-2" /> Description</h4>
          <div className="row mb-4">
            <div className="col-md-12">
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="form-control"
                placeholder="Describe your event"
              ></textarea>
            </div>
          </div>
                  
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
              <FaTimes className="me-1" /> Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <FaSave className="me-1" /> Save Changes
            </button>
          </div>
        </div>
      </form>
    );
  };

  return (
    <div className="events-management" style={containerStyle}>
      {/* Alert messages */}
      {alertMessage && (
        <div className={`alert alert-${alertMessage.type} alert-dismissible fade show`} role="alert">
          {alertMessage.text}
          <button type="button" className="btn-close" onClick={() => setAlertMessage(null)}></button>
        </div>
      )}
      
      {/* Header section */}
      <div className="events-management-header">
        <h2 className="events-title">
          <FaCalendarAlt className="me-2" /> Manage Events
        </h2>
        <button
          className="create-event-btn"
          onClick={() => navigate('/organizer/addevent')}
          style={{ backgroundColor: "#f05537" }}
        >
          <FaPlus className="me-1" /> Create New Event
        </button>
      </div>
      
      {/* Filters and search bar - more compact version */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div className="search-bar me-auto">
              <div className="search-input-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <select
              className="filter-select"
              value={filters.eventType}
              onChange={e => setFilters({...filters, eventType: e.target.value})}
            >
              <option value="all">All Event Types</option>
              {eventTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              className="filter-select"
              value={filters.status}
              onChange={e => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Statuses</option>
              {statuses.map((status, index) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </select>
            
            <select
              className="filter-select"
              value={filters.dateRange}
              onChange={e => setFilters({...filters, dateRange: e.target.value})}
            >
              <option value="all">All Dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            
            <button
              className="filter-button"
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  eventType: 'all',
                  status: 'all',
                  dateRange: 'all'
                });
              }}
            >
              <FaTimes className="me-1" /> Clear
            </button>
          </div>
        </div>
      </div>
      
      {/* Event cards grid */}
      <div className="card shadow-sm border-0 mb-4" style={{ border: 'none', borderRadius: '0', boxShadow: 'none' }}>
        <div className="card-body p-0" style={{ border: 'none', outline: 'none' }}>
          {renderEvents()}
        </div>
      </div>
      
      {/* Pagination */}
      {events.length > 0 && !loading && (
        <div className="organizer-pagination-container">{renderPagination()}</div>
      )}
      
      {/* Event detail modal */}
      {showModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="event-detail-title">{selectedEvent.name}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-container">
                <div className="add-event-container">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="event-image-container">
                        <img 
                          src={getImageUrl(selectedEvent.image) || PLACEHOLDER_IMAGE}
                          alt={selectedEvent.name}
                          className="event-detail-image img-fluid rounded"
                          onError={(e) => handleImageError(e)}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="event-detail-card">
                        <h3 className="step-title">Event Details</h3>
                        <div className="event-details-grid">
                          <div className="form-group">
                            <label className="form-label">Event Type</label>
                            <div className="detail-value">{selectedEvent.eventType}</div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Date</label>
                            <div className="detail-value">
                              {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Location</label>
                            <div className="detail-value">
                              {selectedEvent.city ? (
                                selectedEvent.city.length > 35 ? selectedEvent.city.substring(0, 35) + '...' : selectedEvent.city
                              ) : (selectedEvent.venue?.city ? selectedEvent.venue.city : (selectedEvent.area ? selectedEvent.area : 'Location not specified'))}
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Capacity</label>
                            <div className="detail-value">{selectedEvent.capacity}</div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Price</label>
                            <div className="detail-value">₹{formatCurrency(selectedEvent.price)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="event-detail-card mt-4">
                    <h3 className="step-title">Description</h3>
                    <div className="form-group">
                      <div className="detail-value description">
                        {selectedEvent.description || 'No description available'}
                      </div>
                    </div>
                  </div>
                  
                  {selectedEvent.inclusions && selectedEvent.inclusions.length > 0 && (
                    <div className="event-detail-card mt-4">
                      <h3 className="step-title">What's Included</h3>
                      <div className="inclusions-grid">
                        {selectedEvent.inclusions.map((item, index) => (
                          <div key={index} className="inclusion-item">
                            <span className="checkmark">✓</span> {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.exclusions && selectedEvent.exclusions.length > 0 && (
                    <div className="event-detail-card mt-4">
                      <h3 className="step-title">What's Excluded</h3>
                      <div className="inclusions-grid">
                        {selectedEvent.exclusions.map((item, index) => (
                          <div key={index} className="exclusion-item">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleEdit(selectedEvent._id)}
                style={{ backgroundColor: "#f05537", borderColor: "#f05537" }}
              >
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit event modal */}
      {showEditModal && editingEvent && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content edit-modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaEdit className="me-2" /> Edit Event</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body p-0">
              <EditEventForm 
                event={editingEvent} 
                onSave={handleSaveEvent}
                onCancel={() => setShowEditModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsTable;

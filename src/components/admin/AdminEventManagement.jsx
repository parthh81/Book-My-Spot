import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, FaFilter, FaEdit, FaEye, FaTrashAlt, FaCalendarAlt, 
  FaMapMarkerAlt, FaUsers, FaTicketAlt, FaPlusCircle, FaTag, FaSortAmountDown,
  FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaTrash, FaCheck, FaBan, FaToggleOn, FaToggleOff
} from 'react-icons/fa';
import EventService from '../../services/EventService';
import AdminService from '../../services/AdminService';
import { Table, Button, Form, InputGroup, Spinner, Alert, Modal, Badge, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/formatters';

// Sample event data
const sampleEvents = [
  {
    id: 1,
    name: 'New Year Party',
    imageUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=600&auto=format&fit=crop',
    date: '2023-12-31T23:00:00',
    location: 'Grand Ballroom, Hotel Imperial',
    capacity: 200,
    bookedSeats: 175,
    organizer: 'EventElite',
    organizerId: 101,
    price: 1500,
    status: 'Active',
    eventType: 'Party',
    createdAt: '2023-10-15T14:30:00'
  },
  {
    id: 2,
    name: 'Tech Conference 2024',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop',
    date: '2024-01-15T09:00:00',
    location: 'Convention Center, Tech Park',
    capacity: 500,
    bookedSeats: 320,
    organizer: 'TechEvents',
    organizerId: 102,
    price: 3500,
    status: 'Active',
    eventType: 'Conference',
    createdAt: '2023-09-20T11:45:00'
  },
  {
    id: 3,
    name: 'Wedding Celebration',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop',
    date: '2024-02-10T18:30:00',
    location: 'Garden Venue, The Greens',
    capacity: 150,
    bookedSeats: 85,
    organizer: 'WeddingWonders',
    organizerId: 103,
    price: 95000,
    status: 'Active',
    eventType: 'Wedding',
    createdAt: '2023-10-05T16:20:00'
  },
  {
    id: 4,
    name: 'College Alumni Meet',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop',
    date: '2024-02-25T16:00:00',
    location: 'University Campus, Main Hall',
    capacity: 300,
    bookedSeats: 120,
    organizer: 'AlumniConnects',
    organizerId: 104,
    price: 750,
    status: 'Active',
    eventType: 'Social',
    createdAt: '2023-11-12T09:15:00'
  },
  {
    id: 5,
    name: 'Startup Networking Mixer',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600',
    date: '2024-01-20T18:00:00',
    location: 'Innovation Hub, Downtown',
    capacity: 100,
    bookedSeats: 98,
    organizer: 'StartupCommunity',
    organizerId: 105,
    price: 1200,
    status: 'Active',
    eventType: 'Networking',
    createdAt: '2023-10-25T10:30:00'
  },
  {
    id: 6,
    name: 'Indian Classical Music Concert',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600',
    date: '2024-03-05T19:00:00',
    location: 'Cultural Center Auditorium',
    capacity: 250,
    bookedSeats: 75,
    organizer: 'MusicMagic',
    organizerId: 106,
    price: 850,
    status: 'Pending Approval',
    eventType: 'Concert',
    createdAt: '2023-12-01T14:10:00'
  }
];

const AdminEventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [statusReason, setStatusReason] = useState('');
  const [processingStatus, setProcessingStatus] = useState(false);

  // View details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await AdminService.getAllEvents();
      console.log('Events response received:', response);
      
      // Extract events array from the response, which might be nested or directly returned
      const eventsData = Array.isArray(response) ? response : 
                        (response?.data && Array.isArray(response.data)) ? response.data : [];
      
      console.log('Processed events data:', eventsData);
      setEvents(eventsData);
      setError(null);
    } catch (err) {
      setError('Failed to load events. Please try again later.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (event, newStatus) => {
    setSelectedEvent({ ...event, newStatus });
    setShowModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedEvent) return;
    
    setProcessingStatus(true);
    try {
      // Get the correct ID regardless of whether it's stored as id or _id
      const eventId = selectedEvent.id || selectedEvent._id;
      
      if (!eventId) {
        throw new Error('Event ID is missing');
      }
      
      await AdminService.updateEventStatus(
        eventId, 
        selectedEvent.newStatus, 
        statusReason
      );
      
      // Update local state
      setEvents(prevEvents => 
        prevEvents.map(event => {
          const currId = event.id || event._id;
          if (currId === eventId) {
            return { 
              ...event, 
              isActive: selectedEvent.newStatus,
              status: selectedEvent.newStatus ? 'Active' : 'Inactive'
            };
          }
          return event;
        })
      );
      
      setShowModal(false);
      setStatusReason('');
      setSelectedEvent(null);
    } catch (err) {
      setError(`Failed to update event status: ${err.message || 'Please try again'}`);
      console.error('Status update error:', err);
    } finally {
      setProcessingStatus(false);
    }
  };

  const filteredEvents = events && Array.isArray(events) ? events.filter(event => {
    // Skip invalid events
    if (!event || typeof event !== 'object') return false;
    
    // Safe access to properties that might be missing
    const title = event.title || event.name || '';
    const organizerName = event.organizer?.name || event.organizer || '';
    const location = event.location || '';
    const eventType = event.eventType || event.category || '';
    const isActive = event.isActive !== undefined ? event.isActive : 
                    (event.status === 'Active' || event.status === 'active');
    
    // Apply search filter
    const matchesSearch = 
      searchInput === '' || 
      title.toLowerCase().includes(searchInput.toLowerCase()) ||
      organizerName.toLowerCase().includes(searchInput.toLowerCase()) ||
      location.toLowerCase().includes(searchInput.toLowerCase());
    
    // Apply category filter
    const matchesCategory = 
      categoryFilter === '' || 
      eventType.toLowerCase() === categoryFilter.toLowerCase();
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === '' || 
      (statusFilter === 'active' && isActive) || 
      (statusFilter === 'inactive' && !isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) : [];

  const getStatusBadge = (isActive) => {
    return isActive ? 
      <Badge bg="success">Active</Badge> : 
      <Badge bg="danger">Inactive</Badge>;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container my-4"
    >
      <h2 className="mb-4">Event Management</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="d-flex justify-content-between mb-3">
        <InputGroup className="w-50">
          <InputGroup.Text>
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search events by title, organizer, or location..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </InputGroup>
        
        <Button variant="primary" onClick={fetchEvents} disabled={loading}>
          Refresh
        </Button>
      </div>
      
      {loading && !showModal ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Organizer</th>
                <th>Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <tr key={event.id || event._id}>
                    <td>{event.title || event.name || 'Untitled Event'}</td>
                    <td>{event.organizer?.name || event.organizer || 'Unknown'}</td>
                    <td>{formatDate(event.date) || 'No Date'}</td>
                    <td>{event.location || 'No Location'}</td>
                    <td>{getStatusBadge(event.isActive !== undefined ? event.isActive : 
                         (event.status === 'Active' || event.status === 'active'))}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link to={`/admin/events/${event.id || event._id}`}>
                          <Button variant="info" size="sm">
                            <FaEye /> View
                          </Button>
                        </Link>
                        {(event.isActive || event.status === 'Active' || event.status === 'active') ? (
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleStatusChange(event, false)}
                          >
                            <FaBan /> Deactivate
                          </Button>
                        ) : (
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleStatusChange(event, true)}
                          >
                            <FaCheck /> Activate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No events found{searchInput ? ' matching your search criteria' : ''}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      )}
      
      {/* Status Change Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedEvent?.newStatus
              ? 'Activate Event'
              : 'Deactivate Event'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to 
            <strong>{selectedEvent?.newStatus ? ' activate ' : ' deactivate '}</strong>
            the event: <strong>{selectedEvent?.title}</strong>?
          </p>
          
          <Form.Group>
            <Form.Label>Reason (optional):</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Provide a reason for this status change..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={selectedEvent?.newStatus ? 'success' : 'danger'} 
            onClick={confirmStatusChange}
            disabled={processingStatus}
          >
            {processingStatus ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                /> Processing...
              </>
            ) : (
              `Confirm ${selectedEvent?.newStatus ? 'Activation' : 'Deactivation'}`
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
};

export default AdminEventManagement; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaPlus, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import EventService from '../../services/EventService';

const EventVenueLinker = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedVenues, setSelectedVenues] = useState([]);
  const [venueAvailability, setVenueAvailability] = useState({});

  // Fetch events and venues when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch event categories
      const eventsData = await EventService.getEventCategories();
      setEvents(eventsData.length > 0 ? eventsData : []);
      
      // Fetch all venues owned by the organizer
      const venuesData = await EventService.getAllVenues();
      setVenues(venuesData.length > 0 ? venuesData : []);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please check your connection and try again.");
      setLoading(false);
    }
  };

  const handleEventChange = async (e) => {
    const eventId = e.target.value;
    setSelectedEvent(eventId);
    
    if (eventId) {
      try {
        // Fetch venues already linked to this event
        const linkedVenues = await EventService.getVenuesByCategory(eventId);
        
        // Create a list of venue IDs already linked to this event
        const linkedVenueIds = linkedVenues.map(venue => venue.id);
        setSelectedVenues(linkedVenueIds);
        
        // Update the venue availability
        const availabilityObj = {};
        venues.forEach(venue => {
          availabilityObj[venue.id] = linkedVenueIds.includes(venue.id);
        });
        setVenueAvailability(availabilityObj);
        
      } catch (err) {
        console.error("Error fetching linked venues:", err);
        setError("Failed to load linked venues. Please try again.");
      }
    } else {
      setSelectedVenues([]);
      setVenueAvailability({});
    }
  };

  const toggleVenueSelection = (venueId) => {
    if (selectedVenues.includes(venueId)) {
      setSelectedVenues(selectedVenues.filter(id => id !== venueId));
    } else {
      setSelectedVenues([...selectedVenues, venueId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      setError("Please select an event category");
      return;
    }
    
    setSaveLoading(true);
    try {
      // In a real application, send the selected venues to be linked with the event
      // await ApiService.post(`/api/events/${selectedEvent}/venues`, { venues: selectedVenues });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
      setSaveLoading(false);
    } catch (err) {
      console.error("Error saving venue links:", err);
      setError("Failed to save changes. Please try again.");
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading data...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Button 
          variant="light" 
          className="me-3" 
          onClick={() => navigate('/organizer/dashboard')}
        >
          <FaArrowLeft />
        </Button>
        <h2 className="mb-0">Link Venues to Events</h2>
      </div>
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          <FaExclamationCircle className="me-2" />
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success">
          <FaCheck className="me-2" />
          Venues successfully linked to the event!
        </Alert>
      )}
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Select Event Category</Form.Label>
              <Form.Select 
                value={selectedEvent} 
                onChange={handleEventChange}
                required
              >
                <option value="">Choose an event category</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            {selectedEvent && (
              <>
                <h5 className="mb-3">Select Venues Available for this Event</h5>
                {venues.length > 0 ? (
                  <>
                    <div className="mb-3">
                      <Button 
                        variant="outline-primary" 
                        className="d-flex align-items-center"
                        onClick={() => navigate(`/organizer/add-venue-for-event/${selectedEvent}`)}
                        style={{color: "#f05537", borderColor: "#f05537"}}
                      >
                        <FaPlus className="me-2" /> Add New Venue for This Event
                      </Button>
                    </div>
                    <Row xs={1} md={2} lg={3} className="g-4 mb-4">
                      {venues.map(venue => (
                        <Col key={venue.id}>
                          <Card 
                            className={`h-100 ${selectedVenues.includes(venue.id) ? 'border-primary' : 'border'}`}
                            onClick={() => toggleVenueSelection(venue.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <Card.Img 
                              variant="top" 
                              src={venue.image || "https://via.placeholder.com/300x200?text=No+Image"} 
                              alt={venue.title || venue.name}
                              style={{ height: "160px", objectFit: "cover" }}
                            />
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start">
                                <Card.Title>{venue.title || venue.name}</Card.Title>
                                {selectedVenues.includes(venue.id) && (
                                  <Badge bg="primary" pill>
                                    <FaCheck />
                                  </Badge>
                                )}
                              </div>
                              <Card.Text className="text-muted small">
                                {venue.city || venue.location} • Capacity: {venue.capacity}
                              </Card.Text>
                              <Card.Text className="small">
                                {venue.description?.substring(0, 100)}
                                {venue.description?.length > 100 ? '...' : ''}
                              </Card.Text>
                              <div className="text-primary">
                                {venue.price}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </>
                ) : (
                  <Alert variant="info">
                    You haven't added any venues yet. 
                    <Button 
                      variant="link" 
                      className="p-0 ms-2"
                      onClick={() => navigate('/organizer/add-venue')}
                    >
                      Add a venue now
                    </Button>
                  </Alert>
                )}
              </>
            )}
            
            <div className="d-flex justify-content-end mt-3">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => navigate('/organizer/dashboard')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={!selectedEvent || saveLoading}
                style={{backgroundColor: "#f05537", borderColor: "#f05537"}}
              >
                {saveLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EventVenueLinker; 
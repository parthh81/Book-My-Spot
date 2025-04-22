const Event = require('../models/Event'); // Ensure Event model is defined
const Venue = require('../models/Venue');
const mongoose = require('mongoose');
const path = require('path');

// Get all events
const getAllEvents = async (req, res) => {
  try {
    console.log('Attempting to fetch all events...');
    
    // Check if Event model is properly defined
    if (!Event || typeof Event.find !== 'function') {
      console.error('Event model is not properly defined or initialized');
      return res.status(500).json({ 
        message: 'Database model not properly initialized', 
        error: 'Event model undefined or invalid' 
      });
    }
    
    // Add a try-catch specifically for the database query
    try {
      const events = await Event.find().sort('-date');
      console.log(`Successfully fetched ${events.length} events`);
      res.status(200).json(events);
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return res.status(500).json({ 
        message: 'Database query failed', 
        error: dbError.message 
      });
    }
  } catch (error) {
    console.error('Error in getAllEvents controller:', error);
    res.status(500).json({ 
      message: 'Failed to fetch events', 
      error: error.message 
    });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Check if the ID is a valid ObjectId
    let event;
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      // If it's a valid ObjectId, use findById with populate
      event = await Event.findById(eventId).populate({
        path: 'userId', 
        select: 'firstName lastName email -_id' // Select only name fields, exclude _id
      });
    } else {
      // If it's not a valid ObjectId (like a numeric string "1"), 
      // assume it might be the categoryId from the sample data
      // Try to find by numeric categoryId
      event = await Event.findOne({ categoryId: parseInt(eventId) });
    }
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Format the response data
    const eventData = event.toObject();
    
    // If organizer is a MongoDB ObjectId, and we have userId data, use that for organizer name
    if (mongoose.Types.ObjectId.isValid(eventData.organizer) && eventData.userId) {
      eventData.organizer = `${eventData.userId.firstName || ''} ${eventData.userId.lastName || ''}`.trim();
    }
    
    // If we still don't have a proper organizer name, check if it's stored as string ID
    if (!eventData.organizer || (typeof eventData.organizer === 'string' && mongoose.Types.ObjectId.isValid(eventData.organizer))) {
      try {
        // Try to find the user with this ID
        const userModel = require('../models/UserModel');
        const organizerUser = await userModel.findById(eventData.organizer).select('firstName lastName -_id');
        
        if (organizerUser) {
          eventData.organizer = `${organizerUser.firstName || ''} ${organizerUser.lastName || ''}`.trim();
        }
      } catch (userError) {
        console.error('Error fetching organizer details:', userError);
        // If there's an error, fallback to a default organizer name
        if (!eventData.organizer || typeof eventData.organizer !== 'string' || eventData.organizer.trim() === '') {
          eventData.organizer = 'Event Organizer';
        }
      }
    }
    
    res.status(200).json(eventData);
  } catch (error) {
    console.error(`Error fetching event with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch event' });
  }
};

// Create new event - remove pincode handling
const createEvent = async (req, res) => {
  try {
    console.log('Creating event with data:', req.body);
    
    // Add the user ID to the event data
    const eventData = {
      ...req.body,
      userId: req.user.userId,  // Add user ID from authenticated user
      organizer: req.user.userId // Also save as organizer
    };
    
    // Ensure city and area are properly set
    if (req.body.city) {
      eventData.city = req.body.city;
    }
    
    if (req.body.area) {
      eventData.area = req.body.area;
    }
    
    // Extract city from location if not provided
    if (!eventData.city && eventData.location) {
      const locationParts = eventData.location.split(',');
      if (locationParts.length > 1) {
        // Try to extract city from the last part of the address
        eventData.city = locationParts[locationParts.length - 1].trim();
      }
    }
    
    // Ensure categoryId is a number
    if (eventData.categoryId && typeof eventData.categoryId === 'string') {
      eventData.categoryId = parseInt(eventData.categoryId);
    }
    
    // Make sure the venue ID is properly set
    if (eventData.venue && eventData.venue._id) {
      // If we have a venue object with an _id, ensure venueId field is set
      eventData.venueId = eventData.venue._id;
      console.log(`Setting venue ID from venue object: ${eventData.venueId}`);
    } else if (eventData.venueId) {
      // If only venueId is provided, ensure it's properly formatted
      if (typeof eventData.venueId === 'string' && mongoose.Types.ObjectId.isValid(eventData.venueId)) {
        // Valid MongoDB ID
        console.log(`Using provided venue ID: ${eventData.venueId}`);
        
        // Create a minimal venue object if not present
        if (!eventData.venue) {
          // Try to fetch the venue details
          try {
            const Venue = require('../models/Venue');
            const venueDetails = await Venue.findById(eventData.venueId);
            
            if (venueDetails) {
              eventData.venue = {
                _id: venueDetails._id,
                name: venueDetails.name,
                location: venueDetails.location,
                price: venueDetails.price,
                capacity: venueDetails.capacity
              };
              
              // If event has no location, use venue location
              if (!eventData.location) {
                eventData.location = venueDetails.location;
              }
              
              // If venue has city/area but event doesn't, use venue's
              if (venueDetails.city && !eventData.city) {
                eventData.city = venueDetails.city;
              }
              
              if (venueDetails.area && !eventData.area) {
                eventData.area = venueDetails.area;
              }
              
              console.log('Added venue details to event:', eventData.venue);
            } else {
              console.warn(`Venue with ID ${eventData.venueId} not found`);
            }
          } catch (venueError) {
            console.error('Error fetching venue details:', venueError);
          }
        }
      }
    }
    
    // Remove any pincode that might be sent from frontend
    if (eventData.pincode) {
      delete eventData.pincode;
    }
    
    // Also remove pincode from venue object if it exists
    if (eventData.venue && eventData.venue.pincode) {
      delete eventData.venue.pincode;
    }
    
    console.log('Final event data for creation:', eventData);
    const newEvent = new Event(eventData);
    const savedEvent = await newEvent.save();
    
    // Update the count in the associated category
    if (savedEvent.categoryId) {
      try {
        // Import EventCategory model
        const EventCategory = require('../models/EventCategory');
        
        // Find the category and increment its count
        await EventCategory.findOneAndUpdate(
          { id: savedEvent.categoryId },
          { $inc: { count: 1 } },
          { new: true }
        );
        
        console.log(`Updated count for category ${savedEvent.categoryId}`);
      } catch (categoryError) {
        console.error('Error updating category count:', categoryError);
        // Don't fail the whole request if category update fails
      }
    }
    
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ message: 'Failed to create event', error: error.message });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'Admin';
    
    console.log(`Updating event ${eventId} with data:`, req.body);
    
    // Find the event first to check ownership
    let existingEvent;
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      existingEvent = await Event.findById(eventId);
    } else {
      existingEvent = await Event.findOne({ categoryId: parseInt(eventId) });
    }
    
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user owns the event or is admin
    if (!isAdmin && existingEvent.organizer && existingEvent.organizer.toString() !== userId && existingEvent.userId && existingEvent.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have permission to update this event' });
    }
    
    // Make sure status is part of the update
    const updateData = {
      ...req.body,
      status: req.body.status || existingEvent.status || 'active' // Keep existing status or set default
    };
    
    // Handle city and area fields
    if (req.body.city) {
      updateData.city = req.body.city;
    }
    
    if (req.body.area) {
      updateData.area = req.body.area;
    }
    
    // If city/area fields come from form objects with 'name' property
    if (req.body.cityId && req.body.cityId.name) {
      updateData.city = req.body.cityId.name;
    }
    
    if (req.body.areaId && req.body.areaId.name) {
      updateData.area = req.body.areaId.name;
    }
    
    console.log("Final update data:", updateData);
    
    // Update the event
    let event;
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      event = await Event.findByIdAndUpdate(
        eventId,
        updateData,
        { new: true, runValidators: true }
      );
    } else if (existingEvent) {
      event = await Event.findByIdAndUpdate(
        existingEvent._id,
        updateData,
        { new: true, runValidators: true }
      );
    }
    
    console.log("Updated event:", event);
    res.status(200).json(event);
  } catch (error) {
    console.error(`Error updating event with ID ${req.params.id}:`, error);
    res.status(400).json({ message: 'Failed to update event', error: error.message });
  }
};

// Update event with images
const updateEventWithImages = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'Admin';
    
    console.log(`Updating event ${eventId} with images`, req.body);
    console.log('Uploaded files:', req.files);
    
    // Find the event first to check ownership
    let existingEvent;
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      existingEvent = await Event.findById(eventId);
    } else {
      existingEvent = await Event.findOne({ categoryId: parseInt(eventId) });
    }
    
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user owns the event or is admin
    if (!isAdmin && existingEvent.organizer && existingEvent.organizer.toString() !== userId && existingEvent.userId && existingEvent.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have permission to update this event' });
    }
    
    // Prepare updated data from form fields
    const eventData = { ...req.body };
    
    // Handle image file paths
    if (req.files) {
      // Handle event image
      if (req.files.eventImage && req.files.eventImage[0]) {
        // Store the path relative to the server root for easier retrieval
        const imagePath = `/uploads/${path.basename(req.files.eventImage[0].path)}`;
        eventData.image = imagePath;
        console.log('Updated event image path:', imagePath);
        console.log('Original file name:', req.files.eventImage[0].originalname);
        console.log('Saved file path:', req.files.eventImage[0].path);
      }
      
      // Handle venue image
      if (req.files.venueImage && req.files.venueImage[0]) {
        if (!eventData.venue) {
          eventData.venue = existingEvent.venue || {};
        }
        
        // Store the path relative to the server root for easier retrieval
        const imagePath = `/uploads/${path.basename(req.files.venueImage[0].path)}`;
        eventData.venue.image = imagePath;
        console.log('Updated venue image path:', imagePath);
      }
    }
    
    // Convert certain fields to their proper types
    if (eventData.capacity && typeof eventData.capacity === 'string') {
      eventData.capacity = parseInt(eventData.capacity);
    }
    
    if (eventData.price && typeof eventData.price === 'string') {
      eventData.price = parseInt(eventData.price);
    }
    
    // Extract venue details from the form data
    if (eventData.venueName || eventData.venueAddress || eventData.cityName) {
      if (!eventData.venue) {
        eventData.venue = existingEvent.venue || {};
      }
      
      if (eventData.venueName) {
        eventData.venue.name = eventData.venueName;
      }
      
      if (eventData.venueAddress) {
        eventData.venue.address = eventData.venueAddress;
      }
      
      if (eventData.cityName) {
        eventData.city = eventData.cityName;
        eventData.venue.city = eventData.cityName;
      }
      
      if (eventData.areaName) {
        eventData.area = eventData.areaName;
        eventData.venue.area = eventData.areaName;
      }
    }
    
    // Make sure location is updated if venue address changed
    if (eventData.venueAddress) {
      eventData.location = eventData.venueAddress;
    } else if (eventData.cityName) {
      eventData.location = eventData.cityName;
    }
    
    // Parse date properly if it's a string
    if (eventData.date && typeof eventData.date === 'string') {
      eventData.date = new Date(eventData.date);
    }
    
    console.log('Final update data with images:', eventData);
    
    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: eventData },
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event with images:', error);
    res.status(400).json({ message: 'Failed to update event with images', error: error.message });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'Admin';
    
    // Find the event first to check ownership
    let event;
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      event = await Event.findById(eventId);
    } else {
      event = await Event.findOne({ categoryId: parseInt(eventId) });
    }
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user owns the event or is admin
    if (!isAdmin && event.organizer && event.organizer.toString() !== userId && event.userId && event.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this event' });
    }
    
    // Delete the event
    let deletedEvent;
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      deletedEvent = await Event.findByIdAndDelete(eventId);
    } else if (event) {
      deletedEvent = await Event.findByIdAndDelete(event._id);
    }
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(`Error deleting event with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
};

// Get events by category
const getEventsByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    const events = await Event.find({ categoryId }).sort('-date');
    res.status(200).json(events);
  } catch (error) {
    console.error(`Error fetching events for category ${req.params.categoryId}:`, error);
    res.status(500).json({ message: 'Failed to fetch events for this category' });
  }
};

// Get venues for an event
const getVenuesForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Check if the ID is a valid ObjectId
    let event;
    if (mongoose.Types.ObjectId.isValid(eventId)) {
      // If it's a valid ObjectId, use findById
      event = await Event.findById(eventId);
    } else {
      // If it's not a valid ObjectId (like a numeric string "1"), 
      // assume it might be the categoryId from the sample data
      const categoryId = parseInt(eventId);
      if (!isNaN(categoryId)) {
        event = await Event.findOne({ categoryId });
      }
    }
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // If the event has a venue field, use that directly
    if (event.venue && Object.keys(event.venue).length > 0) {
      console.log(`Event ${eventId} has embedded venue data:`, event.venue);
      return res.status(200).json([event.venue]);
    }
    
    // If the event has a venueId, fetch the venue
    if (event.venueId) {
      console.log(`Event ${eventId} has venueId: ${event.venueId}`);
      try {
        const Venue = require('../models/Venue');
        const venue = await Venue.findById(event.venueId);
        
        if (venue) {
          console.log(`Found venue for event ${eventId}:`, venue);
          return res.status(200).json([venue]);
        } else {
          console.log(`Venue with ID ${event.venueId} not found for event ${eventId}`);
        }
      } catch (venueError) {
        console.error(`Error fetching venue for event ${eventId}:`, venueError);
      }
    }
    
    // If we don't have venue info or failed to fetch it, try to find by category
    if (event.categoryId) {
      const Venue = require('../models/Venue');
      const venues = await Venue.find({ suitableEvents: event.categoryId });
      
      if (venues && venues.length > 0) {
        console.log(`Found ${venues.length} venues for event ${eventId} by category ${event.categoryId}`);
        return res.status(200).json(venues);
      }
    }
    
    // If no venues found by any method, return empty array
    console.log(`No venues found for event ${eventId}`);
    res.status(200).json([]);
  } catch (error) {
    console.error(`Error fetching venues for event ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch venues' });
  }
};

// Get venues by category and location
const getVenuesByCategoryAndLocation = async (req, res) => {
  try {
    const { categoryId, location } = req.query;
    
    console.log(`Fetching venues for category ${categoryId} and location ${location || 'any'}`);
    console.log('Request query:', req.query);
    console.log('CategoryId type:', typeof categoryId);
    
    // Build the query based on provided parameters
    const query = {};
    
    // Add category filter if provided
    if (categoryId) {
      // Convert to number and check if it's a valid number
      const categoryIdNum = Number(categoryId);
      if (!isNaN(categoryIdNum)) {
        query.suitableEvents = categoryIdNum;
        console.log(`Using categoryId as number: ${categoryIdNum}`);
      } else {
        // If it's not a valid number, try to use it as a string
        query.suitableEvents = categoryId;
        console.log(`Using categoryId as string: ${categoryId}`);
      }
    }
    
    // Add location filter if provided
    if (location && location !== 'All Locations') {
      // This assumes venues have a location field that can be matched
      query.location = { $regex: location, $options: 'i' };
      console.log(`Added location filter: ${location}`);
    }
    
    console.log('Final query:', query);
    
    // Find venues matching the criteria
    const venues = await Venue.find(query).limit(20);
    
    console.log(`Found ${venues.length} venues matching criteria`);
    
    // If no venues found, create some sample venues for testing
    if (venues.length === 0 && categoryId) {
      console.log('No venues found, creating sample venues for testing');
      const categoryIdNum = Number(categoryId);
      const sampleVenues = [
        {
          id: `venue-sample-1-${categoryId}`,
          name: 'Grand Ballroom',
          description: 'A luxurious venue for your special event',
          image: 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
          location: location !== 'All Locations' ? location : 'Mumbai',
          capacity: '200-500 guests',
          price: 50000,
          suitableEvents: [categoryIdNum || categoryId]
        },
        {
          id: `venue-sample-2-${categoryId}`,
          name: 'Seaside Resort',
          description: 'Beautiful beachfront venue with stunning views',
          image: 'https://images.pexels.com/photos/265980/pexels-photo-265980.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
          location: location !== 'All Locations' ? location : 'Goa',
          capacity: '100-300 guests',
          price: 35000,
          suitableEvents: [categoryIdNum || categoryId]
        },
        {
          id: `venue-sample-3-${categoryId}`,
          name: 'Heritage Palace',
          description: 'Historic venue with royal ambiance',
          image: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
          location: location !== 'All Locations' ? location : 'Jaipur',
          capacity: '150-400 guests',
          price: 45000,
          suitableEvents: [categoryIdNum || categoryId]
        }
      ];
      
      // Filter by location if specified
      const filteredVenues = location !== 'All Locations' 
        ? sampleVenues.filter(v => v.location.includes(location))
        : sampleVenues;
        
      return res.status(200).json(filteredVenues.length > 0 ? filteredVenues : sampleVenues);
    }
    
    res.status(200).json(venues);
  } catch (error) {
    console.error('Error fetching venues by category and location:', error);
    res.status(500).json({ 
      message: 'Failed to fetch venues by category and location',
      error: error.message 
    });
  }
};

// Search events by term
const searchEvents = async (req, res) => {
  try {
    const searchTerm = req.query.term;
    
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    const events = await Event.find({ $text: { $search: searchTerm } });
    res.status(200).json(events);
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ message: 'Failed to search events' });
  }
};

// Initialize sample events function
const initializeSampleEvents = async () => {
  // This function has been intentionally removed to disable sample data initialization
  console.log('Sample data initialization has been disabled');
  return [];
};

// Delete all events
const deleteAllEvents = async (req, res) => {
  try {
    // Require admin permissions
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can delete all events' });
    }
    
    await Event.deleteMany({});
    res.status(200).json({ message: 'All events deleted successfully' });
  } catch (error) {
    console.error('Error deleting all events:', error);
    res.status(500).json({ message: 'Failed to delete all events', error: error.message });
  }
};

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
  try {
    // Get limit from query params or default to 5
    const limit = parseInt(req.query.limit) || 5;
    
    // Get current date
    const currentDate = new Date();
    
    // Get organizer ID from user if authenticated
    let query = { date: { $gte: currentDate } };
    if (req.user && req.user.role === 'Organizer') {
      const organizerId = req.user.userId;
      query.organizer = organizerId;
    }
    
    // Find upcoming events
    const upcomingEvents = await Event.find(query)
      .sort('date') // Sort by date ascending
      .limit(limit);
    
    // Format events for frontend
    const formattedEvents = upcomingEvents.map(event => {
      return {
        id: event._id,
        name: event.title || event.name,
        date: event.date || event.eventDate,
        location: event.location || '',
        image: event.image || '',
        bookingsCount: event.bookingsCount || 0,
        eventType: event.category || ''
      };
    });
    
    res.status(200).json({
      data: formattedEvents
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      message: 'Error fetching upcoming events',
      error: error.message
    });
  }
};

// Get event statistics
const getEventStats = async (req, res) => {
  try {
    // Get organizer ID from user if authenticated
    let query = {};
    if (req.user && req.user.role === 'Organizer') {
      const organizerId = req.user.userId;
      query.organizer = organizerId;
    }
    
    // Current date for upcoming vs. completed calculation
    const currentDate = new Date();
    
    // Count total events
    const totalEvents = await Event.countDocuments(query);
    
    // Count upcoming events
    const upcomingEvents = await Event.countDocuments({
      ...query,
      date: { $gte: currentDate }
    });
    
    // Count completed events
    const completedEvents = await Event.countDocuments({
      ...query,
      date: { $lt: currentDate }
    });
    
    // Get bookings count and revenue stats (would require joining with bookings)
    // For now return mock data
    
    res.status(200).json({
      totalEvents,
      upcomingEvents,
      completedEvents
    });
  } catch (error) {
    console.error('Error fetching event statistics:', error);
    res.status(500).json({
      message: 'Error fetching event statistics',
      error: error.message
    });
  }
};

// Get events created by the logged-in organizer
const getOrganizerEvents = async (req, res) => {
  try {
    // Check if req.user exists and has userId property
    if (!req.user || !req.user.userId) {
      console.error('No user ID found in request:', req.user);
      return res.status(401).json({ 
        message: 'Authentication required or invalid user ID',
        error: 'No valid user ID found in request' 
      });
    }
    
    console.log('Fetching events for organizer:', req.user.userId);
    
    // Find events where userId (or organizer) matches the authenticated user
    try {
      const events = await Event.find({ 
        $or: [
          { userId: req.user.userId },
          { organizer: req.user.userId }
        ] 
      }).sort('-date');
      
      console.log(`Found ${events.length} events for organizer ${req.user.userId}`);
      return res.status(200).json(events);
    } catch (queryError) {
      console.error('Database query error in getOrganizerEvents:', queryError);
      return res.status(500).json({ 
        message: 'Database query failed', 
        error: queryError.message 
      });
    }
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch organizer events', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  getEventsByCategory,
  getVenuesForEvent,
  getVenuesByCategoryAndLocation,
  searchEvents,
  createEvent,
  updateEvent,
  updateEventWithImages,
  deleteEvent,
  deleteAllEvents,
  getUpcomingEvents,
  getEventStats,
  getOrganizerEvents
};
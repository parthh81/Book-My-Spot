const Venue = require('../models/Venue');
const mongoose = require('mongoose');

// Get all venues
const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find();
    res.status(200).json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Failed to fetch venues' });
  }
};

// Get venue by ID
const getVenueById = async (req, res) => {
  try {
    const venueId = req.params.id;
    console.log(`Received request for venue with ID: ${venueId}`);
    
    // Check if the ID is a valid ObjectId
    let venue;
    if (mongoose.Types.ObjectId.isValid(venueId)) {
      // If it's a valid ObjectId, use findById
      console.log(`Looking up venue by MongoDB ObjectId: ${venueId}`);
      venue = await Venue.findById(venueId);
    } else if (venueId.startsWith('venue-')) {
      // Handle IDs from special format that start with 'venue-'
      console.log(`Handling special venue ID format: ${venueId}`);
      
      // Extract category ID if it's in the format venue-fallback-X-Y
      let categoryId;
      if (venueId.includes('fallback')) {
        const parts = venueId.split('-');
        if (parts.length >= 4) {
          categoryId = parseInt(parts[3]);
        }
      } 
      
      if (categoryId && !isNaN(categoryId)) {
        console.log(`Looking for venue with category ID: ${categoryId}`);
        venue = await Venue.findOne({ suitableEvents: categoryId });
      }
    } else {
      // If it's not a valid ObjectId (like a numeric string "1"), 
      // try to find by venueId or other numeric field
      const venueIdNum = parseInt(venueId);
      if (!isNaN(venueIdNum)) {
        console.log(`Looking for venue with numeric ID or category: ${venueIdNum}`);
        // Try to find a venue that has this number in suitableEvents
        venue = await Venue.findOne({ $or: [{ venueId: venueIdNum }, { suitableEvents: venueIdNum }] });
      }
    }
    
    if (!venue) {
      console.log(`No venue found for ID: ${venueId}. Fetching alternative venues.`);
      
      // Find alternative venues to suggest to the user
      let alternativeVenues = [];
      try {
        // Get 3 random venues as alternatives
        alternativeVenues = await Venue.aggregate([{ $sample: { size: 3 } }]);
        
        // If there aren't any venues in the database, set to empty array
        if (!alternativeVenues || alternativeVenues.length === 0) {
          alternativeVenues = [];
        }
      } catch (err) {
        console.error('Error fetching alternative venues:', err);
        alternativeVenues = [];
      }
      
      // Return 404 with alternative venues
      return res.status(404).json({ 
        message: 'Venue not found',
        alternativeVenues: alternativeVenues.map(venue => ({
          _id: venue._id,
          name: venue.name,
          description: venue.description,
          price: venue.price,
          location: venue.location,
          image: venue.images && venue.images.length > 0 ? venue.images[0] : ""
        }))
      });
    }
    
    console.log(`Successfully found venue: ${venue.name || venue._id}`);
    res.status(200).json(venue);
  } catch (error) {
    console.error(`Error fetching venue with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch venue', error: error.message });
  }
};

// Create new venue
const createVenue = async (req, res) => {
  try {
    const newVenue = new Venue(req.body);
    const savedVenue = await newVenue.save();
    res.status(201).json(savedVenue);
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(400).json({ message: 'Failed to create venue', error: error.message });
  }
};

// Update venue
const updateVenue = async (req, res) => {
  try {
    const venueId = req.params.id;
    let venue;
    
    if (mongoose.Types.ObjectId.isValid(venueId)) {
      venue = await Venue.findByIdAndUpdate(
        venueId,
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      const venueIdNum = parseInt(venueId);
      if (!isNaN(venueIdNum)) {
        const venueToUpdate = await Venue.findOne({ suitableEvents: venueIdNum });
        if (venueToUpdate) {
          venue = await Venue.findByIdAndUpdate(
            venueToUpdate._id,
            req.body,
            { new: true, runValidators: true }
          );
        }
      }
    }
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    res.status(200).json(venue);
  } catch (error) {
    console.error(`Error updating venue with ID ${req.params.id}:`, error);
    res.status(400).json({ message: 'Failed to update venue', error: error.message });
  }
};

// Delete venue
const deleteVenue = async (req, res) => {
  try {
    const venueId = req.params.id;
    let venue;
    
    if (mongoose.Types.ObjectId.isValid(venueId)) {
      venue = await Venue.findByIdAndDelete(venueId);
    } else {
      const venueIdNum = parseInt(venueId);
      if (!isNaN(venueIdNum)) {
        const venueToDelete = await Venue.findOne({ suitableEvents: venueIdNum });
        if (venueToDelete) {
          venue = await Venue.findByIdAndDelete(venueToDelete._id);
        }
      }
    }
    
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    
    res.status(200).json({ message: 'Venue deleted successfully' });
  } catch (error) {
    console.error(`Error deleting venue with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete venue' });
  }
};

// Search venues by term
const searchVenues = async (req, res) => {
  try {
    const searchTerm = req.query.term;
    
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }
    
    const venues = await Venue.find({ $text: { $search: searchTerm } });
    res.status(200).json(venues);
  } catch (error) {
    console.error('Error searching venues:', error);
    res.status(500).json({ message: 'Failed to search venues' });
  }
};

// Filter venues by multiple criteria
const filterVenues = async (req, res) => {
  try {
    const { categoryId, location, minPrice, maxPrice, capacity } = req.query;
    
    // Build the query based on provided parameters
    const query = {};
    
    // Add category filter if provided
    if (categoryId) {
      // Convert to number and check if it's a valid number
      const categoryIdNum = Number(categoryId);
      if (!isNaN(categoryIdNum)) {
        query.suitableEvents = categoryIdNum;
      }
    }
    
    // Add location filter if provided
    if (location && location !== 'All Locations') {
      query.location = { $regex: new RegExp(location, 'i') };
    }
    
    // Add price range filter if provided
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Add capacity filter if provided
    if (capacity) {
      // This is a simplification; in reality, you might want to parse the capacity string
      // or store capacity as min/max numbers in the database
      query.capacity = { $regex: new RegExp(capacity, 'i') };
    }
    
    console.log('Venue filter query:', query);
    
    const venues = await Venue.find(query).limit(20);
    res.status(200).json(venues);
  } catch (error) {
    console.error('Error filtering venues:', error);
    res.status(500).json({ message: 'Failed to filter venues' });
  }
};

// Get venues by event category
const getVenuesByEventCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    console.log(`Fetching venues for category ID: ${categoryId}`);
    const venues = await Venue.find({ suitableEvents: categoryId });
    console.log(`Found ${venues.length} venues for category ${categoryId}`);
    
    // If no venues found, return empty array but with success status
    if (venues.length === 0) {
      console.log(`No venues found for category ${categoryId}`);
      return res.status(200).json([]);
    }
    
    res.status(200).json(venues);
  } catch (error) {
    console.error(`Error fetching venues for category ${req.params.categoryId}:`, error);
    res.status(500).json({ message: 'Failed to fetch venues for this category' });
  }
};

// Initialize sample venues with proper category mapping
const initializeSampleVenues = async () => {
  // This function has been intentionally disabled to remove sample data initialization
  console.log('Sample venues initialization has been disabled');
  return [];
};

// Export all controllers
module.exports = {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  searchVenues,
  filterVenues,
  getVenuesByEventCategory,
  initializeSampleVenues
}; 
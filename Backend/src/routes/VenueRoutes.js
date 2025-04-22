const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');

// GET all venues
router.get('/', venueController.getAllVenues);

// GET search venues (must come before /:id routes)
router.get('/search', venueController.searchVenues);

// GET filter venues (must come before /:id routes)
router.get('/filter', venueController.filterVenues);

// GET venues by event category (must come before /:id routes)
router.get('/event/:categoryId', venueController.getVenuesByEventCategory);

// GET venue by ID
router.get('/:id', venueController.getVenueById);

// POST create new venue
router.post('/', venueController.createVenue);

// PUT update venue
router.put('/:id', venueController.updateVenue);

// DELETE venue
router.delete('/:id', venueController.deleteVenue);

module.exports = router; 
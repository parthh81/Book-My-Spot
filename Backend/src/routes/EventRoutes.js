const express = require('express');
// Use try-catch to handle potential case sensitivity issues
let eventController;
try {
  eventController = require('../controllers/EventController');
} catch (error) {
  try {
    eventController = require('../controllers/EventController');
  } catch (innerError) {
    console.error('Failed to load event controller:', innerError.message);
    // Create a minimal controller that returns empty arrays to prevent crashes
    eventController = {
      getAllEvents: (req, res) => res.json([]),
      getEventById: (req, res) => res.status(404).json({ message: 'Event not found' }),
      getEventsByCategory: (req, res) => res.json([]),
      getVenuesForEvent: (req, res) => res.json([]),
      searchEvents: (req, res) => res.json([]),
      createEvent: (req, res) => res.status(500).json({ message: 'Controller not available' }),
      updateEvent: (req, res) => res.status(500).json({ message: 'Controller not available' }),
      deleteEvent: (req, res) => res.status(500).json({ message: 'Controller not available' }),
      deleteAllEvents: (req, res) => res.status(500).json({ message: 'Controller not available' }),
      getUpcomingEvents: (req, res) => res.json({ data: [] }),
      getEventStats: (req, res) => res.json({ totalEvents: 0, upcomingEvents: 0, completedEvents: 0 })
    };
  }
}

const authMiddleware = require('../utils/AuthMiddleware');
const router = express.Router();

// Setup multer for file uploads
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filter function to only allow image files
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance
const upload = multer({ 
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// Public routes
// GET all events
router.get('/', eventController.getAllEvents);

// GET search events
router.get('/search', eventController.searchEvents);

// GET events by category
router.get('/category/:categoryId', eventController.getEventsByCategory);

// Special routes - MUST come before /:id routes to avoid conflicts
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/stats', eventController.getEventStats);

// GET events for the logged-in organizer
router.get('/organizer', authMiddleware.verifyToken, authMiddleware.isOrganizer, eventController.getOrganizerEvents);

// GET event by ID
router.get('/:id', eventController.getEventById);

// GET venues for a specific event
router.get('/:id/venues', eventController.getVenuesForEvent);

// GET venues by category and location (using query parameters)
router.get('/venues/filter', eventController.getVenuesByCategoryAndLocation);

// Protected routes for organizers and admins
// POST create new event - only organizers can create events
router.post('/', authMiddleware.verifyToken, authMiddleware.isOrganizer, eventController.createEvent);

// PUT update event - only organizers who own the event or admins can update
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isOrganizer, eventController.updateEvent);

// PUT update event with images - only organizers who own the event or admins can update
router.put('/:id/with-images', 
  authMiddleware.verifyToken, 
  authMiddleware.isOrganizer, 
  upload.fields([
    { name: 'eventImage', maxCount: 1 },
    { name: 'venueImage', maxCount: 1 }
  ]),
  eventController.updateEventWithImages
);

// DELETE event - only organizers who own the event or admins can delete
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isOrganizer, eventController.deleteEvent);

// DELETE all events - only admins can delete all events
router.delete('/admin/all', authMiddleware.verifyToken, authMiddleware.isOrganizer, eventController.deleteAllEvents);

module.exports = router;
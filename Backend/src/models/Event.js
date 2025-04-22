const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: false,
    default: "Untitled Event",
    index: { unique: true, sparse: true }  // Only index non-null values
  },
  description: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: false,
    default: Date.now
  },
  location: { 
    type: String, 
    required: true 
  },
  city: {
    type: String,
    required: false,
    default: ""
  },
  area: {
    type: String,
    required: false,
    default: ""
  },
  image: { 
    type: String,
    default: "" 
  },
  category: {
    type: String,
    default: "Event"
  },
  categoryId: {
    type: Number,
    default: 1
  },
  price: {
    type: Number,
    default: 0
  },
  capacity: {
    type: String,
    default: "100+ guests"
  },
  eventType: {
    type: String,
    default: "Event"
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  organizer: {
    type: mongoose.Schema.Types.Mixed,
    default: ""
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue"
  },
  venue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  contact: {
    email: String,
    phone: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the timestamp when document is updated
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create text index for search functionality
eventSchema.index({ 
  name: 'text', 
  description: 'text', 
  location: 'text',
  city: 'text',
  area: 'text',
  category: 'text',
  eventType: 'text'
});

// Remove the pincode_1 index if it exists (safely)
eventSchema.post('init', function(doc) {
  const collection = mongoose.connection.collections['events'];
  if (collection) {
    collection.dropIndex('pincode_1', function(err) {
      // Ignore errors - the index might not exist
      if (err && err.code !== 27) {
        console.log('Note: Could not drop pincode index:', err.message);
      }
    });
  }
});

module.exports = mongoose.model('Event', eventSchema);

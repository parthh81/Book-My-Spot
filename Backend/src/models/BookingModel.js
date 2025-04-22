const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event"
  },
  venueId: {
    type: String,
    required: true
  },
  venueName: {
    type: String,
    required: true
  },
  venueImage: {
    type: String
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  eventDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: function() {
      return this.eventDate; // Default to same as start date
    }
  },
  numberOfDays: {
    type: Number, 
    default: 1,
    min: 1
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  guestCount: {
    type: Number,
    required: true,
    min: 1
  },
  basePrice: {
    type: Number,
    required: true
  },
  serviceFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partially Paid', 'Paid', 'Refunded'],
    default: 'Pending'
  },
  bookingStatus: {
    type: String,
    enum: ['Pending Confirmation', 'Pending Approval', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending Approval'
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  specialRequests: {
    type: String
  },
  contactName: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  location: {
    type: String
  },
  invoiceNumber: {
    type: String
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("bookings", bookingSchema); 
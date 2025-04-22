const bookingModel = require("../models/BookingModel");
const userModel = require("../models/UserModel");
const eventModel = require("../models/Event");

// Create a new booking
const createBooking = async (req, res) => {
  console.log('Create booking request received:', req.body);
  
  try {
    // Validate that at least either eventId or venueId is provided
    const eventId = req.body.eventId;
    const venueId = req.body.venueId;
    
    if (!eventId && !venueId) {
      console.log('Missing both eventId and venueId in request');
      return res.status(400).json({
        message: "Either Event ID or Venue ID is required"
      });
    }
    
    // Validate userId is provided
    const userId = req.body.userId;
    if (!userId) {
      console.log('Missing userId in request');
      return res.status(400).json({
        message: "User ID is required"
      });
    }
    
    // Check if event exists (only if eventId is provided)
    if (eventId) {
      console.log(`Attempting to find event with ID: ${eventId}`);
      
      // Validate that the event exists - but don't block if not found in development
      try {
        const event = await eventModel.findById(eventId);
        if (!event) {
          console.log(`Event not found with ID: ${eventId}`);
          
          // Only fail in production, allow in development for testing
          if (process.env.NODE_ENV === 'production') {
            return res.status(404).json({
              message: "Event not found"
            });
          } else {
            console.log('Continuing despite missing event (development mode)');
          }
        } else {
          console.log('Event found:', event.name || event.description);
        }
      } catch (eventError) {
        console.error('Error finding event:', eventError);
        // Allow to continue in development mode
        if (process.env.NODE_ENV === 'production') {
          return res.status(500).json({
            message: "Error validating event",
            error: eventError.message
          });
        }
      }
    }
    
    // Process dates for multi-day bookings
    let startDate = req.body.eventDate;
    let endDate = req.body.endDate || startDate;
    let numberOfDays = req.body.numberOfDays || 1;
    
    // Calculate number of days if not provided
    if (!numberOfDays && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = Math.abs(end - start);
        numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        numberOfDays = Math.max(numberOfDays, 1); // Ensure at least 1 day
      }
    }
    
    // Process pricing data
    const basePrice = req.body.basePrice || 0;
    const serviceFee = req.body.serviceFee || 0;
    
    // Calculate total amount if not provided
    let totalAmount = req.body.totalAmount;
    if (!totalAmount) {
      totalAmount = (basePrice * numberOfDays) + serviceFee;
    }
    
    // Generate invoice number
    const invoicePrefix = "INV";
    const invoiceDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `${invoicePrefix}-${invoiceDate}-${randomPart}`;
    
    // Add invoice number and default approval status to booking data
    const bookingData = {
      ...req.body,
      invoiceNumber,
      bookingStatus: 'Pending Approval',
      approvalStatus: 'Pending',
      endDate: endDate,
      numberOfDays: numberOfDays,
      basePrice: basePrice,
      serviceFee: serviceFee,
      totalAmount: totalAmount
    };
    
    console.log('Creating booking with data:', bookingData);
    
    // Create booking
    const newBooking = await bookingModel.create(bookingData);
    console.log('Booking created successfully with ID:', newBooking._id);

    // Get the event organizer details (if this is an event booking)
    if (eventId) {
      try {
        const event = await eventModel.findById(eventId);
        if (event && event.organizer) {
          console.log(`Sending approval request to organizer: ${event.organizer}`);
          
          // Here you would implement notification logic
          // For example, send an email, push notification, or in-app alert
        }
      } catch (orgError) {
        console.log('Could not notify organizer:', orgError.message);
        // Don't fail the request just because notification failed
      }
    }
    
    res.status(201).json({
      message: "Booking created successfully. Awaiting organizer approval.",
      data: newBooking
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    
    // Provide more detailed error message based on the error type
    let errorMessage = "Error creating booking";
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = "Validation error: " + Object.values(error.errors).map(e => e.message).join(', ');
      statusCode = 400;
    } else if (error.name === 'CastError') {
      errorMessage = `Invalid ${error.path}: ${error.value}`;
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      message: errorMessage,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all bookings for admin
const getAllBookings = async (req, res) => {
  try {
    // Find all bookings, sort by most recent first
    const bookings = await bookingModel.find().sort({ bookingDate: -1 });
    
    // Add information about the properties we're returning for debug purposes
    if (bookings.length > 0) {
      console.log("Booking data structure properties:", Object.keys(bookings[0]._doc));
      
      // Map the bookings to ensure consistent field names
      const enhancedBookings = bookings.map(booking => {
        const bookingObj = booking._doc || booking;
        return {
          ...bookingObj,
          // Add explicit mapping for fields that components expect
          id: bookingObj._id,
          customerName: bookingObj.contactName,
          customerEmail: bookingObj.contactEmail,
          customerPhone: bookingObj.contactPhone,
          eventTitle: bookingObj.eventType,
          amount: bookingObj.totalAmount
        };
      });
      
      return res.status(200).json({
        message: "Bookings fetched successfully",
        data: enhancedBookings
      });
    }
    
    res.status(200).json({
      message: "Bookings fetched successfully",
      data: bookings
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      message: "Error fetching bookings",
      error: error.message
    });
  }
};

// Get bookings for a specific user
const getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`Fetching bookings for user ID: ${userId}`);
    console.log(`Requesting user ID: ${req.user.userId}, role: ${req.user.role}`);
    
    // If authenticated user is trying to access another user's bookings without admin
    if (req.user.userId !== userId && req.user.role !== 'Admin') {
      console.log('Permission denied: User trying to access another user\'s bookings');
      return res.status(403).json({
        message: "You don't have permission to access these bookings"
      });
    }
    
    // Verify user exists
    const userExists = await userModel.exists({ _id: userId });
    if (!userExists) {
      console.log(`User not found with ID: ${userId}`);
      return res.status(404).json({
        message: "User not found"
      });
    }
    
    // Find bookings for user
    const bookings = await bookingModel.find({ userId }).sort({ bookingDate: -1 });
    console.log(`Found ${bookings.length} bookings for user ${userId}`);
    
    res.status(200).json({
      message: "User bookings fetched successfully",
      data: bookings
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      message: "Error fetching user bookings",
      error: error.message
    });
  }
};

// Get a specific booking by ID
const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await bookingModel.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }
    
    res.status(200).json({
      message: "Booking fetched successfully",
      data: booking
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      message: "Error fetching booking",
      error: error.message
    });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { bookingStatus } = req.body;
    
    // Validate status
    const validStatuses = ['Pending Confirmation', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(bookingStatus)) {
      return res.status(400).json({
        message: "Invalid booking status"
      });
    }
    
    // Update booking
    const updatedBooking = await bookingModel.findByIdAndUpdate(
      bookingId,
      { bookingStatus },
      { new: true }
    );
    
    if (!updatedBooking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }
    
    res.status(200).json({
      message: "Booking status updated successfully",
      data: updatedBooking
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      message: "Error updating booking status",
      error: error.message
    });
  }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { cancellationReason } = req.body;
    
    // Get the userId from the verified JWT token instead of the request body
    const userId = req.user.userId;
    
    console.log(`Cancel booking request: bookingId=${bookingId}, userId=${userId}`);
    
    // Find booking
    const booking = await bookingModel.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }
    
    console.log(`Found booking with userId=${booking.userId}, comparing with authenticated userId=${userId}`);
    
    // Check if user owns this booking - both should be strings for comparison
    // User can cancel if they own the booking or if they're an admin
    if (booking.userId.toString() !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({
        message: "You are not authorized to cancel this booking"
      });
    }
    
    // Check if booking can be cancelled
    if (booking.bookingStatus === 'Completed') {
      return res.status(400).json({
        message: "Completed bookings cannot be cancelled"
      });
    }
    
    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({
        message: "Booking is already cancelled"
      });
    }
    
    // Update booking status
    booking.bookingStatus = 'Cancelled';
    booking.cancellationReason = cancellationReason || 'Cancelled by user';
    await booking.save();
    
    res.status(200).json({
      message: "Booking cancelled successfully",
      data: booking
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      message: "Error cancelling booking",
      error: error.message
    });
  }
};

// New function to handle organizer approval
const approveBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { approved } = req.body;
    
    console.log(`Approving booking: ID=${bookingId}, Approved=${approved}, Body=`, req.body);
    
    // Get the booking
    const booking = await bookingModel.findById(bookingId);
    
    if (!booking) {
      console.log(`Booking not found: ID=${bookingId}`);
      return res.status(404).json({
        message: "Booking not found"
      });
    }
    
    console.log(`Found booking: ${bookingId}, Current status: ${booking.bookingStatus}`);
    
    // Update booking status based on approval
    if (approved) {
      booking.approvalStatus = 'Approved';
      booking.bookingStatus = 'Confirmed';
    } else {
      booking.approvalStatus = 'Rejected';
      booking.bookingStatus = 'Cancelled';
      booking.cancellationReason = req.body.reason || 'Rejected by organizer';
    }
    
    await booking.save();
    
    console.log(`Booking status updated: ${bookingId}, New status: ${booking.bookingStatus}`);
    
    res.status(200).json({
      message: `Booking ${approved ? 'approved' : 'rejected'} successfully`,
      data: booking
    });
  } catch (error) {
    console.error("Error approving/rejecting booking:", error);
    res.status(500).json({
      message: "Error processing approval",
      error: error.message
    });
  }
};

// Get pending bookings for an organizer
const getPendingBookings = async (req, res) => {
  try {
    // Get organizer ID from authenticated user
    const organizerId = req.user.userId;
    const userRole = req.user.role;
    
    console.log(`Finding pending bookings for user: ${organizerId} with role: ${userRole}`);
    
    // If not organizer or admin, deny access
    if (userRole !== 'Organizer' && userRole !== 'Admin') {
      return res.status(403).json({
        message: "Access denied. Only organizers can view pending bookings."
      });
    }
    
    // Find all events organized by this user
    const events = await eventModel.find({ 
      $or: [
        { organizer: organizerId },
        { userId: organizerId },
        { 'organizer.toString()': organizerId } // Handle cases where organizer might be stored as ObjectId
      ]
    });
    
    console.log(`Found ${events.length} events for organizer ${organizerId}`);
    
    if (events.length === 0) {
      // If no events found, return empty array
      console.log('No events found for this organizer');
      return res.status(200).json([]);
    }
    
    const eventIds = events.map(event => event._id);
    console.log('Event IDs for organizer:', eventIds);
    
    // Find pending bookings for these events with broader match criteria
    // Also handle the case where approvalStatus might be missing
    const pendingBookings = await bookingModel.find({
      $and: [
        { $or: [
            { eventId: { $in: eventIds } },
            { event: { $in: eventIds } }  // In case field name is 'event' not 'eventId'
          ]
        },
        { $or: [
            { approvalStatus: 'Pending' },
            { bookingStatus: 'Pending Approval' }
          ]
        }
      ]
    }).sort({ bookingDate: -1 });
    
    console.log(`Found ${pendingBookings.length} pending bookings`);
    
    // For debugging, log some details of the first few bookings
    if (pendingBookings.length > 0) {
      const sampleBooking = pendingBookings[0];
      console.log('Sample booking details:', {
        id: sampleBooking._id,
        eventId: sampleBooking.eventId,
        status: sampleBooking.bookingStatus,
        approvalStatus: sampleBooking.approvalStatus
      });
    }
    
    res.status(200).json(pendingBookings);
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    res.status(500).json({
      message: 'Error fetching pending bookings',
      error: error.message
    });
  }
};

// Get booking statistics
const getBookingStats = async (req, res) => {
  try {
    // Get organizer ID from authenticated user
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'Admin';
    const isOrganizer = req.user.role === 'Organizer';
    
    // Base query - adjust based on role
    let query = {};
    
    // If not admin, restrict to organizer's events
    if (!isAdmin && isOrganizer) {
      // Find all events organized by this user
      const events = await eventModel.find({ organizer: userId });
      const eventIds = events.map(event => event._id);
      
      // Only include bookings for these events
      query.eventId = { $in: eventIds };
    }
    
    // Count total bookings
    const totalBookings = await bookingModel.countDocuments(query);
    
    // Count bookings by status
    const confirmedBookings = await bookingModel.countDocuments({
      ...query,
      bookingStatus: 'Confirmed'
    });
    
    const pendingBookings = await bookingModel.countDocuments({
      ...query,
      bookingStatus: 'Pending Approval'
    });
    
    const cancelledBookings = await bookingModel.countDocuments({
      ...query,
      bookingStatus: 'Cancelled'
    });
    
    // Calculate total revenue (from confirmed bookings only)
    const revenueResult = await bookingModel.aggregate([
      { $match: { ...query, bookingStatus: 'Confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    // Get count of total events (if organizer)
    let totalEvents = 0;
    if (isOrganizer) {
      totalEvents = await eventModel.countDocuments({ organizer: userId });
    } else if (isAdmin) {
      totalEvents = await eventModel.countDocuments();
    }
    
    // Get month-over-month percentage changes (mock data for now)
    // In a real implementation, you would compare with previous month's data
    const bookingChange = 8; // 8% increase
    const revenueChange = 15; // 15% increase
    
    // Return stats
    res.status(200).json({
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue,
      totalEvents,
      bookingChange,
      revenueChange
    });
  } catch (error) {
    console.error('Error calculating booking statistics:', error);
    res.status(500).json({
      message: 'Error calculating booking statistics',
      error: error.message
    });
  }
};

// Get recent bookings
const getRecentBookings = async (req, res) => {
  try {
    // Get organizer ID from authenticated user
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'Admin';
    const isOrganizer = req.user.role === 'Organizer';
    
    // Get limit from query params or default to 5
    const limit = parseInt(req.query.limit) || 5;
    
    // Base query - adjust based on role
    let query = {};
    
    // If not admin, restrict to organizer's events
    if (!isAdmin && isOrganizer) {
      // Find all events organized by this user
      const events = await eventModel.find({ organizer: userId });
      const eventIds = events.map(event => event._id);
      
      // Only include bookings for these events
      query.eventId = { $in: eventIds };
    }
    
    // Find recent bookings
    const recentBookings = await bookingModel.find(query)
      .sort({ bookingDate: -1 })
      .limit(limit)
      .populate('userId', 'firstName lastName email'); // Populate user details
    
    // Format bookings for frontend
    const formattedBookings = recentBookings.map(booking => {
      return {
        id: booking._id,
        userName: booking.userId ? `${booking.userId.firstName || ''} ${booking.userId.lastName || ''}`.trim() : booking.contactName,
        userEmail: booking.userId ? booking.userId.email : booking.contactEmail,
        eventName: booking.eventType || booking.venueName,
        bookingDate: booking.bookingDate,
        eventDate: booking.eventDate,
        amount: booking.totalAmount,
        status: booking.bookingStatus
      };
    });
    
    res.status(200).json({
      data: formattedBookings
    });
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({
      message: 'Error fetching recent bookings',
      error: error.message
    });
  }
};

// Get all bookings for the current organizer
const getOrganizerBookings = async (req, res) => {
  try {
    // Get organizer ID from authenticated user
    const organizerId = req.user.userId;
    
    console.log(`Finding all bookings for organizer: ${organizerId}`);
    
    // Find all events organized by this user
    const events = await eventModel.find({ 
      $or: [
        { organizer: organizerId },
        { userId: organizerId },
        { 'organizer.toString()': organizerId } // Handle cases where organizer might be stored as ObjectId
      ]
    });
    
    console.log(`Found ${events.length} events for organizer ${organizerId}`);
    
    if (events.length === 0) {
      // If no events found, return empty array
      console.log('No events found for this organizer');
      return res.status(200).json([]);
    }
    
    const eventIds = events.map(event => event._id);
    
    // Find all bookings for these events (not just pending ones)
    const bookings = await bookingModel.find({
      $or: [
        { eventId: { $in: eventIds } },
        { event: { $in: eventIds } }  // In case field name is 'event' not 'eventId'
      ]
    }).sort({ bookingDate: -1 });
    
    console.log(`Found ${bookings.length} bookings for organizer ${organizerId}`);
    
    // Format bookings for frontend
    const formattedBookings = bookings.map(booking => {
      return {
        id: booking._id,
        customer: {
          name: booking.contactName || 'Unknown',
          email: booking.contactEmail || '',
          phone: booking.contactPhone || '',
          address: booking.location || ''
        },
        venueName: booking.venueName || '',
        eventType: booking.eventType || '',
        date: booking.eventDate || booking.bookingDate,
        price: booking.totalAmount || 0,
        status: booking.bookingStatus === 'Confirmed' ? 'confirmed' : 
                booking.bookingStatus === 'Cancelled' ? 'cancelled' : 'pending',
        bookingDetails: {
          bookingDate: booking.bookingDate,
          guestCount: booking.guestCount || 0,
          notes: booking.specialRequests || ''
        }
      };
    });
    
    res.status(200).json(formattedBookings);
  } catch (error) {
    console.error('Error fetching organizer bookings:', error);
    res.status(500).json({
      message: 'Error fetching organizer bookings',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  approveBooking,
  getPendingBookings,
  getBookingStats,
  getRecentBookings,
  getOrganizerBookings
}; 
const mongoose = require('mongoose');

// Import models
let User, Event, Booking;
try {
  User = require('../models/UserModel');
  Event = require('../models/Event');
  Booking = require('../models/BookingModel');
} catch (error) {
  console.error('Error loading models in AdminController:', error.message);
}

/**
 * Get admin dashboard statistics
 */
const getStats = async (req, res) => {
  try {
    // Check if models are loaded
    if (!User || !Event || !Booking) {
      console.log('Models not loaded properly, returning default stats');
      return res.status(200).json({
        totalUsers: 0,
        totalOrganizers: 0,
        totalEvents: 0,
        totalBookings: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        userGrowth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        revenueData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        bookingsByCategory: [0, 0, 0, 0, 0, 0],
        recentUsers: [],
        recentBookings: []
      });
    }

    let adminRole = null;
    let organizerRole = null;
    
    try {
      // Query non-admin users
      adminRole = await mongoose.model('roles').findOne({ name: 'Admin' });
      // Find organizer role
      organizerRole = await mongoose.model('roles').findOne({ name: 'Organizer' });
    } catch (error) {
      console.log('Role queries failed, may be missing role documents:', error.message);
    }
    
    const totalUsers = await User.countDocuments({ 
      roleId: { $ne: adminRole ? adminRole._id : null } 
    });
    
    const totalOrganizers = await User.countDocuments({ 
      roleId: organizerRole ? organizerRole._id : null 
    });
    
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    // Get total revenue (sum of all booking amounts)
    const revenueResult = await Booking.aggregate([
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$totalAmount' } 
        } 
      }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    // Get count of pending organizer approvals
    const pendingApprovals = await User.countDocuments({ 
      roleId: organizerRole ? organizerRole._id : null,
      status: 'Pending' 
    });

    // Get user growth data by month (last 12 months)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    const userGrowthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' }, 
            year: { $year: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Format user growth data for frontend
    const userGrowth = Array(12).fill(0);
    userGrowthData.forEach(item => {
      const monthIndex = item._id.month - 1; // MongoDB months are 1-based
      userGrowth[monthIndex] = item.count;
    });
    
    // Get revenue data by month (last 12 months)
    const revenueData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' }, 
            year: { $year: '$createdAt' } 
          },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Format revenue data for frontend
    const monthlyRevenue = Array(12).fill(0);
    revenueData.forEach(item => {
      const monthIndex = item._id.month - 1;
      monthlyRevenue[monthIndex] = item.totalRevenue;
    });
    
    // Get bookings by category
    const bookingsByCategoryData = await Booking.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 6
      }
    ]);
    
    // Format bookings by category for frontend
    const bookingsByCategory = bookingsByCategoryData.map(item => item.count);
    
    // Get recent users
    const recentUsers = await User.find()
      .select('firstName lastName email roleId status createdAt')
      .sort('-createdAt')
      .limit(5)
      .populate('roleId', 'name');
      
    // Get recent bookings
    const recentBookings = await Booking.find()
      .select('customerName eventName bookingDate totalAmount status')
      .sort('-createdAt')
      .limit(5)
      .populate('eventId', 'name');
    
    // Format recent users for frontend
    const formattedRecentUsers = recentUsers.map(user => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.roleId ? user.roleId.name : 'User',
      createdAt: user.createdAt ? user.createdAt.toISOString().split('T')[0] : 'N/A',
      status: user.status
    }));
    
    // Format recent bookings for frontend
    const formattedRecentBookings = recentBookings.map(booking => ({
      id: booking._id,
      customer: booking.customerName,
      eventName: booking.eventId ? booking.eventId.name : booking.eventName,
      date: booking.bookingDate ? booking.bookingDate.toISOString().split('T')[0] : 'N/A',
      amount: booking.totalAmount,
      status: booking.status
    }));

    res.status(200).json({
      totalUsers,
      totalOrganizers,
      totalEvents,
      totalBookings,
      totalRevenue,
      pendingApprovals,
      userGrowth,
      revenueData: monthlyRevenue,
      bookingsByCategory,
      recentUsers: formattedRecentUsers,
      recentBookings: formattedRecentBookings
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ 
      message: 'Error fetching admin dashboard statistics', 
      error: error.message 
    });
  }
};

/**
 * Get all organizers
 */
const getAllOrganizers = async (req, res) => {
  try {
    const organizerRole = await mongoose.model('roles').findOne({ name: 'Organizer' });
    const organizers = await User.find({ 
      roleId: organizerRole ? organizerRole._id : null
    })
      .select('-password')
      .sort('-createdAt');
    
    res.status(200).json(organizers);
  } catch (error) {
    console.error('Error getting all organizers:', error);
    res.status(500).json({ 
      message: 'Error fetching organizers', 
      error: error.message 
    });
  }
};

/**
 * Get pending organizer approval requests
 */
const getPendingOrganizers = async (req, res) => {
  try {
    const organizerRole = await mongoose.model('roles').findOne({ name: 'Organizer' });
    const pendingOrganizers = await User.find({ 
      roleId: organizerRole ? organizerRole._id : null,
      status: 'Pending' 
    })
    .select('-password')
    .sort('-createdAt');
    
    res.status(200).json(pendingOrganizers);
  } catch (error) {
    console.error('Error getting pending organizers:', error);
    res.status(500).json({ 
      message: 'Error fetching pending organizer approvals', 
      error: error.message 
    });
  }
};

/**
 * Approve or reject an organizer
 */
const approveOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { approved, reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({ message: 'Invalid organizer ID' });
    }
    
    const organizer = await User.findById(organizerId);
    
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }
    
    // Check if user has organizer role
    const organizerRole = await mongoose.model('roles').findOne({ name: 'Organizer' });
    if (!organizerRole || !organizer.roleId.equals(organizerRole._id)) {
      return res.status(400).json({ message: 'User is not an organizer' });
    }
    
    // Update organizer status
    organizer.status = approved ? 'Active' : 'Rejected';
    
    // If rejected, save the reason
    if (!approved && reason) {
      organizer.rejectionReason = reason;
    }
    
    await organizer.save();
    
    res.status(200).json({ 
      message: `Organizer ${approved ? 'approved' : 'rejected'} successfully` 
    });
  } catch (error) {
    console.error('Error approving/rejecting organizer:', error);
    res.status(500).json({ 
      message: 'Error updating organizer approval status', 
      error: error.message 
    });
  }
};

/**
 * Update user status (activate/deactivate)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user status
    user.status = isActive ? 'Active' : 'Inactive';
    
    // Add reason to user record if provided
    if (reason) {
      user.statusReason = reason;
    }
    
    await user.save();
    
    res.status(200).json({ 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ 
      message: 'Error updating user status', 
      error: error.message 
    });
  }
};

/**
 * Get all events with admin access
 */
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate({
        path: 'userId',
        select: 'firstName lastName email -_id'
      })
      .sort('-createdAt');
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting all events:', error);
    res.status(500).json({ 
      message: 'Error fetching events', 
      error: error.message 
    });
  }
};

/**
 * Update event status
 */
const updateEventStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Update event status
    event.status = status;
    await event.save();
    
    res.status(200).json({ 
      message: 'Event status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({ 
      message: 'Error updating event status', 
      error: error.message 
    });
  }
};

/**
 * Get revenue analytics
 */
const getRevenueAnalytics = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    const currentDate = new Date();
    let startDate;
    
    // Calculate start date based on timeframe
    if (timeframe === 'week') {
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate = new Date(currentDate);
      startDate.setMonth(currentDate.getMonth() - 12);
    } else if (timeframe === 'quarter') {
      startDate = new Date(currentDate);
      startDate.setMonth(currentDate.getMonth() - 3);
    } else if (timeframe === 'year') {
      startDate = new Date(currentDate);
      startDate.setFullYear(currentDate.getFullYear() - 1);
    } else {
      startDate = new Date(currentDate);
      startDate.setMonth(currentDate.getMonth() - 12); // Default to month
    }
    
    // Get revenue data grouped by month
    const revenueData = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' }, 
            year: { $year: '$createdAt' } 
          },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Convert to format expected by frontend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = months;
    
    // Initialize data with zeros
    const data = Array(12).fill(0);
    
    // Fill in data from aggregation result
    revenueData.forEach(item => {
      const monthIndex = item._id.month - 1; // MongoDB months are 1-based
      data[monthIndex] = item.totalRevenue;
    });
    
    res.status(200).json({
      labels,
      data
    });
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    res.status(500).json({ 
      message: 'Error fetching revenue analytics', 
      error: error.message 
    });
  }
};

/**
 * Get user growth analytics
 */
const getUserGrowthAnalytics = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    const currentDate = new Date();
    let startDate;
    
    // Calculate start date based on timeframe
    if (timeframe === 'week') {
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate = new Date(currentDate);
      startDate.setMonth(currentDate.getMonth() - 12);
    } else if (timeframe === 'quarter') {
      startDate = new Date(currentDate);
      startDate.setMonth(currentDate.getMonth() - 3);
    } else if (timeframe === 'year') {
      startDate = new Date(currentDate);
      startDate.setFullYear(currentDate.getFullYear() - 1);
    } else {
      startDate = new Date(currentDate);
      startDate.setMonth(currentDate.getMonth() - 12); // Default to month
    }
    
    // Get user growth data grouped by month
    const userData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: '$createdAt' }, 
            year: { $year: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Convert to format expected by frontend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = months;
    
    // Initialize data with zeros
    const data = Array(12).fill(0);
    
    // Fill in data from aggregation result
    userData.forEach(item => {
      const monthIndex = item._id.month - 1; // MongoDB months are 1-based
      data[monthIndex] = item.count;
    });
    
    res.status(200).json({
      labels,
      data
    });
  } catch (error) {
    console.error('Error getting user growth analytics:', error);
    res.status(500).json({ 
      message: 'Error fetching user growth analytics', 
      error: error.message 
    });
  }
};

/**
 * Get bookings by category
 */
const getBookingsByCategory = async (req, res) => {
  try {
    // Get bookings grouped by event type/category
    const bookingsData = await Booking.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 6
      }
    ]);
    
    // Convert to format expected by frontend
    const labels = bookingsData.map(item => item._id || 'Other');
    const data = bookingsData.map(item => item.count);
    
    res.status(200).json({
      labels,
      data
    });
  } catch (error) {
    console.error('Error getting bookings by category:', error);
    res.status(500).json({ 
      message: 'Error fetching bookings by category', 
      error: error.message 
    });
  }
};

/**
 * Get all non-admin users
 */
const getAllUsers = async (req, res) => {
  try {
    // Find admin role to exclude these users
    const adminRole = await mongoose.model('roles').findOne({ name: 'Admin' });
    
    // Query to exclude admin users
    const query = adminRole ? { roleId: { $ne: adminRole._id } } : {};
    
    // Get all non-admin users
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .populate('roleId', 'name');
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message 
    });
  }
};

module.exports = {
  getStats,
  getAllOrganizers,
  getPendingOrganizers,
  approveOrganizer,
  updateUserStatus,
  getAllEvents,
  updateEventStatus,
  getRevenueAnalytics,
  getUserGrowthAnalytics,
  getBookingsByCategory,
  getAllUsers
}; 
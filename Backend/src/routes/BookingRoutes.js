const routes = require("express").Router();
const bookingController = require("../controllers/BookingController");
const authMiddleware = require("../utils/AuthMiddleware");
const express = require("express");

// Public routes - none

// Protected routes
// Create booking - any authenticated user
routes.post("/create", authMiddleware.verifyToken, bookingController.createBooking);

// Stats and special routes - MUST come before /:bookingId to avoid conflict
routes.get("/stats", authMiddleware.verifyToken, bookingController.getBookingStats);
routes.get("/recent", authMiddleware.verifyToken, bookingController.getRecentBookings);

// Get all bookings for the current organizer
routes.get("/organizer", authMiddleware.verifyToken, bookingController.getOrganizerBookings);

// Admin routes
routes.get("/all", authMiddleware.verifyToken, authMiddleware.isAdmin, bookingController.getAllBookings);

// Get pending bookings - for organizers and admins
routes.get("/pending", authMiddleware.verifyToken, bookingController.getPendingBookings);

// Booking specific routes - accessible by owner or admin
routes.get("/:bookingId", authMiddleware.verifyToken, bookingController.getBookingById);

// Admin or organizer routes
routes.put("/:bookingId/status", authMiddleware.verifyToken, authMiddleware.isOrganizer, bookingController.updateBookingStatus);

// User can cancel their own booking
routes.put("/:bookingId/cancel", authMiddleware.verifyToken, bookingController.cancelBooking);

// New route for handling approval requests
routes.put("/approve/:bookingId", bookingController.approveBooking);

module.exports = routes; 
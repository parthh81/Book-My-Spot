//router
const routes = require("express").Router()
//controller --> userController
const userController = require("../controllers/UserController")
const bookingController = require("../controllers/BookingController")
const authMiddleware = require("../utils/AuthMiddleware")

// Public routes (no authentication required)
routes.post("/user/login", userController.loginUser)
routes.post("/user/forgotpassword", userController.forgotPassword)
routes.post("/user/resetpassword", userController.resetpassword)
routes.post("/users", userController.signup)

// Password update route (requires authentication)
routes.post("/user/updatepassword", authMiddleware.verifyToken, userController.updatePassword)
routes.post("/user/change-password", authMiddleware.verifyToken, userController.updatePassword)

// Add this route after the login route
routes.get("/user/me", authMiddleware.verifyToken, userController.getUserInfo);

// Protected routes (authentication required)
// Admin only routes
routes.get("/users", authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getAllUsers)

// User specific routes (owner or admin)
routes.get("/user/:id", authMiddleware.verifyToken, authMiddleware.isResourceOwnerOrAdmin, userController.getUserById)
routes.put("/user/:id", authMiddleware.verifyToken, authMiddleware.isResourceOwnerOrAdmin, userController.updateUserById)
routes.delete("/user/:id", authMiddleware.verifyToken, authMiddleware.isAdmin, userController.deleteUserById)

// User bookings route
routes.get("/user/:userId/bookings", authMiddleware.verifyToken, authMiddleware.isResourceOwnerOrAdmin, bookingController.getUserBookings)

//post
//routes.post("/users",userController.addUser)

//delete
//get

module.exports = routes

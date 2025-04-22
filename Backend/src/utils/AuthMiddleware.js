const jwt = require('jsonwebtoken');
const secret = "secret"; // Keep the same secret as in UserController

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('No authorization header found in request');
      return res.status(401).json({
        message: "No token provided"
      });
    }
    
    // Extract token - format "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('Invalid authorization header format:', authHeader);
      return res.status(401).json({
        message: "Invalid token format"
      });
    }
    
    const token = parts[1];
    
    if (!token) {
      console.log('Empty token in authorization header');
      return res.status(401).json({
        message: "Invalid token format"
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, secret);
    
    // Add extra validation to make sure userId exists
    if (!decoded.userId) {
      console.log('Missing userId in decoded token:', decoded);
      return res.status(401).json({
        message: "Invalid token - missing user ID"
      });
    }
    
    console.log(`Authenticated user: ID=${decoded.userId}, Role=${decoded.role}`);
    
    // Attach user info to request object
    req.user = decoded;
    
    // Continue to the next middleware/controller
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Token expired"
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: "Invalid token - " + error.message 
      });
    }
    
    return res.status(401).json({
      message: "Authentication failed: " + error.message
    });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. Admin privileges required."
    });
  }
};

// Middleware to check if user is organizer
const isOrganizer = (req, res, next) => {
  if (req.user && (req.user.role === 'Organizer' || req.user.role === 'Admin')) {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. Organizer privileges required."
    });
  }
};

// Middleware to check if user owns the resource or is admin
const isResourceOwnerOrAdmin = (req, res, next) => {
  const resourceUserId = req.params.userId || req.params.id;
  
  if (!resourceUserId) {
    return next();
  }
  
  if (
    req.user && 
    (req.user.userId === resourceUserId || req.user.role === 'Admin')
  ) {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. You don't have permission to access this resource."
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isOrganizer,
  isResourceOwnerOrAdmin
}; 
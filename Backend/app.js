const express = require("express") //express....
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
//express object..
const app = express()
app.use(cors())
// Increase JSON body parser limit to 50mb
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

//import role routes
const roleRoutes = require("./src/routes/RoleRoutes")
app.use(roleRoutes)

const userRoutes = require("./src/routes/UserRoutes")
app.use(userRoutes)

const stateRoutes = require("./src/routes/StateRoutes")
app.use("/state",stateRoutes)

const cityRoutes = require("./src/routes/CityRoutes")
app.use("/city",cityRoutes)

const areaRoutes = require("./src/routes/AreaRoutes")
app.use("/area",areaRoutes)

const eventRoutes = require("./src/routes/EventRoutes")
// Register event routes at both paths for backward compatibility
app.use("/event", eventRoutes)
app.use("/api/events", eventRoutes)

const bookingRoutes = require("./src/routes/BookingRoutes")
app.use("/booking", bookingRoutes)
app.use("/api/bookings", bookingRoutes) // Add API path

// Admin routes for admin dashboard and management
try {
  const adminRoutes = require("./src/routes/adminRoutes")
  app.use("/admin", adminRoutes)
  app.use("/api/admin", adminRoutes) // New API path
  console.log("Admin routes loaded successfully")
} catch (error) {
  console.log("Admin routes not found or error loading:", error.message)
}

// New routes for better frontend integration
// Ensure all routes are available at /api endpoints
try {
  const venueRoutes = require("./src/routes/VenueRoutes")
  app.use("/venue", venueRoutes) // Original path
  app.use("/api/venues", venueRoutes) // New API path
} catch (error) {
  console.log("Venue routes not found in expected location, skipping...")
}

try {
  const eventCategoryRoutes = require("./src/routes/eventCategoryRoutes")
  app.use("/category", eventCategoryRoutes) // Original path
  app.use("/api/categories", eventCategoryRoutes) // New API path
} catch (error) {
  console.log("Event category routes not found in expected location, skipping...")
}

// Add config routes for frontend integration
try {
  const configRoutes = require("./src/routes/configRoutes");
  app.use("/api/config", configRoutes);
  console.log("Config routes loaded successfully");
} catch (error) {
  console.log("Config routes not found or error loading:", error.message);
}

// Add a health check endpoint
app.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API server is running' });
});

mongoose.connect("mongodb://127.0.0.1:27017/Node")
    .then(() => {
        console.log("Database connected successfully...")
    })
    .catch(err => {
        console.error("Failed to connect to MongoDB:", err.message);
    });

//server creation...
const PORT = 3200
app.listen(PORT,()=>{
    console.log("server started on port number ",PORT)
})

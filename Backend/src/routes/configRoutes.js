const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../utils/AuthMiddleware');

// Path to store configuration
const configFilePath = path.join(__dirname, '../../config.json');

// Initialize config file if it doesn't exist
const initConfigFile = () => {
  if (!fs.existsSync(configFilePath)) {
    fs.writeFileSync(configFilePath, JSON.stringify({
      initializeSampleData: true
    }, null, 2));
  }
};

// Load configuration
const loadConfig = () => {
  initConfigFile();
  const configData = fs.readFileSync(configFilePath, 'utf8');
  return JSON.parse(configData);
};

// Save configuration
const saveConfig = (config) => {
  fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
};

// GET config
router.get('/', (req, res) => {
  try {
    const config = loadConfig();
    res.status(200).json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ message: 'Failed to fetch configuration' });
  }
});

// Simple route to check if sample data initialization is enabled
router.get('/sampleDataStatus', (req, res) => {
  try {
    const config = loadConfig();
    res.status(200).json({ 
      enabled: config.initializeSampleData !== false,
      message: `Sample data initialization is ${config.initializeSampleData !== false ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    console.error('Error checking sample data status:', error);
    res.status(500).json({ message: 'Failed to check sample data status' });
  }
});

// Update sample data initialization setting
router.post('/toggleSampleData', authMiddleware.verifyToken, authMiddleware.isOrganizer, (req, res) => {
  try {
    const config = loadConfig();
    config.initializeSampleData = req.body.enable;
    saveConfig(config);
    
    res.status(200).json({ 
      message: `Sample data initialization ${req.body.enable ? 'enabled' : 'disabled'}`,
      config
    });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ message: 'Failed to update configuration' });
  }
});

// Create config file directly - no auth to ensure it works even without token
router.post('/create-file', (req, res) => {
  try {
    const config = {
      initializeSampleData: req.body.initializeSampleData === true
    };
    
    // Save to config file
    saveConfig(config);
    
    res.status(200).json({ 
      message: `Config file created/updated. Sample data initialization ${req.body.initializeSampleData ? 'enabled' : 'disabled'}`,
      config
    });
  } catch (error) {
    console.error('Error creating config file:', error);
    res.status(500).json({ message: 'Failed to create config file' });
  }
});

module.exports = router;

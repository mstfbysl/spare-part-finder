const fs = require('fs');
const path = require('path');
const { simulateDelay, isValidVIN } = require('../utils/matchUtils');

// Load mock data
const mockVehicles = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/mockVehicles.json'), 'utf8'));

/**
 * Get vehicle details by VIN
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getVehicleByVIN(req, res) {
  try {
    // Simulate API delay
    await simulateDelay(200, 800);
    
    const { vin } = req.params;
    
    // Validate VIN format
    if (!isValidVIN(vin)) {
      return res.status(400).json({
        error: 'Invalid VIN format',
        message: 'VIN must be 17 characters long and contain only valid characters'
      });
    }
    
    // Find vehicle in mock data
    const vehicle = mockVehicles.find(v => v.vin === vin);
    
    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehicle not found',
        message: `No vehicle found with VIN: ${vin}`,
        suggestion: 'Please check the VIN and try again'
      });
    }
    
    // Return vehicle data
    res.json({
      success: true,
      data: vehicle,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getVehicleByVIN:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve vehicle information'
    });
  }
}

/**
 * Get all available vehicles (for testing purposes)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllVehicles(req, res) {
  try {
    await simulateDelay(100, 300);
    
    res.json({
      success: true,
      data: mockVehicles,
      count: mockVehicles.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getAllVehicles:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve vehicles list'
    });
  }
}

/**
 * Search vehicles by make, model, or year
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function searchVehicles(req, res) {
  try {
    await simulateDelay(150, 400);
    
    const { make, model, year } = req.query;
    
    let filteredVehicles = [...mockVehicles];
    
    // Filter by make
    if (make) {
      filteredVehicles = filteredVehicles.filter(v => 
        v.make.toLowerCase().includes(make.toLowerCase())
      );
    }
    
    // Filter by model
    if (model) {
      filteredVehicles = filteredVehicles.filter(v => 
        v.model.toLowerCase().includes(model.toLowerCase())
      );
    }
    
    // Filter by year
    if (year) {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        filteredVehicles = filteredVehicles.filter(v => v.year === yearNum);
      }
    }
    
    res.json({
      success: true,
      data: filteredVehicles,
      count: filteredVehicles.length,
      filters: { make, model, year },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in searchVehicles:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search vehicles'
    });
  }
}

module.exports = {
  getVehicleByVIN,
  getAllVehicles,
  searchVehicles
};

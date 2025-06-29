const fs = require('fs');
const path = require('path');
const { simulateDelay, isValidVIN, interpretPartFromText } = require('../utils/matchUtils');

// Load mock data
const mockParts = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/mockParts.json'), 'utf8'));
const mockVehicles = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/mockVehicles.json'), 'utf8'));

/**
 * Get part suggestions by VIN and category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getPartsByCategory(req, res) {
  try {
    await simulateDelay(150, 600);
    
    const { vin, category } = req.params;
    
    // Validate VIN
    if (!isValidVIN(vin)) {
      return res.status(400).json({
        error: 'Invalid VIN format',
        message: 'VIN must be 17 characters long and contain only valid characters'
      });
    }
    
    // Check if vehicle exists
    const vehicle = mockVehicles.find(v => v.vin === vin);
    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehicle not found',
        message: `No vehicle found with VIN: ${vin}`
      });
    }
    
    // Check if category exists for this vehicle
    if (!vehicle.categories.includes(category)) {
      return res.status(404).json({
        error: 'Category not available',
        message: `Category '${category}' is not available for this vehicle`,
        availableCategories: vehicle.categories
      });
    }
    
    // Get parts for the category
    const categoryParts = mockParts[category];
    if (!categoryParts) {
      return res.status(404).json({
        error: 'Category not found',
        message: `No parts found for category: ${category}`,
        availableCategories: Object.keys(mockParts)
      });
    }
    
    // Return parts with vehicle context
    res.json({
      success: true,
      data: {
        vehicle: {
          vin: vehicle.vin,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year
        },
        category: category,
        parts: categoryParts,
        count: categoryParts.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getPartsByCategory:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve parts'
    });
  }
}

/**
 * Interpret part suggestion from free text description
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function interpretPartFromDescription(req, res) {
  try {
    await simulateDelay(300, 1000); // Longer delay to simulate AI processing
    
    const { vin, description } = req.body;
    
    // Validate input
    if (!vin || !description) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Both VIN and description are required'
      });
    }
    
    if (!isValidVIN(vin)) {
      return res.status(400).json({
        error: 'Invalid VIN format',
        message: 'VIN must be 17 characters long and contain only valid characters'
      });
    }
    
    if (description.trim().length < 5) {
      return res.status(400).json({
        error: 'Description too short',
        message: 'Please provide a more detailed description (at least 5 characters)'
      });
    }
    
    // Check if vehicle exists
    const vehicle = mockVehicles.find(v => v.vin === vin);
    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehicle not found',
        message: `No vehicle found with VIN: ${vin}`
      });
    }
    
    // Interpret the description
    const suggestedPart = interpretPartFromText(description, vin);
    
    // Add some context about the analysis
    const analysisDetails = {
      originalDescription: description,
      processedText: description.toLowerCase(),
      detectedKeywords: suggestedPart.matchedKeywords || 0,
      category: suggestedPart.category || 'unknown',
      confidenceLevel: getConfidenceLevel(suggestedPart.confidence)
    };
    
    res.json({
      success: true,
      data: {
        vehicle: {
          vin: vehicle.vin,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year
        },
        suggestedPart: {
          name: suggestedPart.name,
          id: suggestedPart.id,
          confidence: Math.round(suggestedPart.confidence * 100) / 100
        },
        analysis: analysisDetails,
        recommendations: generateRecommendations(suggestedPart)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in interpretPartFromDescription:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to interpret part description'
    });
  }
}

/**
 * Get all available categories for a vehicle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getVehicleCategories(req, res) {
  try {
    await simulateDelay(100, 300);
    
    const { vin } = req.params;
    
    if (!isValidVIN(vin)) {
      return res.status(400).json({
        error: 'Invalid VIN format',
        message: 'VIN must be 17 characters long and contain only valid characters'
      });
    }
    
    const vehicle = mockVehicles.find(v => v.vin === vin);
    if (!vehicle) {
      return res.status(404).json({
        error: 'Vehicle not found',
        message: `No vehicle found with VIN: ${vin}`
      });
    }
    
    // Get part counts for each category
    const categoriesWithCounts = vehicle.categories.map(category => ({
      name: category,
      partCount: mockParts[category] ? mockParts[category].length : 0,
      available: mockParts[category] ? true : false
    }));
    
    res.json({
      success: true,
      data: {
        vehicle: {
          vin: vehicle.vin,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year
        },
        categories: categoriesWithCounts,
        totalCategories: categoriesWithCounts.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getVehicleCategories:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve vehicle categories'
    });
  }
}

/**
 * Search parts across all categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function searchParts(req, res) {
  try {
    await simulateDelay(200, 500);
    
    const { query, category } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid search query',
        message: 'Search query must be at least 2 characters long'
      });
    }
    
    const searchTerm = query.toLowerCase().trim();
    const results = [];
    
    // Search in specific category or all categories
    const categoriesToSearch = category ? [category] : Object.keys(mockParts);
    
    categoriesToSearch.forEach(cat => {
      if (mockParts[cat]) {
        const matchingParts = mockParts[cat].filter(part =>
          part.name.toLowerCase().includes(searchTerm) ||
          part.id.toLowerCase().includes(searchTerm)
        );
        
        matchingParts.forEach(part => {
          results.push({
            ...part,
            category: cat
          });
        });
      }
    });
    
    res.json({
      success: true,
      data: {
        query: query,
        category: category || 'all',
        results: results,
        count: results.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in searchParts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search parts'
    });
  }
}

/**
 * Helper function to get confidence level description
 * @param {number} confidence - Confidence score (0-1)
 * @returns {string} - Confidence level description
 */
function getConfidenceLevel(confidence) {
  if (confidence >= 0.8) return 'Yüksek';
  if (confidence >= 0.6) return 'Orta';
  if (confidence >= 0.4) return 'Düşük';
  return 'Çok Düşük';
}

/**
 * Generate recommendations based on suggested part
 * @param {Object} suggestedPart - The suggested part object
 * @returns {Array} - Array of recommendations
 */
function generateRecommendations(suggestedPart) {
  const recommendations = [];
  
  if (suggestedPart.confidence > 0.7) {
    recommendations.push('Bu parça tahmini yüksek güvenilirlik seviyesinde');
  }
  
  if (suggestedPart.category === 'fren') {
    recommendations.push('Fren parçaları güvenlik açısından kritiktir, profesyonel montaj önerilir');
  }
  
  if (suggestedPart.category === 'motor') {
    recommendations.push('Motor parçaları için orijinal parça kullanımı önerilir');
  }
  
  if (suggestedPart.confidence < 0.5) {
    recommendations.push('Daha detaylı açıklama ile daha kesin sonuç alabilirsiniz');
    recommendations.push('Bir uzmanla görüşmeniz önerilir');
  }
  
  return recommendations;
}

module.exports = {
  getPartsByCategory,
  interpretPartFromDescription,
  getVehicleCategories,
  searchParts
};

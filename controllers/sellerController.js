const fs = require('fs');
const path = require('path');
const { simulateDelay, generateSellersForPart, generateRequestId } = require('../utils/matchUtils');

// Load mock data
const mockSellers = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/mockSellers.json'), 'utf8'));

// In-memory storage for pending requests (in production, use a database)
const pendingRequests = new Map();

/**
 * Get sellers for a specific part ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getSellersForPart(req, res) {
  try {
    await simulateDelay(200, 700);
    
    const { partId } = req.params;
    
    if (!partId) {
      return res.status(400).json({
        error: 'Missing part ID',
        message: 'Part ID is required'
      });
    }
    
    // Check if we have predefined sellers for this part
    let sellers = mockSellers[partId];
    
    // If no predefined sellers, generate some using global sellers
    if (!sellers && mockSellers.global_sellers) {
      sellers = generateSellersForPart(partId, mockSellers.global_sellers);
    }
    
    if (!sellers || sellers.length === 0) {
      return res.status(404).json({
        error: 'No sellers found',
        message: `No sellers available for part ID: ${partId}`,
        suggestion: 'Try creating a request for this part'
      });
    }
    
    // Add some additional metadata
    const sellersWithMetadata = sellers.map(seller => ({
      ...seller,
      deliveryTime: generateDeliveryTime(),
      warranty: generateWarranty(partId),
      paymentMethods: ['Nakit', 'Kredi Kartı', 'Havale'],
      lastUpdated: new Date().toISOString()
    }));
    
    // Sort by price by default
    sellersWithMetadata.sort((a, b) => a.price - b.price);
    
    res.json({
      success: true,
      data: {
        partId: partId,
        sellers: sellersWithMetadata,
        count: sellersWithMetadata.length,
        priceRange: {
          min: Math.min(...sellersWithMetadata.map(s => s.price)),
          max: Math.max(...sellersWithMetadata.map(s => s.price)),
          average: Math.round(sellersWithMetadata.reduce((sum, s) => sum + s.price, 0) / sellersWithMetadata.length)
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getSellersForPart:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve sellers'
    });
  }
}

/**
 * Create a pending request for a part
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createPartRequest(req, res) {
  try {
    await simulateDelay(300, 800);
    
    const { vin, partId, userEmail, description, urgency } = req.body;
    
    // Validate required fields
    if (!vin || !partId || !userEmail) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'VIN, partId, and userEmail are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }
    
    // Generate unique request ID
    const requestId = generateRequestId();
    
    // Create request object
    const request = {
      requestId,
      vin,
      partId,
      userEmail,
      description: description || '',
      urgency: urgency || 'normal',
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedResponse: getEstimatedResponseTime(urgency),
      contactAttempts: 0
    };
    
    // Store request (in production, save to database)
    pendingRequests.set(requestId, request);
    
    // Simulate notifying sellers (in production, send actual notifications)
    const notificationResult = await simulateSellerNotification(request);
    
    res.status(201).json({
      success: true,
      data: {
        requestId,
        status: 'pending',
        estimatedResponse: request.estimatedResponse,
        message: 'Talebiniz başarıyla oluşturuldu. Satıcılar en kısa sürede sizinle iletişime geçecek.',
        notificationsSent: notificationResult.count
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in createPartRequest:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create part request'
    });
  }
}

/**
 * Get request status by request ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getRequestStatus(req, res) {
  try {
    await simulateDelay(100, 300);
    
    const { requestId } = req.params;
    
    const request = pendingRequests.get(requestId);
    
    if (!request) {
      return res.status(404).json({
        error: 'Request not found',
        message: `No request found with ID: ${requestId}`
      });
    }
    
    // Simulate status updates over time
    const now = new Date();
    const createdAt = new Date(request.createdAt);
    const minutesElapsed = (now - createdAt) / (1000 * 60);
    
    // Update status based on time elapsed
    if (minutesElapsed > 30 && request.status === 'pending') {
      request.status = 'in_progress';
      request.contactAttempts = Math.floor(Math.random() * 3) + 1;
    } else if (minutesElapsed > 60 && request.status === 'in_progress') {
      request.status = 'offers_received';
      request.offerCount = Math.floor(Math.random() * 5) + 1;
    }
    
    res.json({
      success: true,
      data: request,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getRequestStatus:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve request status'
    });
  }
}

/**
 * Get all sellers (for admin/testing purposes)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllSellers(req, res) {
  try {
    await simulateDelay(150, 400);
    
    const { location, specialty, minRating } = req.query;
    
    let sellers = [...mockSellers.global_sellers];
    
    // Filter by location
    if (location) {
      sellers = sellers.filter(seller => 
        seller.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Filter by specialty
    if (specialty) {
      sellers = sellers.filter(seller => 
        seller.specialties.some(spec => 
          spec.toLowerCase().includes(specialty.toLowerCase())
        )
      );
    }
    
    // Filter by minimum rating
    if (minRating) {
      const minRatingNum = parseFloat(minRating);
      if (!isNaN(minRatingNum)) {
        sellers = sellers.filter(seller => seller.rating >= minRatingNum);
      }
    }
    
    // Sort by rating (descending)
    sellers.sort((a, b) => b.rating - a.rating);
    
    res.json({
      success: true,
      data: {
        sellers,
        count: sellers.length,
        filters: { location, specialty, minRating }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in getAllSellers:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve sellers'
    });
  }
}

/**
 * Helper function to generate delivery time
 * @returns {string} - Delivery time estimate
 */
function generateDeliveryTime() {
  const options = ['1-2 gün', '2-3 gün', '3-5 gün', '1 hafta', 'Aynı gün'];
  const weights = [0.3, 0.3, 0.25, 0.1, 0.05]; // Probability weights
  
  const random = Math.random();
  let cumulative = 0;
  
  for (let i = 0; i < options.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return options[i];
    }
  }
  
  return options[0];
}

/**
 * Helper function to generate warranty information
 * @param {string} partId - Part ID to determine warranty
 * @returns {string} - Warranty information
 */
function generateWarranty(partId) {
  if (partId.includes('motor')) return '2 yıl garanti';
  if (partId.includes('fren')) return '1 yıl garanti';
  if (partId.includes('elektrik')) return '6 ay garanti';
  if (partId.includes('suspansiyon')) return '1 yıl garanti';
  if (partId.includes('klima')) return '1 yıl garanti';
  if (partId.includes('govde')) return '6 ay garanti';
  return '3 ay garanti';
}

/**
 * Helper function to get estimated response time
 * @param {string} urgency - Urgency level
 * @returns {string} - Estimated response time
 */
function getEstimatedResponseTime(urgency) {
  switch (urgency) {
    case 'urgent': return '2-4 saat';
    case 'high': return '4-8 saat';
    case 'normal': return '8-24 saat';
    case 'low': return '1-3 gün';
    default: return '8-24 saat';
  }
}

/**
 * Simulate seller notification process
 * @param {Object} request - Request object
 * @returns {Object} - Notification result
 */
async function simulateSellerNotification(request) {
  // Simulate delay for notification processing
  await simulateDelay(100, 300);
  
  // Simulate number of sellers notified
  const notificationCount = Math.floor(Math.random() * 8) + 3;
  
  return {
    count: notificationCount,
    success: true,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getSellersForPart,
  createPartRequest,
  getRequestStatus,
  getAllSellers
};

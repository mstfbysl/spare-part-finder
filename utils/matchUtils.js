// Utility functions for matching parts and interpreting text

/**
 * Analyzes Turkish text for automotive symptoms and maps to likely parts
 * @param {string} description - User's description of the problem
 * @param {string} vin - Vehicle VIN for context
 * @returns {Object} - Suggested part with confidence score
 */
function interpretPartFromText(description, vin) {
  const text = description.toLowerCase();
  
  // Define keyword mappings for different part categories
  const partMappings = {
    // Brake-related keywords
    fren: {
      keywords: ['fren', 'balata', 'disk', 'durmuyor', 'tutmuyor', 'gıcırdıyor', 'ses', 'titreşim', 'pedal'],
      parts: [
        { name: 'Fren Balatası Ön', id: 'part-fren-001', confidence: 0.9 },
        { name: 'Fren Balatası Arka', id: 'part-fren-002', confidence: 0.85 },
        { name: 'Fren Diski Ön', id: 'part-fren-003', confidence: 0.8 },
        { name: 'ABS Sensörü', id: 'part-fren-010', confidence: 0.7 }
      ]
    },
    
    // Engine-related keywords
    motor: {
      keywords: ['motor', 'çalışmıyor', 'titreşim', 'ses', 'duman', 'yağ', 'soğutma', 'ısınma', 'güç', 'performans'],
      parts: [
        { name: 'Motor Yağı', id: 'part-motor-037', confidence: 0.8 },
        { name: 'Hava Filtresi', id: 'part-motor-016', confidence: 0.75 },
        { name: 'Buji', id: 'part-motor-020', confidence: 0.7 },
        { name: 'Yağ Filtresi', id: 'part-motor-017', confidence: 0.7 }
      ]
    },
    
    // Electrical keywords
    elektrik: {
      keywords: ['elektrik', 'akü', 'şarj', 'çalışmıyor', 'ışık', 'far', 'sinyal', 'klakson', 'cam'],
      parts: [
        { name: 'Akü', id: 'part-elektrik-001', confidence: 0.9 },
        { name: 'Alternatör', id: 'part-elektrik-002', confidence: 0.8 },
        { name: 'Far Ampulü', id: 'part-elektrik-010', confidence: 0.7 },
        { name: 'Sigorta Kutusu', id: 'part-elektrik-006', confidence: 0.6 }
      ]
    },
    
    // Suspension keywords
    suspansiyon: {
      keywords: ['amortisör', 'yay', 'salıncak', 'direksiyon', 'titreşim', 'sarsıntı', 'ses', 'çukur'],
      parts: [
        { name: 'Amortisör Ön Sol', id: 'part-suspansiyon-001', confidence: 0.85 },
        { name: 'Amortisör Ön Sağ', id: 'part-suspansiyon-002', confidence: 0.85 },
        { name: 'Stabilizatör Çubuğu', id: 'part-suspansiyon-023', confidence: 0.7 },
        { name: 'Rotil', id: 'part-suspansiyon-013', confidence: 0.65 }
      ]
    },
    
    // Climate control keywords
    klima: {
      keywords: ['klima', 'soğutmuyor', 'ısıtmıyor', 'hava', 'fan', 'filtre', 'gaz', 'kompresör'],
      parts: [
        { name: 'Klima Filtresi', id: 'part-klima-004', confidence: 0.8 },
        { name: 'Klima Kompresörü', id: 'part-klima-001', confidence: 0.75 },
        { name: 'Klima Gazı R134a', id: 'part-klima-005', confidence: 0.7 },
        { name: 'Kabin Filtresi', id: 'part-klima-022', confidence: 0.65 }
      ]
    }
  };
  
  let bestMatch = null;
  let highestConfidence = 0;
  
  // Analyze text for each category
  for (const [category, mapping] of Object.entries(partMappings)) {
    let categoryScore = 0;
    let keywordMatches = 0;
    
    // Count keyword matches
    mapping.keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        keywordMatches++;
        categoryScore += 1;
      }
    });
    
    // If we have matches in this category
    if (keywordMatches > 0) {
      // Calculate confidence based on keyword density
      const confidence = Math.min(0.95, (keywordMatches / mapping.keywords.length) * 0.8 + 0.2);
      
      // Get the best part from this category
      const bestPart = mapping.parts[0];
      const adjustedConfidence = bestPart.confidence * confidence;
      
      if (adjustedConfidence > highestConfidence) {
        highestConfidence = adjustedConfidence;
        bestMatch = {
          ...bestPart,
          confidence: adjustedConfidence,
          category: category,
          matchedKeywords: keywordMatches
        };
      }
    }
  }
  
  // Default fallback if no specific match found
  if (!bestMatch) {
    bestMatch = {
      name: 'Genel Kontrol Gerekli',
      id: 'part-general-001',
      confidence: 0.3,
      category: 'general',
      matchedKeywords: 0
    };
  }
  
  return bestMatch;
}

/**
 * Generates random sellers for a given part ID
 * @param {string} partId - The part ID to find sellers for
 * @param {Array} globalSellers - Array of all available sellers
 * @returns {Array} - Array of sellers with pricing and stock info
 */
function generateSellersForPart(partId, globalSellers) {
  // Select 2-5 random sellers
  const numSellers = Math.floor(Math.random() * 4) + 2;
  const selectedSellers = [];
  const shuffledSellers = [...globalSellers].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < Math.min(numSellers, shuffledSellers.length); i++) {
    const seller = shuffledSellers[i];
    
    // Generate realistic pricing based on part type
    let basePrice = 100;
    if (partId.includes('motor')) basePrice = 800;
    else if (partId.includes('fren')) basePrice = 300;
    else if (partId.includes('elektrik')) basePrice = 200;
    else if (partId.includes('suspansiyon')) basePrice = 400;
    else if (partId.includes('klima')) basePrice = 250;
    else if (partId.includes('govde')) basePrice = 600;
    else if (partId.includes('ic-aksam')) basePrice = 150;
    
    // Add some price variation (±20%)
    const priceVariation = (Math.random() - 0.5) * 0.4;
    const price = Math.round(basePrice * (1 + priceVariation));
    
    // Generate stock levels
    const stock = Math.floor(Math.random() * 25) + 1;
    
    selectedSellers.push({
      name: seller.name,
      location: seller.location,
      price: price,
      stock: stock,
      rating: seller.rating,
      phone: seller.phone,
      email: seller.email
    });
  }
  
  // Sort by price (ascending)
  return selectedSellers.sort((a, b) => a.price - b.price);
}

/**
 * Simulates realistic API response delays
 * @param {number} min - Minimum delay in ms
 * @param {number} max - Maximum delay in ms
 * @returns {Promise} - Promise that resolves after delay
 */
function simulateDelay(min = 100, max = 500) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Validates VIN format (basic validation)
 * @param {string} vin - Vehicle VIN to validate
 * @returns {boolean} - Whether VIN format is valid
 */
function isValidVIN(vin) {
  if (!vin || typeof vin !== 'string') return false;
  
  // Basic VIN validation - should be 17 characters, alphanumeric
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  return vinRegex.test(vin);
}

/**
 * Generates a unique request ID
 * @returns {string} - Unique request ID
 */
function generateRequestId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `req-${timestamp}-${random}`;
}

module.exports = {
  interpretPartFromText,
  generateSellersForPart,
  simulateDelay,
  isValidVIN,
  generateRequestId
};

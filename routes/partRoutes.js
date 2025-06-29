const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');

/**
 * @route GET /api/parts/:vin/:category
 * @desc Get part suggestions by VIN and category
 * @access Public
 */
router.get('/:vin/:category', partController.getPartsByCategory);

/**
 * @route POST /api/parts/interpret
 * @desc Suggest part from free text description
 * @access Public
 */
router.post('/interpret', partController.interpretPartFromDescription);

/**
 * @route GET /api/parts/:vin/categories
 * @desc Get all available categories for a vehicle
 * @access Public
 */
router.get('/:vin/categories', partController.getVehicleCategories);

/**
 * @route GET /api/parts/search
 * @desc Search parts across all categories
 * @access Public
 */
router.get('/search', partController.searchParts);

module.exports = router;

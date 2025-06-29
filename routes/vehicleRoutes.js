const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

/**
 * @route GET /api/vehicle/:vin
 * @desc Get vehicle details by VIN
 * @access Public
 */
router.get('/:vin', vehicleController.getVehicleByVIN);

/**
 * @route GET /api/vehicle
 * @desc Get all vehicles (for testing)
 * @access Public
 */
router.get('/', vehicleController.getAllVehicles);

/**
 * @route GET /api/vehicle/search
 * @desc Search vehicles by make, model, or year
 * @access Public
 */
router.get('/search', vehicleController.searchVehicles);

module.exports = router;

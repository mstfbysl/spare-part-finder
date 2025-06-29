const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');

/**
 * @route GET /api/sellers/:partId
 * @desc Get sellers for a specific part ID
 * @access Public
 */
router.get('/:partId', sellerController.getSellersForPart);

/**
 * @route POST /api/request
 * @desc Create a pending request for a part
 * @access Public
 */
router.post('/request', sellerController.createPartRequest);

/**
 * @route GET /api/request/:requestId
 * @desc Get request status by request ID
 * @access Public
 */
router.get('/request/:requestId', sellerController.getRequestStatus);

/**
 * @route GET /api/sellers
 * @desc Get all sellers (for admin/testing purposes)
 * @access Public
 */
router.get('/', sellerController.getAllSellers);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    createDonation,
    getNearbyDonations,
    getDonationById,
    getMyDonations,
    assignDonation,
    updateStatus,
    generateOtp,
    requestDonation,
    completeDonation,
    getDonorAnalytics,
    handleRequestAction
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createDonation);
router.get('/my/analytics', protect, getDonorAnalytics);
router.get('/my', protect, getMyDonations);
router.get('/nearby', protect, getNearbyDonations);
router.get('/reverse-geocode', protect, require('../controllers/donationController').reverseGeocode);
router.get('/search-geocode', protect, require('../controllers/donationController').searchGeocode);
router.get('/:id', protect, getDonationById);
router.post('/:id/otp', protect, generateOtp);
router.put('/:id/assign', protect, assignDonation);
router.put('/:id/status', protect, updateStatus);
router.put('/:id/request', protect, requestDonation);
router.put('/:id/action', protect, handleRequestAction);
router.put('/:id/complete', protect, completeDonation);

module.exports = router;

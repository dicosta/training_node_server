const express = require('express'); 
const router  = express.Router(); 
const listingController = require('../controllers/listingController'); 
const { authJwt } = require('../middleware/authJwt');


router.get('/listings/all', [authJwt.verifyToken], listingController.getAllListings);
router.get('/listings/:listingId', [authJwt.verifyToken], listingController.getListingById); 
router.get('/listings', [authJwt.verifyToken], listingController.getListingPage);

router.post('/listings', [authJwt.verifyToken], listingController.createListing);
router.post('/listings/:listingId/images', [authJwt.verifyToken], listingController.addListingImage);

router.put('/listings/:listingId/publish', [authJwt.verifyToken], listingController.publishListing);
router.put('/listings/:listingId', [authJwt.verifyToken], listingController.updateListing);

module.exports = router; 
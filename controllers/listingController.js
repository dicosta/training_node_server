require('../util/error.js')()
const Joi = require('joi');
const multer = require('multer');
const listingModel = require('../models/listingModel')
const fileUploader = require('../util/fileupload')

const newListingSchema = Joi.object({    
    title: Joi.string().required(),
    description: Joi.string().required(),
    price_cents: Joi.number().integer(8).required()
});

const getListingById = (req, res, next) => {    
    let listing = listingModel.getListingById(req.params.listingId)

    if (!listing) {
        throw ApiError("Listing not found", 404);
    }

    return res.status(200).json(listing)
};

const getAllListings = (req, res, next) => {        
    let allListings = listingModel.getAllListings()
    
    return res.status(200).json(allListings)    
};

const createListing = (req, res, next) => {   
    const validation = newListingSchema.validate(req.body);
    
    if (validation.error) {
        //json does not meet schema requirements
        throw ApiError("Invalid Data", 400);
    } else {
        try {
            var newListing = listingModel.createListing(req.body, req.userId)
            return res.status(201).json(newListing)
        } catch(err) {
            throw ApiError("Internal Server Error", 500);
        }        
    }     
};

const publishListing = (req, res, next) => {    
    try {
        if (listingModel.isListingFromUser(req.params.listingId, req.userId)) {

            var updatedListing = listingModel.publishListing(req.params.listingId)
            return res.status(201).json(updatedListing)
        } else {
            throw ApiError("Forbidden!", 403);
        }
    } catch(err) {
        throw ApiError("Internal Server Error", 500);
    }           
};

const addListingImage = (req, res, next) => {    
    try {
        if (listingModel.isListingFromUser(req.params.listingId, req.userId)) {
            fileUploader.upload.single('listingimage')(req, res, function(err) {                
                if (err instanceof multer.MulterError) {
                    next(err)
                } else if (err) {
                    next(err)
                } else {
                    var image = {}

                    if (listingModel.addListingImage(req.params.listingId, req.file.filename)) {
                        image["url"] =  "/images/" + req.file.filename
                        return res.status(201).json(image)
                    } else {
                        throw ApiError("Internal Server Error", 500)
                    }
                    
                }
            })
        } else {
            throw ApiError("Forbidden!", 403);
        }
    } catch(err) {
        throw ApiError("Internal Server Error", 500);
    }
};

module.exports = {getListingById, getAllListings, createListing, publishListing, addListingImage};
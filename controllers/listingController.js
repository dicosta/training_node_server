require('../util/error.js')()
const Joi = require('joi');
const listingModel = require('../models/listingModel')
const multer = require('multer');
const uploads_config = require("../config/uploads.config");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploads_config.uploads_dir)
    },
    filename: function (req, file, cb) {
        var ext = file.originalname.split('.')[file.originalname.split('.').length -1];
        cb(null, file.fieldname + '_' + req.userId + '_' + Date.now() + '.' + ext)
    }
})
//create multer instance
var upload = multer({ storage: storage })
//TODO: add image mime/type filter


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
            
            upload.array('listingimage', 12)(req, res, function(err) {
                if (err instanceof multer.MulterError) {
                    throw ApiError("Internal Server Error", 500);
                } else if (err) {
                    throw ApiError("Internal Server Error", 500);
                }

                var images = []

                req.files.forEach(function(imageFile) {
                    if (listingModel.addListingImage(req.params.listingId, imageFile.filename)) {
                        images.push("/images/" + imageFile.filename)
                    }
                });
                
                return res.status(201).json({images})
            })
        } else {
            throw ApiError("Forbidden!", 403);
        }
    } catch(err) {
        throw ApiError("Internal Server Error", 500);
    }
};

module.exports = {getListingById, getAllListings, createListing, publishListing, addListingImage};
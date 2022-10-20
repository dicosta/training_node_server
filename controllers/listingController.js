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
//add image mime/type filter


const newListingSchema = Joi.object({    
    title: Joi.string().required(),
    description: Joi.string().required(),
    price_cents: Joi.number().integer(8).required()
});

const getListingById = (req, res, next) => {    
    try {
        let listing = listingModel.getListingById(req.params.listingId)
        
        return res.status(200).json(
            listing
        )
    } catch(err) {
        return res.status(400).json({
            status: 'error',
            message: 'error fetching listing'
        })
    }
};

const getAllListings = (req, res, next) => {        
    let allListings = listingModel.getAllListings()
    
    return res.status(200).json(
        allListings
    )    
};

const createListing = (req, res, next) => {   
    const validation = newListingSchema.validate(req.body);
    
    if (validation.error) {
        //json does not meet schema requirements
        return res.status(400).json({
            status: 'error',
            message: 'Invalid request data'
        })
    } else {
        try {
            var newListing = listingModel.createListing(req.body, req.userId)
            return res.status(201).json(newListing)
        } catch(err) {
            return res.status(400).json({
                status: 'error',
                message: 'error creating listing'
            })
        }        
    }     
};

const publishListing = (req, res, next) => {    
    try {
        if (listingModel.isListingFromUser(req.params.listingId, req.userId)) {

            var updatedListing = listingModel.publishListing(req.params.listingId)
            return res.status(201).json(updatedListing)
        } else {
            return res.status(404).json({
                status: 'error',
                message: 'no such listing'
            })
        }
    } catch(err) {
        console.log(err)

        return res.status(500).json({
            status: 'error',
            message: 'error updating listing'
        })
    }           
};

const addListingImage = (req, res, next) => {    
    //check if it is my listing
    try {
        if (listingModel.isListingFromUser(req.params.listingId, req.userId)) {
            
            upload.array('listingimage', 12)(req, res, function(err) {
                if (err instanceof multer.MulterError) {
                    return res.status(400).json({
                        status: 'error',
                        message: err
                    })
                } else if (err) {
                    return res.status(400).json({
                        status: 'error',
                        message: err
                    })
                }

                
                req.files.forEach(function(imageFile) {
                    listingModel.addListingImage(req.params.listingId, imageFile.filename)
                });
                
                return res.status(201).json({
                    status: 'ok',
                    message: 'files uploaded'
                })
            })
        } else {
            return res.status(404).json({
                status: 'error',
                message: 'no such listing'
            })
        }
    } catch(err) {
        console.log(err)

        return res.status(500).json({
            status: 'error',
            message: 'error updating listing'
        })
    }
};

module.exports = {getListingById, getAllListings, createListing, publishListing, addListingImage};
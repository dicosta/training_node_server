require('../util/error.js')()
const listUtil = require('../util/wrapListInObject')
const Joi = require('joi');
const multer = require('multer');
const listingModel = require('../models/listingModel')
const fileUploader = require('../util/fileupload');

const newListingSchema = Joi.object({    
    title: Joi.string().required(),
    description: Joi.string().required(),
    price_cents: Joi.number().integer(8).required()
    //TODO: available_to should be bigger than available_from. If one is present, then the other need to be present to
});

const getListingById = (req, res, next) => {    
    let listing = listingModel.getListingById(req.params.listingId)    

    if (!listing) {
        throw ApiError("Listing not found", 404);
    }

    if (listing.state == 'published') {
        delete listing.state
        return res.status(200).json(listing)
    } else if (listingModel.isListingFromUser(req.params.listingId, req.userId)) {
        delete listing.state
        return res.status(200).json(listing)
    } else {
        throw ApiError("Forbidden!", 403); //maybe giving to much information and should return 404 instead?
    }
};

const getAllListings = (req, res, next) => {        
    let allListings = listingModel.getAllListings()
    
    return res.status(200).json(listUtil.wrapInObject(allListings))  
};

const getListingPage = (req, res, next) => {
    //setup defaults
    const page_number = req.query['page_number'] ? req.query['page_number'] : 0
    const page_size = req.query['page_size'] ? req.query['page_size'] : 10
    const sort_by = req.query['sort_by'] ? req.query['sort_by'] : 'created_at'
    const sort_dir = req.query['sort_dir'] ? req.query['sort_dir'] : 'ASC'
    
    const filter_title = req.query['title']
    const filter_description = req.query['description']
    const filter_price_cents_from = req.query['price_cents_from']
    const filter_price_cents_to = req.query['price_cents_to']
    const filter_available_from = req.query['available_from']
    const filter_available_to = req.query['available_to']
    
    //validate params
    paging_params_ok = Number.isInteger(page_number) && Number.isInteger(page_size)
    sort_params_ok = ['ASC', 'DESC'].includes(sort_dir.toUpperCase()) && 
        ['CREATED_AT', 'TITLE', 'DESCRIPTION', 'PRICE_CENTS'].includes(sort_by.toUpperCase())
    filter_params_ok = (!filter_price_cents_from || Number.isInteger(filter_price_cents_from)) &&
        (!filter_price_cents_to || Number.isInteger(filter_price_cents_to))

    if (sort_params_ok && paging_params_ok && filter_params_ok) {
        params = {
            'sort_by': sort_by,
            'sort_dir': sort_dir,
            'page_number': page_number,
            'page_size': page_size,
            'filter_title': filter_title,
            'filter_description': filter_description,
            'filter_price_cents_from': filter_price_cents_from,
            'filter_price_cents_to': filter_price_cents_to,
            'filter_available_from': filter_available_from,
            'filter_available_to': filter_available_to
        }

        let listingsPage = listingModel.getListingPage(params)
        return res.status(200).json(listingsPage)
    } else {
        throw ApiError("Invalid Params", 400);
    }
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

const updateListing = (req, res, next) => {    
    const validation = newListingSchema.validate(req.body);

    if (validation.error) {
        //json does not meet schema requirements
        throw ApiError("Invalid Data", 400);
    } else {
        try {            
            if (listingModel.isListingFromUser(req.params.listingId, req.userId)) {                
                var updatedListing = listingModel.updateListing(req.params.listingId, req.body)
                return res.status(200).json(updatedListing)
            } else {
                throw ApiError("Forbidden!", 403);
            }
        } catch(err) {
            throw ApiError("Internal Server Error", 500);
        }   
    }
}

const publishListing = (req, res, next) => {    
    try {
        if (listingModel.isListingFromUser(req.params.listingId, req.userId)) {
            var updatedListing = listingModel.publishListing(req.params.listingId)
            return res.status(200).json(updatedListing)
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

module.exports = {getListingById, getAllListings, createListing, publishListing, addListingImage, updateListing, getListingPage};
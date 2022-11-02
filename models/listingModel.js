const EventEmitter = require('events').EventEmitter;
const db = require('../services/db'); 

var eventBus = new EventEmitter();

function createListing(listingObject, user_id) {
    const {title, description, price_cents} = listingObject
    const created_at = new Date().toISOString()
    const state = "unpublished"

    const result = db.get(`INSERT INTO listing (title, description, price_cents, created_at, state, user_id) 
        VALUES (@title, @description, @price_cents, @created_at, @state, @user_id) RETURNING id, title, description, price_cents, created_at, state, user_id`, 
            {title, description, price_cents, created_at, state, user_id})
    

    if (!result) {
        throw "Error Inserting Listing"
    }

    return result
}

function updateListing(listing_id, listingObject) {
    console.log('update')
    const {title, description, price_cents} = listingObject

    const listing = db.get(`UPDATE listing SET title = @title, description = @description, price_cents = @price_cents WHERE id = @listing_id RETURNING id, title, description, price_cents, created_at, state, user_id`, 
        {title, description, price_cents, listing_id})

    if (!listing) {
        throw "Error Updating Listing"
    } else {
        listing['images'] = fetchListingImages(listing_id)

        eventBus.emit('listing-changed', listing)
        return listing
    }
}


function publishListing(listing_id) {
    const listing = db.get(`UPDATE listing SET state = 'published' WHERE id = @listing_id RETURNING id, title, description, price_cents, created_at, state, user_id`, 
        {listing_id})

    if (!listing) {
        throw "Error Updating Listing"
    } else {
        listing['images'] = fetchListingImages(listing_id)

        eventBus.emit('listing-changed', listing)
        return listing
    }
}

function getAllListings() {
    const data = db.queryAll(`SELECT id, title, description, created_at, price_cents, available_since, available_to, lat, lon FROM listing WHERE state = 'published'`)

    data.forEach(function(listing){
        listing['images'] = fetchListingImages(listing.id)   
    })

    return data    
}

function getListingById(listing_id) {
    const listing = db.get(`SELECT id, title, description, created_at, price_cents, available_since, available_to, lat, lon, state FROM listing WHERE id = @listing_id`, 
        {listing_id})

    if (!listing) {
        return null
    }

    listing['images'] = fetchListingImages(listing_id)
    return listing
}

function addListingImage(listing_id, file_name) {
    const result = db.run(`INSERT INTO listing_image (listing_id, file_name) 
        VALUES (@listing_id, @file_name)`, {listing_id, file_name})
    
    if (result.changes) {
        eventBus.emit('listing-changed', getListingById(listing_id))

        return true
    }

    return false;
}

function isListingFromUser(listing_id, user_id) {    
    const data = db.query(`SELECT id FROM listing WHERE id = @listing_id AND user_id = @user_id`, {listing_id, user_id})
    
    return data && data.length > 0
}

function fetchListingImages(listing_id) {
    return db.query(`SELECT file_name FROM listing_image where listing_id = @listing_id`, {listing_id})
}

module.exports = {
    createListing, getAllListings, publishListing, getListingById, addListingImage, isListingFromUser, eventBus, updateListing
}
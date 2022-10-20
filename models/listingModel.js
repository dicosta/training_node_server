const db = require('../services/db'); 

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

function publishListing(listing_id) {
    const result = db.get(`UPDATE listing SET state = 'published' WHERE id = @listing_id RETURNING id, title, description, price_cents, created_at, state, user_id`, 
        {listing_id})

    if (!result) {
        throw "Error Updating Listing"
    }

    return result
}

function getAllListings() {
    const data = db.queryAll(`SELECT id, title, description, created_at, price_cents, available_since, available_to, lat, lon FROM listing WHERE state = 'published'`)

    return data    
}

function getListingById(listing_id) {
    const listingImages = db.query(`SELECT file_name FROM listing_image where listing_id = @listing_id`, {listing_id})
    
    const listing = db.get(`SELECT id, title, description, created_at, price_cents, available_since, available_to, lat, lon FROM listing WHERE id = @listing_id`, 
        {listing_id})

    if (!listing) {
        return null
    }

    listing['images'] = listingImages
    return listing
}

function addListingImage(listing_id, file_name) {
    const result = db.run(`INSERT INTO listing_image (listing_id, file_name) 
        VALUES (@listing_id, @file_name)`, {listing_id, file_name})
    
    if (result.changes) {
        return true
    }

    return false;
}

function isListingFromUser(listing_id, user_id) {    
    const data = db.query(`SELECT id FROM listing WHERE id = @listing_id AND user_id = @user_id`, {listing_id, user_id})
    
    return data && data.length > 0
}

module.exports = {
    createListing, getAllListings, publishListing, getListingById, addListingImage, isListingFromUser
}
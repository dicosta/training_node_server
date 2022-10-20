const db = require('../services/db'); 
const bcrypt = require("bcryptjs");

function isEmailTaken(email) {   
    const data = db.query(`SELECT * FROM user WHERE email = ?`, email)
    return data && data.length > 0
}

function createUser(userObject) {
    const {firstname, lastname, email} = userObject
    const password = bcrypt.hashSync(userObject.password, 8)

    const result = db.get(`INSERT INTO user (firstname, lastname, email, password) 
        VALUES (@firstname, @lastname, @email, @password) RETURNING id, firstname, lastname, email`, {firstname, lastname, email, password})
    
    if (!result) {
        throw "Error Inserting User"
    }
    
    return result
}

function fetchUser(signInObject) {
    const {email} = signInObject

    const data = db.query(`SELECT * FROM user WHERE email =?`, email)

    return data    
}

function fetchUserById(userId) {
    const data = db.query(`SELECT * FROM user WHERE id =?`, userId)

    return data    
}

module.exports = {
    isEmailTaken,
    createUser,
    fetchUser,
    fetchUserById
}
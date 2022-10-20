require('../util/error.js')()
const Joi = require('joi');
const userModel = require('../models/userModel')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");


const newUserSchema = Joi.object({    
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    password: Joi.string().min(8).required().strict(),
    email: Joi.string().email().required()   
});

const signInSchema = Joi.object({
    password: Joi.string().min(8).required().strict(),
    email: Joi.string().email().required()   
})

const newUser = (req, res, next) => {    
    const validation = newUserSchema.validate(req.body);
    
    if (validation.error) {
        //json does not meet schema requirements 
        //TODO: improve return message to indicate the offending property
        throw ApiError("Invalid Data", 400);
    } else {
        if (userModel.isEmailTaken(req.body.email)) {
            throw ApiError("Email Already Taken", 400);
        } else {
            try {
                var newUser = userModel.createUser(req.body)
                
                const token = jwt.sign({ id: newUser.id }, config.secret, {
                    expiresIn: 86400, // 24 hours
                });

                newUser["token"] = token

                return res.status(201).json(newUser)

            } catch(err) {
                console.log(err)
                throw ApiError("Internal Server Error", 500)
            }    
        }
    }    
};

const getUser = (req, res, next) => {
    let user = userModel.fetchUserById(req.userId)

    if (user && user.length == 1) {
        return res.status(200).send({
            id: user[0].id,
            firstname: user[0].firstname,
            lastname: user[0].lastname,
            email: user[0].email,                
        });
    } else {
        throw ApiError("User Not Found", 404);
    }
}

const signIn = (req, res, next) => {
    const validation = signInSchema.validate(req.body);

    if (validation.error) {
        //json does not meet schema requirements
        throw ApiError("Invalid Data", 400);
    } else {
        let user = userModel.fetchUser(req.body)
        
        if (user && user.length == 1) {
            
            const passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user[0].password
              );

            if (!passwordIsValid) {
                //maybe return a 200?
                throw ApiError("Invalid Password", 401);
            }
            
            const token = jwt.sign({ id: user[0].id }, config.secret, {
                expiresIn: 86400, // 24 hours
            });

            req.session.token = token;

            return res.status(200).send({
                id: user[0].id,
                firstname: user[0].firstname,
                lastname: user[0].lastname,                
                email: user[0].email,                
                token: token
            });

        } else {
            throw ApiError("User Not Found", 404);
        }
    }       
}

const signOut = (req, res, next) => {
    //keep a list of invalidated tokens to check after token validation?
    //(also maybe clear the list when the secret is rotated)
    res.json({message: "sign out"})
}

module.exports = {newUser, getUser, signIn, signOut};
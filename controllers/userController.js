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
        return res.status(400).json({
            status: 'error',
            message: 'Invalid request data'
        })
    } else {
        if (userModel.isEmailTaken(req.body.email)) {
            return res.status(400).json({
                status: 'error',
                message: 'email already in use!'
            })
        } else {
            if (userModel.createUser(req.body)) {
                return res.status(201).json({
                    status: 'ok',
                    message: 'user created'
                })
            } else {
                return res.status(400).json({
                    status: 'error',
                    message: 'error creating user'
                })
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
            username: user[0].username,
            email: user[0].email,                
        });
    } else {
        return res.status(404).json({
            status: 'error',
            message: 'User not found'
        })
    }
}

const signIn = (req, res, next) => {
    const validation = signInSchema.validate(req.body);

    if (validation.error) {
        //json does not meet schema requirements
        return res.status(400).json({
            status: 'error',
            message: 'Invalid request data'
        })
    } else {
        let user = userModel.fetchUser(req.body)
        if (user && user.length == 1) {
            
            const passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user[0].password
              );

            if (!passwordIsValid) {
                return res.status(401).send({
                    message: "Invalid Password!",
                });
            }
            
            const token = jwt.sign({ id: user[0].id }, config.secret, {
                expiresIn: 86400, // 24 hours
            });

            req.session.token = token;

            return res.status(200).send({
                id: user[0].id,
                username: user[0].username,
                email: user[0].email,                
            });

        } else {
            return res.status(500).json({
                status: 'error',
                message: 'server error'
            })
        }
    }       
}

const signOut = (req, res, next) => {
    res.json({message: "sign out"})
}

module.exports = {newUser, getUser, signIn, signOut};
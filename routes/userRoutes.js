const express = require('express'); 
const router  = express.Router(); 
const userController = require('../controllers/userController.js'); 
const { authJwt } = require('../middleware/authJwt');

router.post('/user/signup', userController.newUser); 
router.get('/user', [authJwt.verifyToken], userController.getUser)
router.post('/user/signin', userController.signIn)
router.post('/user/signout', [authJwt.verifyToken], userController.signOut)


module.exports = router; 
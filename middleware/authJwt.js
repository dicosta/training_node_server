const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

verifyToken = (req, res, next) => {  
  let token = req.session.token;

  if (!token) {
    token = req.headers['x-access-token']
  }

  if (!token) {
    throw ApiError("no token provided", 401);
  }

  
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      throw ApiError("unauthorized", 401);
    }
    
    req.userId = decoded.id;
    
    next();
  });
};

const authJwt = {
    verifyToken
};

module.exports = {authJwt};
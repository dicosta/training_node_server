# Training Node Server

The purpose of this project is to provide an API with basic features
for Mobile Apps development training.

Provided Features
- REST Interface with JSON content
- Token based Authentication/Authorization with JWT
- Account Management 
- multi-part/form-data Image upload
- SQLite storage for persistence
- Pagination (TODO)

# Summary of Endpoints:

- [POST] **/user/signup**

  **[Not Authenticated]**
  
  Purpose: Creates a new User Account
  
  Sample Payload:
  ```
  {
    "firstname": "my-name",
    "lastname": "my-last-name",
    "email": "address@mail.com",
    "password": "my-password"
  }
  ```
  

- [POST] **/user/signin**

  **[Not Authenticated]**

  Purpose: Sign In and get a User Token

  Sample Payload:
  ```
  {
    "email": "address@mail.com",
    "password": "my-password"
  }
  ```
  
  
# Setup:

- Clone this repository
- run `npm install` to fetch dependencies
- run `server.js` (i.e. npx nodemon server.js)





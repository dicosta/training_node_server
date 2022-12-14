# Training Node Server

The purpose of this project is to provide an API with basic features
for Mobile Apps development training.

Provided Features
- REST Interface with JSON content
- Token based Authentication/Authorization with JWT
- Account Management 
- multi-part/form-data Image upload
- SQLite storage for persistence
- WebSocket Support for Listening changes in Listings through a suscription 
- Pagination
- Sort & Filter
- Push Notification (TODO)

# Setup:

- Clone this repository
- run `npm install` to fetch dependencies
- run `ws-server.js` (i.e. npx nodemon ws-server.js)

# Web-Sockets Test Page

Available on **/wstest.html**

# WebSocket Support

The server listens to connections on the same port as the API (defaults to 3000, i.e.: **ws://localhost:3000/**)
Once connected, the ws server expects json messages with this protocol:

```
{
  "action": "desired_action",
  "listing_id": "the id of the listing to monitor/unmonitor"
}
```

where action can be **SUSCRIBE** OR **UNSUSCRIBE**

Suscribed clients will receive the Listing object through the web socket each time
that the suscribed listing changes in the server, until the client either unsuscribes or
closes the connection

# Summary of Endpoints:

- [POST] **/api/user/signup**

  **[Not Authenticated]**
  
  Purpose: Creates a new User Account
  
  Sample Payload (all fields are mandatory):
  ```
  {
    "firstname": "my-name",
    "lastname": "my-last-name",
    "email": "address@mail.com",
    "password": "my-password"
  }
  ```
  
  Responses:
  ```
  Status 201:
  
  {
    "id": 1,
    "firstname": "my-name",
    "lastname": "my-last-name",
    "email": "my-last-name",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjY2Mzk4NzY0LCJleHAiOjE2NjY0ODUxNjR9.WVRDcSeelhSa_MxrcY1XbIguGNu33R0QmShIwK1IrX4"
  }

  Status 400:

  {
    "message": "Email Already Taken"
  }

  ``` 

- [POST] **/api/user/signin**

  **[Not Authenticated]**

  Purpose: Sign In and get a User Token

  Sample Payload (all fields are mandatory):
  ```
  {
    "email": "address@mail.com",
    "password": "my-password"
  }
  ```

  Responses:
  ```
  Status 200: 
  {
    "id": 1,
    "firstname": "my-name",
    "lastname": "my-last-name",
    "email": "address@mail.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjY2Mzk5MDgxLCJleHAiOjE2NjY0ODU0ODF9.9DBZOBv9dWwA_qzbw3rfxiy95xOzhLkvD5X45Gahbug"
  }

  Status 401:
  {
    "message": "Invalid Password"
  }
  
  ```

- [GET] **/api/user**

  **[Authenticated]**
  Header
  x-access-token = [your-token]

  Purpose: Fetches the User Information (from the user associated with the provided token)
  
  Responses
  ```
  Status 200:

  {
    "id": 1,
    "firstname": "my-name",
    "lastname": "my-last-name",
    "email": "address@mail.com",
  }

  Status 401:

  {
    "message": "unauthorized"
  }
  ```

  - [POST] **/user/signout**

  **[Authenticated]**
  Header
  x-access-token = [your-token]

  Purpose: Invalidates the token
  
  Responses
  ```
  Status 200:
  ```
  
- [GET] **/api/listings/all**

  **[Authenticated]**
  Header
  x-access-token = [your-token]

  Purpose: Returns all the listings that have the state "published" sorted by created_at ASC
  
  Responses
  ```
  Status 200:

  {
    "items": 
      [
        {
            "id": 1,
            "title": "titulo 1",
            "description": "description 1",
            "created_at": "2022-10-18T18:19:07.737Z",
            "price_cents": 10000,
            "available_since": null,
            "available_to": null,
            "lat": null,
            "lon": null,
            "images": []
        },
        {
            "id": 2,
            "title": "titulo 1",
            "description": "description 1",
            "created_at": "2022-10-18T18:19:08.547Z",
            "price_cents": 10000,
            "available_since": null,
            "available_to": null,
            "lat": null,
            "lon": null,
            "images": []
        },
        {
            "id": 9,
            "title": "titulo 1",
            "description": "description 1",
            "created_at": "2022-10-18T18:19:12.816Z",
            "price_cents": 10000,
            "available_since": null,
            "available_to": null,
            "lat": null,
            "lon": null,
            "images": []
        }
      ]
  }
  ```

  - [GET] **/api/listings?page_size=SIZE&page_number=NUM**

  **[Authenticated]**
  Header
  x-access-token = [your-token]

  Purpose: Returns the NUMth page of SIZE listings sorted by created_at ASC.
  SIZE defaults to 10 when not provided
  NUM defaults to 0 when not provided
  The page_number is zero-based. 

  It also support additional query parameters for sorting and filtering
  Sorting:
    - sort_by (supported values: created_at, title, description, price_cents)
    - sort_dir (supported values: asc, desc)
  
  Filtering:
    - filter_title (uses a 'like' query checking the value against title column)
    - filter description (uses a 'like' query checking the value against description column)
    - filter_price_cents_from & filter_price_cents_to (can define a min and/or max value to filter
      by price_cents)
    - filter_available_from & filter_available_to (can define two dates to look for listings 
      available in a specific time window)
  
  Responses
  ```
  Status 200:

  {
    "page_number": 0,
    "page_size": 2,
    "total": 5,
    "listings": [
        {
            "id": 1,
            "title": "un titulo mas largo.  4",
            "description": "una descripcion mas larga 1234",
            "created_at": "2022-10-27T03:47:26.095Z",
            "price_cents": 15000,
            "available_since": null,
            "available_to": null,
            "lat": null,
            "lon": null,
            "state": "published",
            "images": [
                {
                    "file_name": "listingimage_1_1667519578050.jpg"
                }
            ]
        },
        {
            "id": 2,
            "title": "titulo 1",
            "description": "description 1",
            "created_at": "2022-10-27T03:47:26.924Z",
            "price_cents": 10000,
            "available_since": null,
            "available_to": null,
            "lat": null,
            "lon": null,
            "state": "published",
            "images": []
        }
    ]
  }
  ```

- [GET] **/api/listings/:listing_id**

  **[Authenticated]**
  Header
  x-access-token = [your-token]

  Purpose: Returns the listing with the corresponding id
  
  Responses
  ```
  Status 200:

  {
    "id": 1,
    "title": "titulo 1",
    "description": "description 1",
    "created_at": "2022-10-22T02:40:45.203Z",
    "price_cents": 10000,
    "available_since": null,
    "available_to": null,
    "lat": null,
    "lon": null,
    "images": []
  }

  STATUS 404:
  {
    "message": "Listing not found"
  }
  ```

- [POST] **/api/listings/**

  **[Authenticated]**
  Header
  x-access-token = [your-token]

  Purpose: Creates a new Listing with the provided values and sets it in state "unpublished"
  
  Sample Payload (title, description and price_cents are mandatory):
  ```
  {
    "title":"titulo 1",
    "description":"description 1",
    "price_cents": 10000
  }
  ```

  Responses
  ```
  Status 201:

  {
    "id": 1,
    "title": "titulo 1",
    "description": "description 1",
    "price_cents": 10000,
    "created_at": "2022-10-22T02:40:45.203Z",
    "state": "unpublished",
    "user_id": 1
  }  
  ```

- [PUT] **/api/listings/:listing_id/publish**

  **[Authenticated]**
  Header
  x-access-token = [your-token]

  Purpose: modifies the state to "published" for a listing the current user owns
  
  Responses
  ```
  Status 200:

  {
    "id": 1,
    "title": "titulo 1",
    "description": "description 1",
    "price_cents": 10000,
    "created_at": "2022-10-18T18:19:12.816Z",
    "state": "published",
    "user_id": 1,
    "images": [
    {
        "file_name": "listingimage_1_1666407745508.jpg"
    },
    {
        "file_name": "listingimage_1_1666409125261.jpg"
    }]
  }
  
  Status 403:
  {
    "message": "Forbidden!"
  }
  ```

  - [PUT] **/api/listings/:listing_id**

  **[Authenticated]**
  Header
  x-access-token = [your-token]

  Purpose: updates the title, description or price of a listing the current user owns
  
  Sample Payload (title, description and price_cents are mandatory):
  ```
  {
    "title":"new title",
    "description":"new description",
    "price_cents": 15000
  }
  ```

  Responses
  ```
  Status 200:

  {
    "id": 1,
    "title": "new title",
    "description": "new description",
    "price_cents": 15000,
    "created_at": "2022-10-18T18:19:12.816Z",
    "state": "published",
    "user_id": 1,
    "images": [
    {
        "file_name": "listingimage_1_1666407745508.jpg"
    },
    {
        "file_name": "listingimage_1_1666409125261.jpg"
    }]
  }
  
  Status 403:
  {
    "message": "Forbidden!"
  }
  ```

- [POST] **/api/listings/:listing_id/images**

  **[Authenticated]**
  Header
  x-access-token = [your-token]

  Purpose: adds an image to a listing the current user owns (only jpg, png, jpeg, gif allowed)
  
  Payload:
  ```
    MultiPart FormData image file
    key: listingimage
  ```

  Responses
  ```
  Status 201:
  {
    "url": "/images/listingimage_1_1666407745508.jpg"
  }

  Status 403:
  {
    "message": "Forbidden!"
  }

  Status 500:
  {
    "message": "Only images are allowed"
  }
  ```  

- [GET] **/images/:image_name**

  **[Not Authenticated]**
  
  Purpose: Fetches an image
  
  Responses
  ```
  Status 200:
  [The Requested Image]

  STATUS 404:
  {
    "message": "No such route exists"
  }
  ```
const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const morgan = require("morgan")
const database = require('./database')

const uploads_config = require("./config/uploads.config.js");

const userRoutes = require('./routes/userRoutes.js');
const listingsRoutes = require('./routes/listingRoutes.js')

const app = express();

database.initDataBase();

app.use(morgan('tiny'));

app.use(cors())
//parse application/json content
app.use(express.json());
//parse application/x-www-form-urlencoded content
app.use(express.urlencoded({ extended: true }));

app.use(
    cookieSession({
      name: "sampleapp-session",
      secret: "COOKIE_SECRET", // should use as secret environment variable
      httpOnly: true
    })
  );


app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

//routes
app.use('/api/', userRoutes); 
app.use('/api/', listingsRoutes); 
app.use('/images', express.static(uploads_config.uploads_dir))

// invalid route handler
app.use(function(req, res, next) {
  res.status(404).json({
    message: "No such route exists"
  })
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message
  })
});


const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('App is listening on port ' + listener.address().port)
})

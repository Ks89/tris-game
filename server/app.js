console.log("Starting with NODE_ENV=" + process.env.NODE_ENV);
console.log("process.env.CI is " + process.env.CI);

if(!process.env.CI) {
  console.log("Initializing dotenv (requires .env file)");
  if(process.env.NODE_ENV === 'production') {
    // production
    require('dotenv').config({path: '.env_prod'}); //to read info from .env_prod file
  } else {
    // development
    require('dotenv').config({path: '.env'}); //to read info from .env file
  }
}

// ------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------
// re-assign all process.env variables to be used in app.js and defined with dotenv to constants
// In this way I can see all variables defined with donenv and used here
// In CI I can't use dotenv => I provide default values for all these constants
const _FRONT_END_PATH         = process.env.FRONT_END_PATH         || '../client/public';
const _FRONT_END_PATH_INDEX   = process.env.FRONT_END_PATH_INDEX         || '../client/app_client';
// ------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------

let path = require('path');

// --------------------------------------------------------
// --------------------------------------------------------
let pathFrontEndFolder, pathFrontEndIndex;
if(process.env.CI || process.env.NODE_ENV === 'test') {
  console.log("Executed in CI or TEST - providing fake paths");
  //provides fake directories and files to run this project in a CI env
  pathFrontEndFolder = path.join(__dirname);
  pathFrontEndIndex = path.join(__dirname, 'app.js');
} else {
  if(process.env.NODE_ENV === 'production') {
    console.log(`Providing ${_FRONT_END_PATH} and ${_FRONT_END_PATH_INDEX} for production`);
    pathFrontEndFolder = path.join(__dirname, _FRONT_END_PATH);
    pathFrontEndIndex = path.join(__dirname, _FRONT_END_PATH_INDEX);
  } else {
    console.log(`Providing real ${_FRONT_END_PATH} and ${_FRONT_END_PATH_INDEX}`);
    pathFrontEndFolder = path.join(__dirname, _FRONT_END_PATH);
    pathFrontEndIndex = path.join(__dirname, _FRONT_END_PATH_INDEX);
  }
}
// --------------------------------------------------------
// --------------------------------------------------------

let express = require('express');
let compression = require('compression');
let favicon = require('serve-favicon');
let session = require('express-session');
let bodyParser = require('body-parser');

console.log("Initializing mongodb");
//require for mongo
require('./src/models/db');

console.log("Initializing expressjs");
let app = express();

console.log("Initializing static resources");
app.use(express.static(pathFrontEndFolder));
app.use(express.static(pathFrontEndIndex));

console.log("Initializing bodyparser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// compress all requests using gzip
app.use(compression());

console.log("Initializing REST apis and CSRF");

// --------------------------------------- ROUTES ---------------------------------------
let routesApi = require('./src/routes/index')(express);
app.use('/api', routesApi);
// --------------------------------------------------------------------------------------


console.log("Initializing static path for index.html");

app.use('/', function(req, res) {
  res.sendFile(path.join(pathFrontEndIndex, 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  }
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
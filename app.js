require('dotenv').config(); //necessario para express-jwt e variareis de ambiente process.env.xxx
var express = require('express');
const helmet = require("helmet");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');//logger
var cookieParser = require('cookie-parser');//Parse Cookie header and populate req.cookies
var bodyParser = require('body-parser');//Parse incoming request bodies in a middleware before your handlers
var uglifyJs = require("uglify-js");
var fs = require('fs');
var passport = require('passport');// Express-compatible authentication middleware for Node.js.

require('./app_api/models/db');
require('./app_api/config/passport');

var routesApi = require('./app_api/routes/index');

var app = express();

var appClientFiles = [
  'app_client/app.js',
  'app_client/addLocation/currentLocation/addLocation.controller.js',
  'app_client/home/home.controller.js',
  'app_client/about/about.controller.js',
  'app_client/auth/login/login.controller.js',
  'app_client/auth/register/register.controller.js',
  'app_client/locationDetail/locationDetail.controller.js',
  'app_client/reviewModal/reviewModal.controller.js',
  'app_client/common/services/authentication.service.js',
  'app_client/common/services/geolocation.service.js',
  'app_client/common/services/loc8rData.service.js',
  'app_client/common/filters/formatDistance.filter.js',
  'app_client/common/filters/addHtmlLineBreaks.filter.js',
  'app_client/common/directives/navigation/navigation.controller.js',
  'app_client/common/directives/navigation/navigation.directive.js',
  'app_client/common/directives/footerGeneric/footerGeneric.directive.js',
  'app_client/common/directives/pageHeader/pageHeader.directive.js',
  'app_client/common/directives/ratingStars/ratingStars.directive.js'
];
var uglified = uglifyJs.minify(appClientFiles, { compress : false });

fs.writeFile('public/javascripts/loc8r.min.js', uglified.code, function (err){
  if(err) {
    console.log(err);
  } else {
    console.log("Script generated and saved:", 'loc8r.min.js');
  }
});

app.use(
  helmet.contentSecurityPolicy(
    {
      directives:{
        defaultSrc: ["https:"],
        scriptSrc: ["https:"],
        imgSrc: ["https:"],
        styleSrc: ["'unsafe-hashes'", "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='", "https:"]
      }
    }
  )
);

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));//Concise output colored by response status for development use
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_public','build')));
//app.use(express.static(path.join(__dirname, 'app_client')));
/*
app.use('/api', (req, res, next) => {
	res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With,Content-Type, Accept, Authorization');
	next();
});
*/
//app.use(passport.initialize()); verificar a necessidade de inicializacao
app.use('/api', routesApi);

app.get('*', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'app_public', 'build', 'index.html'));
});
/*
app.use(function(req, res) {
  console.log('###build###')
  res.sendFile(path.join(__dirname, 'app_public', 'build', 'index.html'));
});
/*
/*
app.use(function(req, res) {
  console.log('###app_client###')
  res.sendFile(path.join(__dirname, 'app_client', 'index.html'));
});
*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handlers
// Catch unauthorised errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401);
    res.json({"message" : err.name + ": " + err.message});
  }else{
    res.status(500);
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

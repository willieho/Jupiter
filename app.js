var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
const redis = require("redis");
const redisClient = redis.createClient();

// managers
var FileManager = require('./manager/FileManager');
var fileManager;

var index = require('./routes/index');

var app = express();

// setup redis
redisClient.on('error', function (err) {
  console.log('Please Run Redis Server First.');
  throw err; 
})
redisClient.on('connect', function () {
  console.log('Redis Connected!');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// session
var session = require('express-session');
app.set('trust proxy', 1);
app.use(session({
    name: 'jupiter-session',
    secret: 'a4f5Df', 
    resave: true, 
    saveUninitialized: true 
}));

// CORS configuration
app.use(cors())

var init = async () => {
  fileManager = new FileManager();
  await fileManager.init();
}

// Connect to mLab
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://jupiteruser:jupiterpwd0@ds019876.mlab.com:19876/jupiter', { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.set('debug', true)
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('MongoDB Connected!')
  init();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', (req, res, next) => {
  req.fileManager = fileManager;
  req.redisClient = redisClient;
  next();
}, index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

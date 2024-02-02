require("dotenv").config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session")
const bodyParser = require("body-parser")
const passport = require("passport")
const localStategy = require("passport-local")

const {Mongoose} = require("./db")
Mongoose(process.env.DATABASE)
const indexRouter = require('./routes/index');
const {userModel} = require("./models/userModel")
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// email & password login
app.use(session({secret:process.env.SESSION,resave:true,saveUninitialized:false,cookie:{maxAge:24*60*60*1000}}))
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user,cb)=>{
  cb(null,user)
})
passport.deserializeUser((user,cb)=>{
  cb(null,user)
})
passport.use(new localStategy({usernameField:"email"},userModel.authenticate()))

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

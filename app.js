// Import Middleware
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash')
const session = require('express-session');
// Passport for authentication
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// Import router.js
const router = require('./routes/router');

const app = express();
// Database url
const db = 'mongodb://localhost:27017/forumd'

mongoose.connect(db, { useMongoClient: true }, () => {
    console.log('Connected to MongoDB.');
});

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}

// Use Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Flash messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Use routes
app.use('/api', router);

module.exports = app;
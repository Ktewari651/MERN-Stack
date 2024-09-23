const path = require('path');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const User = require('./models/user');

const CONNECT_MONGODB = 'mongodb+srv://kartikkarari987:6lZOylSki0liLxG7@nodeapplication.zjwjvgp.mongodb.net/Shop?retryWrites=true&w=majority&appName=NodeApplication';

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// MongoDB Session Store
const store = new MongoDBStore({
  uri: CONNECT_MONGODB,
  collection: 'sessions'
});

// Session Middleware
app.use(
  session({
    secret: 'My Secret',  // A long and random string to sign the session ID cookie
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

// CSRF Protection Middleware
const csrfProtection = csrf();
app.use(csrfProtection);

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));


app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  console.log(" res.locals.isAuthenticated",  res.locals.isAuthenticated, "res.locals.csrfToken ", res.locals.csrfToken )
  next();
});


app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


app.use(errorController.get404);

mongoose
  .connect(CONNECT_MONGODB)
  .then(result => {
    app.listen(3008, () => {
      console.log('Connected to MongoDB and server running on port 3008');
    });
  })
  .catch(err => {
    console.log("Error connecting to MongoDB:", err);
  });

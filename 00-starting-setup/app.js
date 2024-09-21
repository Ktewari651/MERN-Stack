const path = require('path');
const session = require('express-session')
const mongoDbStore = require('connect-mongodb-session')(session)

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const CONNECT_MONGODB =  'mongodb+srv://kartikkarari987:6lZOylSki0liLxG7@nodeapplication.zjwjvgp.mongodb.net/Shop?retryWrites=true&w=majority&appName=NodeApplication'

const app = express();


app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());           // Used to parse incoming request
app.use(express.static(path.join(__dirname, 'public')));
app.use( 
  session({
    secret: 'My Secret',  
    resave: false,  
    saveUninitialized: false, 
    store: new mongoDbStore({ 
      uri: CONNECT_MONGODB, 
      collection: 'sessions_' 
    })
  })
);

app.use((req,res, next)=>{
  if(!req.session.user){
    return next()
  }
  User.findById(req.session.user._id).then(user =>{
    req.user = user;
    next()
  }).catch(err =>{
    console.log("errro", err)
  })

})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
.connect(CONNECT_MONGODB)
 .then(result => {
    app.listen(3008, ()=>{
      console.log('connected to MongoDB')
    });
   
  })
  .catch(err => {
    console.log("Error while connecting",err);
  });

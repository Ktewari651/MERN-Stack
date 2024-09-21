const User = require('../models/user')
const bcrypt = require('bcryptjs')

exports.getLogin = async (req, res) => {
  // const isLoggedIn =  req.get('Cookie').split(';')[2].trim().split('=')[1]
  console.log("1req.session.isLoggedIn", req.session.isLoggedIn)
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: false

  }
  )
}


exports.postLogin = async (req, res) => {
  try {
    const user = await User.findById('66ee751c7d8d3143b471646c');
    if (!user) {
      throw new Error('User not found');
    }
    req.session.isLoggedIn = true;
    req.session.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    req.session.save(err => {
      if (err) {
        console.log('Session save error:', err);
      }
      res.redirect('/');
    });
  } catch (err) {
    console.log('Error during login:', err);
  
    res.redirect('/login');
  }
};


exports.postLogout = async (req, res) => {
  req.session.destroy(err => {
    console.log(err)
    res.redirect('/')
  })
}

exports.getSignup = async (req, res) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Login',
    isAuthenticated: false

  }
  )
}

exports.postSignup = (req, res) => {
  const { email, Password, confirmPassword } = req.body;

  User.findOne({ email: email })
    .then((userDetails) => {
      if (userDetails) {
       
        return res.redirect('/signup');
      }
    
      return bcrypt.hash(Password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(() => {
       
          res.redirect('/login');
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error'); 
    });
};

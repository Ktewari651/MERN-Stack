const express = require ('express')
const authControler = require('../controllers/auth')
const auth = require('../middlewear/is-auth')


const router = express.Router()

router.get('/login',  authControler.getLogin)

router.post('/login', authControler.postLogin)

router.post('/logout', authControler.postLogout)

router.get('/signup', authControler.getSignup)

router.post('/signup', authControler.postSignup)


module.exports = router


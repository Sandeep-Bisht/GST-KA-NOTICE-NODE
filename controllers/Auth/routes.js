const router = require("express").Router()

const { login, loginVerify } = require('./login')
const { googleSignup } = require('./googleLogin')
const { facebookSignup } = require('./facebookLogin')
const { signup, signupVerify } = require('./signup')

router.post('/login', login)
router.post('/login-verify',loginVerify)

router.post('/google',googleSignup)
router.post('/facebook',facebookSignup)

router.post('/signup', signup);
router.post('/signup-verify', signupVerify)

module.exports = router
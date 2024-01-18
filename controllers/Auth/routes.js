const router = require("express").Router()

const { signup, signupVerify } = require('./signup')
const { googleSignup } = require('./googleLogin')
const { facebookSignup } = require('./facebookLogin')

router.post('/signup',signup)
router.post('/signup-verify',signupVerify)

router.post('/google',googleSignup)
router.post('/facebook',facebookSignup)

module.exports = router
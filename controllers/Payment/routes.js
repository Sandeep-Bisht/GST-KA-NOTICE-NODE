const router = require("express").Router()
const passport = require("passport")
const {createPayment, verify} = require('./payment')

router.post('/orders' , createPayment)
router.post('/verify' , verify)


module.exports = router
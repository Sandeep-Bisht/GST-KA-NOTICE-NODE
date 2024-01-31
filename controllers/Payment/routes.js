const router = require("express").Router()
const passport = require("passport")
const {getAllPayments} = require('./payment')


router.get("/get-all-payments",passport.authenticate('jwt', {session:false}), getAllPayments)


module.exports = router
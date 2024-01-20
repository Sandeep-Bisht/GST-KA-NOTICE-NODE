const router = require("express").Router()

const { createTicket } = require('./tickets')
const passport = require("passport")
const upload = require('../../config/multer')

router.post('/create-ticket',passport.authenticate('jwt', {session:false}), upload.fields([{name: 'document'}]), createTicket)

module.exports = router
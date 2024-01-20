const router = require("express").Router()

const { getAllTickets, getByTicketNo} = require('./ticket')
const passport = require("passport")

router.get('/get-all-tickets',passport.authenticate('jwt', {session:false}),getAllTickets)

router.get('/get-by-ticketNo/:ticketNo',passport.authenticate('jwt', {session:false}),getByTicketNo)

module.exports = router
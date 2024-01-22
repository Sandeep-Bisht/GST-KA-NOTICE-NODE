const router = require("express").Router()

const { getAllTickets, getByTicketNo, askForPayment} = require('./ticket')
const passport = require("passport")

router.get('/get-all-tickets',passport.authenticate('jwt', {session:false}),getAllTickets)

router.get('/get-by-ticketNo/:ticketNo',passport.authenticate('jwt', {session:false}),getByTicketNo)
router.post('/ask-payment/:ticketNo',passport.authenticate('jwt', {session:false}),askForPayment)

module.exports = router
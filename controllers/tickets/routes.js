const router = require("express").Router()

const { getAllTickets, getByTicketNo, askForPayment, uploadAskedDocs, createOrder} = require('./ticket')
const passport = require("passport")
const upload = require('../../config/multer')

router.get('/get-all-tickets',passport.authenticate('jwt', {session:false}),getAllTickets)

router.get('/get-by-ticketNo/:ticketNo',passport.authenticate('jwt', {session:false}),getByTicketNo)
router.post('/ask-payment/:ticketNo',passport.authenticate('jwt', {session:false}),askForPayment)
router.post('/create-order/:ticketNo',passport.authenticate('jwt', {session:false}),createOrder)
router.post('/upload-asked-documents/:ticketNo',passport.authenticate('jwt', {session:false}), upload.any('files'), uploadAskedDocs)

module.exports = router
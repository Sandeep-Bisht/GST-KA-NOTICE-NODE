const router = require("express").Router()

const { getAllTickets, getByTicketNo, askForPayment, uploadAskedDocs, createOrder, verifyPayment, failedPayment, removeOtherDocuments, getAllTicketsForDashboard, requestDocuments, uploadRequestedDocuments} = require('./ticket')
const passport = require("passport")
const upload = require('../../config/multer')

router.get('/get-all-tickets',passport.authenticate('jwt', {session:false}),getAllTickets);
router.get('/get-all-tickets-dashboard',passport.authenticate('jwt', {session:false}),getAllTicketsForDashboard)

router.get('/get-by-ticketNo/:ticketNo',passport.authenticate('jwt', {session:false}),getByTicketNo)
router.post('/document-requested/:ticketNo',passport.authenticate('jwt', {session:false}),requestDocuments)
router.post('/upload-document-requested/:ticketNo',passport.authenticate('jwt', {session:false}), upload.any('files'), uploadRequestedDocuments)
router.post('/ask-payment/:ticketNo',passport.authenticate('jwt', {session:false}),askForPayment)
router.post('/create-order/:ticketNo',passport.authenticate('jwt', {session:false}),createOrder)
router.post('/payment/verify',passport.authenticate('jwt', {session:false}),verifyPayment)
router.post('/payment/failed',passport.authenticate('jwt', {session:false}),failedPayment)
router.post('/upload-asked-documents/:ticketNo',passport.authenticate('jwt', {session:false}), upload.any('files'), uploadAskedDocs)
router.post('/remove-other-documents/:ticketNo',passport.authenticate('jwt', {session:false}), removeOtherDocuments);


module.exports = router
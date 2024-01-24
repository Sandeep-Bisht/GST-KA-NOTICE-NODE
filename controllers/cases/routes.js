const router = require("express").Router()

const { getAllCases, getByCaseNo, replyDocument} = require('./cases')
const passport = require("passport")
const upload = require('../../config/multer')

router.get('/get-all-cases',passport.authenticate('jwt', {session:false}),getAllCases)
router.get('/get-by-caseNo/:caseNo',passport.authenticate('jwt', {session:false}),getByCaseNo)
router.post('/reply-document/:caseNo',passport.authenticate('jwt', {session:false}), upload.any('files'), replyDocument)

module.exports = router
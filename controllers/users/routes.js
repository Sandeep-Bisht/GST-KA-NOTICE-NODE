const router = require("express").Router()

const { createTicket } = require('./tickets')
const { getProfile, setProfile, getAllUsers, getRecentUsers } = require('./index')
const passport = require("passport")
const upload = require('../../config/multer')

router.post('/create-ticket',passport.authenticate('jwt', {session:false}), upload.fields([{name: 'document'}]), createTicket);
router.post('/setProfile',passport.authenticate('jwt',{session:false}),upload.any('files'),setProfile)
router.get('/getProfile',passport.authenticate('jwt',{session:false}),getProfile)
router.get('/get-all-users', passport.authenticate('jwt', {session:false}), getAllUsers);
router.get('/get-recent-users', passport.authenticate('jwt', {session:false}), getRecentUsers);

module.exports = router
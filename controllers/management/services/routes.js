const router = require("express").Router()

const upload = require('../../../config/multer')
const {createService, getAllServices} = require("./index")
const passport = require("passport")

router.get('/get-all-services', passport.authenticate('jwt', {session:false}), getAllServices)
router.post('/create-service', passport.authenticate('jwt', {session:false}), upload.fields([{name: 'featuredImage'}, {name : 'featuredIcon'}]),createService)
module.exports = router


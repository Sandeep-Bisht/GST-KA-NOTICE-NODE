const router = require("express").Router()

const upload = require('../../../config/multer')
const {createService, getAllServices, deleteServiceById, updateServiceById, getServicesById} = require("./index")
const passport = require("passport")

router.get('/get-all-services', passport.authenticate('jwt', {session:false}), getAllServices)
router.post('/create-service', passport.authenticate('jwt', {session:false}), upload.fields([{name: 'featuredImage'}, {name : 'featuredIcon'}]),createService);
router.get('/get-service-by-id/:_id', passport.authenticate('jwt', {session:false}), getServicesById)
router.delete('/delete-service-by-id/:_id', passport.authenticate('jwt', {session:false}), deleteServiceById);
router.post('/update-service-by-id/:_id', passport.authenticate('jwt', {session:false}), upload.fields([{name: 'updatedFeaturedImage'}, {name : 'updatedFeaturedIcon'}]), updateServiceById)
module.exports = router


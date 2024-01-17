const router = require("express").Router()

const upload = require('../../../config/multer')
const {createService, getAllServices} = require("./index")

router.get('/get-all-services',getAllServices)
router.post('/create-service',upload.fields([{name: 'featuredImage'}, {name : 'featuredIcon'}]),createService)
module.exports = router


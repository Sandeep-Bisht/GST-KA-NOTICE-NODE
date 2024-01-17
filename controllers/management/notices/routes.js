const router = require("express").Router()

const upload = require('../../../config/multer')
const {createNotice, getAllNotices} = require("./index")

router.get('/get-all-notices',getAllNotices)
router.post('/create-notice',upload.fields([{name: 'featuredImage'}]),createNotice)
module.exports = router


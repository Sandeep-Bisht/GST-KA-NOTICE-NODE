const router = require("express").Router()

const upload = require('../../../config/multer')
const {createNotice, getAllNotices, getNoticeBySeoTitle} = require("./index")
const passport = require("passport")

router.get('/get-all-notices',getAllNotices)
router.post('/create-notice',passport.authenticate('jwt', {session:false}), upload.fields([{name: 'featuredImage'}, {name : 'featuredIcon'}]),createNotice)
router.get('/get-notice-by-seo-title/:seo_title', getNoticeBySeoTitle)
module.exports = router


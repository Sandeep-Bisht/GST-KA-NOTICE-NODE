const passport = require("passport")
const router = require("express").Router()

const  blogs  = require('./index')
const upload = require('../../../config/multer')


router.post('/blog-create',passport.authenticate('jwt',{session:false}),upload.any('files'),blogs.create)
router.get('/all_blogs',blogs.get_all_blog);
router.post('/get_blog_by_id',blogs.get_blog_by_id)
router.post('/create-blog-category', passport.authenticate('jwt',{session:false}),upload.any('files'),blogs.create_categorie);
router.get('/get_all_blog_categories', blogs.get_all_blog_categories);
router.get('/get_category_by_id/:category_id',blogs.getBlogCategoryById)
router.post('/update_blog_by_id/:_id',passport.authenticate('jwt',{session:false}),upload.any('files'), blogs.update_Blog_by_id) 
router.delete('/delete_blog_by_id/:_id', passport.authenticate('jwt',{session:false}),upload.any('files'), blogs.delete_Blog_by_id);
router.get('/get_blog_by_slug/:slug',blogs.get_blog_by_slug)

module.exports = router
 
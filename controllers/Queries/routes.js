const passport = require("passport")
const router = require("express").Router()

const  queries  = require('./queries')

router.post('/submit-query',queries.create)
router.get('/all_queries',passport.authenticate('jwt',{session:false}),queries.get_all_queries);

module.exports = router
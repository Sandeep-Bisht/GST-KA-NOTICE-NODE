const router = require("express").Router()

const { getAllCases, getByCaseNo} = require('./cases')
const passport = require("passport")

router.get('/get-all-cases',passport.authenticate('jwt', {session:false}),getAllCases)
router.get('/get-by-caseNo/:caseNo',passport.authenticate('jwt', {session:false}),getByCaseNo)

module.exports = router
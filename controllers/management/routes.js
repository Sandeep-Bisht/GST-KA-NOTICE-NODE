const router = require("express").Router()
const ServicesRoute = require('./services/routes')
const NoticesRoute = require("./notices/routes")

router.use('/services',ServicesRoute);
router.use('/notices',NoticesRoute);

module.exports = router
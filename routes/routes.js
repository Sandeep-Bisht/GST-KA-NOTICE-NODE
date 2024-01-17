const router = require("express").Router()
const ManagementRouter = require('../controllers/management/routes')

router.use('/management',ManagementRouter);

module.exports = router
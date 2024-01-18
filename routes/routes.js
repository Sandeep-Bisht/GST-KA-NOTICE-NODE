const router = require("express").Router()
const ManagementRouter = require('../controllers/management/routes')
const AuthRoutes = require('../controllers/Auth/routes')

router.use('/management',ManagementRouter);
router.use('/auth',AuthRoutes);

module.exports = router
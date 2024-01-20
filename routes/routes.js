const router = require("express").Router()
const ManagementRouter = require('../controllers/management/routes')
const AuthRoutes = require('../controllers/Auth/routes')
const UserRoutes = require('../controllers/users/routes')

router.use('/management',ManagementRouter);
router.use('/auth',AuthRoutes);
router.use('/user',UserRoutes);

module.exports = router
const router = require("express").Router()
const ManagementRouter = require('../controllers/management/routes')
const AuthRoutes = require('../controllers/Auth/routes')
const UserRoutes = require('../controllers/users/routes')
const BlogRoutes = require("../controllers/management/blog/routes");

router.use('/management',ManagementRouter);
router.use('/auth',AuthRoutes);
router.use('/user',UserRoutes);


router.use('/blog', BlogRoutes);

module.exports = router
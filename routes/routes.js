const router = require("express").Router()
const ManagementRouter = require('../controllers/management/routes')
const AuthRoutes = require('../controllers/Auth/routes')
const UserRoutes = require('../controllers/users/routes')
const BlogRoutes = require("../controllers/management/blog/routes");
const TicketRoutes = require('../controllers/tickets/routes');
const CasesRoutes = require('../controllers/cases/routes');
const PaymentRoutes = require('../controllers/Payment/routes')
const QueryRoutes = require('../controllers/Queries/routes')

router.use('/management',ManagementRouter);
router.use('/auth',AuthRoutes);
router.use('/user',UserRoutes);
router.use('/tickets',TicketRoutes);
router.use('/cases',CasesRoutes);
router.use('/payment', PaymentRoutes);
router.use('/queries',QueryRoutes);


router.use('/blog', BlogRoutes);

module.exports = router
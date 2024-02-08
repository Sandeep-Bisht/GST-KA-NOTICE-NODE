const UserRole = require("../../models/user_roles");
const Payment = require("../../models/payments");
const Profile = require("../../models/profile");
const Tickets = require("../../models/tickets");

// Replace with your Razorpay API key and secret

exports.getAllPayments = async (req, res) => {
  try {
    const user = await UserRole.findOne({ user_id: req.user._id }).select(
      "role_id"
    );

    if (!user || !user.role_id) {
      return res.status(401).json({
        error: true,
        message: "Unautherized user role.",
      });
    }

    if (user.role_id != process.env.ROLE_ADMIN) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized User",
      });
    }

    let allPayments = await Payment.find();
    const referenceIds = Array.from(
      new Set(allPayments.map((payment) => payment.reference_id.toString()))
    );
    const tickets = await Tickets.find({ _id: { $in: referenceIds } });
    const ticketMap = {};
    tickets.forEach((ticket) => {
      ticketMap[ticket._id.toString()] = ticket;
    });
    const uniqueserIds = Array.from(
      new Set(allPayments.map((payment) => payment.user_id.toString()))
    );
    const userData = await Profile.find({ user_id: { $in: uniqueserIds } });

    const userMap = {};
    userData.forEach((user) => {
      userMap[user.user_id.toString()] = user;
    });


    allPayments = allPayments.map((payment) => {
      const userData = userMap[payment.user_id.toString()];
      const ticketData = ticketMap[payment.reference_id.toString()];
      return {
        ...payment.toObject(),
        ticketData: ticketData,
        user_data: userData, // Add user_data field to the payment with the corresponding user data
      };
    });

    if (!allPayments) {
      res.status(200).json({
        error: true,
        message: "Please try again",
      });
    } else {
      res.status(200).json({
        error: false,
        data: allPayments,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Something went wrong",
    });
  }
};

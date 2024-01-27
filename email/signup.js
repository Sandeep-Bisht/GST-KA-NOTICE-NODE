const {signature} = require('./common')

const signupTemplate = ({fullname,otp}) =>{
    return `
    <p>Dear ${fullname},</p>
    <p>We hope this email finds you well. As part of our ongoing commitment to ensuring the security of your account, we have initiated a verification process for your login. To proceed, please use the following One-Time Password (OTP):</p>
    <p>
    Your OTP: <b>${otp}</b>
    </p>
    <p>
    Please enter this OTP on the login page when prompted. It is crucial to keep your account secure, and the OTP serves as an additional layer of protection.</p>
    <p>
    If you did not request this OTP or if you have any concerns about the security of your account, please contact our support team immediately at <b>help@gstkanotice.com</b> or call us at <b>+91 7817010434</b>
    Thank you for your cooperation in keeping your account safe.
    </p>
    ${signature}
    `;
}

module.exports = signupTemplate;
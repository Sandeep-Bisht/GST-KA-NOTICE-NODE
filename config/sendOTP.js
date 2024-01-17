const axios = require('axios');

async function sendOTP(flowID, otp, mobile) {
  const MSG91_API_KEY = process.env.MSG91_AUTH_KEY;

  const url = process.env.MSG91_API_URL;
  const payload = {
    template_id: flowID,
    recipients: [
      {
        mobiles: `91${mobile}`,
        otp,
      },
    ],
  };

  const config = {
    method: 'post',
    url,
    data: payload,
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authkey': MSG91_API_KEY,
    },
  };

  try {
    const response = await axios(config);
    return 'Message sent successfully: ' + JSON.stringify(response.data);
  } catch (error) {
    return 'Failed to send SMS: ' + error.response.data;
  }
}

module.exports = sendOTP;

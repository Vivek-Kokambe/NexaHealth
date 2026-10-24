const emailjs = require("@emailjs/nodejs");

emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

const sendOtpEmail = async (email, otp, expiryTime) => {

  const templateParams = {
    email: email,
    passcode: otp,
    time: expiryTime,
  };

  try {

    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log("EmailJS SUCCESS:", response.status, response.text);

    return response;

  } catch (error) {

    console.error("EmailJS ERROR:", error);

    throw error;
  }
};

module.exports = {
  sendOtpEmail,
};
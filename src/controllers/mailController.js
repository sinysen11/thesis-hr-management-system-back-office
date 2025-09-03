const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, EMAIL_USER } = process.env;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function createTransporter() {
  const accessTokenObj = await oAuth2Client.getAccessToken();
  const accessToken = accessTokenObj?.token || accessTokenObj;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: EMAIL_USER,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken,
    },
  });
}

async function sendLeaveRequestMail({ staffEmail, staffName, approverEmail, leaveDate, reason }) {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `${staffName} via Leave System <${EMAIL_USER}>`,
    replyTo: staffEmail,
    to: approverEmail,
    subject: `Leave Request from ${staffName}`,
    text: `
      Dear Approver,

      ${staffName} (${staffEmail}) has submitted a leave request.

      Date: ${leaveDate}
      Reason: ${reason}

      Please log in to the system to review.

      Best regards,
      Leave Management System
    `,
  };

  return transporter.sendMail(mailOptions);
}

async function sendLeaveResponseMail({ staffEmail, staffName, approverName, leaveDate, status, reason }) {
  const transporter = await createTransporter();

  const mailOptions = {
    from: `${approverName} via Leave System <${EMAIL_USER}>`,
    to: staffEmail,
    subject: `Your Leave Request has been ${status}`,
    text: `
      Dear ${staffName},

      Your leave request for ${leaveDate} has been ${status.toLowerCase()} by ${approverName}.

      Reason: ${reason || "N/A"}

      Please log in to the system for more details.

      Best regards,
      Leave Management System
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendLeaveRequestMail, sendLeaveResponseMail };
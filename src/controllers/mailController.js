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

async function sendApplyJobMail(applicant_mail) {
  const transporter = await createTransporter();

  const mailOptions = {
    from: EMAIL_USER,
    to: applicant_mail,
    subject: 'SunFlex Cambodia Career',
    text: `
      Dear Applicant,

      Thanks for your interest in vacacy position in SunFlex (Cambodia) Co., Ltd.
      This is a confirmation that we have recieved your application. Our Human Resource team is reviewing your application and you will be contacted if you are qualified with position that have applied.
      Otherwish, we will keep your application in our database for further opportunity arises which fits your credentials and experience.
      We wish you all the best in your career and future endeavor.

      Best regards,
      Human Resources & Training
    `,
  };
  return transporter.sendMail(mailOptions);
}

async function sendForgotPasswordMail({ email, resetLink }) {
  const transporter = await createTransporter();

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    text: `
      Dear User,

      We received a request to reset your password.
      Please click the link below to set a new password:

      ${resetLink}

      If you did not request this, please ignore this email.

      Best regards,
      SunFlex Cambodia Team
    `,
  };

  return transporter.sendMail(mailOptions);
}

async function sendResetPasswordConfirmationMail({ email }) {
  const transporter = await createTransporter();

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Your Password Has Been Changed",
    text: `
      Dear User,

      This is a confirmation that your password has been successfully changed.

      If you did not perform this action, please contact our support immediately.

      Best regards,
      SunFlex Cambodia Team
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendLeaveRequestMail, sendLeaveResponseMail, sendApplyJobMail, sendForgotPasswordMail, sendResetPasswordConfirmationMail };
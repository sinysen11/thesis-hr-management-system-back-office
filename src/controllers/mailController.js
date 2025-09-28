const nodemailer = require("nodemailer");

const { EMAIL_USER, EMAIL_PASS } = process.env;

async function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
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

      Thanks for your interest in vacancy position in SunFlex (Cambodia) Co., Ltd.
      This is a confirmation that we have received your application. Our Human Resource team is reviewing your application and you will be contacted if you are qualified for the position applied.
      Otherwise, we will keep your application in our database for further opportunity arises which fits your credentials and experience.
      We wish you all the best in your career and future endeavor.

      Best regards,
      Human Resources & Training
    `,
  };
  return transporter.sendMail(mailOptions);
}

async function sendForgotPasswordMail({ email, resetLink }) {
  console.log(email)
  const transporter = await createTransporter();

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    text: `
      Dear User,

      We received a request to reset your password.
      Please use the following link to set a new password:

      ${resetLink}

      If you did not request this, please ignore this email.

      Best regards,
      SunFlex Cambodia Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Dear User,</p>
        <p>We received a request to reset your password.</p>
        <p>Please click the button below to set a new password:</p>
        <p style="margin: 20px 0;">
          <a href="${resetLink}" target="_blank"
             style="background-color: #1a73e8; color: #fff; padding: 12px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>SunFlex Cambodia Team</p>
      </div>
    `
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

module.exports = { 
  sendLeaveRequestMail, 
  sendLeaveResponseMail, 
  sendApplyJobMail, 
  sendForgotPasswordMail, 
  sendResetPasswordConfirmationMail 
};

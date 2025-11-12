import { transport, sender } from "./mail.config.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplate.js";

// Send Verification Email (OTP)
export const sendVerificationEmail = async (email, verificationCode) => {
  if (!email) throw new Error("Missing recipient email");

  const html = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    verificationCode
  );

  try {
    const response = await transport.sendMail({
      from: `${sender.name} <${sender.address}>`,
      to: email,
      subject: "Verify Your Email Address",
      html,
    });
    console.log("Verification email sent:", response.messageId);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error(`Verification email failed: ${error.message}`);
  }
};

// Send Welcome Email After Verification
export const sendWelcomeEmail = async (email, name) => {
  if (!email) throw new Error("Missing recipient email");

  const html = `
    <div style="font-family:Arial,sans-serif;padding:20px;text-align:center">
      <h2>Welcome, ${name}</h2>
      <p>We're glad to have you on board. Start exploring our app now.</p>
      <a href="${process.env.CLIENT_URL}" style="padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;">Go to Dashboard</a>
      <p style="color:#777;margin-top:20px;">Auth App Team</p>
    </div>
  `;

  try {
    const response = await transport.sendMail({
      from: `${sender.name} <${sender.address}>`,
      to: email,
      subject: "Welcome to Our App",
      html,
    });
    console.log("Welcome email sent:", response.messageId);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw new Error(`Welcome email failed: ${error.message}`);
  }
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (email, resetURL) => {
  if (!email) throw new Error("Missing recipient email");

  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);

  try {
    const response = await transport.sendMail({
      from: `${sender.name} <${sender.address}>`,
      to: email,
      subject: "Password Reset Request",
      html,
    });
    console.log("Password reset email sent:", response.messageId);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error(`Password reset email failed: ${error.message}`);
  }
};

// Send Password Reset Success Email
export const sendPasswordResetSuccessEmail = async (email) => {
  if (!email) throw new Error("Missing recipient email");

  try {
    const response = await transport.sendMail({
      from: `${sender.name} <${sender.address}>`,
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });
    console.log("Password reset success email sent:", response.messageId);
  } catch (error) {
    console.error("Failed to send password reset success email:", error);
    throw new Error(`Password reset success email failed: ${error.message}`);
  }
};

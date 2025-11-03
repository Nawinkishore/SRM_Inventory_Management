import { transport, sender } from "./mailtrap.config.js";
import { VERIFICATION_EMAIL_TEMPLATE ,PASSWORD_RESET_REQUEST_TEMPLATE ,PASSWORD_RESET_SUCCESS_TEMPLATE} from "./emailTemplate.js";
// ...existing code...
export const sendVerificationEmail = async (email, verificationToken) => {
  if (!email) throw new Error("Missing recipient email");

  const html = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    verificationToken
  );

  try {
    const response = await transport.sendMail({
      // nodemailer accepts either a string "Name <email@domain>" or an object { name, address }
      from: `${sender.name} <${sender.address}>`,
      to: email, // send a single recipient as a string to satisfy Mailtrap normalizer
      subject: "Verify Your Email Address",
      html,
      category: "User Verification",
    });

    console.log("Verification email sent:", response);
  } catch (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};
// ...existing code...

export const sendWelcomeEmail = async (email, name) => {
  const recipients = email;
  if (!recipients) {
    throw new Error("Missing recipient email");
  }
  try {
    const response = await transport.sendMail({
      from: `${sender.name} <${sender.address}>`,
      to: recipients,
      subject: "Welcome to Our App!",
      templateUuid: "5d2b87ee-47bc-48bf-87cc-e6f04f38119c",
      templateVariables: {
        first_name: name,
        company_info_name: "Auth Company",
      },
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
    
  }
};


export const sendPasswordResetEmail = async (email, resetURL) => {
  if (!email) throw new Error("Missing recipient email");
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace(
    "{resetURL}",
    resetURL
  );
  try{
    const response = await transport.sendMail({
      from: `${sender.name} <${sender.address}>`,
      to: email,
      subject: "Password Reset Request",
      html:html,
      category: "Password Reset",
    });
  }
  catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

export const sendPasswordResetSuccessEmail = async (email) => {
  if (!email) throw new Error("Missing recipient email");

  const html = PASSWORD_RESET_SUCCESS_TEMPLATE
  try {
    const response = await transport.sendMail({
      from: `${sender.name} <${sender.address}>`,
      to: email,
      subject: "Password Reset Successful",
      html,
      category: "Password Reset",
    });
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    throw new Error(`Failed to send password reset success email: ${error.message}`);
  }
};
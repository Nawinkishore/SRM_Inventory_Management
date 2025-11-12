import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config(); 

export const transport = nodemailer.createTransport({
  service: "gmail", // automatically uses smtp.gmail.com
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sender = {
  name: "SRM Motors Support Team",
  address: process.env.EMAIL_USER,
};

// Verify transporter
transport.verify((error, success) => {
  if (error) {
    console.error("Email server connection failed:", error);
  } else {
    console.log("Email server is ready to send messages.");
  }
});

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // app password
  },
});

export const sendMail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: `"WONO Nomads" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

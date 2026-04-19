import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  const host = process.env.ALI_SMTP_HOST || "smtpdm.aliyun.com";
  const port = parseInt(process.env.ALI_SMTP_PORT || "25", 10);
  const user = process.env.ALI_SMTP_USER;
  const pass = process.env.ALI_SMTP_PASS;
  const nickname = process.env.ALI_SMTP_NICKNAME || "noreply";

  const transporter = nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass,
    },
  });

  const options = {
    from: `${nickname}<${user}>`,
    to,
    subject,
    html: body,
  };

  try {
    const testResult = await transporter.verify();
    console.log("SMTP server is ready to take messages:", testResult);
  } catch (error) {
    console.error("Error connecting to SMTP server:", error);
    return;
  }

  try {
    const sendResult = await transporter.sendMail(options);
    console.log("Message sent: " + sendResult.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

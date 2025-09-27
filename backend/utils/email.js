const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `OrderIt <${process.env.EMAIL_FROM}>`;
  }

  // 📌 Tạo transporter để gửi mail
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // 📌 Hàm gửi email chung (template, subject)
  async send(template, subject) {
    // 1) Render HTML dựa vào template pug
    const html = pug.renderFile(
        `${__dirname}/../view/${template}.pug`,
        {
          firstName: this.firstName,
          url: this.url,
          subject,
        }
    );

    // 2) Các option của email
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html), // bản text thuần
    };

    // 3) Gửi mail
    await this.newTransport().sendMail(mailOptions);
  }

  // 📩 Gửi mail welcome
  async sendWelcome() {
    await this.send("welcome", "Welcome to the Order It!");
  }

  // 🔑 Gửi mail reset password
  async sendPasswordReset() {
    await this.send(
        "passwordReset",
        "Your password reset token (valid for only 10 minutes)"
    );
  }
}

module.exports = Email;

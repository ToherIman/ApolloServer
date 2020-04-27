const sgMail = require("@sendgrid/mail");
const { generateToken } = require("./users");

class Mail {
  async sendEmail({ userId, name, email, reason }) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const token = await generateToken(userId, name);
    const link = `url/${reason}?${token}`; //action url

    const mailOptions = {
      to: email,
      from: "email", //real email
      subject: `${reason} email`,
      text: `Please click this link to ${reason} email ${link}`,
      html: `<strong>Please click this link to ${reason} email ${link}</strong>`,
    };

    try {
      const mail = await sgMail.send(mailOptions);
      return true;
    } catch (e) {
      throw new Error(`send mail ${e}`);
    }
  }
}

module.exports.Mail = Mail;
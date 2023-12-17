const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmailController = asyncHandler(async (data, req, res) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    // port: 587,
    // secure: false,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `"Hey from 👻" ${process.env.EMAIL} `, // sender address
    to: data.to, // list of receivers
    subject: data.subject, // Subject line
    text: data.text, // plain text body
    html: data.htm, // html body
  });
});

module.exports = sendEmailController;

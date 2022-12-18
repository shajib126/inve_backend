const nodemailer = require('nodemailer')

const sendEmail = async(subject,message,send_to,sent_from,reply_to)=>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 2525,
        auth: {
          user: "425b464848f0fc",
          pass: "0214f8a548c76b"
        }
      });
      const option = {
        from:sent_from,
        to:send_to,
        replyTo:reply_to,
        html:message
      }

      transporter.sendMail(options, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          console.log(info);
        }
      });
}


module.exports = sendEmail
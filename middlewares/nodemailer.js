var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'akme.africa15@gmail.com',
        pass: process.env.MAILER_PASS
    }
});
module.exports = transporter;

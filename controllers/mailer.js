var nodemailer = require('nodemailer');

// Create the transporter with the required configuration for Outlook
// change the user and pass !
var transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
       ciphers:'SSLv3'
    },
    auth: {
        user: 'cethostelmanagement@outlook.com',
        pass: 'finalproject+7876'
    },
    from: 'cethostelmanagement@outlook.com'
});

// // setup e-mail data, even with unicode symbols
// var mailOptions = {
//     from: 'cethostelmanagement@outlook.com', // sender address (who sends)
//     to: 'athulnkumar1999@gmail.com', // list of receivers (who receives)
//     subject: 'Hello ', // Subject line
//     text: 'Hello world ', // plaintext body
//     html: '<b>Hello world </b><br> This is the first email sent with Nodemailer in Node.js' // html body
// };

// // send mail with defined transport object
// transporter.sendMail(mailOptions, function(error, info){
//     if(error){
//         return console.log(error);
//     }

//     console.log('Message sent: ' + info.response);
// });

module.exports = {transporter}

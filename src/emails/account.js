const mailgun = require('mailgun-js')
const DOMAIN = 'sandbox3b6062b7588b40f9b556744e405018e6.mailgun.org';
const mg = mailgun({apiKey: process.env.SEND_MAIL, domain: DOMAIN});

const sendWelcomeEmail = (email,name) => {
    const data = {
        from: 'Excited User <mail@gmail.com>',
        to: email,
        subject: 'Thanks for joining in !',
        text: `Welcome to the , ${name} . Let me know how you get along with the app`
    };
    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
}

module.exports = {
    sendWelcomeEmail
}
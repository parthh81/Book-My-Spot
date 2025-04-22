const mailer = require('nodemailer');

const sendingMail = async (to, subject, text) => {
    try {
        console.log("Recipient:", to); // Check if the email is set

        const transporter = mailer.createTransport({
            service: 'gmail',
            auth: {
                user: "parththakkar5555@gmail.com",
                pass: "bstw pucp fdvv azhj"// Use App Password if needed
            },
        });

        const mailOptions = {
            from: "parththakkar5555@gmail.com",
            to: to,
            subject: subject,
            html: text
        };

        const mailresponse = await transporter.sendMail(mailOptions);
        console.log("Email sent:", mailresponse);
        return mailresponse;
    } catch (error) {
        console.error("Error sending email:", error);
        return error;
    }
};

module.exports = {
    sendingMail 
}
//sendingMail("parthh84@gmail.com","Test","This is a test mail")
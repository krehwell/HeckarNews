const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const config = require("../../config.js");

const mailgunAuth = {
    auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: "sandboxb04a40fa97f64c278312516f194ccb02.mailgun.org",
    },
};

const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));

const resetPasswordTemplate = fs.readFileSync(
    path.join(__dirname, "/templates/resetPassword.hbs"),
    "utf8"
);

const changePasswordNotificationTemplate = fs.readFileSync(
    path.join(__dirname, "/templates/changePasswordNotification.hbs"),
    "utf8"
);

module.exports = {
    sendResetPasswordEmail: (username, token, email, callback) => {
        const template = handlebars.compile(resetPasswordTemplate);
        const baseWebsiteUrl =
            process.env.NODE_ENV === "development"
                ? "http://localhost:3000"
                : config.productionWebsiteURL;

        const htmlToSend = template({
            username: username,
            resetUrl: `${baseWebsiteUrl}/reset?username=${username}&token=${token}`,
        });

        const mailOptions = {
            from: "HeckarNews <me@krehwell.com>",
            to: email,
            subject: "HeckarNews Password Recovery",
            html: htmlToSend,
        };

        smtpTransport.sendMail(mailOptions, (error, _response) => {
            if (error) {
                callback({ success: false });
            } else {
                callback({ success: true });
            }
        });
    },

    sendResetPasswordEmail: (username, email, callback) => {
        const template = handlebars.compile(changePasswordNotificationTemplate);
        const htmlToSend = template({ username: username });

        const mailOptions = {
            from: "HeckarNews <me@krehwell.com>",
            to: email,
            subject: "HeckarNews Password Recovery",
            html: htmlToSend,
        };

        smtpTransport.sendMail(mailOptions, (error, _response) => {
            if (error) {
                callback({ success: false });
            } else {
                callback({ success: true });
            }
        });
    },
};

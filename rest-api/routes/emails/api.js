const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const config = require("../../config.js");

/// EMAIL CONFIG
const mailgunAuth = {
    auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: "sandboxb04a40fa97f64c278312516f194ccb02.mailgun.org",
    },
};

const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));

/// EMAIL TEMPLATE
const resetPasswordTemplate = fs.readFileSync(
    path.join(__dirname, "/templates/resetPassword.hbs"),
    "utf8"
);

const changePasswordNotificationTemplate = fs.readFileSync(
    path.join(__dirname, "/templates/changePasswordNotification.hbs"),
    "utf8"
);

const changeEmailNotificationTemplate = fs.readFileSync(
    path.join(__dirname, "/templates/changeEmailNotification.hbs"),
    "utf8"
);

/// SEND EMAIL API
module.exports = {
    sendResetPasswordEmail: async (username, token, email) => {
        const template = handlebars.compile(resetPasswordTemplate);
        const baseWebsiteUrl =
            process.env.NODE_ENV === "development"
                ? "http://localhost:3000"
                : config.productionWebsiteURL;

        const htmlToSend = template({
            username: username,
            resetUrl: `${config.productionWebsiteUrl}/reset?username=${username}&token=${token}`,
        });

        const mailOptions = {
            from: "HeckarNews <me@krehwell.com>",
            to: email,
            subject: "HeckarNews Password Recovery",
            html: htmlToSend,
        };

        try {
            const sendEmail = await smtpTransport.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            throw { success: false };
        }
    },

    sendChangePasswordNotificationEmail: async (username, email) => {
        const template = handlebars.compile(changePasswordNotificationTemplate);
        const htmlToSend = template({ username: username });

        const mailOptions = {
            from: "HeckarNews <me@krehwell.com>",
            to: email,
            subject: "Password changed for " + username,
            html: htmlToSend,
        };

        try {
            const sendEmail = await smtpTransport.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            // throw { success: false };
        }
    },

    sendChangeEmailNotificationEmail: async (username, email, actionType) => {
        const template = handlebars.compile(changeEmailNotificationTemplate);

        const htmlToSend = template({
            username: username,
            actionType: actionType,
        });

        const mailOptions = {
            from: "HeckarNews <me@krehwell.com>",
            to: email,
            subject: "Email address changed for " + username,
            html: htmlToSend,
        };

        try {
            const sendEmail = await smtpTransport.sendMail(mailOptions);
            return { success: true };
        } catch (error) {
            // throw { success: false };
        }
    },
};

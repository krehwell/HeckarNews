const moment = require("moment");
const linkifyUrls = require("linkify-urls");
const xss = require("xss");

const utils = require("../utils.js");
const config = require("../../config.js");

const UserModel = require("../../models/user.js");
const emailApi = require("../emails/api.js");

/// USER API
module.exports = {
    createNewUser: async (username, password) => {
        if (username.length < 2 || password.length > 15) {
            throw { usernameLengthError: true };
        } else if (password.length < 8) {
            throw { passwordLengthError: true };
        } else {
            const userExist = await UserModel.findOne({ username }).exec();

            if (userExist) {
                throw { alreadyExistUser: true };
            }

            // create new user
            const authTokenString = utils.generateUniqueId(40);
            const authTokenExpirationTimestamp =
                moment().unix() +
                86400 * config.userCookieExpirationLengthInDays;

            const newUserDoc = new UserModel({
                username,
                password,
                authToken: authTokenString,
                authTokenExpiration: authTokenExpirationTimestamp,
                created: moment().unix(),
            });

            const newUser = await newUserDoc.save();
            return {
                success: true,
                username,
                authToken: authTokenString,
                authTokenExpirationTimestamp,
            };
        }
    },

    loginUser: async (username, password) => {
        const user = await UserModel.findOne({ username }).exec();

        if (!user) {
            throw { credentialError: true };
        }

        const passwordIsMatch = await user.comparePassword(password);

        if (!passwordIsMatch) {
            throw { credentialError: true };
        }

        if (user.banned) {
            throw { bannedError: true };
        }

        // renew user token
        const authTokenString = utils.generateUniqueId(40);
        const authTokenExpirationTimestamp =
            moment().unix() + 86400 * config.userCookieExpirationLengthInDays;

        user.authToken = authTokenString;
        user.authTokenExpiration = authTokenExpirationTimestamp;

        await user.save();

        return {
            success: true,
            username: username,
            authToken: authTokenString,
            authTokenExpirationTimestamp: authTokenExpirationTimestamp,
        };
    },

    /**
     * Step 1 - Query the database for any users that match the username function parameter.
     *          If the user is not found, an unsuccessful response will be sent back to the website.
     * Step 2 - Compare the authentication token function parameter to what's stored in the database.
     *          If the tokens don't match, an unsuccessful response will be sent back to the website.
     * Step 3 - Validate that the authentication token has not expired.
     *          If the token has expired, an unsuccessful response will be sent back to the website.
     * Step 4 - If successful, return a success response to the website.
     * The response should also include the following data about the user to be used on the website:
     *          1. User's username.
     *          2. User's karma count.
     *          3. Boolean value representing whether or not the user has an email added to their account or not.
     *          4. Boolean value representing whether or not the user wants to see dead submissions and comments.
     */
    authenticateUser: async (username, authToken) => {
        const user = await UserModel.findOne({ username: username })
            .lean()
            .exec();

        if (
            !user ||
            authToken !== user.authToken ||
            moment().unix() > user.authTokenExpiration
        ) {
            throw { success: false };
        }

        if (user.banned) {
            throw { success: false, banned: true };
        }

        return {
            success: true,
            username: user.username,
            karma: user.karma,
            containsEmail: user.email ? true : false,
            showDead: user.showDead ? true : false,
            isModerator: user.isModerator ? true : false,
            shadowBanned: user.shadowBanned ? true : false,
        };
    },

    removeUserAuthData: async (authUser) => {
        const user = await UserModel.findOneAndUpdate(
            { username: authUser.username },
            { authToken: null, authTokenExpiration: null }
        )
            .lean()
            .exec();

        if (!user) {
            throw { success: false };
        }

        return { success: true };
    },

    /**
     * Step 1 - Query the database for a user with the given username.
     *          Return an error if the user is not found.
     *          Return an error if the user doesn't have an email added to their account.
     * Step 2 - Generate a reset password token and expiration date for the user.
     *          The reset password token will be a randomly generated string with a length of 40 characters.
     *          The expiration date will be a UNIX timestamp set to 1 hour in the future.
     * Step 3 - Save the token and expiration date to the database.
     * Step 4 - Send an email to the user with the reset password link.
     * Step 5 - Send a success response back to the website.
     */
    requestPasswordResetLink: async (username) => {
        const user = await UserModel.findOne({ username: username }).exec();

        if (!user) {
            throw { userNotFoundError: true };
        } else if (!user.email) {
            throw { noEmailError: true };
        }

        const resetPasswordToken = utils.generateUniqueId(40);
        const resetPasswordTokenExpiration = moment().unix() + 3600;

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordTokenExpiration = resetPasswordTokenExpiration;

        const saveUser = await user.save();
        const sendEmailResponse = await emailApi.sendResetPasswordEmail(
            user.username,
            resetPasswordToken,
            user.email
        );

        if (!sendEmailResponse.success) {
            throw { submitError: true };
        }

        return { success: true };
    },

    /**
     * Step 1 - Query the database for a user with the given username.
     *          An error response will be sent back to the browser if no user is found in the database.
     * Step 2 - Validate the given reset token.
     *          Token needs to possess the following qualities:
     *          Must match the token stored in the database for the user.
     *          Must not have expired.
     * Step 3 - Validate the new password value.
     *          Must be at least 8 characters in length.
     *          An error response will be sent back to the browser if the password is not valid.
     * Step 4 - Save the new password to the database.
     *          Reset token and expiration date will also be removed from the database.
     * Step 5 - Send an email to the user notifying them that their password was changed.
     * Step 6 - Send a success response back to the website.
     */
    resetPassword: async (username, newPassword, resetToken) => {
        const user = await UserModel.findOne({ username: username }).exec();

        if (!user) {
            throw { submitError: true };
        } else if (resetToken !== user.resetPasswordToken) {
            throw { invalidTokenError: true };
        } else if (moment().unix() > user.resetPasswordTokenExpiration) {
            throw { expiredTokenError: true };
        } else if (newPassword.length < 8) {
            throw { passwordLengthError: true };
        }

        // proceed reset user password
        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordTokenExpiration = null;

        await user.save();

        // as long as new pass has been saved then return {success: true}
        if (user.email) {
            await emailApi.sendChangePasswordNotificationEmail(
                user.username,
                user.email
            );
        }
        return { success: true };
    },

    getPublicUserData: async (username, authUserData) => {
        const user = await UserModel.findOne({ username: username })
            .lean()
            .exec();

        if (!user) {
            throw { notFoundError: true };
        }

        return {
            success: true,
            user: {
                username: user.username,
                created: user.created,
                karma: user.karma,
                about: user.about,
                shadowBanned:
                    user.shadowBanned && authUserData.isModerator
                        ? true
                        : false,
                banned: user.banned ? true : false,
            },
        };
    },

    getPrivateUserData: async (username) => {
        const user = await UserModel.findOne({ username: username })
            .lean()
            .exec();

        if (!user) {
            throw { notFoundError: true };
        }

        // change about text to be a plain text
        const aboutText = user.about
            .replace(/<a\b[^>]*>/i, "")
            .replace(/<\/a>/i, "")
            .replace(/<i\b[^>]*>/i, "*")
            .replace(/<\/i>/i, "*");

        return {
            success: true,
            user: {
                username: user.username,
                created: user.created,
                karma: user.karma,
                about: aboutText,
                email: user.email,
                showDead: user.showDead,
            },
        };
    },

    /**
     * Step 1 - Retrieve the user from the database.
     *          If the user is not found, an error will be sent back to the website.
     * Step 2 - Prepare the about text before to saving it to the database.
     *          Will need to do the following:
     *          - Trim extra spaces from the beginning and end of the string.
     *          - Remove all the HTML tags from the string.
     *          - Convert text surrounded in asterisks (*) into italic elements (<i></i>).
     *          - Turn each URL into a <a href=""> element.
     *          - Sanitize the text using an external XSS tool. This is done for security reasons.
     * Step 3 - Validate the inputted email value.
     *          If the inputted email is invalid, it will not be saved to the database.
     * Step 4 - Save the updated user document to the database.
     * Step 5 - If the email was changed or removed, send a notification email to the user.
     * Step 6 - Send back a success response to the website.
     */
    updateUserData: async (username, inputData) => {
        const user = await UserModel.findOne({ username: username });
        if (!user) {
            throw { submitError: true };
        }

        let newAboutText = inputData.about;

        newAboutText = newAboutText.trim();
        newAboutText = newAboutText.replace(/<[^>]+>/g, "");
        newAboutText = newAboutText.replace(/\*([^*]+)\*/g, "<i>$1</i>");
        newAboutText = linkifyUrls(newAboutText);
        newAboutText = xss(newAboutText);

        const oldEmail = user.email;

        const isNewEmailValid = utils.validateEmail(inputData.email);

        user.about = newAboutText;
        user.email = isNewEmailValid ? inputData.email : oldEmail;
        user.showDead = inputData.showDead ? true : false;

        const saveUser = await user.save();

        // as long as new user data has been saved then return {success: true}
        if (oldEmail && oldEmail !== inputData.email) {
            const emailAction = !inputData.email ? "deleted" : "changed";

            const sendEmailResponse = await emailApi.sendChangeEmailNotificationEmail(
                username,
                oldEmail,
                emailAction
            );
        }
        return { success: true };
    },

    /**
     * Step 1 - Find a user in the database with the given username.
     *          If the user is not found, an error response will be sent back to the website.
     * Step 2 - Validate the new password value.
     *          If it's not at least 8 characters in length, an error response will be sent back to the website.
     * Step 3 - Verify that the current password input value matches what's in the database.
     *          To do this, the user.comparePassword() Mongoose schema method will be used.
     *          If they don't match, an error response will be sent back to the website.
     * Step 4 - Save the new password value to the database.
     *          We'll want to also delete the authentication token and expiration date stored in the database for the user.
     *          This will ensure that the user is logged out after making the password change.
     * Step 5 - Send an email notification to the user letting them know that their password was changed.
     * Step 6 - Send a success response back to the website.
     */
    changePassword: async (username, currentPassword, newPassword) => {
        const user = await UserModel.findOne({ username: username }).exec();
        if (!user) {
            throw { submitError: true };
        }

        if (newPassword.length < 8) {
            throw { newPasswordLengthError: true };
        }

        const passwordIsMatch = await user.comparePassword(currentPassword);

        if (!passwordIsMatch) {
            throw { invalidCurrentPassword: true };
        }

        user.password = newPassword;
        user.authToken = null;
        user.authTokenExpiration = null;

        const saveUser = await user.save();

        // as long as pass has been saved then return {success: true}
        if (user.email) {
            const sendEmailResponse = await emailApi.sendChangePasswordNotificationEmail(
                username,
                user.email
            );
        }

        return { success: true };
    },
};

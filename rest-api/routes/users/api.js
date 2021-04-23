const moment = require("moment");

const utils = require("../utils.js");

const config = require("../../config.js");

const UserModel = require("../../models/user.js");

// API FUNCTIONS
module.exports = {
    createNewUser: (username, password, callback) => {
        if (username.length < 2 || password.length > 15) {
            callback({ usernameLengthError: true });
        } else if (password.length < 8) {
            callback({ passwordLengthError: true });
        } else {
            UserModel.findOne({ username }).exec((error, user) => {
                if (error) {
                    callback({ submitError: true });
                } else if (user) {
                    callback({ alreadyExistUser: true });
                } else {
                    // create new user here
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

                    newUserDoc.save((newUserError, newUser) => {
                        if (newUserError) {
                            callback({ submitError: true });
                        } else {
                            callback({
                                success: true,
                                username,
                                authToken: authTokenString,
                                authTokenExpirationTimestamp,
                            });
                        }
                    });
                }
            });
        }
    },

    loginUser: (username, password, callback) => {
        UserModel.findOne({ username }).exec((error, user) => {
            if (error) {
                callback({ submitError: true });
            } else if (!user) {
                callback({ credentialError: true });
            } else {
                user.comparePassword(password, (matchError, isMatch) => {
                    if (matchError) {
                        callback({ submitError: true });
                    } else if (!isMatch) {
                        callback({ credentialError: true });
                    } else {
                        const authTokenString = utils.generateUniqueId(40);
                        const authTokenExpirationTimestamp =
                            moment().unix() +
                            86400 * config.userCookieExpirationLengthInDays;

                        user.authToken = authTokenString;
                        user.authTokenExpiration = authTokenExpirationTimestamp;

                        user.save((saveError) => {
                            if (saveError) {
                                callback({ submitError: true });
                            } else {
                                callback({
                                    success: true,
                                    username: username,
                                    authToken: authTokenString,
                                    authTokenExpirationTimestamp: authTokenExpirationTimestamp,
                                });
                            }
                        });
                    }
                });
            }
        });
    },

    // Step 1 - Query the database for any users that match the username function parameter.
    // If the user is not found, an unsuccessful response will be sent back to the website.

    // Step 2 - Compare the authentication token function parameter to what's stored in the database.
    // If the tokens don't match, an unsuccessful response will be sent back to the website.

    // Step 3 - Validate that the authentication token has not expired.
    // If the token has expired, an unsuccessful response will be sent back to the website.

    // Step 4 - If successful, return a success response to the website.
    // The response should also include the following data about the user to be used on the website:
    // 1. User's username.
    // 2. User's karma count.
    // 3. Boolean value representing whether or not the user has an email added to their account or not.
    // 4. Boolean value representing whether or not the user wants to see dead submissions and comments.
    authenticateUser: (username, authToken, callback) => {
        UserModel.findOne({ username: username })
            .lean()
            .exec((err, user) => {
                if (
                    err ||
                    !user ||
                    authToken !== user.authToken ||
                    moment().unix() > user.authTokenExpiration
                ) {
                    callback({ success: false });
                } else {
                    callback({
                        success: true,
                        username: user.username,
                        karma: user.karma,
                        containsEmail: user.email ? true : false,
                        showDead: user.showDead ? true : false,
                    });
                }
            });
    },
};

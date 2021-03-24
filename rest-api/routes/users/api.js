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
                    const authTokenExpirationTimestamp = moment().unix() + (86400 * config.userCookieExpirationLengthInDays);

                    const newUserDoc = new UserModel({
                        username,
                        password,
                        authToken: authTokenString,
                        authTokenExpiration: authTokenExpirationTimestamp,
                        created: moment().unix()
                    });

                    newUserDoc.save((newUserError, newUser) => {
                        if (newUserError) {
                            callback({ submitError: true });
                        } else {
                            callback({
                                success: true,
                                username,
                                authToken: authTokenString,
                                authTokenExpirationTimestamp
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
                user.comparePassword( password, user.password, (matchError, isMatch) => {
                    if (matchError) {
                        callback({ submitError: true });
                    } else if (!isMatch) {
                        callback({ credentialError: true });
                    } else {
                        // user found here, do something...
                    }
                });
            }
        });
    },
};

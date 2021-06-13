const usersApi = require("../routes/users/api.js");

const config = require("../config.js");

/**
 * Step 1 - Parse the username and authentication tokens from the cookie data inside the request.
 *          Authentication will be deemed unsuccessful if any of that data is missing.
 * Step 2 - Attempt to authenticate the user using the username and authentication token.
 *          We'll use the authenticateUser() function we just created.
 * Step 3 - Handle the result of the authentication request.
 *          Return the following data based on whether or not authentication was a success:
 *          - userSignedIn: boolean value indicating if authentication was successful.
 *          - username: username of the user.
 *          - karma: current karma count for the user.
 *          - containsEmail: boolean value indicating whether or not the user has added an email to their account.
 *          - showDead: boolean indicating if the user has chosen to see dead items and comments.
 *          - If authentication was not successful, those values will be set to either null or false.
 */

module.exports = {
    authUser: async (req, res, next) => {
        try {
            const cookies = req.cookies.user
                ? req.cookies.user.split("&")
                : null;

            const username = cookies ? cookies[0] : "";
            const authToken = cookies ? cookies[1] : "";

            if (cookies) res.locals.cookiesIncluded = true;

            if (!cookies || !username || !authToken) {
                throw { success: false };
            }

            const authResponse = await usersApi.authenticateUser(
                username,
                authToken
            );

            res.locals.userSignedIn = true;
            res.locals.username = authResponse.username;
            res.locals.karma = authResponse.karma;
            res.locals.containsEmail = authResponse.containsEmail;
            res.locals.showDead = authResponse.showDead;
            res.locals.showDownvote =
                authResponse.karma >= config.minimumKarmaToDownvote;
            res.locals.isModerator = authResponse.isModerator;
            res.locals.shadowBanned = authResponse.shadowBanned;
            res.locals.banned = authResponse.banned;

            next();
        } catch (error) {
            res.locals.userSignedIn = false;
            res.locals.username = null;
            res.locals.karma = null;
            res.locals.showDead = false;
            res.locals.showDownvote = false;
            res.locals.banned = error.banned || false;

            next();
        }
    },
};

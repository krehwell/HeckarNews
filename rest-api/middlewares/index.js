const usersApi = require("../routes/users/api.js");

// Step 1 - Parse the username and authentication tokens from the cookie data inside the request.
// Authentication will be deemed unsuccessful if any of that data is missing.

// Step 2 - Attempt to authenticate the user using the username and authentication token.
// We'll use the authenticateUser() function we just created.

// Step 3 - Handle the result of the authentication request.
// Return the following data based on whether or not authentication was a success:
// userSignedIn: boolean value indicating if authentication was successful.
// username: username of the user.
// karma: current karma count for the user.
// containsEmail: boolean value indicating whether or not the user has added an email to their account.
// showDead: boolean indicating if the user has chosen to see dead items and comments.
// If authentication was not successful, those values will be set to either null or false.

module.exports = {
    authUser: (req, res, next) => {
        const cookies = req.cookies.user ? req.cookies.user.split("&") : null;

        const username = cookies ? cookies[0] : "";
        const authToken = cookies ? cookies[1] : "";

        if (cookies) res.locals.cookiesIncluded = true;

        if (!cookies || !username || !authToken) {
            res.locals.userSignedIn = false;
            res.locals.username = null;
            res.locals.karma = null;
            res.locals.showDead = false;

            next();
        } else {
            usersApi.authenticateUser(username, authToken, (authResponse) => {
                if (!authResponse.success) {
                    res.locals.userSignedIn = false;
                    res.locals.username = null;
                    res.locals.karma = null;
                    res.locals.showDead = false;

                    next();
                } else {
                    res.locals.userSignedIn = true;
                    res.locals.username = authResponse.username;
                    res.locals.karma = authResponse.karma;
                    res.locals.containsEmail = authResponse.containsEmail;
                    res.locals.showDead = authResponse.showDead;

                    next();
                }
            });
        }
    },
};
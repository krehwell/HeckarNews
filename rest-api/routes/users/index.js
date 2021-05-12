const express = require("express");
const app = express.Router();

const utils = require("../utils.js");
const config = require("../../config.js");

const api = require("./api.js");
const authUser = require("../../middlewares/index.js").authUser;

/// API ENDPOINT GOES HERE

app.post("/users/create-new-user", async (req, res) => {
    try {
        if (!req.body.username || !req.body.password) {
            throw { submitError: true };
        }

        const response = await api.createNewUser(
            req.body.username,
            req.body.password
        );

        const cookieSettings = {
            path: "/",
            expires: new Date(response.authTokenExpirationTimestamp * 1000),
            httpOnly: true,
            encode: String,
            secure: process.env.NODE_ENV === "production",
            domain:
                process.env.NODE_ENV === "development"
                    ? ""
                    : utils.getDomainFromUrl(config.productionWebsiteURL),
        };

        /**
         * cookie format: user = "username&auth_token"
         */
        res.cookie(
            "user",
            response.username + "&" + response.authToken,
            cookieSettings
        );

        res.json({ success: true });
    } catch (error) {
        res.json(error);
    }
});

/* LOGIN USER */
app.put("/users/login", async (req, res) => {
    try {
        if (!req.body.username || !req.body.password) {
            throw { submitError: true };
        }

        const response = await api.loginUser(
            req.body.username,
            req.body.password
        );

        const cookieSettings = {
            path: "/",
            expires: new Date(response.authTokenExpirationTimestamp * 1000),
            httpOnly: true,
            encode: String,
            secure: process.env.NODE_ENV === "production",
            domain:
                process.env.NODE_ENV === "development"
                    ? ""
                    : utils.getDomainFromUrl(config.productionWebsiteURL),
        };

        res.cookie(
            "user",
            response.username + "&" + response.authToken,
            cookieSettings
        );

        res.json({ success: true });
    } catch (error) {
        res.json(error);
    }
});

/* AUTHENTICATE USER */
app.get("/users/authenticate", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { success: false, authUser: res.locals };
        }

        res.json({ success: true, authUser: res.locals });
    } catch (error) {
        res.json(error);
    }
});

/* LOGOUT USER */
app.put("/users/logout", authUser, async (req, res) => {
    try {
        const cookieSettings = {
            path: "/",
            domain:
                process.env.NODE_ENV === "development"
                    ? ""
                    : utils.getDomainFromUrl(config.productionWebsiteURL),
        };

        res.clearCookie("user", cookieSettings);

        if (!res.locals.userSignedIn) {
            throw { success: false };
        }

        const response = await api.removeUserAuthData(res.locals);
        res.json(response);
    } catch (error) {
        res.json(error);
    }
});

/* LOGOUT USER - CLEAR COOKIES */
app.put("/users/remove-user-cookie-data", (req, res) => {
    const cookieSettings = {
        path: "/",
        domain:
            process.env.NODE_ENV === "development"
                ? ""
                : utils.getDomainFromUrl(config.productionWebsiteURL),
    };

    res.cookieSettings("user", cookieSettings);

    res.json({ success: true });
});

/* REQUEST TO SEND RESET PASSWORD USER TOKEN */
app.put("/users/request-password-reset-link", async (req, res) => {
    try {
        if (!req.body.username) {
            throw { submitError: true };
        }

        const response = await api.requestPasswordResetLink(req.body.username);
        res.json(response);
    } catch (error) {
        res.json(error);
    }
});

/* RESET PASSWORD USER */
app.put("/users/reset-password", (req, res) => {
    if (!req.body.username || !req.body.newPassword || !req.body.resetToken) {
        res.json({ submitError: true });
    } else {
        api.resetPassword(
            req.body.username,
            req.body.newPassword,
            req.body.resetToken,
            (response) => {
                res.json(response);
            }
        );
    }
});

/* GET USER PROFILE DATA */
app.get("/users/get-user-data", authUser, (req, res) => {
    if (!req.query.username) {
        res.json({ notFoundError: true, authUser: res.locals });
    } else if (
        !res.locals.userSignedIn ||
        res.locals.username !== req.query.username
    ) {
        api.getPublicUserData(req.query.username, (response) => {
            response.authUser = res.locals;
            response.showPrivateUserData = false;

            res.json(response);
        });
    } else {
        api.getPrivateUserData(req.query.username, (response) => {
            response.authUser = res.locals;
            response.showPrivateUserData = true;

            res.json(response);
        });
    }
});

/* UPDATE USER PROFILE */
app.put("/users/update-user-data", authUser, (req, res) => {
    if (!req.body.inputData) {
        res.json({ submitError: true });
    } else if (!res.locals.userSignedIn) {
        res.json({ submitError: true });
    } else {
        api.updateUserData(
            res.locals.username,
            req.body.inputData,
            (response) => {
                res.json(response);
            }
        );
    }
});

/* CHANGE USER PASSWORD */
app.put("/users/change-password", authUser, (req, res) => {
    if (!req.body.currentPassword || !req.body.newPassword) {
        res.json({ submitError: true });
    } else if (!res.locals.userSignedIn) {
        res.json({ authError: true });
    } else {
        api.changePassword(
            res.locals.username,
            req.body.currentPassword,
            req.body.newPassword,
            (response) => {
                if (response.success) {
                    const cookieSettings = {
                        path: "/",
                        secure: process.env.NODE_ENV === "production",
                        domain:
                            process.env.NODE_ENV === "development"
                                ? ""
                                : utils.getDomainFromUrl(
                                      config.productionWebsiteURL
                                  ),
                    };

                    res.clearCookie("user", cookieSettings);
                }

                res.json(response);
            }
        );
    }
});

module.exports = app;

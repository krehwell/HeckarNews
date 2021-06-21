const express = require("express");
const app = express.Router();

const utils = require("../utils.js");
const config = require("../../config.js");

const api = require("./api.js");
const authUser = require("../../middlewares/index.js").authUser;

/**
 * IMPORTANT: make sure to always send bad response from a known error
 *            catch error and return to be a suitable response instead
 * @param error, expected type to be a object {userNotFoundError: true}, etc.
 * else @returns/response {submitError: true}
 */
/// USER ENDPOINT

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
            secure: req.secure || req.headers["x-forwarded-proto"] === "https",
            domain:
                process.env.NODE_ENV === "development"
                    ? ""
                    : utils.getDomainFromUrl(config.productionWebsiteUrl),
            sameSite: "none",
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
        console.log(error);
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
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
                    : utils.getDomainFromUrl(config.productionWebsiteUrl),
        };

        res.cookie(
            "user",
            response.username + "&" + response.authToken,
            cookieSettings
        );

        res.json({ success: true });
    } catch (error) {
        console.log(error);
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
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
                    : utils.getDomainFromUrl(config.productionWebsiteUrl),
        };

        res.clearCookie("user", cookieSettings);

        if (!res.locals.userSignedIn) {
            throw { success: false };
        }

        const response = await api.removeUserAuthData(res.locals);
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

/* LOGOUT USER - CLEAR COOKIES */
app.put("/users/remove-user-cookie-data", (req, res) => {
    const cookieSettings = {
        path: "/",
        domain:
            process.env.NODE_ENV === "development"
                ? ""
                : utils.getDomainFromUrl(config.productionWebsiteUrl),
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
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

/* RESET PASSWORD USER */
app.put("/users/reset-password", async (req, res) => {
    try {
        if (
            !req.body.username ||
            !req.body.newPassword ||
            !req.body.resetToken
        ) {
            throw { submitError: true };
        }

        const response = await api.resetPassword(
            req.body.username,
            req.body.newPassword,
            req.body.resetToken
        );
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

/* GET USER PROFILE DATA */
app.get("/users/get-user-data", authUser, async (req, res) => {
    try {
        if (!req.query.username) {
            throw { notFoundError: true, authUser: res.locals };
        } else if (
            !res.locals.userSignedIn ||
            res.locals.username !== req.query.username
        ) {
            const response = await api.getPublicUserData(
                req.query.username,
                res.locals
            );
            response.authUser = res.locals;
            response.showPrivateUserData = false;

            res.json(response);
        } else {
            const response = await api.getPrivateUserData(req.query.username);
            response.authUser = res.locals;
            response.showPrivateUserData = true;

            res.json(response);
        }
    } catch (error) {
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ getDataError: true });
        }
    }
});

/* UPDATE USER PROFILE */
app.put("/users/update-user-data", authUser, async (req, res) => {
    try {
        if (!req.body.inputData) {
            throw { submitError: true };
        } else if (!res.locals.userSignedIn) {
            throw { submitError: true };
        }

        const response = await api.updateUserData(
            res.locals.username,
            req.body.inputData
        );
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

/* CHANGE USER PASSWORD */
app.put("/users/change-password", authUser, async (req, res) => {
    try {
        if (!req.body.currentPassword || !req.body.newPassword) {
            throw { submitError: true };
        } else if (!res.locals.userSignedIn) {
            throw { authError: true };
        }

        const response = await api.changePassword(
            res.locals.username,
            req.body.currentPassword,
            req.body.newPassword
        );

        if (response.success) {
            const cookieSettings = {
                path: "/",
                secure: process.env.NODE_ENV === "production",
                domain:
                    process.env.NODE_ENV === "development"
                        ? ""
                        : utils.getDomainFromUrl(config.productionWebsiteUrl),
            };

            res.clearCookie("user", cookieSettings);
        }

        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

module.exports = app;

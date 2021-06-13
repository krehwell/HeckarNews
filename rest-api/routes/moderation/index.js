const express = require("express");

const api = require("./api.js");

const authUser = require("../../middlewares/index.js").authUser;

const app = express.Router();

/// MODERATION API ENDPOINT
app.put("/moderation/kill-item", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn || !res.locals.isModerator) {
            res.json({ authError: true });
        }
        const response = await api.killItem(req.body.id, res.locals);
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

app.put("/moderation/unkill-item", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn || !res.locals.isModerator) {
            res.json({ authError: true });
        }
        const response = await api.unkillItem(req.body.id, res.locals);
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

app.put("/moderation/kill-comment", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn || !res.locals.isModerator) {
            res.json({ authError: true });
        }

        const response = await api.killComment(req.body.id, res.locals);
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

app.put("/moderation/unkill-comment", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn || !res.locals.isModerator) {
            res.json({ authError: true });
        }

        const response = await api.unkillComment(req.body.id, res.locals);
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

app.put("/moderation/add-user-shadow-ban", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn || !res.locals.isModerator) {
            res.json({ authError: true });
        }

        const response = await api.addUserShadowBan(
            req.body.username,
            res.locals
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

app.put("/moderation/remove-user-shadow-ban", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn || !res.locals.isModerator) {
            res.json({ authError: true });
        }
        const response = await api.removeUserShadowBan(
            req.body.username,
            res.local
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

app.get(
    "/moderation/get-shadow-banned-users-by-page",
    authUser,
    async (req, res) => {
        try {
            if (!res.locals.userSignedIn || !res.locals.isModerator) {
                res.json({ notAllowedError: true });
            } else if (!req.query.page) {
                res.json({ getDataError: true });
            }

            const response = await api.getShadowBannedUsersByPage(
                req.query.page
            );
            res.json(response);
        } catch (error) {
            if (!(error instanceof Error)) {
                res.json(error);
            } else {
                res.json({ getDataError: true });
            }
        }
    }
);

app.put("/moderation/add-user-ban", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn || !res.locals.isModerator) {
            res.json({ authError: true });
        }

        const response = await api.addUserBan(req.body.username, res.locals);
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

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

module.exports = app;

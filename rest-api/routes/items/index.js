const express = require("express");
const app = express.Router();

const api = require("./api.js");
const authUser = require("../../middlewares/index.js").authUser;

// API ENDPOINT CODE WILL GO HERE
app.post("/items/submit-new-item", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { authError: true };
        } else if (!req.body.title) {
            throw { titleRequiredError: true };
        } else if (req.body.title.length > 80) {
            throw { titleTooLongError: true };
        } else if (req.body.url && req.body.text) {
            throw { urlAndTextError: true };
        } else if (req.body.text.length > 5000) {
            throw { textTooLongError: true };
        }

        const response = await api.submitNewItem(
            req.body.title,
            req.body.url,
            req.body.text,
            res.locals
        );
        res.json(response);
    } catch (error) {
        res.json(error);
    }
});

module.exports = app;

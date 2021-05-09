const express = require("express");
const app = express.Router();

const api = require("./api.js");
const authUser = require("../../middlewares/index.js").authUser;

// API ENDPOINT CODE WILL GO HERE
app.post("/items/submit-new-item", authUser, (req, res) => {
    if (!res.locals.userSignedIn) {
        res.json({ authError: true });
    } else if (!req.body.title) {
        res.json({ titleRequiredError: true });
    } else if (req.body.title.length > 80) {
        res.json({ titleTooLongError: true });
    } else if (req.body.url && req.body.text) {
        res.json({ urlAndTextError: true });
    } else if (req.body.text.length > 5000) {
        res.json({ textTooLongError: true });
    } else {
        api.submitNewItem(
            req.body.title,
            req.body.url,
            req.body.text,
            res.locals,
            (response) => {
                res.json(response);
            }
        );
    }
});

module.exports = app;

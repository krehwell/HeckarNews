const express = require("express");

const app = express.Router();

const api = require("./api.js");
const authUser = require("../../middlewares/index.js").authUser;

/**
 * IMPORTANT: make sure to always send bad response from a known error
 *            catch error and return to be a suitable response instead
 * @param error, expected type to be a object {userNotFoundError: true}, etc.
 * else @returns/response {submitError: true}
 */
/// COMMENT ENDPOINT

app.post("/comments/add-new-comment", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { authError: true };
        } else if (!req.body.commentData.text) {
            throw { textRequiredError: true };
        } else if (req.body.commentData.text.length > 5000) {
            throw { textTooLongError: true };
        }

        const response = await api.addNewComment(
            req.body.commentData,
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

module.exports = app;

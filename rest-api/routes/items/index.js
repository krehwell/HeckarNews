const express = require("express");
const app = express.Router();

const api = require("./api.js");
const authUser = require("../../middlewares/index.js").authUser;

/**
 * IMPORTANT: make sure to always send bad response from a known error
 *            catch error and return to be a suitable response instead
 * @param error, expected type to be a object {userNotFound: true}, etc.
 * else @returns/response {submitError: true}
 */
/// ITEM API ENDPOINT GOES HERE

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
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

app.get("/items/get-item-by-id", authUser, async (req, res) => {
    try {
        if (!req.query.id) {
            throw { notFoundError: true, authUser: res.locals };
        }

        const response = await api.getItemById(req.query.id, res.locals);
        response.authUser = res.locals;

        res.json(response);
    } catch (error) {
        // console.log(error);
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ getDataError: true });
        }
    }
});

app.post("/items/upvote-item", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { authError: true };
        } else if (!req.body.id) {
            throw { submitError: true };
        }

        const response = await api.upvoteItem(req.body.id, res.locals);
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

app.put("/items/unvote-item", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { authError: true };
        } else if (!req.body.id) {
            throw { submitError: true };
        }

        response = await api.unvoteItem(req.body.id, res.locals);
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

app.post("/items/favorite-item", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { authError: true };
        } else if (!req.body.id) {
            throw { submitError: true };
        }

        response = await api.favoriteItem(req.body.id, res.locals);
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

app.put("/items/unfavorite-item", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { authError: true };
        } else if (!req.body.id) {
            throw { submitError: true };
        }
        const response = await api.unfavoriteItem(req.body.id, res.locals);

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

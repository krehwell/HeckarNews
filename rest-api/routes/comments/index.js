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
        console.log(error);
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

app.get("/comments/get-comment-by-id", authUser, async (req, res) => {
    try {
        if (!req.query.id) {
            throw { notFoundError: true, authUser: res.locals };
        }
        const response = await api.getCommentById(
            req.query.id,
            req.query.page,
            res.locals
        );
        response.authUser = res.locals;
        res.json(response);
    } catch (error) {
        console.log(error);
        if (!(error instanceof Error)) {
            error.authUser = res.locals;
            res.json(error);
        } else {
            res.json({ getDataError: true, authUser: res.locals });
        }
    }
});

app.post("/comments/upvote-comment", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { authError: true };
        } else if (!req.body.id || !req.body.parentItemId) {
            throw { submitError: true };
        }
        const response = await api.upvoteComment(
            req.body.id,
            req.body.parentItemId,
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

app.post("/comments/downvote-comment", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { authError: true };
        } else if (!req.body.id || !req.body.parentItemId) {
            throw { submitError: true };
        } else if (!res.locals.showDownvote) {
            throw { submitError: true };
        }
        const response = await api.downvoteComment(
            req.body.id,
            req.body.parentItemId,
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

app.put("/comments/unvote-comment", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { authError: true };
        } else if (!req.body.id) {
            throw { submitError: true };
        }

        const response = await api.unvoteComment(req.body.id, res.locals);
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

app.post("/comments/favorite-comment", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { authError: true };
        } else if (!req.body.id) {
            throw { submitError: true };
        }

        const response = await api.favoriteComment(req.body.id, res.locals);
        res.json(response);
    } catch (error) {
        console.log(error);
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

app.put("/comments/unfavorite-comment", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { authError: true };
        } else if (!req.body.id) {
            throw { submitError: true };
        }
        const response = await api.unfavoriteComment(req.body.id, res.locals);
        res.json(response);
    } catch (error) {
        console.log(error);
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

app.get("/comments/get-edit-comment-page-data", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { notAllowedError: true, authUser: res.locals };
        } else if (!req.query.id) {
            throw { notFoundError: true, authUser: res.locals };
        }
        const response = await api.getEditCommentPageData(
            req.query.id,
            res.locals
        );
        response.authUser = res.locals;
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            error.authUser = res.locals;
            res.json(error);
        } else {
            res.json({ getDataError: true, authUser: res.locals });
        }
    }
});

app.put("/comments/edit-comment", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { authError: true };
        } else if (!req.body.id) {
            throw { submitError: true };
        } else if (!req.body.newCommentText) {
            throw { textRequiredError: true };
        } else if (req.body.newCommentText.length > 5000) {
            throw { textTooLongError: true };
        }
        const response = await api.editComment(
            req.body.id,
            req.body.newCommentText,
            res.locals
        );
        response.authUser = res.locals;
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
    "/comments/get-delete-comment-page-data",
    authUser,
    async (req, res) => {
        try {
            if (!res.locals.userSignedIn) {
                throw { notAllowedError: true, authUser: res.locals };
            } else if (!req.query.id) {
                throw { notFoundError: true, authUser: res.locals };
            }
            const response = await api.getDeleteCommentPageData(
                req.query.id,
                res.locals
            );
            response.authUser = res.locals;
            res.json(response);
        } catch (error) {
            console.log(error);
            if (!(error instanceof Error)) {
                error.authUser = res.locals;
                res.json(error);
            } else {
                res.json({ getDataError: true, authUser: res.locals });
            }
        }
    }
);

app.put("/comments/delete-comment", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { notAllowedError: true };
        } else if (!req.body.id) {
            throw { submitError: true };
        }

        const response = await api.deleteComment(req.body.id, res.locals);
        res.json(response);
    } catch (error) {
        console.log(error);
        if (!(error instanceof Error)) {
            res.json(error);
        } else {
            res.json({ submitError: true });
        }
    }
});

app.get("/comments/get-reply-page-data", authUser, async (req, res) => {
    try {
        if (!res.locals.userSignedIn) {
            throw { authError: true, authUser: res.locals };
        } else if (!req.query.id) {
            throw { notFoundError: true, authUser: res.locals };
        }
        const response = await api.getReplyPageData(req.query.id, res.locals);
        response.authUser = res.locals;
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            error.authUser = res.locals;
            res.json(error);
        } else {
            res.json({ getDataError: true, authUser: res.locals });
        }
    }
});

app.get("/comments/get-newest-comments-by-page", authUser, async (req, res) => {
    try {
        if (!req.query.page) {
            throw { getDataError: true, authUser: res.locals };
        }
        const response = await api.getNewestCommentsByPage(
            req.query.page,
            res.locals
        );
        response.authUser = res.locals;
        res.json(response);
    } catch (error) {
        console.log(error);
        if (!(error instanceof Error)) {
            error.authUser = res.locals;
            res.json(error);
        } else {
            res.json({ getDataError: true, authUser: res.locals });
        }
    }
});

app.get("/comments/get-user-comments-by-page", authUser, async (req, res) => {
    try {
        if (!req.query.userId || !req.query.page) {
            throw { getDataError: true, authUser: res.locals };
        }

        const response = await api.getUserCommentsByPage(
            req.query.userId,
            req.query.page,
            res.locals
        );
        response.authUser = res.locals;
        res.json(response);
    } catch (error) {
        if (!(error instanceof Error)) {
            error.authUser = res.locals;
            res.json(error);
        } else {
            res.json({ getDataError: true, authUser: res.locals });
        }
    }
});

app.get(
    "/comments/get-user-favorited-comments-by-page",
    authUser,
    async (req, res) => {
        try {
            if (!req.query.userId || !req.query.page) {
                throw { getDataError: true, authUser: res.locals };
            }

            const response = await api.getUserFavoritedCommentsByPage(
                req.query.userId,
                req.query.page,
                res.locals
            );
            response.authUser = res.locals;
            res.json(response);
        } catch (error) {
            console.log(error);
            if (!(error instanceof Error)) {
                error.authUser = res.locals;
                res.json(error);
            } else {
                res.json({ getDataError: true, authUser: res.locals });
            }
        }
    }
);

app.get(
    "/comments/get-user-upvoted-comments-by-page",
    authUser,
    async (req, res) => {
        try {
            if (!res.locals.userSignedIn) {
                throw { notAllowedError: true, authUser: res.locals };
            } else if (!req.query.userId || !req.query.page) {
                throw { getDataError: true, authUser: res.locals };
            } else if (req.query.userId !== res.locals.username) {
                throw { notAllowedError: true, authUser: res.locals };
            }

            const response = await api.getUserUpvotedCommentsByPage(
                req.query.page,
                res.locals
            );
            response.authUser = res.locals;
            res.json(response);
        } catch (error) {
            console.log(error);
            if (!(error instanceof Error)) {
                error.authUser = res.locals;
                res.json(error);
            } else {
                res.json({ getDataError: true, authUser: res.locals });
            }
        }
    }
);

module.exports = app;

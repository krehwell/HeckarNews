const moment = require("moment");
const linkifyUrls = require("linkify-urls");
const xss = require("xss");

const CommentModel = require("../../models/comment.js");
const UserModel = require("../../models/user.js");
const ItemModel = require("../../models/item.js");
const UserVoteModel = require("../../models/userVote.js");

const utils = require("../utils.js");

/// COMMENT API
module.exports = {
    addNewComment: async (commentData, authUser) => {
        const item = await ItemModel.findOne({ id: commentData.parentItemId })
            .lean()
            .exec();

        if (!item) {
            throw { submitError: false };
        }

        commentData.text = commentData.text.trim();
        commentData.text = commentData.text.replace(/<[^>]+>/g, "");
        commentData.text = commentData.text.replace(
            /\*([^*]+)\*/g,
            "<i>$1</i>"
        );
        commentData.text = linkifyUrls(commentData.text);
        commentData.text = xss(commentData.text);

        const newComment = await CommentModel({
            id: utils.generateUniqueId(12),
            by: authUser.username,
            parentItemId: commentData.parentItemId,
            parentItemTitle: item.title,
            isParent: commentData.isParent,
            parentCommentId: commentData.parentCommentId,
            text: commentData.text,
            points: 1,
            created: moment().unix(),
        });

        const newCommentDoc = await newComment.save();

        const promises = [
            UserModel.findOneAndUpdate(
                { username: authUser.username },
                { $inc: { karma: 1 } }
            ).lean(),
            ItemModel.findOneAndUpdate(
                { id: commentData.parentItemId },
                { $inc: { commentCount: 1 } }
            ).lean(),
        ];

        if (!commentData.isParent) {
            const commentRefPromise = CommentModel.findOneAndUpdate(
                { id: commentData.parentCommentId },
                { $push: { children: newCommentDoc._id } }
            ).lean();

            promises.push(commentRefPromise);
        }

        await Promise.all(promises);

        return { success: true };
    },

    getCommentById: async (commentId, authUser) => {
        const comment = await CommentModel.findOne({ id: commentId })
            .lean()
            .exec();

        if (!comment) {
            throw { notFoundError: true };
        }

        comment.pageMetadataTitle = comment.text.replace(/<[^>]+>/g, "");

        // user user not signed in then just return comment with no vote checkers
        if (!authUser.userSignedIn) {
            return { success: true, comment: comment };
        }

        const [commentVoteDoc] = await Promise.all([
            UserVoteModel.findOne({
                username: authUser.username,
                id: commentId,
                type: "comment",
            }).lean(),
        ]);

        comment.votedOnByUser = commentVoteDoc ? true : false;

        return { success: true, comment: comment };
    },

    /**
     * Step 1 - Find the comment in the database with the given id.
     * Step 2 - Query the database for a user vote document with the given username and comment id.
     * Step 3 - Create a new user vote document and save it to the database.
     * Step 4 - Increment the comment's point & author karma count by 1.
     */
    upvoteComment: async (commentId, parentItemId, authUser) => {
        const [comment, voteDoc] = await Promise.all([
            CommentModel.findOne({ id: commentId }),
            UserVoteModel.findOne({
                username: authUser.username,
                id: commentId,
                type: "comment",
            }).lean(),
        ]);

        if (!comment || comment.by === authUser.username || comment.dead) {
            throw { submitError: true };
        }

        if (voteDoc) {
            throw { submitError: true };
        }

        const newUserVoteDoc = new UserVoteModel({
            username: authUser.username,
            type: "comment",
            id: commentId,
            parentItemId: parentItemId,
            upvote: true,
            downvote: false,
            date: moment().unix(),
        });

        await newUserVoteDoc.save();

        comment.points = comment.points + 1;

        await comment.save();

        await UserModel.findOneAndUpdate(
            { username: comment.by },
            { $inc: { karma: 1 } }
        )
            .lean()
            .exec();

        return { success: true };
    },

    downvoteComment: async (commentId, parentItemId, authUser) => {
        const [comment, voteDoc] = await Promise.all([
            CommentModel.findOne({ id: commentId }),
            UserVoteModel.findOne({
                username: authUser.username,
                id: commentId,
                type: "comment",
            }).lean(),
        ]);

        if (!comment || comment.by === authUser.username || comment.dead) {
            throw { submitError: true };
        }

        if (voteDoc) {
            throw { submitError: true };
        }

        const newUserVoteDoc = new UserVoteModel({
            username: authUser.username,
            type: "comment",
            id: commentId,
            parentItemId: parentItemId,
            upvote: false,
            downvote: true,
            date: moment().unix(),
        });

        await newUserVoteDoc.save();

        comment.points = comment.points - 1;

        await comment.save();

        await UserModel.findOneAndUpdate(
            { username: comment.by },
            { $inc: { karma: -1 } }
        )
            .lean()
            .exec();

        return { success: true };
    },
};

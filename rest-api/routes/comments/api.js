const moment = require("moment");
const linkifyUrls = require("linkify-urls");
const xss = require("xss");

const CommentModel = require("../../models/comment.js");
const UserModel = require("../../models/user.js");
const ItemModel = require("../../models/item.js");

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

        return {success: true, comment: comment};
    },
};

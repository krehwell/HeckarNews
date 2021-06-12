const moment = require("moment");
const linkifyUrls = require("linkify-urls");
const xss = require("xss");

const CommentModel = require("../../models/comment.js");
const UserModel = require("../../models/user.js");
const ItemModel = require("../../models/item.js");
const UserVoteModel = require("../../models/userVote.js");
const UserFavoriteModel = require("../../models/userFavorite.js");

const utils = require("../utils.js");
const config = require("../../config.js");

const searchApi = require("../search/api.js");

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
            dead: authUser.shadowBanned ? true : false,
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

        // push myself (comment) to be in the array of my parent comment
        if (!commentData.isParent) {
            const commentRefPromise = CommentModel.findOneAndUpdate(
                { id: commentData.parentCommentId },
                { $push: { children: newCommentDoc._id } }
            ).lean();

            promises.push(commentRefPromise);
        }

        await Promise.all(promises);

        if (!authUser.shadowBanned) {
            await searchApi.addNewComment(
                newCommentDoc,
                item.id,
                item.commentCount + 1
            );
        }

        return { success: true };
    },

    /**
     * Step 1 - Query db for the commentId
     * Step 2 - Filter any meta text
     * Step 3 - if user not signed in directly return the comment data
     * Step 4 - else search if user ever vote this comment before on UserVoteModel
     *          @returns { success: (false | true), comment }
     * comment is added with the:
     *        - upvotedByUser: if user ever upvote this comment
     *        - downvotedByUser
     *        - votedOnByUser: user ever do and still currently vote to this comment
     * comment also populated with its children comment, count each children and return based on num of comment per page
     */
    getCommentById: async (commentId, page, authUser) => {
        const comment = await CommentModel.findOne({ id: commentId }, null, {
            getChildrenComment: true,
            showDeadComments: authUser.showDead,
        })
            .lean()
            .exec();

        if (!comment) {
            throw { notFoundError: true };
        }

        // this is for website to put it as title meta data
        comment.pageMetadataTitle = comment.text.replace(/<[^>]+>/g, "");

        // sort comment children by points and created
        comment.children.sort((a, b) => {
            if (a.points > b.points) return -1;
            if (a.points < b.points) return 1;

            if (a.created > b.created) return -1;
            if (a.created < b.created) return 1;
        });

        const totalNumOfChildrenComments = comment.children.length;

        // slice comment per page
        comment.children = comment.children.slice(
            (page - 1) * config.commentsPerPage,
            page * config.commentsPerPage
        );

        // user user not signed in then just return comment with no vote checkers
        if (!authUser.userSignedIn) {
            return { success: true, comment: comment };
        }

        const [
            commentVoteDoc,
            commentFavoriteDoc,
            commentVotesByUserDocs,
        ] = await Promise.all([
            UserVoteModel.findOne({
                username: authUser.username,
                id: commentId,
                type: "comment",
            }).lean(),
            UserFavoriteModel.findOne({
                username: authUser.username,
                id: commentId,
                type: "comment",
            }).lean(),
            UserVoteModel.find({
                username: authUser.username,
                type: "comment",
                parentItemId: comment.parentItemId,
            }).lean(),
        ]);

        comment.votedOnByUser = commentVoteDoc ? true : false;
        comment.upvotedByUser = commentVoteDoc?.upvote || false;
        comment.downvotedByUser = commentVoteDoc?.downvote || false;
        comment.favoritedByUser = commentFavoriteDoc ? true : false;

        comment.unvoteExpired =
            commentVoteDoc &&
            commentVoteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                moment().unix();

        if (comment.by === authUser.username) {
            const hasEditAndDeleteExpired =
                comment.created + 3600 * config.hrsUntilEditAndDeleteExpires <
                    moment().unix() || comment.children.length > 0;

            comment.editAndDeleteExpired = hasEditAndDeleteExpired;
        }

        // define if user has voted a certain comment
        let userCommentVotes = [];

        for (let i = 0; i < commentVotesByUserDocs.length; i++) {
            userCommentVotes.push(commentVotesByUserDocs[i].id);
        }

        const updateComment = (parentComment) => {
            if (parentComment.by === authUser.username) {
                const hasEditAndDeleteExpired =
                    parentComment.created +
                        3600 * config.hrsUntilEditAndDeleteExpires <
                        moment().unix() || parentComment.children.length > 0;

                parentComment.editAndDeleteExpired = hasEditAndDeleteExpired;
            }

            // user ever vote this comment?
            if (userCommentVotes.includes(parentComment.id)) {
                parentComment.votedOnByUser = true;

                for (let i = 0; i < commentVotesByUserDocs.length; i++) {
                    if (parentComment.id === commentVotesByUserDocs[i].id) {
                        parentComment.unvoteExpired =
                            commentVotesByUserDocs[i].date +
                                3600 * config.hrsUntilUnvoteExpires <
                            moment().unix()
                                ? true
                                : false;
                    }

                    // user upvote it or downvote it?
                    if (parentComment.id === commentVotesByUserDocs[i].id) {
                        parentComment.upvotedByUser =
                            commentVotesByUserDocs[i].upvote;
                        parentComment.downvotedByUser =
                            commentVotesByUserDocs[i].downvote;
                    }
                }
            }

            if (parentComment.children) {
                for (let i = 0; i < parentComment.children.length; i++) {
                    updateComment(parentComment.children[i]);
                }
            }
        };

        for (let i = 0; i < comment.children.length; i++) {
            updateComment(comment.children[i]);
        }

        return {
            success: true,
            comment: comment,
            isMoreChildrenComments:
                totalNumOfChildrenComments >
                (page - 1) * config.commentsPerPage + config.commentsPerPage
                    ? true
                    : false,
        };
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

        await searchApi.updateCommentPointsValue(comment.id, comment.points);

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

        await searchApi.updateCommentPointsValue(comment.id, comment.points);

        return { success: true };
    },

    unvoteComment: async (commentId, authUser) => {
        const [comment, voteDoc] = await Promise.all([
            CommentModel.findOne({ id: commentId }),
            UserVoteModel.findOne({
                username: authUser.username,
                id: commentId,
                type: "comment",
            }),
        ]);

        if (!comment || comment.by === authUser.username || comment.dead) {
            throw { submitError: true };
        }

        if (
            !voteDoc ||
            voteDoc.date + 3600 * config.hrsUntilUnvoteExpires < moment().unix()
        ) {
            throw { submitError: true };
        }

        await voteDoc.remove();

        comment.points = voteDoc.upvote
            ? comment.points - 1
            : comment.points + 1;

        await comment.save();

        const user = await UserModel.findOneAndUpdate(
            { username: comment.by },
            { $inc: { karma: voteDoc.upvote ? -1 : 1 } }
        )
            .lean()
            .exec();

        if (!user) {
            throw { submitError: true };
        }

        await searchApi.updateCommentPointsValue(comment.id, comment.points);

        return { success: true };
    },

    favoriteComment: async (commentId, authUser) => {
        const [comment, favorite] = await Promise.all([
            CommentModel.findOne({ id: commentId }),
            UserFavoriteModel.findOne({
                username: authUser.username,
                id: commentId,
                type: "comment",
            }).lean(),
        ]);

        if (!comment || favorite) {
            throw { submitError: true };
        }

        const newFavoriteDoc = new UserFavoriteModel({
            username: authUser.username,
            type: "comment",
            id: commentId,
            date: moment().unix(),
        });

        await newFavoriteDoc.save();

        return { success: true };
    },

    unfavoriteComment: async (commentId, authUser) => {
        await UserFavoriteModel.findOneAndRemove({
            username: authUser.username,
            id: commentId,
        })
            .lean()
            .exec();

        return { success: true };
    },

    getEditCommentPageData: async (commentId, authUser) => {
        const comment = await CommentModel.findOne({ id: commentId })
            .lean()
            .exec();

        if (!comment) {
            throw { notFoundError: true };
        } else if (comment.dead) {
            throw { notAllowedError: true };
        } else if (comment.by !== authUser.username) {
            throw { notAllowedError: true };
        } else if (
            comment.created + 3600 * config.hrsUntilEditAndDeleteExpires <
            moment().unix()
        ) {
            throw { notAllowedError: true };
        } else if (comment.children.length > 0) {
            throw { notAllowedError: true };
        }

        comment.textForEditing = comment.text
            .replace(/<a\b[^>]*>/g, "")
            .replace(/<\/a>/g, "")
            .replace(/<i\b[^>]*>/g, "*")
            .replace(/<\/i>/g, "*");

        return { success: true, comment: comment };
    },

    editComment: async (commentId, newCommentText, authUser) => {
        const comment = await CommentModel.findOne({ id: commentId }).exec();

        if (!comment) {
            throw { notFoundError: true };
        } else if (comment.dead) {
            throw { notAllowedError: true };
        } else if (comment.by !== authUser.username) {
            throw { notAllowedError: true };
        } else if (
            comment.created + 3600 * config.hrsUntilEditAndDeleteExpires <
            moment().unix()
        ) {
            throw { notAllowedError: true };
        } else if (comment.children.length > 0) {
            throw { notAllowedError: true };
        }

        newCommentText = newCommentText.trim();
        newCommentText = newCommentText.replace(/<[^>]+>/g, "");
        newCommentText = newCommentText.replace(/\*([^*]+)\*/g, "<i>$1</i>");
        newCommentText = linkifyUrls(newCommentText);
        newCommentText = xss(newCommentText);

        comment.text = newCommentText;

        await comment.save();

        await searchApi.editComment(comment.id, newCommentText);

        return { success: true };
    },

    getDeleteCommentPageData: async (commentId, authUser) => {
        const comment = await CommentModel.findOne({ id: commentId })
            .lean()
            .exec();

        if (!comment) {
            throw { notFoundError: true };
        } else if (comment.dead) {
            throw { notAllowedError: true };
        } else if (comment.by !== authUser.username) {
            throw { notAllowedError: true };
        } else if (
            comment.created + 3600 * config.hrsUntilEditAndDeleteExpires <
            moment().unix()
        ) {
            throw { notAllowedError: true };
        } else if (comment.children.length > 0) {
            throw { notAllowedError: true };
        }

        return { success: true, comment: comment };
    },

    deleteComment: async (commentId, authUser) => {
        const comment = await CommentModel.findOne({ id: commentId }).exec();

        if (!comment) {
            throw { submitError: true };
        } else if (comment.dead) {
            throw { notAllowedError: true };
        } else if (comment.by !== authUser.username) {
            throw { notAllowedError: true };
        } else if (
            comment.created + 3600 * config.hrsUntilEditAndDeleteExpires <
            moment().unix()
        ) {
            throw { notAllowedError: true };
        } else if (comment.children.length > 0) {
            throw { notAllowedError: true };
        }

        await comment.remove();

        const newUserKarmaValue = authUser.karma - comment.points;

        await ItemModel.findOneAndUpdate(
            { id: comment.parentItemId },
            { $inc: { commentCount: -1 } }
        )
            .lean()
            .exec();

        await UserModel.findOneAndUpdate(
            { username: authUser.username },
            { karma: newUserKarmaValue }
        )
            .lean()
            .exec();

        // remove this comments (children) from parent
        if (!comment.isParent) {
            await CommentModel.findOneAndUpdate(
                { id: comment.parentCommentId },
                { $pullAll: { children: [comment._id] } }
            )
                .lean()
                .exec();
        }

        await searchApi.deleteComment(
            comment.id,
            comment.id,
            comment.commentCount - 1
        );

        return { success: true };
    },

    getReplyPageData: async (commentId, authUser) => {
        const comment = await CommentModel.findOne({ id: commentId })
            .lean()
            .exec();
        if (!comment) {
            throw { notFoundError: true };
        }

        if (comment.by === authUser.username) {
            const hasEditAndDeleteExpired =
                comment.created + 3600 * config.hrsUntilEditAndDeleteExpires <
                    moment().unix() || comment.children.length > 0;

            comment.editAndDeleteExpired = hasEditAndDeleteExpired;
        }

        const commentVoteDoc = await UserVoteModel.findOne({
            username: authUser.username,
            id: commentId,
            type: "comment",
        })
            .lean()
            .exec();

        comment.votedOnByUser = commentVoteDoc ? true : false;
        comment.unvoteExpired =
            commentVoteDoc &&
            commentVoteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                moment().unix();

        return { success: true, comment: comment };
    },

    getNewestCommentsByPage: async (page, authUser) => {
        let commentsDbQuery = {};

        if (!authUser.showDead) commentsDbQuery.dead = false;

        const [comments, totalCommentsCount] = await Promise.all([
            CommentModel.find(commentsDbQuery)
                .sort({ _id: -1 })
                .skip((page - 1) * config.commentsPerPage)
                .limit(config.commentsPerPage)
                .lean(),
            CommentModel.countDocuments(commentsDbQuery).lean(),
        ]);

        /// IF USER NOT SIGNED IN
        if (!authUser.userSignedIn) {
            return {
                success: true,
                comments: comments,
                isMore:
                    totalCommentsCount >
                    (page - 1) * config.commentsPerPage + config.commentsPerPage
                        ? true
                        : false,
            };
        }

        /// IF USER SIGNED IN

        let arrayOfCommentIds = [];

        for (let i = 0; i < comments.length; i++) {
            if (comments[i].by !== authUser.username)
                arrayOfCommentIds.push(comments[i].id);

            if (comments[i].by === authUser.username) {
                const hasEditAndDeleteExpired =
                    comments[i].created +
                        3600 * config.hrsUntilEditAndDeleteExpires <
                        moment().unix() || comments[i].children.length > 0;

                comments[i].editAndDeleteExpired = hasEditAndDeleteExpired;
            }
        }

        const voteDocs = await UserVoteModel.find({
            username: authUser.username,
            id: { $in: arrayOfCommentIds },
            type: "comment",
        })
            .lean()
            .exec();

        for (let i = 0; i < voteDocs.length; i++) {
            const commentObj = comments.find((comment) => {
                return comment.id === voteDocs[i].id;
            });

            if (commentObj) {
                commentObj.upvotedByUser = voteDocs[i].upvote || false;
                commentObj.downvotedByUser = voteDocs[i].downvote || false;
                commentObj.votedOnByUser = true;
                commentObj.unvoteExpired =
                    voteDocs[i].date + 3600 * config.hrsUntilUnvoteExpires <
                    moment().unix()
                        ? true
                        : false;
            }
        }

        return {
            success: true,
            comments: comments,
            isMore:
                totalCommentsCount >
                (page - 1) * config.commentsPerPage + config.commentsPerPage
                    ? true
                    : false,
        };
    },

    /**
     * Thread Page:
     * Step 1 - Retrieve the list of comments created by the given user from the database.
     *          comments will be sorted by their creation date property.
     *          pagination will be applied to the results.
     * Step 2 - Get the total number of comments created by the user in the database.
     *          will be used for pagination purposes.
     */
    getUserCommentsByPage: async (userId, page, authUser) => {
        const user = await UserModel.findOne({ username: userId })
            .lean()
            .exec();

        if (!user) {
            throw { notFoundError: true };
        }

        let commentsDbQuery = {
            by: userId,
        };

        if (!authUser.showDead) commentsDbQuery.dead = false;

        const [comments, totalCommentsCount] = await Promise.all([
            CommentModel.find(commentsDbQuery)
                .sort({ _id: -1 })
                .skip((page - 1) * config.commentsPerPage)
                .limit(config.commentsPerPage)
                .lean(),
            CommentModel.countDocuments(commentsDbQuery).lean(),
        ]);

        /// IF USER SIGNED IN
        if (!authUser.userSignedIn) {
            return {
                success: true,
                comments: comments,
                isMore:
                    totalCommentsCount >
                    (page - 1) * config.commentsPerPage + config.commentsPerPage
                        ? true
                        : false,
            };
        }

        /// IF USER SIGNED IN

        let arrayOfCommentIds = [];

        for (let i = 0; i < comments.length; i++) {
            if (comments[i].by !== authUser.username)
                arrayOfCommentIds.push(comments[i].id);

            if (comments[i].by === authUser.username) {
                const hasEditAndDeleteExpired =
                    comments[i].created +
                        3600 * config.hrsUntilEditAndDeleteExpires <
                        moment().unix() || comments[i].children.length > 0;

                comments[i].editAndDeleteExpired = hasEditAndDeleteExpired;
            }
        }

        const voteDocs = await UserVoteModel.find({
            username: authUser.username,
            id: { $in: arrayOfCommentIds },
            type: "comment",
        })
            .lean()
            .exec();

        for (let i = 0; i < voteDocs.length; i++) {
            const commentObj = comments.find((comment) => {
                return comment.id === voteDocs[i].id;
            });

            if (commentObj) {
                commentObj.upvotedByUser = voteDocs[i].upvote || false;
                commentObj.downvotedByUser = voteDocs[i].downvote || false;
                commentObj.votedOnByUser = true;
                commentObj.unvoteExpired =
                    voteDocs[i].date + 3600 * config.hrsUntilUnvoteExpires <
                    moment().unix()
                        ? true
                        : false;
            }
        }

        return {
            success: true,
            comments: comments,
            isMore:
                totalCommentsCount >
                (page - 1) * config.commentsPerPage + config.commentsPerPage
                    ? true
                    : false,
        };
    },

    getUserFavoritedCommentsByPage: async (userId, page, authUser) => {
        const user = await UserModel.findOne({ username: userId })
            .lean()
            .exec();
        if (!user) {
            throw { notFoundError: true };
        }

        const [
            userFavoriteCommentsDocs,
            totalFavoriteCommentsCount,
        ] = await Promise.all([
            UserFavoriteModel.find({
                username: userId,
                type: "comment",
            })
                .sort({ _id: -1 })
                .skip((page - 1) * config.commentsPerPage)
                .limit(config.commentsPerPage)
                .lean(),
            UserFavoriteModel.countDocuments({
                username: userId,
                type: "comment",
            }).lean(),
        ]);

        let arrayOfCommentIds = [];

        for (i = 0; i < userFavoriteCommentsDocs.length; i++) {
            arrayOfCommentIds.push(userFavoriteCommentsDocs[i].id);
        }

        let commentsDbQuery = {
            id: {
                $in: arrayOfCommentIds,
            },
        };

        if (!authUser.showDead) commentsDbQuery.dead = false;

        const comments = await CommentModel.aggregate([
            {
                $match: commentsDbQuery,
            },
            {
                // $addFields: https://docs.mongodb.com/manual/reference/operator/aggregation/addFields/
                // in this case the comment add field called {__order} and the value is based on the index of $id (mongodb id)
                $addFields: {
                    __order: {
                        // sort by -> search the arrayOfItemIds match the $id of the doc, it means it is first created
                        $indexOfArray: [arrayOfCommentIds, "$id"],
                    },
                },
            },
            {
                $sort: {
                    __order: 1,
                },
            },
        ]);

        if (!authUser.userSignedIn) {
            return {
                success: true,
                comments: comments,
                isMore:
                    totalFavoriteCommentsCount >
                    (page - 1) * config.commentsPerPage + config.commentsPerPage
                        ? true
                        : false,
            };
        }

        const userCommentVoteDocs = await UserVoteModel.find({
            username: authUser.username,
            id: { $in: arrayOfCommentIds },
            type: "comment",
        })
            .lean()
            .exec();

        for (let i = 0; i < comments.length; i++) {
            if (comments[i].by === authUser.username) {
                const hasEditAndDeleteExpired =
                    comments[i].created +
                        3600 * config.hrsUntilEditAndDeleteExpires <
                        moment().unix() || comments[i].children.length > 0;

                comments[i].editAndDeleteExpired = hasEditAndDeleteExpired;
            }
        }

        for (let i = 0; i < userCommentVoteDocs.length; i++) {
            const commentObj = comments.find((comment) => {
                return comment.id === userCommentVoteDocs[i].id;
            });

            if (commentObj) {
                commentObj.upvotedByUser =
                    userCommentVoteDocs[i].upvote || false;
                commentObj.downvotedByUser =
                    userCommentVoteDocs[i].downvote || false;
                commentObj.votedOnByUser = true;
                commentObj.unvoteExpired =
                    userCommentVoteDocs[i].date +
                        3600 * config.hrsUntilUnvoteExpires <
                    moment().unix()
                        ? true
                        : false;
            }
        }

        return {
            success: true,
            comments: comments,
            isMore:
                totalFavoriteCommentsCount >
                (page - 1) * config.commentsPerPage + config.commentsPerPage
                    ? true
                    : false,
        };
    },

    getUserUpvotedCommentsByPage: async (page, authUser) => {
        const [voteDocs, totalUpvotedCommentsCount] = await Promise.all([
            UserVoteModel.find({
                username: authUser.username,
                upvote: true,
                type: "comment",
            })
                .sort({ date: -1 })
                .skip((page - 1) * config.commentsPerPage)
                .limit(config.commentsPerPage)
                .lean(),
            UserVoteModel.countDocuments({
                username: authUser.username,
                upvote: true,
                type: "comment",
            }).lean(),
        ]);

        let arrayOfCommentIds = [];

        for (i = 0; i < voteDocs.length; i++) {
            arrayOfCommentIds.push(voteDocs[i].id);
        }

        let commentsDbQuery = {
            id: {
                $in: arrayOfCommentIds,
            },
        };

        if (!authUser.showDead) commentsDbQuery.dead = false;

        const comments = await CommentModel.aggregate([
            {
                $match: commentsDbQuery,
            },
            {
                // $addFields: https://docs.mongodb.com/manual/reference/operator/aggregation/addFields/
                // in this case the comment add field called {__order} and the value is based on the index of $id (mongodb id)
                $addFields: {
                    __order: {
                        // sort by -> search the arrayOfItemIds match the $id of the doc, it means it is first created
                        $indexOfArray: [arrayOfCommentIds, "$id"],
                    },
                },
            },
            {
                $sort: {
                    __order: 1,
                },
            },
        ]).exec();

        for (let i = 0; i < voteDocs.length; i++) {
            const commentObj = comments.find((comment) => {
                return comment.id === voteDocs[i].id;
            });

            if (commentObj) {
                commentObj.upvotedByUser = voteDocs[i].upvote || false;
                commentObj.downvotedByUser = voteDocs[i].downvote || false;
                commentObj.votedOnByUser = true;
                commentObj.unvoteExpired =
                    voteDocs[i].date + 3600 * config.hrsUntilUnvoteExpires <
                    moment().unix()
                        ? true
                        : false;
            }
        }

        return {
            success: true,
            comments: comments,
            isMore:
                totalUpvotedCommentsCount >
                (page - 1) * config.commentsPerPage + config.commentsPerPage
                    ? true
                    : false,
        };
    },

    /**
     * Used once all comments initialized and ready to be sync to Algolia
     */
    updateAllCommentsToAlgolia: async () => {
        const comments = await CommentModel.find({}).lean().exec();
        for (let i = 0; i < comments.length; i++) {
            const comment = comments[i];
            const item = await ItemModel.findOne({ id: comment.parentItemId })
                .lean()
                .exec();

            if (item) {
                await searchApi.addNewComment(
                    comment,
                    comment.parentItemId,
                    item.commentCount
                );
            }
        }
    },
};

const moment = require("moment");

const ModerationLogModel = require("../../models/moderationLog.js");
const ItemModel = require("../../models/item");
const CommentModel = require("../../models/comment.js");
const UserModel = require("../../models/user.js");

const searchApi = require("../../routes/search/api.js");

const config = require("../../config.js");

module.exports = {
    killItem: async (itemId, moderator) => {
        const item = await ItemModel.findOneAndUpdate(
            { id: itemId },
            { $set: { dead: true, score: 0 } }
        )
            .lean()
            .exec();

        if (!item) {
            throw { submitError: true };
        }

        await searchApi.deleteItem(itemId);

        const newModerationLogDoc = new ModerationLogModel({
            moderatorUsername: moderator.username,
            actionType: "kill-item",
            itemId: itemId,
            itemTitle: item.title,
            itemBy: item.by,
            created: moment().unix(),
        });

        await newModerationLogDoc.save();

        return { success: true };
    },

    unkillItem: async (itemId, moderator) => {
        ItemModel.findOneAndUpdate({ id: itemId }, { $set: { dead: false } })
            .lean()
            .exec();

        if (!item) {
            throw { submitError: true };
        }

        await searchApi.addNewItem(item);

        const newModerationLogDoc = new ModerationLogModel({
            moderatorUsername: moderator.username,
            actionType: "unkill-item",
            itemId: itemId,
            itemTitle: item.title,
            itemBy: item.by,
            created: moment().unix(),
        });

        await newModerationLogDoc.save();
        return { success: true };
    },

    killComment: async (commentId, moderator) => {
        const comment = await CommentModel.findOneAndUpdate(
            { id: commentId },
            { $set: { dead: true } }
        )
            .lean()
            .exec();

        if (!comment) {
            throw { submitError: true };
        }

        await searchApi.deleteKilledComment(comment.id);

        const newModerationLogDoc = new ModerationLogModel({
            moderatorUsername: moderator.username,
            actionType: "kill-comment",
            commentId: commentId,
            commentBy: comment.by,
            itemTitle: comment.parentItemTitle,
            itemId: comment.parentItemId,
            created: moment().unix(),
        });

        await newModerationLogDoc.save();

        return { success: true };
    },

    unkillComment: async (commentId, moderator) => {
        const comment = await CommentModel.findOneAndUpdate(
            { id: commentId },
            { $set: { dead: false } }
        )
            .lean()
            .exec();

        if (!comment) {
            throw { submitError: true };
        }

        await searchApi.addUnkilledComment(comment);

        const newModerationLogDoc = new ModerationLogModel({
            moderatorUsername: moderator.username,
            actionType: "unkill-comment",
            commentId: commentId,
            commentBy: comment.by,
            itemTitle: comment.parentItemTitle,
            itemId: comment.parentItemId,
            created: moment().unix(),
        });

        await newModerationLogDoc.save();
    },

    addUserShadowBan: async (username, moderator) => {
        const user = await UserModel.findOneAndUpdate(
            { username: username },
            { $set: { shadowBanned: true } }
        )
            .lean()
            .exec();

        if (!user) {
            throw { submitError: true };
        }

        const newModerationLogDoc = new ModerationLogModel({
            moderatorUsername: moderator.username,
            actionType: "add-user-shadow-ban",
            username: username,
            created: moment().unix(),
        });

        await newModerationLogDoc.save();

        return { success: true };
    },

    removeUserShadowBan: async (username, moderator) => {
        const user = await UserModel.findOneAndUpdate(
            { username: username },
            { $set: { shadowBanned: false } }
        )
            .lean()
            .exec();

        if (!user) {
            throw { submitError: true };
        }

        const newModerationLogDoc = new ModerationLogModel({
            moderatorUsername: moderator.username,
            actionType: "remove-user-shadow-ban",
            username: username,
            created: moment().unix(),
        });

        await newModerationLogDoc.save();
        return { success: true };
    },

    getShadowBannedUsersByPage: async (page) => {
        const [users, totalNumOfUsers] = await Promise.all([
            UserModel.find({ shadowBanned: true }, "username")
                .sort({ _id: -1 })
                .skip((page - 1) * config.shadowBannedUsersPerPage)
                .limit(config.shadowBannedUsersPerPage)
                .lean(),
            UserModel.countDocuments({ shadowBanned: true }).lean(),
        ]);

        return {
            success: true,
            users: users,
            isMore:
                totalNumOfUsers >
                (page - 1) * config.shadowBannedUsersPerPage +
                    config.shadowBannedUsersPerPage
                    ? true
                    : false,
        };
    },

    addUserBan: async (username, moderator) => {
        const user = await UserModel.findOneAndUpdate(
            { username: username },
            { $set: { banned: true } }
        )
            .lean()
            .exec();

        if (!user) {
            throw { submitError: true };
        }

        const newModerationLogDoc = new ModerationLogModel({
            moderatorUsername: moderator.username,
            actionType: "add-user-ban",
            username: username,
            created: moment().unix(),
        });

        await newModerationLogDoc.save();

        return { success: true };
    },

    removeUserBan: async (username, moderator) => {
        const user = await UserModel.findOneAndUpdate(
            { username: username },
            { $set: { banned: false } }
        )
            .lean()
            .exec();

        if (!user) {
            throw { submitError: true };
        }

        const newModerationLogDoc = new ModerationLogModel({
            moderatorUsername: moderator.username,
            actionType: "remove-user-ban",
            username: username,
            created: moment().unix(),
        });

        await newModerationLogDoc.save();

        throw { submitError: true };
    },

    getBannedUsersByPage: async (page) => {
        const [users, totalNumOfUsers] = await Promise.all([
            UserModel.find({ banned: true }, "username")
                .sort({ _id: -1 })
                .skip((page - 1) * config.bannedUsersPerPage)
                .limit(config.bannedUsersPerPage)
                .lean(),
            UserModel.countDocuments({ shadowBanned: true }).lean(),
        ]);

        return {
            success: true,
            users: users,
            isMore:
                totalNumOfUsers >
                (page - 1) * config.bannedUsersPerPage +
                    config.bannedUsersPerPage
                    ? true
                    : false,
        };
    },

    getModerationLogsByPage: async (category, page) => {
        let dbQuery, categoryString;

        if (category === "users") {
            categoryString = "users";
            dbQuery = {
                $or: [
                    { actionType: "add-user-shadow-ban" },
                    { actionType: "remove-user-shadow-ban" },
                    { actionType: "add-user-ban" },
                    { actionType: "remove-user-ban" },
                ],
            };
        } else if (category === "items") {
            categoryString = "items";
            dbQuery = {
                $or: [
                    { actionType: "kill-item" },
                    { actionType: "unkill-item" },
                ],
            };
        } else if (category === "comments") {
            categoryString = "comments";
            dbQuery = {
                $or: [
                    { actionType: "kill-comment" },
                    { actionType: "unkill-comment" },
                ],
            };
        } else {
            categoryString = "all";
            dbQuery = {};
        }

        const [logs, totalNumOfLogs] = await Promise.all([
            ModerationLogModel.find(dbQuery)
                .sort({ _id: -1 })
                .skip((page - 1) * config.moderationLogsPerPage)
                .limit(config.moderationLogsPerPage)
                .lean(),
            ModerationLogModel.countDocuments(dbQuery).lean(),
        ]);

        return {
            success: true,
            logs: logs,
            categoryString: categoryString,
            isMore:
                totalNumOfLogs >
                (page - 1) * config.moderationLogsPerPage +
                    config.moderationLogsPerPage
                    ? true
                    : false,
        };
    },
};

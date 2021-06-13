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
};

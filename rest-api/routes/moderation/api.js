const moment = require("moment");

const ModerationLogModel = require("../../models/moderationLog.js");
const ItemModel = require("../../models/item");
const searchApi = require("../../routes/search/api.js");

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
};

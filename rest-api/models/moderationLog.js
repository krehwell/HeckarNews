const mongoose = require("mongoose");

/**
 * @property moderatorUsername: the username of the moderator who took the action.
 * @property actionType: the type of action the moderator took. This will be one of these strings: "kill-item", "unkill-item", "kill-comment", "unkill-comment", "add-user-shadow-ban", "remove-user-shadow-ban", "add-user-ban", or "remove-user-ban".
 * @property username: username of the user the moderator action is related to. This could be the author of the item/comment or the user that got banned.
 * @property itemId: id property of the item the moderator action was taken on.
 * @property itemTitle: title property of the item the moderator action was taken on.
 * @property itemBy: author's username property of the item the moderator action was taken on.
 * @property commentId: id property of the comment the moderator action was taken on.
 * @property commentBy: author's username property of the comment the moderator action was taken on.
 * @property created: UNIX timestamp that represents when the moderator action was taken.
 */
const ModerationLogSchema = new mongoose.Schema({
    moderatorUsername: {
        type: String,
        required: true,
    },

    actionType: {
        type: String,
        required: true,
    },

    username: String,
    itemId: String,
    itemTitle: String,
    itemBy: String,
    commentId: String,
    commentBy: String,
    created: Number,
});

ModerationLogSchema.index({ moderatorUsername: 1, actionType: 1 });

module.exports = mongoose.model("ModerationLog", ModerationLogSchema);

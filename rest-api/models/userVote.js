const mongoose = require("mongoose");

/**
 * @property username: the username of the user who upvoted the item or comment.
 * @property type: a string indicates the type of content that was voted on. Can be either an "item" or "comment" value.
 * @property id: the id of the item or comment that the user voted on.
 * @property parentItemId: the id of the item the comment belongs to. Only used for votes placed on comments.
 * @property upvote: a boolean value that indicates if the vote was an upvote.
 * @property downvote: a boolean value that indicates if the vote was a downvote. Downvoting is not allowed on items and will only be used for comments.
 * @property date: a UNIX timestamp that represents when the vote was cast.
 */
const UserVoteSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },

    type: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
    parentItemId: String,

    upvote: {
        type: Boolean,
        required: true,
    },
    downvote: {
        type: Boolean,
        required: true,
    },

    date: Number,
});

UserVoteSchema.index({
    username: 1,
    id: 1,
    parentItemId: 1,
    type: 1,
    upvote: 1,
    downvote: 1,
});

module.exports = mongoose.model("UserVote", UserVoteSchema);

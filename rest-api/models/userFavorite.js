const mongoose = require("mongoose");

/**
 * @property username: the username of the user who favorite this item
 * @property type: type of favorited item
 * @property id: the id of the hidden item
 * @property date: a UNIX timestamp that represents when the user set this item to be hidden
 */
const UserFavoriteSchema = new mongoose.Schema({
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
    date: Number,
});

UserFavoriteSchema.index({ username: 1, id: 1, type: 1 });

module.exports = mongoose.model("UserFavorite", UserFavoriteSchema);

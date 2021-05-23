const mongoose = require("mongoose");

/**
 * @property username: the username of the user who choose to hide this item
 * @property id: the id of the hidden item
 * @property date: a UNIX timestamp that represents when the user set this item to be hidden
 * @property itemCreationDate: date of the hidden item is created
 */
const UserHiddenSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true,
    },
    date: Number,
    itemCreationDate: Number,
});

UserHiddenSchema.index({ username: 1, id: 1 });

module.exports = mongoose.model("UserHidden", UserHiddenSchema);

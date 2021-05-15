const mongoose = require("mongoose");

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

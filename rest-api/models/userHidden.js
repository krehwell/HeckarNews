const mongoose = require("mongoose");

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

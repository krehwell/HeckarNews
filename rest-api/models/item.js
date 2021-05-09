const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true,
    },
    by: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    url: String,
    domain: String,
    text: String,
    points: {
        type: Number,
        default: 1,
        min: 1,
    },
    score: {
        type: Number,
        default: 0,
    },
    commentCount: {
        type: Number,
        default: 0,
    },
    created: Number,
    dead: {
        type: Boolean,
        default: false,
    },
});

ItemSchema.index({ id: 1, by: 1, type: 1, domain: 1, points: 1 });

module.exports = mongoose.model("Item", ItemSchema);

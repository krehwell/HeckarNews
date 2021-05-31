const mongoose = require("mongoose");

/**
 * @property id: the unique identifier given to each comment in the form of a randomly generated string
 * @property by: username of the user who created the comment
 * @property parentItemId: the id of the item the comment was placed on
 * @property parentItemTitle: the title of the item the comment was placed on
 * @property isParent: a boolean value that indicates whether or not the comment is a parent comment(not a child of any other comment)
 * @property parentCommentId: the id of the parent comment. This will only be added if the comment is a direct reply to another comment
 * @property children: holds references to all the comment children (or replies) for the comment. This will allow to do population when creating the comment section
 * @property text: body text for the commen
 * @property points: sum total of upvotes and downvotes the comment has received. The minimum point value for a comment is -4
 * @property created: UNIX timestamp that represents when the comment was created
 * @property dead: boolean value that indicates whether or not the comment has been killed
 */
const CommentSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true,
    },
    by: {
        type: String,
        required: true,
    },

    parentItemId: {
        type: String,
        required: true,
    },
    parentItemTitle: {
        type: String,
        required: true,
    },
    isParent: {
        type: Boolean,
        required: true,
    },
    parentCommentId: String,
    children: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Comment",
        },
    ],

    text: String,
    points: {
        type: Number,
        default: 1,
        min: -4,
    },
    created: Number,

    dead: {
        type: Boolean,
        default: false,
    },
});

/**
 * CommentModel.Find or CommentModel.FindOne will return
 * {...data, children: [object]} where `children` is the data of each child comment
 */
function autoPopulateChildrenComments(next) {
    if (this.options.getChildrenComment) {
        let filterObj = {};

        if (!this.options.showDeadComments) filterObj.dead = false;

        /**
         * Since inside `children` property saved is the Mongo _id/ObjectId
         * the data populate will search through the docs and replace it with
         * comment docs.
         * before: children: [objectId("8976fdsafskda"), objectId("kljsfd89fdsdfa")]
         * after: children: [{comment doc}, {comment doc}]
         *
         * Reference: Mongoose Populate: https://stackoverflow.com/a/53002303/13825733
         */
        this.populate({
            path: "children",
            match: filterObj,
            options: {
                getChildrenComment: true,
                showDeadComments: this.options.showDeadComments,
            },
        });

        next();
    } else {
        next();
    }
}

CommentSchema.pre("find", autoPopulateChildrenComments);
CommentSchema.pre("findOne", autoPopulateChildrenComments);

CommentSchema.index({
    id: 1,
    by: 1,
    parentItemId: 1,
    isParent: 1,
    parentCommentId: 1,
    points: 1,
});

module.exports = mongoose.model("Comment", CommentSchema);

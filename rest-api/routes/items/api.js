const xss = require("xss");
const linkifyUrls = require("linkify-urls");
const moment = require("moment");

const ItemModel = require("../../models/item.js");
const UserModel = require("../../models/user.js");
const UserVoteModel = require("../../models/userVote.js");

const utils = require("../utils.js");
const config = require("../../config.js");

module.exports = {
    /**
     * Step 1 - If a URL was given, validate that it is valid.
     *          If the URL is deemed to not be valid, an error will be sent back to the website.
     * Step 2 - Parse and prepare the title, URL, and text values before they are saved to the database.
     *          Process for the title:
     *          - trim extra spaces from the beginning and end of the string.
     *          - run the string through the XSS NPM package.
     *          Process for the URL:
     *          - trim extra spaces from the beginning and end of the string.
     *          - run the string through the XSS NPM package.
     *          Process for the text:
     *          - trim extra spaces from the beginning and end of the string.
     *          - remove all HTML tags from the string.
     *          - transform all asterisk (*) encapsulated text into <i></i> HTML elements.
     *          - transform all the URLs in the string into <a href=""> HTML elements.
     *          - run the string through the XSS NPM package.
     * Step 3 - Save the new item to the database.
     * Step 4 - In the database, increment the author's karma count by a value of 1.
     * Step 5 - Send a success response back to the website.
     */
    submitNewItem: async (title, url, text, authUser) => {
        const isValidUrl = utils.isValidUrl(url);

        if (url && !isValidUrl) {
            throw { invalidUrlError: true };
        }

        // filter content
        title = title.trim();
        title = xss(title);

        url = url.trim();
        url = xss(url);

        if (text) {
            text = text.trim();
            text = text.replace(/<[^>]+>/g, "");
            text = text.replace(/\*([^*]+)\*/g, "<i>$1</i>");
            text = linkifyUrls(text);
            text = xss(text);
        }

        const domain = url ? utils.getDomainFromUrl(url) : "";
        const itemType = utils.getItemType(title, url, text);

        // submit new post/item
        const newItem = new ItemModel({
            id: utils.generateUniqueId(12),
            by: authUser.username,
            title: title,
            type: itemType,
            url: url,
            domain: domain,
            text: text,
            created: moment().unix(),
        });

        const saveItem = await newItem.save();

        const updateUserKarma = await UserModel.findOneAndUpdate(
            { username: authUser.username },
            { $inc: { karma: 1 } }
        ).exec();

        return { success: true };
    },

    getItemById: async (itemId, authUser) => {
        const item = await ItemModel.findOne({ id: itemId }).exec();

        if (!item) {
            throw { notFoundError: true };
        }

        // show item even if user not logged in
        if (!authUser.userSignedIn) {
            return { success: true, item: item };
        }

        const [voteDoc] = await Promise.all([
            UserVoteModel.findOne({
                username: authUser.username,
                id: itemId,
            }).lean(),
        ]);

        /**
         * BUG     : don't know why item can't be mutate on first run.
         * NOT SURE: why below doesnt work?
         *           item["votedOnByUser"] = voteDoc ? true : false;
         * SOLUTION: as below, need to find why tho
         */
        const itemClone = { ...item._doc };

        itemClone.votedOnByUser = voteDoc ? true : false;

        // if item already 1 hour long, decline any vote
        itemClone.unvoteExpired =
            voteDoc &&
            voteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                moment().unix();

        return {
            success: true,
            item: itemClone,
        };
    },

    /**
     * Step 1 - Find the item in the database with the given id.
     *          If the item doesn't exist, an error will be sent back to the website.
     * Step 2 - Query the database for a user vote document with the given username and item id.
     *          If the document is found, this means the user has already voted on the item (users can only vote on an item once).
     *          An error response will be sent back to the website.
     * Step 3 - Create a new user vote document and save it to the database.
     *          Document will contain these values:
     *          - username for the user who requested the upvote action.
     *          - "item" string value that represents the type of content the upvote is for.
     *          - id of the item the upvote was requested for.
     *          - set the upvote field to true.
     *          - set the downvote field to false.
     *          - UNIX timestamp that represents when the vote was made by the user.
     * Step 4 - Increment the item's point value by 1.
     * Step 5 - Increment the item author's karma count by 1.
     * Step 6 - Send a success response back to the website.
     */
    upvoteItem: async (itemId, authUser) => {
        const [item, voteDoc] = await Promise.all([
            ItemModel.findOne({ id: itemId }),
            UserVoteModel.findOne({
                username: authUser.username,
                id: itemId,
                type: "item",
            }).lean(),
        ]);

        if (!item || item.by === authUser.username || item.dead) {
            throw { submitError: true };
        } else if (voteDoc) {
            // if user already vote dont allow to revote
            throw { submitError: true };
        }

        // create vote document
        const newUserVoteDoc = new UserVoteModel({
            username: authUser.username,
            type: "item",
            id: itemId,
            upvote: true,
            downvote: false,
            date: moment().unix(),
        });

        const saveVoteDoc = await newUserVoteDoc.save();

        item.points = item.points + 1;
        const saveItem = await item.save();

        // increment author karma
        await UserModel.findOneAndUpdate(
            { username: item.by },
            { $inc: { karma: 1 } }
        )
            .lean()
            .exec();

        return { success: true };
    },

    /**
     * Step 1 - Query the database for the item the original upvote belongs to.
     *          If the item doesn't exist, an error will be sent back to the website.
     * Step 2 - Query the database for a user vote document with the given username and item id.
     *          If the document isn't found, an error response will be sent back to the website.
     * Step 3 - Verify that the un-vote option hasn't expired.
     *          If the option has expired, an error response will be sent back to the website.
     * Step 4 - Remove the user vote document from the database.
     * Step 5 - Decrement the item's points value by 1.
     * Step 6 - Decrement the item author's karma count by 1.
     * Step 7 - Send a success response back to the website.
     */
    unvoteItem: async (itemId, authUser) => {
        const [item, voteDoc] = await Promise.all([
            ItemModel.findOne({ id: itemId }),
            UserVoteModel.findOne({
                username: authUser.username,
                id: itemId,
                type: "item",
            }),
        ]);

        if (
            !voteDoc ||
            voteDoc.date + 3600 * config.hrsUntilUnvoteExpires < moment().unix()
        ) {
            throw { submitError: true };
        }

        const removeVoteDoc = await voteDoc.remove();

        item.points = item.points - 1;

        const saveItem = await item.save();

        // decrement author karma
        await UserModel.findOneAndUpdate(
            { username: item.by },
            { $inc: { karma: -1 } }
        )
            .lean()
            .exec();
    },
};

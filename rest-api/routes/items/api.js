const xss = require("xss");
const linkifyUrls = require("linkify-urls");
const moment = require("moment");

const ItemModel = require("../../models/item.js");
const UserModel = require("../../models/user.js");
const UserVoteModel = require("../../models/userVote.js");
const UserFavoriteModel = require("../../models/userFavorite.js");
const UserHiddenModel = require("../../models/userHidden.js");
const CommentModel = require("../../models/comment.js");

const utils = require("../utils.js");
const config = require("../../config.js");

const searchApi = require("../search/api.js");

/// ITEMS API
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
            dead: authUser.shadowBanned ? true : false,
        });

        const newItemDoc = await newItem.save();

        await UserModel.findOneAndUpdate(
            { username: authUser.username },
            { $inc: { karma: 1 } }
        ).exec();

        if (!authUser.shadowBanned) {
            await searchApi.addNewItem(newItemDoc);
        }

        return { success: true };
    },

    getItemById: async (itemId, page, authUser) => {
        const showDeadComments = authUser.showDead ? true : false;

        let commentsDbQuery = {
            parentItemId: itemId,
            isParent: true,
        };

        if (!showDeadComments) commentsDbQuery.dead = false;

        const [item, comments, totalNumOfComments] = await Promise.all([
            ItemModel.findOne({ id: itemId }).lean(),
            CommentModel.find(commentsDbQuery, null, {
                getChildrenComment: true,
                showDeadComments: showDeadComments,
            })
                .sort({ points: -1, created: -1 })
                .skip((page - 1) * config.commentsPerPage)
                .limit(config.commentsPerPage)
                .lean(),
            CommentModel.countDocuments(commentsDbQuery).lean(),
        ]);

        if (!item) {
            throw { notFoundError: true };
        }

        /// IF USER NOT SIGNED IN
        if (!authUser.userSignedIn) {
            return {
                success: true,
                item: item,
                comments: comments,
                isMoreComments:
                    totalNumOfComments >
                    (page - 1) * config.commentsPerPage + config.commentsPerPage
                        ? true
                        : false,
            };
        }

        /// IF USER SIGNED IN
        const [
            voteDoc,
            favoriteDoc,
            hiddenDoc,
            commentVoteDocs,
        ] = await Promise.all([
            UserVoteModel.findOne({
                username: authUser.username,
                id: itemId,
                type: "item",
            }).lean(),
            UserFavoriteModel.findOne({
                username: authUser.username,
                id: itemId,
                type: "item",
            }).lean(),
            UserHiddenModel.findOne({
                username: authUser.username,
                id: itemId,
            }).lean(),
            UserVoteModel.find({
                username: authUser.username,
                type: "comment",
                parentItemId: itemId,
            }).lean(),
        ]);

        // setup all item and user relation
        item.votedOnByUser = voteDoc ? true : false;
        item.unvoteExpired =
            voteDoc &&
            voteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                moment().unix();
        item.favoritedByUser = favoriteDoc ? true : false;
        item.hiddenByUser = hiddenDoc ? true : false;

        // is item still able to be edited/deleted
        if (item.by === authUser.username) {
            const hasEditAndDeleteExpired =
                item.created + 3600 * config.hrsUntilEditAndDeleteExpires <
                    moment().unix() || item.commentCount > 0;

            item.editAndDeleteExpired = hasEditAndDeleteExpired;
        }

        // prepare to get item comment
        let userCommentVotes = [];

        for (let i = 0; i < commentVoteDocs.length; i++) {
            userCommentVotes.push(commentVoteDocs[i].id);
        }

        /**
         * check each comment within comment RECURSIVELY to
         * update either user has vote it or not
         * or allow user to edit its own comment or not
         */
        const updateComment = (comment) => {
            if (comment.by === authUser.username) {
                const hasEditAndDeleteExpired =
                    comment.created +
                        3600 * config.hrsUntilEditAndDeleteExpires <
                        moment().unix() || comment.children.length > 0;

                comment.editAndDeleteExpired = hasEditAndDeleteExpired;
            }

            if (userCommentVotes.includes(comment.id)) {
                comment.votedOnByUser = true;

                for (let i = 0; i < commentVoteDocs.length; i++) {
                    if (comment.id === commentVoteDocs[i].id) {
                        comment.unvoteExpired =
                            commentVoteDocs[i].date +
                                3600 * config.hrsUntilUnvoteExpires <
                            moment().unix()
                                ? true
                                : false;

                        comment.upvotedByUser =
                            commentVoteDocs[i].upvote || false;
                        comment.downvotedByUser =
                            commentVoteDocs[i].downvote || false;
                    }
                }
            }

            // IMPORTANT: this could be very dangerous if not tested seriously
            // CAVEAT: make sure comment gotten is limited at CommentModel.findOne({})
            // TODO: better to limit num of recursive too in the future.
            if (comment.children) {
                for (let i = 0; i < comment.children.length; i++) {
                    updateComment(comment.children[i]);
                }
            }
        };

        // call update comment function above if comment exist on current item
        if (comments) {
            for (let i = 0; i < comments.length; i++) {
                updateComment(comments[i]);
            }
        }

        return {
            success: true,
            item: item,
            comments: comments,
            isMoreComments:
                totalNumOfComments >
                (page - 1) * config.commentsPerPage + config.commentsPerPage
                    ? true
                    : false,
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

        await newUserVoteDoc.save();

        item.points = item.points + 1;
        await item.save();

        // increment author karma
        await UserModel.findOneAndUpdate(
            { username: item.by },
            { $inc: { karma: 1 } }
        )
            .lean()
            .exec();

        await searchApi.updateItemPointsCount(item.id, item.points);

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

        await voteDoc.remove();

        item.points = item.points - 1;

        await item.save();

        searchApi.updateItemPointsCount(item.id, item.points);

        // decrement author karma
        await UserModel.findOneAndUpdate(
            { username: item.by },
            { $inc: { karma: -1 } }
        )
            .lean()
            .exec();
    },

    /**
     * Step 1 - Query the database for the item the user wants to add to their favorites.
     *          If the item doesn't exist, an error will be sent back to the website.
     * Step 2 - Query the database to see if the user has already added the item to their favorites.
     *          If the user has already favorited the item, an error will be sent back to the website.
     * Step 3 - Create a new user favorite document and save it to the database.
     *          Document will contain these values:
     *          username for the user who made the request.
     *          "item" string value that represents the type of content the favorite is for.
     *          id of the item the user wants to add to their favorites.
     *          UNIX timestamp that represents the creation date.
     * Step 4 - Send success response back to the website.
     */
    favoriteItem: async (itemId, authUser) => {
        const [item, favorite] = await Promise.all([
            ItemModel.findOne({ id: itemId }).lean(),
            UserFavoriteModel.findOne({
                username: authUser.username,
                id: itemId,
                type: "item",
            }).lean(),
        ]);

        if (!item || favorite) {
            throw { submitError: true };
        }

        // save item to user favorite
        const newFavoriteDoc = new UserFavoriteModel({
            username: authUser.username,
            type: "item",
            id: itemId,
            date: moment().unix(),
        });

        const saveFavoriteItem = newFavoriteDoc.save();
        return { success: true };
    },

    unfavoriteItem: async (itemId, authUser) => {
        const removeItemFavorite = await UserFavoriteModel.findOneAndRemove({
            username: authUser.username,
            id: itemId,
        });

        if (!removeItemFavorite) {
            throw { submitError: false };
        }

        return { success: true };
    },

    /**
     * @summary When a user adds an item to their hidden list, that item will not be shown
     * to the user when they view item list pages (i.e. "/news", "/newest", "past")
     * ---
     * Step 1 - Query the database for an item with a given id.
     *          If the item document isn't found in the database, an error
     *          response will be sent back to the website.
     * Step 2 - Query the database for a hidden item document with the given username and item id.
     *          If the user's hidden document already exists, an error will be sent back to the website.
     * Step 3 - Create a new hidden item document and save it to the database.
     * Step 4 - Send a success response back to the website.
     */
    hideItem: async (itemId, authUser) => {
        const [item, hiddenDoc] = await Promise.all([
            ItemModel.findOne({ id: itemId }).lean(),
            UserHiddenModel.findOne({
                username: authUser.username,
                id: itemId,
            }).lean(),
        ]);

        if (!item || hiddenDoc) {
            throw { submitError: true };
        }

        const newHiddenDoc = new UserHiddenModel({
            username: authUser.username,
            id: itemId,
            date: moment().unix(),
            itemCreationDate: item.created,
        });

        saveHiddenItem = await newHiddenDoc.save();
        return { success: true };
    },

    unhideItem: async (itemId, authUser) => {
        const removeHideItem = await UserHiddenModel.findOneAndRemove({
            username: authUser.username,
            id: itemId,
        }).exec();

        if (!removeHideItem) {
            throw { submitError: false };
        }

        return { success: true };
    },

    /**
     * @summary Only the item and text content can be modified. The URL cannot be changed after submitting the item.
     * ---
     * Step 1 - Determine if the item can be edited.
     *          An error will be sent back to the website and the item's data
     *          will not be retrieved if one of these conditions occur:
     *          - The item has been killed by a moderator.
     *          - The item author's username doesn't match the authenticated user's username (a user can only edit an item they submitted).
     *          - The edit option has expired for the item (set for 2 hours after the item was created).
     *          - A comment has been placed on the item.
     */
    getEditItemPageData: async (itemId, authUser) => {
        const item = await ItemModel.findOne({ id: itemId }).lean().exec();
        if (!item) {
            throw { notFoundError: true };
        } else if (item.dead) {
            throw { notAllowedError: true };
        } else if (item.by !== authUser.username) {
            throw { notAllowedError: true };
        } else if (
            item.created + 3600 * config.hrsUntilEditAndDeleteExpires <
            moment().unix()
        ) {
            throw { notAllowedError: true };
        } else if (item.commentCount > 0) {
            throw { notAllowedError: true };
        }

        if (item.text) {
            item.textForEditing = item.text
                .replace(/<a\b[^>]*>/g, "")
                .replace(/<\/a>/g, "")
                .replace(/<i\b[^>]*>/g, "*")
                .replace(/<\/i>/g, "*");
        } else {
            item.textForEditing = "";
        }

        return { success: true, item: item };
    },

    editItem: async (itemId, newItemTitle, newItemText, authUser) => {
        const item = await ItemModel.findOne({ id: itemId }).exec();

        if (!item) {
            throw { submitError: true };
        } else if (item.dead) {
            throw { notAllowedError: true };
        } else if (item.by !== authUser.username) {
            throw { notAllowedError: true };
        } else if (
            item.created + 3600 * config.hrsUntilEditAndDeleteExpires <
            moment().unix()
        ) {
            throw { notAllowedError: true };
        } else if (item.commentCount > 0) {
            throw { notAllowedError: true };
        }

        const ogItemTitle = item.title;

        newItemTitle = newItemTitle.trim();
        newItemTitle = xss(newItemTitle);

        item.title = newItemTitle;

        if (!item.url && newItemText) {
            newItemText = newItemText.trim();
            newItemText = newItemText.replace(/<[^>]+>/g, "");
            newItemText = newItemText.replace(/\*([^*]+)\*/g, "<i>$1</i>");
            newItemText = linkifyUrls(newItemText);
            newItemText = xss(newItemText);
        }

        item.text = newItemText;

        if (ogItemTitle !== newItemTitle) {
            item.type = utils.getItemType(newItemTitle, item.url, newItemText);
        }

        await item.save();

        await searchApi.editItem(itemId, newItemTitle, newItemText);

        return { success: true };
    },

    getDeleteItemPageData: async (itemId, authUser) => {
        const item = await ItemModel.findOne({ id: itemId }).lean().exec();

        if (!item) {
            throw { notFoundError: true };
        } else if (item.dead) {
            throw { notAllowedError: true };
        } else if (item.by !== authUser.username) {
            throw { notAllowedError: true };
        } else if (
            item.created + 3600 * config.hrsUntilEditAndDeleteExpires <
            moment().unix()
        ) {
            throw { notAllowedError: true };
        } else if (item.commentCount > 0) {
            throw { notAllowedError: true };
        }

        return { success: true, item: item };
    },

    deleteItem: async (itemId, authUser) => {
        const item = await ItemModel.findOne({ id: itemId }).exec();

        if (!item) {
            throw { notFoundError: true };
        } else if (item.dead) {
            throw { notAllowedError: true };
        } else if (item.by !== authUser.username) {
            throw { notAllowedError: true };
        } else if (
            item.created + 3600 * config.hrsUntilEditAndDeleteExpires <
            moment().unix()
        ) {
            throw { notAllowedError: true };
        } else if (item.commentCount > 0) {
            throw { notAllowedError: true };
        }

        await item.remove();

        const newUserKarmaValue = authUser.karma - item.points;

        await UserModel.findOneAndUpdate(
            { username: authUser.username },
            { karma: newUserKarmaValue }
        ).exec();

        await searchApi.deleteItem(item.id);

        return { success: true };
    },

    /**
     * Step 1 - If the user is not signed-in, retrieve:
     *          - The items that have been submitted within the past config.maxAgeOfRankedItemsInDays days
     *          sorted by their points and creation date values.
     *          - Total number of items submitted in the config.maxAgeOfRankedItemsInDays days
     *          will be used for pagination purposes.
     * Step 2 - If the user is signed-in, retrieve this data:
     *          - All the user's hidden item documents from the past config.maxAgeOfRankedItemsInDays.
     *          - The items that have been submitted within the past config.maxAgeOfRankedItemsInDays
     *          sorted by their points and creation date values.
     *          - any item that is hidden by the user will not be included.
     *          - All the user's item upvotes from the past three days.
     *          any item the user has upvoted will contain a votedOnByUser value.
     *          this will tell the website if it should display the upvote arrow for each item.
     *          - Total number of items submitted in the past config.maxAgeOfRankedItemsInDays
     *          will be used for pagination purposes.
     * Step 3 - Regardless of whether or not the user is signed-in, the data sent back to the website should include the following:
     *          - Array of items retrieved from the database.
     *          - An isMore value that indicates whether or not there is an additional page of results to retrieve
     */
    getRankedItemsByPage: async (page, authUser) => {
        const startDate =
            moment().unix() - 86400 * config.maxAgeOfRankedItemsInDays;

        if (!authUser.userSignedIn) {
            /// GET DATA FOR A NON-SIGNED-IN USER
            const [items, totalItemCount] = await Promise.all([
                ItemModel.find({ created: { $gt: startDate }, dead: false })
                    .sort({ score: -1, _id: -1 })
                    .skip((page - 1) * config.itemsPerPage)
                    .limit(config.itemsPerPage)
                    .lean(),
                ItemModel.countDocuments({
                    created: { $gt: startDate },
                    dead: false,
                }).lean(),
            ]);

            // set item rank shown on each num of page, item rank [1, 2, 3, ..., 10, 11, 12]
            for (i = 0; i < items.length; i++) {
                items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        } else {
            /// GET DATA FOR A SIGNED-IN USER
            const hiddenDocs = await UserHiddenModel.find({
                username: authUser.username,
                itemCreationDate: { $gte: startDate },
            })
                .lean()
                .exec();

            // filter id of each hidden item
            let arrayOfHiddenItems = [];

            for (let i = 0; i < hiddenDocs.length; i++) {
                arrayOfHiddenItems.push(hiddenDocs[i].id);
            }

            // query all items and exclude($nin) hidden items
            let itemsDbQuery = {
                created: {
                    $gte: startDate,
                },
                id: {
                    $nin: arrayOfHiddenItems,
                },
            };

            if (!authUser.showDead) itemsDbQuery.dead = false;

            const items = await ItemModel.find(itemsDbQuery)
                .sort({ score: -1, _id: -1 })
                .skip((page - 1) * config.itemsPerPage)
                .limit(config.itemsPerPage)
                .lean()
                .exec();

            // be ready to retrieve the user's upvote history from the db
            let arrayOfItemIds = [];

            for (let i = 0; i < items.length; i++) {
                arrayOfItemIds.push(items[i].id);
            }

            const [userItemVoteDocs, totalItemCount] = await Promise.all([
                UserVoteModel.find({
                    username: authUser.username,
                    date: { $gte: startDate },
                    id: { $in: arrayOfItemIds },
                    type: "item",
                }).lean(),
                ItemModel.countDocuments(itemsDbQuery).lean(),
            ]);

            for (let i = 0; i < items.length; i++) {
                // set item rank shown on each num of page, item rank [1, 2, 3, ..., 10, 11, 12]
                items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);

                // is item allowed to be edited or deleted?
                if (items[i].by === authUser.username) {
                    const hasEditAndDeleteExpired =
                        items[i].created +
                            3600 * config.hrsUntilEditAndDeleteExpires <
                            moment().unix() || items[i].commentCount > 0;

                    items[i].editAndDeleteExpired = hasEditAndDeleteExpired;
                }

                // check if item has been voted by user
                const voteDoc = userItemVoteDocs.find((voteDoc) => {
                    return voteDoc.id === items[i].id;
                });

                if (voteDoc) {
                    items[i].votedOnByUser = true;
                    items[i].unvoteExpired =
                        voteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                        moment().unix()
                            ? true
                            : false;
                }
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        }
    },

    getNewestItemsByPage: async (page, authUser) => {
        if (!authUser.userSignedIn) {
            /// GET NEWEST ITEMS IF USER NOT SIGNED IN
            const [items, totalItemCount] = await Promise.all([
                ItemModel.find({ dead: false })
                    .sort({ _id: -1 })
                    .skip((page - 1) * config.itemsPerPage)
                    .limit(config.itemsPerPage)
                    .lean(),
                ItemModel.countDocuments({ dead: false }).lean(),
            ]);

            for (let i = 0; i < items.length; i++) {
                items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        } else {
            /// GET NEWEST ITEMS IF USER SIGNED IN
            const hiddenDocs = await UserHiddenModel.find({
                username: authUser.username,
            })
                .lean()
                .exec();

            // collect item id which set to hidden
            let arrayOfHiddenItems = [];

            for (let i = 0; i < hiddenDocs.length; i++) {
                arrayOfHiddenItems.push(hiddenDocs[i].id);
            }

            // query to get the suitable items
            let itemsDbQuery = {
                id: {
                    $nin: arrayOfHiddenItems,
                },
            };

            if (!authUser.showDead) itemsDbQuery.dead = false;

            const items = await ItemModel.find(itemsDbQuery)
                .sort({ _id: -1 })
                .skip((page - 1) * config.itemsPerPage)
                .limit(config.itemsPerPage)
                .lean()
                .exec();

            // collect each item id to retrieve user upvote next
            let arrayOfItemIds = [];

            for (let i = 0; i < items.length; i++) {
                arrayOfItemIds.push(items[i].id);
            }

            const [userItemVoteDocs, totalItemCount] = await Promise.all([
                UserVoteModel.find({
                    username: authUser.username,
                    id: { $in: arrayOfItemIds },
                    type: "item",
                }).lean(),
                ItemModel.countDocuments(itemsDbQuery).lean(),
            ]);

            for (let i = 0; i < items.length; i++) {
                // assign rank to each item
                items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);

                // is item allowed to be edited or deleted?
                if (items[i].by === authUser.username) {
                    const hasEditAndDeleteExpired =
                        items[i].created +
                            3600 * config.hrsUntilEditAndDeleteExpires <
                            moment().unix() || items[i].commentCount > 0;

                    items[i].editAndDeleteExpired = hasEditAndDeleteExpired;
                }

                // check if item has been voted by user
                const voteDoc = userItemVoteDocs.find((voteDoc) => {
                    return voteDoc.id === items[i].id;
                });

                if (voteDoc) {
                    items[i].votedOnByUser = true;
                    items[i].unvoteExpired =
                        voteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                        moment().unix()
                            ? true
                            : false;
                }
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        }
    },

    getRankedShowItemsByPage: async (page, authUser) => {
        const startDate =
            moment().unix() - 86400 * config.maxAgeOfRankedItemsInDays;

        if (!authUser.userSignedIn) {
            /// GET HN ITEMS FOR A NON-SIGNED-IN USER
            const [items, totalItemCount] = await Promise.all([
                ItemModel.find({
                    type: "show",
                    created: { $gte: startDate },
                    dead: false,
                })
                    .sort({ score: -1, _id: -1 })
                    .skip((page - 1) * config.itemsPerPage)
                    .limit(config.itemsPerPage)
                    .lean(),
                ItemModel.countDocuments({
                    type: "show",
                    created: { $gte: startDate },
                    dead: false,
                }).lean(),
            ]);

            // assign rank to each item
            for (i = 0; i < items.length; i++) {
                items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        } else {
            /// GET HN ITEMS FOR A SIGNED-IN USER
            const hiddenDocs = await UserHiddenModel.find({
                username: authUser.username,
                itemCreationDate: { $gte: startDate },
            })
                .lean()
                .exec();

            // collect each item id to retrieve user upvote next
            let arrayOfHiddenItems = [];

            for (let i = 0; i < hiddenDocs.length; i++) {
                arrayOfHiddenItems.push(hiddenDocs[i].id);
            }

            // query to get the item with type show
            let itemsDbQuery = {
                type: "show",
                created: {
                    $gte: startDate,
                },
                id: {
                    $nin: arrayOfHiddenItems,
                },
            };

            if (!authUser.showDead) itemsDbQuery.dead = false;

            const items = await ItemModel.find(itemsDbQuery)
                .sort({ score: -1, _id: -1 })
                .skip((page - 1) * config.itemsPerPage)
                .limit(config.itemsPerPage)
                .lean()
                .exec();

            // collect each item id to retrieve user upvote next
            let arrayOfItemIds = [];

            for (let i = 0; i < items.length; i++) {
                arrayOfItemIds.push(items[i].id);
            }

            const [userItemVoteDocs, totalItemCount] = await Promise.all([
                UserVoteModel.find({
                    username: authUser.username,
                    date: { $gte: startDate },
                    id: { $in: arrayOfItemIds },
                    type: "item",
                }).lean(),
                ItemModel.countDocuments(itemsDbQuery).lean(),
            ]);

            for (let i = 0; i < items.length; i++) {
                // assign rank to each item
                items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);

                // is item allowed to be edited or deleted?
                if (items[i].by === authUser.username) {
                    const hasEditAndDeleteExpired =
                        items[i].created +
                            3600 * config.hrsUntilEditAndDeleteExpires <
                            moment().unix() || items[i].commentCount > 0;

                    items[i].editAndDeleteExpired = hasEditAndDeleteExpired;
                }

                // check if item has been voted by user
                const voteDoc = userItemVoteDocs.find((voteDoc) => {
                    return voteDoc.id === items[i].id;
                });

                if (voteDoc) {
                    items[i].votedOnByUser = true;
                    items[i].unvoteExpired =
                        voteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                        moment().unix()
                            ? true
                            : false;
                }
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        }
    },

    getNewestShowItemsByPage: async (page, authUser) => {
        if (!authUser.userSignedIn) {
            // GET NEWEST ITEM FOR A NON-SIGNED-IN USER
            const [items, totalItemCount] = await Promise.all([
                ItemModel.find({ type: "show", dead: false })
                    .sort({ _id: -1 })
                    .skip((page - 1) * config.itemsPerPage)
                    .limit(config.itemsPerPage)
                    .lean(),
                ItemModel.countDocuments({ type: "show", dead: false }).lean(),
            ]);

            for (i = 0; i < items.length; i++) {
                items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        } else {
            // GET NEWEST ITEM FOR A SIGNED-IN USER
            const hiddenDocs = await UserHiddenModel.find({
                username: authUser.username,
            })
                .lean()
                .exec();

            // collect each item id to retrieve user upvote next
            let arrayOfHiddenItems = [];

            for (let i = 0; i < hiddenDocs.length; i++) {
                arrayOfHiddenItems.push(hiddenDocs[i].id);
            }

            // query to get the item with type show
            let itemsDbQuery = {
                type: "show",
                id: {
                    $nin: arrayOfHiddenItems,
                },
            };

            if (!authUser.showDead) itemsDbQuery.dead = false;

            const items = await ItemModel.find(itemsDbQuery)
                .sort({ _id: -1 })
                .skip((page - 1) * config.itemsPerPage)
                .limit(config.itemsPerPage)
                .lean()
                .exec();

            // collect each item id to retrieve user upvote next
            let arrayOfItemIds = [];

            for (let i = 0; i < items.length; i++) {
                arrayOfItemIds.push(items[i].id);
            }

            const [userItemVoteDocs, totalItemCount] = await Promise.all([
                UserVoteModel.find({
                    username: authUser.username,
                    id: { $in: arrayOfItemIds },
                    type: "item",
                }).lean(),
                ItemModel.countDocuments(itemsDbQuery).lean(),
            ]);

            for (let i = 0; i < items.length; i++) {
                // assign rank to each item
                items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);

                // is item allowed to be edited or deleted?
                for (let i = 0; i < items.length; i++) {
                    items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);

                    if (items[i].by === authUser.username) {
                        const hasEditAndDeleteExpired =
                            items[i].created +
                                3600 * config.hrsUntilEditAndDeleteExpires <
                                moment().unix() || items[i].commentCount > 0;

                        items[i].editAndDeleteExpired = hasEditAndDeleteExpired;
                    }
                }

                const voteDoc = userItemVoteDocs.find((voteDoc) => {
                    return voteDoc.id === items[i].id;
                });

                if (voteDoc) {
                    items[i].votedOnByUser = true;
                    items[i].unvoteExpired =
                        voteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                        moment().unix()
                            ? true
                            : false;
                }
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        }
    },

    getRankedAskItemsByPage: async (page, authUser) => {
        const startDate =
            moment().unix() - 86400 * config.maxAgeOfRankedItemsInDays;

        if (!authUser.userSignedIn) {
            /// GET ASK ITEM FOR A NON-SIGNED-IN USER
            const [items, totalItemCount] = await Promise.all([
                ItemModel.find({
                    type: "ask",
                    created: { $gt: startDate },
                    dead: false,
                })
                    .sort({ score: -1, _id: -1 })
                    .skip((page - 1) * config.itemsPerPage)
                    .limit(config.itemsPerPage)
                    .lean(),
                ItemModel.countDocuments({
                    type: "ask",
                    created: { $gt: startDate },
                    dead: false,
                }).lean(),
            ]);

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        } else {
            /// GET ASK ITEM FOR A SIGNED-IN USER
            const hiddenDocs = await UserHiddenModel.find({
                username: authUser.username,
                itemCreationDate: { $gte: startDate },
            })
                .lean()
                .exec();

            let arrayOfHiddenItems = [];

            for (let i = 0; i < hiddenDocs.length; i++) {
                arrayOfHiddenItems.push(hiddenDocs[i].id);
            }

            let itemsDbQuery = {
                type: "ask",
                created: {
                    $gte: startDate,
                },
                id: {
                    $nin: arrayOfHiddenItems,
                },
            };

            if (!authUser.showDead) itemsDbQuery.dead = false;

            const items = await ItemModel.find(itemsDbQuery)
                .sort({ score: -1, _id: -1 })
                .skip((page - 1) * config.itemsPerPage)
                .limit(config.itemsPerPage)
                .lean()
                .exec();

            // collect each item id to retrieve user upvote next
            let arrayOfItemIds = [];

            for (let i = 0; i < items.length; i++) {
                arrayOfItemIds.push(items[i].id);
            }

            const [userItemVoteDocs, totalItemCount] = await Promise.all([
                UserVoteModel.find({
                    username: authUser.username,
                    date: { $gte: startDate },
                    id: { $in: arrayOfItemIds },
                    type: "item",
                }).lean(),
                ItemModel.countDocuments(itemsDbQuery).lean(),
            ]);

            for (let i = 0; i < items.length; i++) {
                // assign rank to each item
                items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);

                // is item allowed to be edited or deleted?
                if (items[i].by === authUser.username) {
                    const hasEditAndDeleteExpired =
                        items[i].created +
                            3600 * config.hrsUntilEditAndDeleteExpires <
                            moment().unix() || items[i].commentCount > 0;

                    items[i].editAndDeleteExpired = hasEditAndDeleteExpired;
                }

                const voteDoc = userItemVoteDocs.find((voteDoc) => {
                    return voteDoc.id === items[i].id;
                });

                if (voteDoc) {
                    items[i].votedOnByUser = true;
                    items[i].unvoteExpired =
                        voteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                        moment().unix()
                            ? true
                            : false;
                }
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        }
    },

    getItemsBySiteDomain: async (domain, page, authUser) => {
        if (!authUser.userSignedIn) {
            /// GET ITEM BY SITE FOR A NON-SIGNED-IN USER
            const [items, totalItemCount] = await Promise.all([
                ItemModel.find({ domain: domain, dead: false })
                    .sort({ _id: -1 })
                    .skip((page - 1) * config.itemsPerPage)
                    .limit(config.itemsPerPage)
                    .lean(),
                ItemModel.countDocuments({
                    domain: domain,
                    dead: false,
                }).lean(),
            ]);

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        } else {
            /// GET ITEM BY SITE FOR A SIGNED-IN USER
            const hiddenDocs = await UserHiddenModel.find({
                username: authUser.username,
            })
                .lean()
                .exec();

            let arrayOfHiddenItems = [];

            for (let i = 0; i < hiddenDocs.length; i++) {
                arrayOfHiddenItems.push(hiddenDocs[i].id);
            }

            let itemsDbQuery = {
                domain: domain,
                id: {
                    $nin: arrayOfHiddenItems,
                },
            };

            if (!authUser.showDead) itemsDbQuery.dead = false;

            const items = await ItemModel.find(itemsDbQuery)
                .sort({ _id: -1 })
                .skip((page - 1) * config.itemsPerPage)
                .limit(config.itemsPerPage)
                .lean()
                .exec();

            // collect each item id to retrieve user upvote next
            let arrayOfItemIds = [];

            for (let i = 0; i < items.length; i++) {
                arrayOfItemIds.push(items[i].id);
            }

            const [userItemVoteDocs, totalItemCount] = await Promise.all([
                UserVoteModel.find({
                    username: authUser.username,
                    id: { $in: arrayOfItemIds },
                    type: "item",
                }).lean(),
                ItemModel.countDocuments(itemsDbQuery).lean(),
            ]);

            for (let i = 0; i < items.length; i++) {
                // is item allowed to be edited or deleted?
                if (items[i].by === authUser.username) {
                    const hasEditAndDeleteExpired =
                        items[i].created +
                            3600 * config.hrsUntilEditAndDeleteExpires <
                            moment().unix() || items[i].commentCount > 0;

                    items[i].editAndDeleteExpired = hasEditAndDeleteExpired;
                }

                const voteDoc = userItemVoteDocs.find((voteDoc) => {
                    return voteDoc.id === items[i].id;
                });

                if (voteDoc) {
                    items[i].votedOnByUser = true;
                    items[i].unvoteExpired =
                        voteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                        moment().unix()
                            ? true
                            : false;
                }
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        }
    },

    getItemsSubmittedByUser: async (userId, page, authUser) => {
        if (!authUser.userSignedIn) {
            /// GET SUBMITTED ITEM IF USER NOT LOGGED IN
            const [items, totalItemCount] = await Promise.all([
                ItemModel.find({ by: userId, dead: false })
                    .sort({ _id: -1 })
                    .skip((page - 1) * config.itemsPerPage)
                    .limit(config.itemsPerPage)
                    .lean(),
                ItemModel.countDocuments({ by: userId, dead: false }).lean(),
            ]);

            for (i = 0; i < items.length; i++) {
                items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        } else {
            /// GET SUBMITTED ITEM IF USER LOGGED IN
            const hiddenDocs = await UserHiddenModel.find({
                username: authUser.username,
            })
                .lean()
                .exec();

            let arrayOfHiddenItems = [];

            for (let i = 0; i < hiddenDocs.length; i++) {
                arrayOfHiddenItems.push(hiddenDocs[i].id);
            }

            let itemsDbQuery = {
                by: userId,
                id: {
                    $nin: arrayOfHiddenItems,
                },
            };

            if (!authUser.showDead) itemsDbQuery.dead = false;

            const items = await ItemModel.find(itemsDbQuery)
                .sort({ _id: -1 })
                .skip((page - 1) * config.itemsPerPage)
                .limit(config.itemsPerPage)
                .lean()
                .exec();

            // collect each item id to retrieve user upvote next
            let arrayOfItemIds = [];

            for (let i = 0; i < items.length; i++) {
                arrayOfItemIds.push(items[i].id);
            }

            const [userItemVoteDocs, totalItemCount] = await Promise.all([
                UserVoteModel.find({
                    username: authUser.username,
                    id: { $in: arrayOfItemIds },
                    type: "item",
                }).lean(),
                ItemModel.countDocuments(itemsDbQuery).lean(),
            ]);

            for (let i = 0; i < items.length; i++) {
                // rank each item
                items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);

                // item allow edit or deleted?
                if (items[i].by === authUser.username) {
                    const hasEditAndDeleteExpired =
                        items[i].created +
                            3600 * config.hrsUntilEditAndDeleteExpires <
                            moment().unix() || items[i].commentCount > 0;

                    items[i].editAndDeleteExpired = hasEditAndDeleteExpired;
                }

                // user has voted it?
                const voteDoc = userItemVoteDocs.find((voteDoc) => {
                    return voteDoc.id === items[i].id;
                });

                if (voteDoc) {
                    items[i].votedOnByUser = true;
                    items[i].unvoteExpired =
                        voteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                        moment().unix()
                            ? true
                            : false;
                }
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        }
    },

    getRankedItemsByDay: async (day, page, authUser) => {
        const isValidDate = utils.isValidDate(day);
        if (!isValidDate) {
            throw { invalidDateError: true };
        }

        const startTimestamp = moment(day).startOf("day").unix();
        const endTimestamp = moment(day).endOf("day").unix();

        if (!authUser.userSignedIn) {
            /// GET ITEM BY DAY FOR A NON-SIGNED-IN USER
            const [items, totalItemCount] = await Promise.all([
                ItemModel.find({
                    created: { $gte: startTimestamp, $lte: endTimestamp },
                    dead: false,
                })
                    .sort({ points: -1, _id: -1 })
                    .skip((page - 1) * config.itemsPerPage)
                    .limit(config.itemsPerPage)
                    .lean(),
                ItemModel.countDocuments({
                    created: { $gte: startTimestamp, $lte: endTimestamp },
                    dead: false,
                }).lean(),
            ]);

            for (i = 0; i < items.length; i++) {
                items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        } else {
            /// GET ITEM BY DAY FOR SIGNED-IN USER
            const hiddenDocs = await UserHiddenModel.find({
                username: authUser.username,
                itemCreationDate: { $gte: startTimestamp, $lte: endTimestamp },
            })
                .lean()
                .exec();

            let arrayOfHiddenItems = [];

            for (let i = 0; i < hiddenDocs.length; i++) {
                arrayOfHiddenItems.push(hiddenDocs[i].id);
            }

            let itemsDbQuery = {
                created: {
                    $gte: startTimestamp,
                    $lte: endTimestamp,
                },
                id: {
                    $nin: arrayOfHiddenItems,
                },
            };

            if (!authUser.showDead) itemsDbQuery.dead = false;

            const items = await ItemModel.find(itemsDbQuery)
                .sort({ points: -1, _id: -1 })
                .skip((page - 1) * config.itemsPerPage)
                .limit(config.itemsPerPage)
                .lean()
                .exec();

            // collect each item id to retrieve user upvote next
            let arrayOfItemIds = [];

            for (let i = 0; i < items.length; i++) {
                arrayOfItemIds.push(items[i].id);
            }

            const [userItemVoteDocs, totalItemCount] = await Promise.all([
                UserVoteModel.find({
                    username: authUser.username,
                    id: { $in: arrayOfItemIds },
                    type: "item",
                }).lean(),
                ItemModel.countDocuments(itemsDbQuery).lean(),
            ]);

            for (let i = 0; i < items.length; i++) {
                // assign rank to each item
                items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);

                // is item allowed to be edited or deleted?
                if (items[i].by === authUser.username) {
                    const hasEditAndDeleteExpired =
                        items[i].created +
                            3600 * config.hrsUntilEditAndDeleteExpires <
                            moment().unix() || items[i].commentCount > 0;

                    items[i].editAndDeleteExpired = hasEditAndDeleteExpired;
                }

                // user has voted this item?
                const voteDoc = userItemVoteDocs.find((voteDoc) => {
                    return voteDoc.id === items[i].id;
                });

                if (voteDoc) {
                    items[i].votedOnByUser = true;
                    items[i].unvoteExpired =
                        voteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                        moment().unix()
                            ? true
                            : false;
                }
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalItemCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        }
    },

    getUserFavoritedItemsByPage: async (username, page, authUser) => {
        const user = await UserModel.findOne({ username: username });

        if (!user) {
            throw { notFoundError: true };
        }

        const [
            userFavoriteItemsDocs,
            totalFavoriteItemsCount,
        ] = await Promise.all([
            UserFavoriteModel.find({ username: username, type: "item" })
                .sort({ _id: -1 })
                .skip((page - 1) * config.itemsPerPage)
                .limit(config.itemsPerPage)
                .lean(),
            UserFavoriteModel.countDocuments({
                username: username,
                type: "item",
            }).lean(),
        ]);

        // get items
        let arrayOfItemIds = [];

        for (i = 0; i < userFavoriteItemsDocs.length; i++) {
            arrayOfItemIds.push(userFavoriteItemsDocs[i].id);
        }

        let itemsDbQuery = {
            id: {
                $in: arrayOfItemIds,
            },
        };

        if (!authUser.showDead) itemsDbQuery.dead = false;

        const items = await ItemModel.aggregate([
            {
                // $match: https://docs.mongodb.com/manual/reference/operator/aggregation/match/
                $match: itemsDbQuery,
            },
            {
                // $addFields: https://docs.mongodb.com/manual/reference/operator/aggregation/addFields/
                $addFields: {
                    __order: {
                        // sort by -> search the arrayOfItemIds match the $id of the doc, it means it is first created
                        $indexOfArray: [arrayOfItemIds, "$id"],
                    },
                },
            },
            {
                $sort: {
                    __order: 1,
                },
            },
        ]).exec();

        for (i = 0; i < items.length; i++) {
            items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);
        }

        if (!authUser.userSignedIn) {
            /// GET USER FAVORITE ITEMS FOR NON-SIGNED-IN USER
            return {
                success: true,
                items: items,
                isMore:
                    totalFavoriteItemsCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        } else {
            /// GET USER FAVORITE ITEMS FOR SIGNED-IN USER
            const userItemVoteDocs = await UserVoteModel.find({
                username: authUser.username,
                id: { $in: arrayOfItemIds },
                type: "item",
            })
                .lean()
                .exec();

            for (let i = 0; i < items.length; i++) {
                if (items[i].by === authUser.username) {
                    const hasEditAndDeleteExpired =
                        items[i].created +
                            3600 * config.hrsUntilEditAndDeleteExpires <
                            moment().unix() || items[i].commentCount > 0;

                    items[i].editAndDeleteExpired = hasEditAndDeleteExpired;
                }

                const voteDoc = userItemVoteDocs.find((voteDoc) => {
                    return voteDoc.id === items[i].id;
                });

                if (voteDoc) {
                    items[i].votedOnByUser = true;
                    items[i].unvoteExpired =
                        voteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                        moment().unix()
                            ? true
                            : false;
                }
            }

            return {
                success: true,
                items: items,
                isMore:
                    totalFavoriteItemsCount >
                    (page - 1) * config.itemsPerPage + config.itemsPerPage
                        ? true
                        : false,
            };
        }
    },

    getUserHiddenItemsByPage: async (page, authUser) => {
        const hiddenDocs = await UserHiddenModel.find({
            username: authUser.username,
        })
            .sort({ _id: -1 })
            .skip((page - 1) * config.itemsPerPage)
            .limit(config.itemsPerPage)
            .lean()
            .exec();

        if (!hiddenDocs) {
            throw { success: true, items: [], isMore: false };
        }

        let arrayOfItemIds = [];

        for (i = 0; i < hiddenDocs.length; i++) {
            arrayOfItemIds.push(hiddenDocs[i].id);
        }

        let itemsDbQuery = {
            id: {
                $in: arrayOfItemIds,
            },
        };

        if (!authUser.showDead) itemsDbQuery.dead = false;

        const items = await ItemModel.aggregate([
            {
                // $match: https://docs.mongodb.com/manual/reference/operator/aggregation/match/
                $match: itemsDbQuery,
            },
            {
                // $addFields: https://docs.mongodb.com/manual/reference/operator/aggregation/addFields/
                $addFields: {
                    __order: {
                        // sort by -> search the arrayOfItemIds match the $id of the doc, it means it is first created
                        $indexOfArray: [arrayOfItemIds, "$id"],
                    },
                },
            },
            {
                $sort: {
                    __order: 1,
                },
            },
        ]);

        const [userItemVoteDocs, totalNumOfHiddenItems] = await Promise.all([
            UserVoteModel.find({
                username: authUser.username,
                id: { $in: arrayOfItemIds },
                type: "item",
            }).lean(),
            UserHiddenModel.countDocuments({
                username: authUser.username,
            }).lean(),
        ]);

        for (let i = 0; i < items.length; i++) {
            items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);

            items[i].hiddenByUser = true;

            if (items[i].by === authUser.username) {
                const hasEditAndDeleteExpired =
                    items[i].created +
                        3600 * config.hrsUntilEditAndDeleteExpires <
                        moment().unix() || items[i].commentCount > 0;

                items[i].editAndDeleteExpired = hasEditAndDeleteExpired;
            }

            const voteDoc = userItemVoteDocs.find((voteDoc) => {
                return voteDoc.id === items[i].id;
            });

            if (voteDoc) {
                items[i].votedOnByUser = true;
                items[i].unvoteExpired =
                    voteDoc.date + 3600 * config.hrsUntilUnvoteExpires <
                    moment().unix()
                        ? true
                        : false;
            }
        }

        return {
            success: true,
            items: items,
            isMore:
                totalNumOfHiddenItems >
                (page - 1) * config.itemsPerPage + config.itemsPerPage
                    ? true
                    : false,
        };
    },

    /**
     * Get The User Upvote Items.
     * User only can see his own upvote items.
     * if User try to see other user's upvote, return { notAllowedError: true } from item routes
     */
    getUserUpvotedItemsByPage: async (page, authUser) => {
        const [voteDocs, totalItemCount] = await Promise.all([
            UserVoteModel.find({
                username: authUser.username,
                upvote: true,
                type: "item",
            })
                .sort({ _id: -1 })
                .skip((page - 1) * config.itemsPerPage)
                .limit(config.itemsPerPage)
                .lean(),
            UserVoteModel.countDocuments({
                username: authUser.username,
                upvote: true,
                type: "item",
            }).exec(),
        ]);

        let arrayOfItemIds = [];

        for (i = 0; i < voteDocs.length; i++) {
            arrayOfItemIds.push(voteDocs[i].id);
        }

        let itemsDbQuery = {
            id: {
                $in: arrayOfItemIds,
            },
        };

        if (!authUser.showDead) itemsDbQuery.dead = false;

        const items = await ItemModel.aggregate([
            {
                // $match: https://docs.mongodb.com/manual/reference/operator/aggregation/match/
                $match: itemsDbQuery,
            },
            {
                // $addFields: https://docs.mongodb.com/manual/reference/operator/aggregation/addFields/
                $addFields: {
                    __order: {
                        // sort by -> search the arrayOfItemIds match the $id of the doc, it means it is first created
                        $indexOfArray: [arrayOfItemIds, "$id"],
                    },
                },
            },
            {
                $sort: {
                    __order: 1,
                },
            },
        ]).exec();

        for (i = 0; i < items.length; i++) {
            items[i].rank = (page - 1) * config.itemsPerPage + (i + 1);

            items[i].votedOnByUser = true;
            items[i].unvoteExpired =
                voteDocs[i].date + 3600 * config.hrsUntilUnvoteExpires <
                moment().unix()
                    ? true
                    : false;
        }

        return {
            success: true,
            items: items,
            isMore:
                totalItemCount >
                (page - 1) * config.itemsPerPage + config.itemsPerPage
                    ? true
                    : false,
        };
    },

    /**
     * Calculate Score is how to rank the item on /, /news, /show, /ask"
     * score = (P - 1) / (T + 2)^G
     * where:
     * P = points the item has received from upvotes (the -1 negates the submitter's vote that is automatically applied to the item when it is created).
     * T = amount of time that has passed since the item was created (in hours).
     * G = gravity, which defaults to 1.8 in the Hacker News algorithm. This determines how fast an item will fall down the rankings as time passes.
     * Step 1 - Query the database for items
     *          Items must have the following qualities:
     *          - Submitted in the past X amount of days.
     *          - Points value greater than 1. Items that haven't been upvoted will automatically have a score of 0.
     *          - Not dead (killed by a moderator). Killed items will automatically be removed from the rankings.
     * Step 2 - Calculate the score for each item and save the item change to the database.
     */
    updateScoreForItems: async () => {
        const startDate =
            moment().unix() - 86400 * config.maxAgeOfRankedItemsInDays;

        const items = await ItemModel.find({
            created: { $gt: startDate },
            points: { $gt: 1 },
            dead: false,
        }).exec();

        // here is the implementation of the algorithm above
        items.map(async (item) => {
            const ageInHours = (moment().unix() - item.created) / 3600;

            const gravity = config.scoreGravity;

            const score = (item.points - 1) / Math.pow(ageInHours + 2, gravity);

            item.score = score.toFixed(3);

            await item.save();
        });

        return { success: true };
    },

    /**
     * Used once all items initialized and ready to be sync to Algolia
     */
    updateAllItemsToAlgolia: async () => {
        const items = await ItemModel.find({}).lean().exec();
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            await searchApi.addNewItem(item);
        }
    },
};

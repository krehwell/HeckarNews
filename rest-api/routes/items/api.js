const xss = require("xss");
const linkifyUrls = require("linkify-urls");
const moment = require("moment");

const ItemModel = require("../../models/item.js");
const UserModel = require("../../models/user.js");

const utils = require("../utils.js");

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
        try {
            const isValidUrl = utils.isValidUrl(url);

            if (url && !isValidUrl) {
                throw { invalidUrlError: true };
            } else {
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
            }
        } catch (error) {
            // make sure to always send bad response from a known error
            if (!(error instanceof Error)) {
                throw error;
            } else {
                throw { submitError: true };
            }
        }
    },

    getItemById: async (itemId) => {
        try {
            const item = await ItemModel.findOne({ id: itemId });

            if (!item) {
                throw { notFoundError: true };
            }

            return {
                success: true,
                item: item,
            };
        } catch (error) {
            // make sure to always send bad response from a known error
            if (!(error instanceof Error)) {
                throw error;
            } else {
                throw { submitError: true };
            }
        }
    },
};

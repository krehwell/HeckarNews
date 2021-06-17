const nanoid = require("nanoid");
const url = require("url");
const psl = require("psl");
const validator = require("validator");

module.exports = {
    generateUniqueId: (length) => {
        const alphabet =
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        const generator = nanoid.customAlphabet(alphabet, length);

        return generator();
    },

    getDomainFromUrl: (paramUrl) => {
        const hostname = url.parse(paramUrl).hostname;

        const parsed = psl.parse(hostname);

        console.log("DOMAIN PARSED: ", parsed);
        return parsed ? parsed.domain : null;
    },

    validateEmail: (email) => {
        if (email === "") {
            return true;
        } else {
            return validator.isEmail(email);
        }
    },

    isValidUrl: (url) => {
        return validator.isURL(url, { require_protocol: true });
    },

    getItemType: (title, url, text) => {
        if (url) {
            if (title.toLowerCase().startsWith("show hn")) {
                return "show";
            } else {
                return "news";
            }
        } else {
            return "ask";
        }
    },

    isValidDate: (dateString) => {
        return validator.isISO8601(dateString);
    },
};

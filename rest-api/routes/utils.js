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

        return parsed ? parsed.domain : null;
    },

    validateEmail: (email) => {
        if (email === "") {
            return true;
        } else {
            return validator.isEmail(email);
        }
    },
};

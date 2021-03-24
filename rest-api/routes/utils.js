const nanoid = require("nanoid");
const url = require("url");
const psl = require("psl");

module.exports = {
    generateUniqueId: (length) => {
        const alphabet =
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        const generator = nanoid.customAlphabet(alphabet, length);

        return generator();
    },

    getDomainFromUrl: function (paramUrl) {
        const hostname = url.parse(paramUrl).hostname;

        const parsed = psl.parse(hostname);

        return parsed ? parsed.domain : null;
    },
};

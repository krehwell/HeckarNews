const algoliasearch = require("algoliasearch");

/// ALGOLIA CONFIGURATION
const client = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_PRIVATE_API_KEY
);

const index = client.initIndex("submission");

module.exports = {

};

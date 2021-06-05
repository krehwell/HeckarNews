const algoliasearch = require("algoliasearch");

/// ALGOLIA CONFIGURATION
const client = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_PRIVATE_API_KEY
);

const index = client.initIndex("submissions");

module.exports = {
    addNewItem: async (item) => {
        await index.saveObject({
            objectID: item.id,
            type: "item",
            by: item.by,
            title: item.title,
            itemType: item.type,
            url: item.url,
            domain: item.domain,
            text: item.text,
            created: item.created,
            points: item.points,
            commentCount: item.commentCount,
        });

        return { success: true };
    },

    editItem: async (id, newItemTitle, newItemText) => {
        await index.partialUpdateObject({
            objectID: id,
            title: newItemTitle,
            text: newItemText,
        });

        return { success: true };
    },

    deleteItem: async (id) => {
        await index.deleteObject(id);

        return { success: true };
    },

    updateItemPointsCount: async (id, newPointsValue) => {
        await index.partialUpdateObject({
            objectID: id,
            points: newPointsValue,
        });

        return { success: true };
    },
};

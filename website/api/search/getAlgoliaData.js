import algoliasearch from "algoliasearch/lite";
import moment from "moment";

const searchClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_PUBLIC_API_KEY);

const indexRankedByPopularity = searchClient.initIndex("submissions_ranked_by_popularity");
const indexRankedByDate = searchClient.initIndex("submissions_ranked_by_date");

export default async function getAlgoliaData(query) {
    try {
        let sortBy;

        if (query.sortBy === "date") {
            sortBy = "date";
        } else {
            sortBy = "popularity";
        }

        let timestampRangeString, dateRangeType;

        if (query.dateRange) {
            if (query.dateRange === "last24h") {
                timestampRangeString = `created:${moment().unix() - 24 * 3600} TO ${moment().unix()}`;
                dateRangeType = "last24h";
            } else if (query.dateRange === "pastWeek") {
                timestampRangeString = `created:${moment().unix() - 7 * 24 * 3600} TO ${moment().unix()}`;
                dateRangeType = "pastWeek";
            } else if (query.dateRange === "pastMonth") {
                timestampRangeString = `created:${moment().unix() - 30 * 24 * 3600} TO ${moment().unix()}`;
                dateRangeType = "pastMonth";
            } else if (query.dateRange === "pastYear") {
                timestampRangeString = `created:${moment().unix() - 365 * 24 * 3600} TO ${moment().unix()}`;
                dateRangeType = "pastYear";
            } else if (query.dateRange === "custom") {
                timestampRangeString = `created:${query.startDate} TO ${query.endDate}`;
                dateRangeType = "custom";
            } else {
                timestampRangeString = "";
                dateRangeType = "allTime";
            }
        } else {
            timestampRangeString = "";
            dateRangeType = "allTime";
        }

        let facetFilters = [];
        let itemType;

        if (query.itemType) {
            if (query.itemType === "comment") {
                facetFilters.push("type:comment");
                itemType = "comment";
            } else if (query.itemType === "item") {
                facetFilters.push("type:item");
                itemType = "item";
            } else {
                itemType = "all";
            }
        } else {
            itemType = "all";
        }

        const searchQueryData = {
            page: query.page > 0 ? query.page - 1 : 0,
            hitsPerPage: 30,
            typoTolerance: true,
            filters: timestampRangeString,
            facetFilters: facetFilters,
        };

        const content =
            sortBy === "date"
                ? await indexRankedByDate.search(query.q, searchQueryData)
                : await indexRankedByPopularity.search(query.q, searchQueryData);

        content.sortBy = sortBy;
        content.dateRange = dateRangeType;
        content.itemType = itemType;

        return content;
    } catch (error) {
        return { getDataError: true };
    }
}

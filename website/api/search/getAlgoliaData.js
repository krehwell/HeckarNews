import algoliasearch from "algoliasearch/lite";

const searchClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_PUBLIC_API_KEY);

const indexRankedByPopularity = searchClient.initIndex("submissions_ranked_by_popularity");
const indexRankedByDate = searchClient.initIndex("submissions_ranked_by_date");

export default async function getAlgoliaData(query) {
    try {
        const content = await indexRankedByPopularity.search(query.q);
        return content;
    } catch (error) {
        console.log(error);
        return { getDataError: true };
    }
}

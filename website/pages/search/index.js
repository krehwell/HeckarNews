import HeadMetadata from "../../components/headMetadata.js";
import SearchPageHeader from "../../components/search/header.js";
import SearchPageFooter from "../../components/search/footer.js";

import getAlgoliaData from "../../api/search/getAlgoliaData.js";

export default function Search({ searchQuery, hits, getDataError}) {
    return (
        <div className="search-wrapper">
            <HeadMetadata title="Search | HeckarNews" />
            <SearchPageHeader searchQuery={searchQuery} showSearchBar showSettingsButton showBackButton />
            <div className="search-results"></div>
            <SearchPageFooter />
        </div>
    );
}

export async function getServerSideProps({ query }) {
    const apiResult = await getAlgoliaData(query);

    return {
        props: {
            searchQuery: query.q ? query.q : "",
            hits: apiResult.hits ? apiResult.hits : [],
            getDataError: apiResult.error || false,
        },
    };
}

import HeadMetadata from "../../components/headMetadata.js";
import SearchPageHeader from "../../components/search/header.js";
import SearchPageFooter from "../../components/search/footer.js";

export default function Search({ searchQuery }) {
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
    return {
        props: {
            searchQuery: query.q ? query.q : "",
        },
    };
}

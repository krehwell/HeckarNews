import HeadMetadata from "../../components/headMetadata.js";
import SearchPageHeader from "../../components/search/header.js";
import SearchPageFooter from "../../components/search/footer.js";
import Item from "../../components/search/item.js";
import Comment from "../../components/search/comment.js";

import getAlgoliaData from "../../api/search/getAlgoliaData.js";

export default function Search({ searchQuery, hits, getDataError }) {
    return (
        <div className="search-wrapper">
            <HeadMetadata title="Search | HeckarNews" />
            <SearchPageHeader searchQuery={searchQuery} showSearchBar showSettingsButton showBackButton />
            <div className="search-results">
                <div className="search-results-items">
                    {hits.length > 0 && !getDataError
                        ? hits.map((hit, index) => {
                              return hit.type === "item" ? (
                                  <>
                                      <div
                                          style={{
                                              padding: "8px 0px",
                                              borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                                          }}>
                                          <Item item={hit} key={hit.objectID} />
                                      </div>
                                  </>
                              ) : (
                                  <Comment comment={hit} key={hit.objectID} />
                              );
                          })
                        : null}
                    {getDataError ? (
                        <div className="search-error-msg">
                            <span>An error occurred.</span>
                        </div>
                    ) : null}
                </div>
            </div>
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

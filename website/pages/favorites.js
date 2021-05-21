import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";
import ItemsList from "../components/itemsList.js";

import getUserFavoritedItemsByPage from "../api/items/getUserFavoritedItemsByPage.js";

export default function Favorites({
    items,
    showItems,
    isMoreItems,
    comments,
    showComments,
    isMoreComments,
    userId,
    page,
    authUserData,
    notFoundError,
    getDataError,
    goToString,
}) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata
                title={
                    !notFoundError
                        ? `${userId}'s favorites | Coder News`
                        : "Coder News"
                }
            />
            <Header
                userSignedIn={authUserData && authUserData.userSignedIn}
                username={authUserData && authUserData.username}
                karma={authUserData && authUserData.karma}
                goto={goToString}
                label="favorites"
            />
            <div className="items-list-content-container">
                {!getDataError && !notFoundError ? (
                    <>
                        <div
                            className={
                                showItems
                                    ? "favorites-top-links items"
                                    : "favorites-top-links comments"
                            }>
                            <span className={showItems ? "active" : null}>
                                <a href={`/favorites?id=${userId}`}>
                                    submissions
                                </a>
                            </span>
                            <span> | </span>
                            <span className={showComments ? "active" : null}>
                                <a href={`/favorites?id=${userId}&comments=t`}>
                                    comments
                                </a>
                            </span>
                        </div>

                        {showItems ? (
                            <>
                                {items.length ? (
                                    /* FAVORITES ITEM */
                                    <ItemsList
                                        items={items}
                                        goToString={goToString}
                                        userSignedIn={authUserData.userSignedIn}
                                        currUsername={authUserData.username}
                                        showUnfavoriteOption={
                                            userId === authUserData.username
                                        }
                                        showRank={true}
                                        isMoreLink={`/favorites?id=${userId}&page=${
                                            page + 1
                                        }`}
                                        isMore={isMoreItems}
                                    />
                                ) : (
                                    <div className="favorites-none-found-msg items">
                                        <p>
                                            {userId} hasn’t added any favorite
                                            submissions yet.
                                        </p>
                                        <p>
                                            To add an item to your own
                                            favorites, click on its timestamp to
                                            go to its page, then click
                                            'favorite' at the top.
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : null}
                        {showComments ? <></> : null}
                    </>
                ) : (
                    <div className="items-list-error-msg">
                        {notFoundError ? (
                            <span>No such user.</span>
                        ) : (
                            <span>An error occurred.</span>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export async function getServerSideProps({ req, query }) {
    const userId = query.id ? query.id : "";
    const page = query.page ? parseInt(query.page) : 1;

    const showItems = query.comments === "t" ? false : true;

    let itemsApiResult, commentsApiResult, authUserData;

    if (showItems) {
        itemsApiResult = await getUserFavoritedItemsByPage(userId, page, req);

        authUserData = itemsApiResult.authUser ? itemsApiResult.authUser : {};

        commentsApiResult = {};
    } else {
        // make api call to get comments data

        authUserData = {};

        commentsApiResult = {};
        itemsApiResult = {};
    }

    const goToString =
        page > 1
            ? `favorites?id=${userId}${
                  showItems ? "" : "&comments=t"
              }&page=${page}`
            : `favorites?id=${userId}${showItems ? "" : "&comments=t"}`;

    // console.log(itemsApiResult);

    return {
        props: {
            items: (itemsApiResult && itemsApiResult.items) || [],
            showItems: showItems || false,
            isMoreItems: (itemsApiResult && itemsApiResult.isMore) || false,
            comments: (commentsApiResult && commentsApiResult.comments) || [],
            showComments: !showItems,
            isMoreComments:
                (commentsApiResult && commentsApiResult.isMore) || false,
            userId: userId || "",
            page: page || 0,
            authUserData: authUserData || {},
            notFoundError:
                itemsApiResult.notFoundError ||
                commentsApiResult.notFoundError ||
                false,
            getDataError:
                itemsApiResult.getDataError ||
                commentsApiResult.getDataError ||
                false,
            goToString: goToString || "",
        },
    };
}

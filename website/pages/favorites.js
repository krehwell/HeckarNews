import Link from "next/link";

import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";
import ItemsList from "../components/itemsList.js";
import CommentsList from "../components/commentsList.js";

import getUserFavoritedItemsByPage from "../api/items/getUserFavoritedItemsByPage.js";
import getUserFavoritedCommentsByPage from "../api/comments/getUserFavoritedCommentsByPage.js";

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
            <HeadMetadata title={!notFoundError ? `${userId}'s favorites | HeckarNews` : "HeckarNews"} />
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
                        <div className={showItems ? "favorites-top-links items" : "favorites-top-links comments"}>
                            <span className={showItems ? "active" : null}>
                                <Link href={`/favorites?id=${userId}`}>submissions</Link>
                            </span>
                            <span> | </span>
                            <span className={showComments ? "active" : null}>
                                <Link href={`/favorites?id=${userId}&comments=t`}>comments</Link>
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
                                        showUnfavoriteOption={userId === authUserData.username}
                                        showRank={true}
                                        isMoreLink={`/favorites?id=${userId}&page=${page + 1}`}
                                        isMore={isMoreItems}
                                        isModerator={authUserData.isModerator}
                                    />
                                ) : (
                                    <div className="favorites-none-found-msg items">
                                        <p>{userId} hasn’t added any favorite submissions yet.</p>
                                        <p>
                                            To add an item to your own favorites, click on its timestamp to go to its
                                            page, then click 'favorite' at the top.
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : null}


                        {showComments ? (
                            <>
                                {showComments ? (
                                    <>
                                        {/* FAVORITES COMMENTS */ }
                                        {comments.length ? (
                                            <CommentsList
                                                comments={comments}
                                                goToString={goToString}
                                                userSignedIn={authUserData.userSignedIn}
                                                currUsername={authUserData.username}
                                                showUnfavoriteOption={userId === authUserData.username}
                                                showDownvote={authUserData.showDownvote}
                                                isMoreLink={`/favorites?id=${userId}&page=${page + 1}&comments=t`}
                                                isMore={isMoreComments}
                                                isModerator={authUserData.isModerator}
                                            />
                                        ) : (
                                            <div className="favorites-none-found-msg comments">
                                                <p>{userId} hasn’t added any favorite comments yet.</p>
                                                <p>
                                                    To add a comment to your own favorites, click on its timestamp to go
                                                    to its page, then click 'favorite' at the top.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </>
                        ) : null}
                    </>
                ) : (
                    <div className="items-list-error-msg">
                        {notFoundError ? <span>No such user.</span> : <span>An error occurred.</span>}
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
        /// GET FAVORITES ITEM
        itemsApiResult = await getUserFavoritedItemsByPage(userId, page, req);
        authUserData = itemsApiResult.authUser ? itemsApiResult.authUser : {};
        commentsApiResult = {};
    } else {
        /// GET FAVORITES COMMENTS
        commentsApiResult = await getUserFavoritedCommentsByPage(userId, page, req);
        authUserData = commentsApiResult.authUser ? commentsApiResult.authUser : {};
        itemsApiResult = {};
    }

    const goToString =
        page > 1
            ? `favorites?id=${userId}${showItems ? "" : "&comments=t"}&page=${page}`
            : `favorites?id=${userId}${showItems ? "" : "&comments=t"}`;

    // console.log(itemsApiResult);

    return {
        props: {
            items: (itemsApiResult && itemsApiResult.items) || [],
            showItems: showItems || false,
            isMoreItems: (itemsApiResult && itemsApiResult.isMore) || false,
            comments: (commentsApiResult && commentsApiResult.comments) || [],
            showComments: !showItems,
            isMoreComments: (commentsApiResult && commentsApiResult.isMore) || false,
            userId: userId || "",
            page: page || 0,
            authUserData: authUserData || {},
            notFoundError: itemsApiResult.notFoundError || commentsApiResult.notFoundError || false,
            getDataError: itemsApiResult.getDataError || commentsApiResult.getDataError || false,
            goToString: goToString || "",
        },
    };
}

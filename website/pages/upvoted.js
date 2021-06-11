import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";
import ItemsList from "../components/itemsList.js";
import CommentsList from "../components/commentsList.js";

import getUserUpvotedItemsByPage from "../api/items/getUserUpvotedItemsByPage.js";
import getUserUpvotedCommentsByPage from "../api/comments/getUserUpvotedCommentsByPage.js";

export default function Upvoted({
    items,
    showItems,
    isMoreItems,
    comments,
    showComments,
    isMoreComments,
    authUserData,
    userId,
    page,
    getDataError,
    notAllowedError,
    goToString,
}) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata title={`Upvoted ${showItems ? "Items" : "Comments"} | HeckarNews`} />
            <Header
                userSignedIn={authUserData && authUserData.userSignedIn}
                username={authUserData && authUserData.username}
                karma={authUserData && authUserData.karma}
                goto={goToString}
                label="upvoted"
            />
            <div className="items-list-content-container">
                {!getDataError && !notAllowedError ? (
                    <>
                        {showItems ? (
                            <ItemsList
                                items={items}
                                goToString={goToString}
                                userSignedIn={authUserData.userSignedIn}
                                currUsername={authUserData.username}
                                showRank={true}
                                isMoreLink={`/upvoted?id=${userId}&page=${page + 1}`}
                                isMore={isMoreItems}
                                isModerator={authUserData.isModerator}
                            />
                        ) : null}
                        {showComments ? (
                            <>
                                {showComments ? (
                                    <CommentsList
                                        comments={comments}
                                        userSignedIn={authUserData.userSignedIn}
                                        currUsername={authUserData.username}
                                        showDownvote={authUserData.showDownvote}
                                        isMoreLink={`/upvoted?id=${userId}&page=${page + 1}&comments=t`}
                                        isMore={isMoreComments}
                                        isModerator={authUserData.isModerator}
                                    />
                                ) : null}
                            </>
                        ) : null}
                    </>
                ) : (
                    <div className="items-list-error-msg">
                        {notAllowedError ? <span>Can’t display that.</span> : <span>An error occurred.</span>}
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
        /// UPVOTED ITEMS
        itemsApiResult = await getUserUpvotedItemsByPage(userId, page, req);
        authUserData = itemsApiResult.authUser ? itemsApiResult.authUser : {};
        commentsApiResult = {};
    } else {
        /// UPVOTED COMMENT
        commentsApiResult = await getUserUpvotedCommentsByPage(userId, page, req);
        authUserData = commentsApiResult.authUser ? commentsApiResult.authUser : {};
        itemsApiResult = {};
    }

    const goToString =
        page > 1
            ? `upvoted?id=${userId}${showItems ? "" : "&comments=t"}&page=${page}`
            : `upvoted?id=${userId}${showItems ? "" : "&comments=t"}`;

    return {
        props: {
            items: (itemsApiResult && itemsApiResult.items) || [],
            showItems: showItems || false,
            isMoreItems: (itemsApiResult && itemsApiResult.isMore) || false,
            comments: (commentsApiResult && commentsApiResult.comments) || [],
            showComments: !showItems,
            isMoreComments: (commentsApiResult && commentsApiResult.isMore) || false,
            authUserData: authUserData || {},
            userId: userId || "",
            page: page || 0,
            getDataError: itemsApiResult.getDataError || commentsApiResult.getDataError || false,
            notAllowedError: itemsApiResult.notAllowedError || commentsApiResult.notAllowedError || false,
            goToString: goToString || "",
        },
    };
}

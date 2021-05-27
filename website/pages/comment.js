import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";
import CommentComponent from "../components/comment.js";

import getCommentById from "../api/comments/getCommentById.js";

import truncateCommentText from "../utils/truncateCommentText.js";

export default function Comment({ comment, authUserData, notFoundError, getDataError, goToString }) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata
                title={comment ? `${truncateCommentText(comment.pageMetadataTitle || "")} | HeckarNews` : "HeckarNews"}
            />
            <Header
                userSignedIn={authUserData && authUserData.userSignedIn}
                username={authUserData && authUserData.username}
                karma={authUserData && authUserData.karma}
                goto={goToString}
            />
            <div className="comment-content-container">
                {comment && !getDataError && !notFoundError ? (
                    <>
                        <CommentComponent
                            comment={comment}
                            userSignedIn={authUserData.userSignedIn}
                            currUsername={authUserData.username}
                            goToString={goToString}
                            showDownvote={authUserData.showDownvote}
                            showFavoriteOption={true}
                        />
                    </>
                ) : (
                    <div className="comment-get-data-error-msg">
                        {notFoundError ? <span>No such comment.</span> : <span>An error occurred.</span>}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export async function getServerSideProps({ req, query }) {
    const commentId = query.id ? query.id : "";

    const apiResult = await getCommentById(commentId, req);

    return {
        props: {
            comment: (apiResult && apiResult.comment) || {},
            authUserData: apiResult && apiResult.authUser ? apiResult.authUser : {},
            notFoundError: (apiResult && apiResult.notFoundError) || false,
            getDataError: (apiResult && apiResult.getDataError) || false,
            goToString: `comment?id=${commentId}`,
        },
    };
}

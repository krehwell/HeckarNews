import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";
import CommentComponent from "../components/comment.js";
import CommentSection from "../components/commentSection.js";

import getCommentById from "../api/comments/getCommentById.js";

import truncateCommentText from "../utils/truncateCommentText.js";

export default function Comment({
    comment,
    authUserData,
    notFoundError,
    getDataError,
    goToString,
    page,
    isMoreChildrenComments,
}) {
    // console.log("COMMENT", comment);
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
                            isModerator={authUserData.isModerator}
                        />
                        <CommentSection
                            comments={comment.children}
                            parentItemId={comment.parentItemId}
                            isMore={isMoreChildrenComments}
                            isMoreLink={`/comment?id=${comment.id}&page=${page + 1}`}
                            userSignedIn={authUserData.userSignedIn}
                            currUsername={authUserData.username}
                            showDownvote={authUserData.showDownvote}
                            goToString={goToString}
                            isModerator={authUserData.isModerator}
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
    const page = query.page ? parseInt(query.page) : 1;

    const apiResult = await getCommentById(commentId, page, req);

    return {
        props: {
            comment: (apiResult && apiResult.comment) || {},
            authUserData: apiResult && apiResult.authUser ? apiResult.authUser : {},
            notFoundError: (apiResult && apiResult.notFoundError) || false,
            getDataError: (apiResult && apiResult.getDataError) || false,
            goToString: `comment?id=${commentId}`,
            page: page,
            isMoreChildrenComments: (apiResult && apiResult.isMoreChildrenComments) || false,
        },
    };
}

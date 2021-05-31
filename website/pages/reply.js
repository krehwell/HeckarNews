import AlternateHeader from "../components/alternateHeader.js";
import HeadMetadata from "../components/headMetadata.js";
import Comment from "../components/comment.js";

import getReplyPageData from "../api/comments/getReplyPageData.js";

export default function Reply({ comment, authUserData, getDataError, notFoundError, goToString }) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Add Comment Reply | HeckarNews" />
            <AlternateHeader displayMessage="Reply to Comment" />
            <div className="comment-content-container">
                {!getDataError && !notFoundError ? (
                    <>
                        <Comment
                            comment={comment}
                            userSignedIn={authUserData.userSignedIn}
                            currUsername={authUserData.username}
                            showDownvote={authUserData.showDownvote}
                            goToString={goToString}
                        />
                    </>
                ) : (
                    <div className="comment-get-data-error-msg">
                        {notFoundError ? <span>No such comment.</span> : <span>An error occurred.</span>}
                    </div>
                )}
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, query, res }) {
    const commentId = query.id ? query.id : "";

    const apiResult = await getReplyPageData(commentId, req);

    if (!apiResult.authUser.userSignedIn) {
        res.writeHead(302, {
            Location: `/login?goto=reply?id=${commentId}`,
        });

        res.end();
    }

    return {
        props: {
            comment: (apiResult && apiResult.comment) || {},
            authUserData: apiResult && apiResult.authUser ? apiResult.authUser : {},
            getDataError: (apiResult && apiResult.getDataError) || false,
            notFoundError: (apiResult && apiResult.notFoundError) || false,
            goToString: `reply?id=${commentId}`,
        },
    };
}

import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";
import CommentsList from "../components/commentsList.js";

import getUserCommentsByPage from "../api/comments/getUserCommentsByPage.js";

export default function Thread({
    comments,
    authUserData,
    page,
    userId,
    isMore,
    getDataError,
    notFoundError,
    goToString,
}) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata
                title={!getDataError && !notFoundError ? `${userId}'s Comments | HeckarNews` : "HeckarNews"}
            />
            <Header
                userSignedIn={authUserData && authUserData.userSignedIn}
                username={authUserData && authUserData.username}
                karma={authUserData && authUserData.karma}
                goto={goToString}
                pageName={authUserData.username === userId || notFoundError || getDataError ? "threads" : null}
                label={
                    !notFoundError && !getDataError && authUserData.username !== userId ? `${userId}'s comments` : null
                }
            />
            <div className="comments-list-content-container">
                {!getDataError && !notFoundError ? (
                    <>
                        <CommentsList
                            comments={comments}
                            userSignedIn={authUserData.userSignedIn}
                            currUsername={authUserData.username}
                            goToString={goToString}
                            showDownvote={authUserData.showDownvote}
                            isMoreLink={`/threads?id=${userId}&page=${page + 1}`}
                            isMore={isMore}
                            isModerator={authUserData.isModerator}
                        />
                    </>
                ) : (
                    <div className="comments-list-error-msg">
                        {notFoundError ? <span>User not found.</span> : <span>An error occurred.</span>}
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

    const apiResult = await getUserCommentsByPage(userId, page, req);

    return {
        props: {
            comments: (apiResult && apiResult.comments) || [],
            authUserData: apiResult && apiResult.authUser ? apiResult.authUser : {},
            page: page,
            userId: userId || "",
            isMore: (apiResult && apiResult.isMore) || false,
            getDataError: (apiResult && apiResult.getDataError) || false,
            notFoundError: (apiResult && apiResult.notFoundError) || false,
            goToString: page > 1 ? `threads?id=${userId}&page=${page}` : `threads?id=${userId}`,
        },
    };
}

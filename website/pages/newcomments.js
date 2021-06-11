import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";
import CommentsList from "../components/commentsList.js";

import getNewestCommentsByPage from "../api/comments/getNewestCommentsByPage.js";

export default function NewComments({ comments, authUserData, page, isMore, getDataError, goToString }) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata title="New Comments | HeckarNews" />
            <Header
                userSignedIn={authUserData && authUserData.userSignedIn}
                username={authUserData && authUserData.username}
                karma={authUserData && authUserData.karma}
                goto={goToString}
                pageName="newcomments"
            />
            <div className="comments-list-content-container">
                {!getDataError ? (
                    <>
                        <CommentsList
                            comments={comments}
                            userSignedIn={authUserData.userSignedIn}
                            currUsername={authUserData.username}
                            goToString={goToString}
                            showDownvote={authUserData.showDownvote}
                            isMore={isMore}
                            isMoreLink={`/newcomments?page=${page + 1}`}
                            isModerator={authUserData.isModerator}
                        />
                    </>
                ) : (
                    <div className="comments-list-error-msg">
                        <span>An error occurred.</span>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export async function getServerSideProps({ req, query }) {
    const page = query.page ? parseInt(query.page) : 1;

    const apiResult = await getNewestCommentsByPage(page, req);

    return {
        props: {
            comments: (apiResult && apiResult.comments) || [],
            authUserData: apiResult && apiResult.authUser ? apiResult.authUser : {},
            page: page,
            isMore: (apiResult && apiResult.isMore) || false,
            getDataError: (apiResult && apiResult.getDataError) || false,
            goToString: page > 1 ? `newcomments?page=${page}` : `newcomments`,
        },
    };
}

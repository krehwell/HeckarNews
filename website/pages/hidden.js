import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";
import ItemsList from "../components/itemsList.js";

import getUserHiddenItemsByPage from "../api/items/getUserHiddenItemsByPage.js";

export default function Hidden({ items, authUserData, page, isMore, getDataError, goToString }) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Hidden | HeckarNews" />
            <Header
                userSignedIn={authUserData && authUserData.userSignedIn}
                username={authUserData && authUserData.username}
                karma={authUserData && authUserData.karma}
                goto={goToString}
                label="hidden"
            />
            <div className="items-list-content-container">
                {!getDataError ? (
                    <>
                        <ItemsList
                            items={items}
                            goToString={goToString}
                            userSignedIn={authUserData.userSignedIn}
                            currUsername={authUserData.username}
                            showRank={true}
                            showWebLink={true}
                            showPastLink={true}
                            showUnhideOption={true}
                            isMoreLink={`/hidden?page=${page + 1}`}
                            isMore={isMore}
                            isModerator={authUserData.isModerator}
                        />
                    </>
                ) : (
                    <div className="items-list-error-msg">
                        <span>An error occurred.</span>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export async function getServerSideProps({ req, query, res }) {
    const page = query.page ? parseInt(query.page) : 1;

    const apiResult = await getUserHiddenItemsByPage(page, req);
    // console.log(apiResult);

    if (apiResult.authError) {
        res.writeHead(302, {
            Location: "/login?goto=hidden",
        });

        res.end();
    }

    return {
        props: {
            items: (apiResult && apiResult.items) || [],
            authUserData: apiResult && apiResult.authUser ? apiResult.authUser : {},
            page: page || 0,
            isMore: (apiResult && apiResult.isMore) || false,
            getDataError: (apiResult && apiResult.getDataError) || false,
            goToString: page > 1 ? `hidden?page=${page}` : "hidden",
        },
    };
}

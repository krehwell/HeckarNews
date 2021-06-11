import Link from "next/link";

import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";
import ItemsList from "../components/itemsList.js";

import getRankedShowItemsByPage from "../api/items/getRankedShowItemsByPage.js";

export default function Show({ items, authUserData, page, isMore, getDataError, goToString }) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Show | HeckarNews" />
            <Header
                userSignedIn={authUserData && authUserData.userSignedIn}
                username={authUserData && authUserData.username}
                karma={authUserData && authUserData.karma}
                goto={goToString}
                pageName="show"
            />
            <div className="items-list-content-container">
                {!getDataError ? (
                    <>
                        <div className="show-items-top-text">
                            <span>
                                Please read the&nbsp;
                                <Link href="/showguidelines">
                                    <a>rules</a>
                                </Link>
                                . You can also browse the&nbsp;
                                <Link href="/shownew">
                                    <a>newest</a>
                                </Link>
                                &nbsp;Show submissions.
                            </span>
                        </div>
                        <ItemsList
                            items={items}
                            goToString={goToString}
                            userSignedIn={authUserData.userSignedIn}
                            currUsername={authUserData.username}
                            showHideOption={true}
                            showRank={true}
                            isMoreLink={`/show?page=${page + 1}`}
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

export async function getServerSideProps({ req, query }) {
    const page = query.page ? parseInt(query.page) : 1;

    const apiResult = await getRankedShowItemsByPage(page, req);
    // console.log(apiResult);

    return {
        props: {
            items: (apiResult && apiResult.items) || [],
            authUserData: apiResult && apiResult.authUser ? apiResult.authUser : {},
            page: page || 0,
            isMore: (apiResult && apiResult.isMore) || false,
            getDataError: (apiResult && apiResult.getDataError) || false,
            goToString: page > 1 ? `news?page=${page}` : "show",
        },
    };
}

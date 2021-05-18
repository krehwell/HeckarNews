import { Component } from "react";

import HeadMetadata from "../components/headMetadata.js";
import Header from "../components/header.js";
import Footer from "../components/footer.js";

import getRankedItemsByPage from "../api/items/getRankedItemsByPage.js";

export default function Index({
    item,
    authUserData,
    page,
    isMore,
    getDataError,
    goToString,
}) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata
                title="HeckarNews"
                description="News and Bullshit people having."
            />
            <Header
                userSignedIn={authUserData.userSignedIn}
                username={authUserData.username}
                karma={authUserData.karma}
                goto={goToString}
            />
            <div className="items-list-content-container">
                {!getDataError ? (
                    <></>
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
    const page = 1;

    const apiResult = await getRankedItemsByPage(page, req);

    return {
        props: {
            items: (apiResult && apiResult.items) || {},
            authUserData:
                apiResult && apiResult.authUser ? apiResult.authUser : {},
            page: page,
            isMore: (apiResult && apiResult.isMore) || false,
            getDataError: (apiResult && apiResult.getDataError) || false,
            goToString: "",
        },
    };
}

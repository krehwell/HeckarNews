import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";

import ItemComponent from "../components/item.js";

import getItemById from "../api/items/getItemById.js";

export default function Item({
    item,
    authUserData,
    getDataError,
    notFoundError,
    goToString,
}) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata
                title={!!item.title ? `${item.title} | HeckarNews` : "HeckarNews"}
            />
            <Header
                userSignedIn={authUserData && authUserData.userSignedIn}
                username={authUserData && authUserData.username}
                karma={authUserData && authUserData.karma}
                goto={goToString}
            />
            <div className="item-content-container">
                {item && !notFoundError && !getDataError ? (
                    <ItemComponent
                        item={item}
                        currUsername={authUserData.username}
                        userSignedIn={authUserData.userSignedIn}
                        goToString={goToString}
                    />
                ) : (
                    <div className="item-get-data-error-msg">
                        {notFoundError ? (
                            <span>No such item.</span>
                        ) : (
                            <span>An error occurred.</span>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export async function getServerSideProps({ req, query }) {
    const itemId = query.id ? query.id : "";

    const apiResult = await getItemById(itemId, req);

    return {
        props: {
            item: apiResult && apiResult.item || {},
            authUserData:
                apiResult && apiResult.authUser ? apiResult.authUser : {},
            getDataError: (apiResult && apiResult.getDataError) || "",
            notFoundError: (apiResult && apiResult.notFoundError) || "",
            goToString: `item?id=${itemId}` || "",
        },
    };
}

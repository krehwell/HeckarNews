import { useState } from "react";

import AlternateHeader from "../components/alternateHeader.js";
import HeadMetadata from "../components/headMetadata.js";

import getDeleteItemPageData from "../api/items/getDeleteItemPageData.js";

import renderCreatedTime from "../utils/renderCreatedTime.js";

export default function DeleteItem({
    item,
    authUserData,
    getDataError,
    notAllowedError,
    notFoundError,
    goToString,
}) {
    const [error, setError] = useState({
        getDataError,
        notFoundError,
        notAllowedError,
        submitError: false,
    });

    const [loading, setLoading] = useState(false);

    const submitDeleteItem = () => {
        if (loading) return;

        setLoading(true);
    };

    const goBackToOriginPage = () => {
        if (loading) return;

        window.location.href = `/${goToString}`;
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Delete Item | HeckarNews" />
            <AlternateHeader displayMessage="Delete Item" />
            <div className="delete-item-content-container">
                {!getDataError && !notAllowedError && !notFoundError ? (
                    <>
                        <div className="delete-item-top-section">
                            <table>
                                <tbody>
                                    <tr>
                                        <td valign="top">
                                            <div className="delete-item-star">
                                                <span>*</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="delete-item-title">
                                                <a href={item.url}>
                                                    {item.title}
                                                </a>
                                            </span>
                                            {item.url ? (
                                                <span className="delete-item-domain">
                                                    (
                                                    <a
                                                        href={`/from?site=${item.domain}`}>
                                                        {item.domain}
                                                    </a>
                                                    )
                                                </span>
                                            ) : null}
                                        </td>
                                    </tr>

                                    {/*ITEM DETAILS*/}
                                    <tr className="delete-item-details-bottom">
                                        <td colSpan="1"></td>
                                        <td>
                                            <span className="delete-item-score">
                                                {item.points.toLocaleString()}{" "}
                                                {item.points === 1
                                                    ? "point"
                                                    : "points"}
                                            </span>
                                            <span>
                                                {" "}
                                                by{" "}
                                                <a href={`/user?id=${item.by}`}>
                                                    {item.by}
                                                </a>{" "}
                                            </span>
                                            <span className="delete-item-time">
                                                <a href={`/item?id=${item.id}`}>
                                                    {renderCreatedTime(
                                                        item.created
                                                    )}
                                                </a>
                                            </span>
                                            <span> | </span>
                                            <span className="delete-item-edit">
                                                <a
                                                    href={`/edit-item?id=${item.id}`}>
                                                    edit
                                                </a>
                                            </span>
                                            <span> | </span>
                                            <span>
                                                <a href="">delete</a>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            {!item.url && item.text ? (
                                <div className="delete-item-text-content">
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: item.text,
                                        }}></span>
                                </div>
                            ) : null}
                        </div>
                        <div className="delete-item-confirm-msg">
                            <span>Do you want to delete this item?</span>
                        </div>
                        <div className="delete-item-btns">
                            <input
                                type="submit"
                                value="Yes"
                                className="delete-item-yes-btn"
                                onClick={submitDeleteItem}
                            />
                            <input
                                type="submit"
                                value="No"
                                onClick={goBackToOriginPage}
                            /> {loading && <span> loading...</span>}
                        </div>
                        {error.submitError ? (
                            <div className="delete-item-submit-error-msg">
                                <span>An error occurred.</span>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className="delete-item-error-msg">
                        {error.getDataError ? (
                            <span>An error occurred.</span>
                        ) : null}
                        {error.notAllowedError ? (
                            <span>You can’t delete that item.</span>
                        ) : null}
                        {error.notFoundError ? (
                            <span>Item not found.</span>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}

export async function getServerSideProps({ query, req }) {
    const apiResult = await getDeleteItemPageData(query.id, req);

    return {
        props: {
            item: (apiResult && apiResult.item) || {},
            authUserData:
                apiResult && apiResult.authUser ? apiResult.authUser : {},
            getDataError: (apiResult && apiResult.getDataError) || false,
            notAllowedError: (apiResult && apiResult.notAllowedError) || false,
            notFoundError: (apiResult && apiResult.notFoundError) || false,
            goToString: query.goto ? decodeURIComponent(query.goto) : "",
        },
    };
}

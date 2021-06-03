import { useState } from "react";
import Link from "next/link";
import Router from "next/router";

import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";

import getEditItemPageData from "../api/items/getEditItemPageData.js";
import editItem from "../api/items/editItem.js";

import renderCreatedTime from "../utils/renderCreatedTime.js";

export default function EditItem({ item, authUserData, notAllowedError, getDataError, notFoundError, goToString }) {
    const [titleInputValue, setTitleInputValue] = useState(item.title || "");
    const [textInputValue, setTextInputValue] = useState(item.text || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        titleRequiredError: false,
        titleTooLongError: false,
        textTooLongError: false,
        submitError: false,
    });

    const updateTitleInputValue = (event) => {
        setTitleInputValue(event.target.value);
    };

    const updateTextInputValue = (event) => {
        setTextInputValue(event.target.value);
    };

    const setInitialTextareaHeight = () => {
        if (item.text) {
            const numOfLines = item.text.split(/\r\n|\r|\n/).length;

            return numOfLines + 4;
        } else {
            return 6;
        }
    };

    const submitEditItem = () => {
        if (loading) return;

        if (!titleInputValue.trim()) {
            setError({
                ...error,
                titleRequiredError: true,
                titleTooLongError: false,
                textTooLongError: false,
                submitError: false,
            });
        } else if (titleInputValue.length > 80) {
            setError({
                ...error,
                titleRequiredError: false,
                titleTooLongError: true,
                textTooLongError: false,
                submitError: false,
            });
        } else if (textInputValue.length > 5000) {
            setError({
                ...error,
                titleRequiredError: false,
                titleTooLongError: false,
                textTooLongError: true,
                submitError: false,
            });
        } else {
            setLoading(true);

            editItem(item.id, titleInputValue, textInputValue, (response) => {
                setLoading(false);

                if (response.authError) {
                    // location.href = `/login?goto=${goToString}`;
                    Router.push(`/login?goto=${goToString}`);
                } else if (response.notAllowedError) {
                    setError({ ...error, notAllowedError: true });
                } else if (response.titleTooLongError) {
                    setError({
                        ...error,
                        titleRequiredError: false,
                        titleTooLongError: true,
                        textTooLongError: false,
                        submitError: false,
                    });
                } else if (response.textTooLongError) {
                    setError({
                        ...error,
                        titleRequiredError: false,
                        titleTooLongError: false,
                        textTooLongError: true,
                        submitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setError({
                        ...error,
                        titleRequiredError: false,
                        titleTooLongError: false,
                        textTooLongError: false,
                        submitError: true,
                    });
                } else {
                    // location.href = `/item?id=${item.id}`;
                    Router.push(`/item?id=${item.id}`);
                }
            });
        }
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Edit Item | HeckarNews" />
            <Header
                userSignedIn={authUserData && authUserData.userSignedIn}
                username={authUserData && authUserData.username}
                karma={authUserData && authUserData.karma}
                goto={goToString}
                label="edit item"
            />
            <div className="edit-item-content-container">
                {!getDataError && !notAllowedError && !notFoundError ? (
                    <>
                        {/* ITEM CONTENT */}
                        <table className="edit-item-top-section">
                            <tbody>
                                <tr>
                                    <td valign="top">
                                        <div className="edit-item-star">
                                            <span>*</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="edit-item-title">
                                            <Link href={item.url ? item.url : `/item?id=${item.id}`}>{item.title}</Link>
                                        </span>
                                        {item.url ? (
                                            <span className="edit-item-domain">
                                                (<Link href={`/from?site=${item.domain}`}>{item.domain}</Link>)
                                            </span>
                                        ) : null}
                                    </td>
                                </tr>
                                <tr className="edit-item-details-bottom">
                                    <td colSpan="1"></td>
                                    <td>
                                        <span className="edit-item-score">
                                            {item.points.toLocaleString()} {item.points === 1 ? "point" : "points"}
                                        </span>
                                        <span>
                                            &nbsp; by <Link href={`/user?id=${item.by}`}>{item.by}</Link>&nbsp;
                                        </span>
                                        <span className="edit-item-time">
                                            <Link href={`/item?id=${item.id}`}>{renderCreatedTime(item.created)}</Link>
                                        </span>
                                        {/* <span> | </span> */}
                                        {/* <span className="edit-item-edit"> */}
                                        {/*     <Link href="">edit</Link> */}
                                        {/* </span> */}
                                        <span> | </span>
                                        <span>
                                            <Link href={`/delete-item?id=${item.id}`}>delete</Link>
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        {!item.url && item.text ? (
                            <div className="edit-item-text-content">
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: item.text,
                                    }}></span>
                            </div>
                        ) : null}

                        {/* EDIT FORM */}
                        <table className="edit-item-form-section">
                            <tbody>
                                {/* TITLE EDIT */}
                                <tr>
                                    <td className="edit-item-title-input-label">title:</td>
                                    <td className="edit-item-title-input">
                                        <input type="text" value={titleInputValue} onChange={updateTitleInputValue} />
                                    </td>
                                </tr>
                                {/* URL EXIST? EDIT URL */}
                                {item.url ? (
                                    <tr>
                                        <td className="edit-item-url-label">url:</td>
                                        <td className="edit-item-url-value">{item.url}</td>
                                    </tr>
                                ) : null}
                                {/* TEXT EXIST? EDIT TEXT */}
                                {!item.url ? (
                                    <tr>
                                        <td className="edit-item-text-input-label">text:</td>
                                        <td className="edit-item-text-input">
                                            <textarea
                                                type="text"
                                                cols={60}
                                                rows={setInitialTextareaHeight()}
                                                value={textInputValue}
                                                onChange={updateTextInputValue}
                                            />
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                        <div className="edit-item-submit-btn">
                            <input type="submit" value="update" onClick={() => submitEditItem()} />
                            &nbsp;
                            {loading && <span> loading...</span>}
                        </div>
                        {error.submitError ? (
                            <div className="edit-item-submit-error-msg">
                                <span>An error occurred.</span>
                            </div>
                        ) : null}
                        {error.titleRequiredError ? (
                            <div className="edit-item-submit-error-msg">
                                <span>Title is required.</span>
                            </div>
                        ) : null}
                        {error.titleTooLongError ? (
                            <div className="edit-item-submit-error-msg">
                                <span>Title exceeds limit of 80 characters.</span>
                            </div>
                        ) : null}
                        {error.textTooLongError ? (
                            <div className="edit-item-submit-error-msg">
                                <span>Text exceeds limit of 5,000 characters.</span>
                            </div>
                        ) : null}
                        {error.notAllowedError ? (
                            <div className="edit-item-submit-error-msg">
                                <span>You can’t edit that item.</span>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className="edit-item-error-msg">
                        {error.getDataError ? <span>An error occurred.</span> : null}
                        {notAllowedError ? <span>You can’t edit that item.</span> : null}
                        {error.notFoundError ? <span>Item not found.</span> : null}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export async function getServerSideProps({ query, req }) {
    const apiResult = await getEditItemPageData(query.id, req);
    // console.log("result", apiResult);

    return {
        props: {
            item: (apiResult && apiResult.item) || {},
            authUserData: apiResult && apiResult.authUser ? apiResult.authUser : {},
            notAllowedError: (apiResult && apiResult.notAllowedError) || false,
            getDataError: (apiResult && apiResult.getDataError) || false,
            notFoundError: (apiResult && apiResult.notFoundError) || false,
            goToString: `edit-item?id=${query.id}`,
        },
    };
}

import { useState } from "react";
import Router from "next/router";
import Link from "next/link";

import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";

import renderPointsString from "../utils/renderPointsString.js";
import renderCreatedTime from "../utils/renderCreatedTime.js";
import truncateItemTitle from "../utils/truncateItemTitle.js";

import getEditCommentPageData from "../api/comments/getEditCommentPageData.js";
import editComment from "../api/comments/editComment.js";

export default function EditComment({
    comment,
    authUserData,
    getDataError,
    notAllowedError,
    notFoundError,
    goToString,
}) {
    const [commentInputValue, setCommentInputValue] = useState(comment.textForEditing || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        textRequiredError: false,
        textTooLongError: false,
        submitError: false,
    });

    const setInitialTextareaHeight = () => {
        if (comment.textForEditing) {
            const numOfLines = comment.textForEditing.split(/\r\n|\r|\n/).length;

            return numOfLines + 5;
        } else {
            return 6;
        }
    };

    const updateCommentInputValue = (event) => {
        setCommentInputValue(event.target.value);
    };

    const submitEditComment = () => {
        if (loading) return;

        if (!commentInputValue.trim()) {
            setError({
                textRequiredError: true,
                textTooLongError: false,
                submitError: false,
            });
        } else if (commentInputValue.length > 5000) {
            setError({
                textRequiredError: false,
                textTooLongError: true,
                submitError: false,
            });
        } else {
            setLoading(true);

            editComment(comment.id, commentInputValue, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${goToString}`;
                    Router.push(`/login?goto=${goToString}`);
                } else if (response.notAllowedError) {
                    setError({ ...error, notAllowedError: true });
                } else if (response.notFoundError) {
                    setError({ ...error, notFoundError: true });
                } else if (response.textRequiredError) {
                    setError({
                        textRequiredError: true,
                        textTooLongError: false,
                        submitError: false,
                    });
                } else if (response.textTooLongError) {
                    setError({
                        textRequiredError: false,
                        textTooLongError: true,
                        submitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setError({
                        textRequiredError: false,
                        textTooLongError: false,
                        submitError: true,
                    });
                } else {
                    // location.href = `/comment?id=${comment.id}`;
                    Router.push(`/comment?id=${comment.id}`);
                }
                setLoading(false);
            });
        }
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Edit Comment | HeckarNews" />
            <Header
                userSignedIn={authUserData && authUserData.userSignedIn}
                username={authUserData && authUserData.username}
                karma={authUserData && authUserData.karma}
                goto={goToString}
                label="edit comment"
            />
            <div className="edit-comment-content-container">
                {!getDataError && !notAllowedError && !notFoundError ? (
                    <>
                        <div className="edit-comment-top-section">
                            <table>
                                <tbody>
                                    <tr>
                                        <td valign="top">
                                            {/* VOTE BUTTON (Should be star since user own the comment) */}
                                            <div className="edit-comment-top-section-star">
                                                <span>*</span>
                                            </div>
                                        </td>
                                        <td>
                                            {/* NUM OF COMMENT POINTS */}
                                            <span className="edit-comment-top-section-points">
                                                {comment.points.toLocaleString()} {renderPointsString(comment.points)}
                                                &nbsp;
                                            </span>

                                            {/* COMMENT BY */}
                                            <span>
                                                by{" "}
                                                <Link href={`/user?id=${comment.by}`}>
                                                    <a>{comment.by}</a>
                                                </Link>
                                                &nbsp;
                                            </span>

                                            {/* COMMENT CREATED */}
                                            <span>
                                                <Link href={`/comment?id=${comment.id}`}>
                                                    <a>{renderCreatedTime(comment.created)}</a>
                                                </Link>
                                            </span>
                                            <span> | </span>

                                            {/* PARENT COMMENT */}
                                            <span className="edit-comment-top-section-parent">
                                                <Link
                                                    href={
                                                        comment.isParent
                                                            ? `/item?id=${comment.parentItemId}`
                                                            : `/comment?id=${comment.parentCommentId}`
                                                    }>
                                                    <a>parent</a>
                                                </Link>
                                            </span>
                                            <span> | </span>

                                            {/* DELETE COMMENT */}
                                            <span>
                                                <Link href={`/delete-comment?id=${comment.id}`}>
                                                    <a>delete</a>
                                                </Link>
                                            </span>
                                            <span> | </span>

                                            {/* COMMENT FROM/FOR ITEM */}
                                            <span className="edit-comment-top-section-article-title">
                                                on:&nbsp;
                                                <Link href={`/item?id=${comment.parentItemId}`}>
                                                    <a>{truncateItemTitle(comment.parentItemTitle)}</a>
                                                </Link>
                                            </span>

                                            {/* COMMENT CONTENT */}
                                            <div className="edit-comment-content">
                                                <span dangerouslySetInnerHTML={{ __html: comment.text }}></span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* COMMENT CONTENT TEXTBOX */}
                        <div className="edit-comment-input-box">
                            <div className="edit-comment-input-box-label">text:</div>
                            <textarea
                                type="text"
                                cols={60}
                                rows={setInitialTextareaHeight()}
                                value={commentInputValue}
                                onChange={updateCommentInputValue}
                            />
                            <span className="edit-comment-input-box-help">
                                <Link href="/formatdoc">
                                    <a>help</a>
                                </Link>
                            </span>
                        </div>

                        {/* UPDATE COMMENT SUBMIT BUTTON */}
                        <div className="edit-comment-input-submit-btn">
                            <input type="submit" value="update" onClick={() => submitEditComment()} />
                            {loading && <span> loading...</span>}
                        </div>

                        {/* UPDATE COMMENT ERROR */}
                        {error.textRequiredError ? (
                            <div className="edit-comment-submit-error-msg">
                                <span>Text is required.</span>
                            </div>
                        ) : null}
                        {error.textTooLongError ? (
                            <div className="edit-comment-submit-error-msg">
                                <span>Text exceeds limit of 5,000 characters.</span>
                            </div>
                        ) : null}
                        {error.submitError ? (
                            <div className="edit-comment-submit-error-msg">
                                <span>An error occurred.</span>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className="edit-comment-error-msg">
                        {getDataError ? <span>An error occurred.</span> : null}
                        {notAllowedError ? <span>You can’t edit that comment.</span> : null}
                        {notFoundError ? <span>Comment not found.</span> : null}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export async function getServerSideProps({ query, req }) {
    const apiResult = await getEditCommentPageData(query.id, req);

    return {
        props: {
            comment: (apiResult && apiResult.comment) || {},
            authUserData: apiResult && apiResult.authUser ? apiResult.authUser : {},
            getDataError: (apiResult && apiResult.getDataError) || false,
            notAllowedError: (apiResult && apiResult.notAllowedError) || false,
            notFoundError: (apiResult && apiResult.notFoundError) || false,
            goToString: `edit-comment?id=${query.id}` || "",
        },
    };
}

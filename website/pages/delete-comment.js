import { useState } from "react";
import Router from "next/router";
import Link from "next/link";

import AlternateHeader from "../components/alternateHeader.js";
import HeadMetadata from "../components/headMetadata.js";

import renderPointsString from "../utils/renderPointsString.js";
import renderCreatedTime from "../utils/renderCreatedTime.js";
import truncateItemTitle from "../utils/truncateItemTitle.js";

import getDeleteCommentPageData from "../api/comments/getDeleteCommentPageData.js";
import deleteComment from "../api/comments/deleteComment.js";

export default function DeleteComment({
    comment,
    authUserData,
    getDataError,
    notAllowedError,
    notFoundError,
    goToString,
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        submitError: false,
        notAllowedError: notAllowedError,
    });

    const submitDeleteComment = () => {
        if (loading) return;

        setLoading(true);

        deleteComment(comment.id, (response) => {
            if (response.notAllowedError) {
                setError({
                    notAllowedError: true,
                    submitError: false,
                });
            } else if (response.submitError || !response.success) {
                setError({
                    notAllowedError: false,
                    submitError: true,
                });
            } else {
                // location.href = `/${goToString}`;
                Router.push(`/${goToString}`);
            }

            setLoading(false);
        });
    };

    const goBackToOriginPage = () => {
        if (loading) return;

        // location.href = `/${goToString}`;
        Router.push(`/${goToString}`);
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Delete Comment | HeckarNews" />
            <AlternateHeader displayMessage="Delete Comment" />
            <div className="delete-comment-content-container">
                {!getDataError && !error.notAllowedError && !notFoundError ? (
                    <>
                        <div className="delete-comment-top-section">
                            <table>
                                <tbody>
                                    <tr>
                                        <td valign="top">
                                            {/* VOTE COMMENT, SHOULD BE STAR SINCE IT MUST BE USERS COMMENT */}
                                            <div className="delete-comment-top-section-star">
                                                <span>*</span>
                                            </div>
                                        </td>
                                        <td>
                                            {/* COMMENT POINT */}
                                            <span className="delete-comment-top-section-points">
                                                {comment?.points?.toLocaleString()} {renderPointsString(comment.points)}
                                            </span>

                                            {/* COMMENT BY */}
                                            <span>
                                                by&nbsp;
                                                <Link href={`/user?id=${comment.by}`}>
                                                    <a>{comment.by}</a>
                                                </Link>
                                                &nbsp;
                                            </span>

                                            {/* COMMENT CREATED TIME */}
                                            <span>
                                                <Link href={`/comment?id=${comment.id}`}>
                                                    <a>{renderCreatedTime(comment.created)}</a>
                                                </Link>
                                            </span>
                                            <span> | </span>

                                            {/* PARENT */}
                                            <span className="delete-comment-top-section-parent">
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

                                            {/* EDIT COMMENT */}
                                            <span>
                                                <Link href={`/edit-comment?id=${comment.id}`}>
                                                    <a>edit</a>
                                                </Link>
                                            </span>
                                            <span> | </span>

                                            {/* COMMENT FROM POST/ITEM */}
                                            <span className="delete-comment-top-section-article-title">
                                                on:&nbsp;
                                                <Link href={`/item?id=${comment.parentItemId}`}>
                                                    <a>{truncateItemTitle(comment?.parentItemTitle)}</a>
                                                </Link>
                                            </span>

                                            {/* COMMENT CONTENT */}
                                            <div className="delete-comment-content-text">
                                                <span dangerouslySetInnerHTML={{ __html: comment.text }}></span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* DELETE COMMENT BUTTON */}
                        <div className="delete-comment-confirm-msg">
                            <span>Do you want to delete this comment?</span>
                        </div>
                        <div className="delete-comment-btns">
                            <input
                                type="submit"
                                value="Yes"
                                className="delete-comment-yes-btn"
                                onClick={submitDeleteComment}
                            />
                            <input type="submit" value="No" onClick={goBackToOriginPage} />
                            {loading && <span> loading...</span>}
                        </div>
                        {error.submitError ? (
                            <div className="delete-comment-submit-error-msg">
                                <span>An error occurred.</span>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className="delete-comment-error-msg">
                        {getDataError ? <span>An error occurred.</span> : null}
                        {notFoundError ? <span>Comment not found.</span> : null}
                        {error.notAllowedError ? <span>You can’t delete that comment.</span> : null}
                    </div>
                )}
            </div>
        </div>
    );
}

export async function getServerSideProps({ query, req }) {
    const apiResult = await getDeleteCommentPageData(query.id, req);

    return {
        props: {
            comment: (apiResult && apiResult.comment) || {},
            authUserData: apiResult && apiResult.authUser ? apiResult.authUser : {},
            getDataError: (apiResult && apiResult.getDataError) || false,
            notAllowedError: (apiResult && apiResult.notAllowedError) || false,
            notFoundError: (apiResult && apiResult.notFoundError) || false,
            goToString: query.goto ? decodeURIComponent(query.goto) : "",
        },
    };
}

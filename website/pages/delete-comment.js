import { useState } from "react";

import AlternateHeader from "../components/alternateHeader.js";
import HeadMetadata from "../components/headMetadata.js";

import renderPointsString from "../utils/renderPointsString.js";
import renderCreatedTime from "../utils/renderCreatedTime.js";
import truncateItemTitle from "../utils/truncateItemTitle.js";

import getDeleteCommentPageData from "../api/comments/getDeleteCommentPageData.js";

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
    });

    const submitDeleteComment = () => {
        if (loading) return;
    };

    const goBackToOriginPage = () => {
        if (loading) return;

        window.location.href = `/${goToString}`;
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Delete Comment | HeckarNews" />
            <AlternateHeader displayMessage="Delete Comment" />
            <div className="delete-comment-content-container">
                {!getDataError && !error.notAllowedError && !error.notFoundError ? (
                    <>
                        <div className="delete-comment-top-section">
                            <table>
                                <tbody>
                                    <tr>
                                        <td valign="top">
                                            <div className="delete-comment-top-section-star">
                                                <span>*</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="delete-comment-top-section-points">
                                                {comment.points.toLocaleString()} {renderPointsString(comment.points)}
                                            </span>
                                            <span>
                                                by <a href={`/user?id=${comment.by}`}>{comment.by}</a>&nbsp;
                                            </span>
                                            <span>
                                                <a href={`/comment?id=${comment.id}`}>
                                                    {renderCreatedTime(comment.created)}
                                                </a>
                                            </span>
                                            <span> | </span>
                                            <span className="delete-comment-top-section-parent">
                                                <a
                                                    href={
                                                        comment.isParent
                                                            ? `/item?id=${comment.parentItemId}`
                                                            : `/comment?id=${comment.parentCommentId}`
                                                    }>
                                                    parent
                                                </a>
                                            </span>
                                            <span> | </span>
                                            <span>
                                                <a href={`/edit-comment?id=${comment.id}`}>edit</a>
                                            </span>
                                            <span> | </span>
                                            <span className="delete-comment-top-section-article-title">
                                                on:&nbsp;
                                                <a href={`/item?id=${comment.parentItemId}`}>
                                                    {truncateItemTitle(comment.parentItemTitle)}
                                                </a>
                                            </span>
                                            <div className="delete-comment-content-text">
                                                <span dangerouslySetInnerHTML={{ __html: comment.text }}></span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
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
                        {error.notAllowedError ? <span>You can’t delete that comment.</span> : null}
                        {error.notFoundError ? <span>Comment not found.</span> : null}
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

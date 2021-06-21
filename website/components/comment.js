import { useState } from "react";
import Link from "next/link";
import Router from "next/router";

import renderPointsString from "../utils/renderPointsString.js";
import renderCreatedTime from "../utils/renderCreatedTime.js";
import truncateItemTitle from "../utils/truncateItemTitle.js";

import addNewComment from "../apix/comments/addNewComment.js";
import upvoteComment from "../apix/comments/upvoteComment.js";
import downvoteComment from "../apix/comments/downvoteComment.js";
import unvoteComment from "../apix/comments/unvoteComment.js";
import favoriteComment from "../apix/comments/favoriteComment.js";
import unfavoriteComment from "../apix/comments/unfavoriteComment.js";
import killComment from "../apix/moderation/killComment.js";
import unkillComment from "../apix/moderation/unkillComment.js";

export default function CommentComponent({
    comment,
    currUsername,
    showFavoriteOption,
    goToString,
    userSignedIn,
    showDownvote,
    isModerator,
}) {
    const [replyInputValue, setReplyInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [numOfVote, setNumOfVote] = useState(comment.points);
    const [error, setError] = useState({
        replyTextRequiredError: false,
        replyTextTooLongError: false,
        replySubmitError: false,
    });

    const updateReplyInputValue = (event) => {
        setReplyInputValue(event.target.value);
    };

    const requestSubmitReply = () => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else if (!replyInputValue) {
            setError({
                replyTextRequiredError: true,
                replyTextTooLongError: false,
                replySubmitError: false,
            });
        } else if (replyInputValue.length > 5000) {
            setError({
                replyTextRequiredError: false,
                replyTextTooLongError: true,
                replySubmitError: false,
            });
        } else {
            setLoading(true);

            const commentData = {
                parentItemId: comment.parentItemId,
                isParent: false,
                parentCommentId: comment.id,
                text: replyInputValue,
            };

            addNewComment(commentData, (response) => {
                setLoading(false);
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else if (response.textRequiredError) {
                    setError({
                        replyTextRequiredError: true,
                        replyTextTooLongError: false,
                        replySubmitError: false,
                    });
                } else if (response.textTooLongError) {
                    setError({
                        replyTextRequiredError: false,
                        replyTextTooLongError: true,
                        replySubmitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setError({
                        replyTextRequiredError: false,
                        replyTextTooLongError: false,
                        replySubmitError: true,
                    });
                } else {
                    // location.href = `/comment?id=${comment.id}`;
                    Router.push(`/comment?id=${comment.id}`);
                }
            });
        }
    };

    const requestUpvoteComment = () => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            comment.upvotedByUser = true;
            comment.votedOnByUser = true;

            upvoteComment(comment.id, comment.parentItemId, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeuricomponent(gotostring)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else {
                    setNumOfVote(numOfVote + 1);
                    setLoading(false);
                }
            });
        }
    };

    const requestDownvoteComment = () => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeuricomponent(gotostring)}`;
            Router.push(`/login?goto=${encodeuricomponent(gotostring)}`);
        } else {
            setLoading(true);

            comment.downvotedByUser = true;
            comment.votedOnByUser = true;

            downvoteComment(comment.id, comment.parentItemId, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else {
                    setNumOfVote(numOfVote - 1);
                    setLoading(false);
                }
            });
        }
    };

    const requestUnvoteComment = () => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeuricomponent(gotostring)}`;
            Router.push(`/login?goto=${encodeuricomponent(gotostring)}`);
        } else {
            setLoading(true);

            comment.votedOnByUser = false;

            unvoteComment(comment.id, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else {
                    if (comment.upvotedByUser) {
                        comment.upvotedByUser = false;
                        setNumOfVote(numOfVote - 1);
                    } else if (comment.downvotedByUser) {
                        comment.downvotedByUser = false;
                        setNumOfVote(numOfVote + 1);
                    }
                    setLoading(false);
                }
            });
        }
    };

    const requestFavoriteComment = () => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            favoriteComment(comment.id, (response) => {
                // console.log(response);
                setLoading(false);
                if (response.authError) {
                    // location.href = `/login?goto=${encodeuricomponent(gotostring)}`;
                    Router.push(`/login?goto=${encodeuricomponent(gotostring)}`);
                } else {
                    // location.href = `/favorites?id=${currUsername}&comments=t`;
                    Router.push(`/favorites?id=${currUsername}&comments=t`);
                }
            });
        }
    };

    const requestUnfavoriteComment = () => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            comment.favoritedByUser = false;

            unfavoriteComment(comment.id, function (response) {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                }
                setLoading(false);
            });
        }
    };

    const requestKillComment = () => {
        if (loading) return;

        setLoading(true);

        killComment(comment.id, (_response) => {
            setLoading(false);
            Router.push(Router.asPath);
        });
    };

    const requestUnkillComment = () => {
        if (loading) return;

        setLoading(true);

        unkillComment(comment.id, (_response) => {
            setLoading(false);
            Router.push(Router.asPath);
        });
    };

    return (
        <div className="comment-content">
            <table>
                <tbody>
                    <tr>
                        <td valign="top">
                            {comment.by === currUsername ? (
                                <div className="comment-content-star">
                                    <span>*</span>
                                </div>
                            ) : null}
                            {comment.by !== currUsername ? (
                                <>
                                    {/* COMMENT UPVOTE BUTTON */}
                                    {comment.votedOnByUser || comment.dead ? (
                                        <>
                                            <div className="comment-content-upvote hide">
                                                <span></span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                className="comment-content-upvote"
                                                onClick={() => requestUpvoteComment()}>
                                                <span></span>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : null}
                            {comment.by !== currUsername ? (
                                <>
                                    {/* COMMENT DOWNVOTE BUTTON */}
                                    {comment.votedOnByUser || comment.dead || !showDownvote ? (
                                        <>
                                            <div className="comment-content-downvote hide">
                                                <span></span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                className="comment-content-downvote"
                                                onClick={() => requestDownvoteComment()}>
                                                <span></span>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : null}
                        </td>
                        <td>
                            {/* COMMENT DETAILS */}
                            <div className="comment-content-details">
                                {/* {currUsername === comment.by ? ( */}
                                {/*     <span> */}
                                {/*         {comment.points.toLocaleString()} {renderPointsString(comment.points)} by&nbsp; */}
                                {/*     </span> */}
                                {/* ) : null} */}
                                {/* AUTHOR OF COMMENT */}

                                {/* NUM OF VOTE */}
                                <span className="comment-content-author">
                                    <span>
                                        {numOfVote.toLocaleString()} {renderPointsString(numOfVote)} by&nbsp;
                                    </span>
                                    <Link href={`/user?id=${comment.by}`}>{comment.by}</Link>
                                </span>

                                {/* COMMENT TIME CREATED */}
                                <span className="comment-content-time">
                                    <Link href={`/comment?id=${comment.id}`}>{renderCreatedTime(comment.created)}</Link>
                                </span>
                                {comment.dead ? <span className="comment-content-dead"> [dead]</span> : null}

                                {/* UNVOTE COMMENT? */}
                                {comment.votedOnByUser && !comment.unvoteExpired && !comment.dead ? (
                                    <>
                                        <span> | </span>
                                        <span className="comment-content-unvote" onClick={() => requestUnvoteComment()}>
                                            un-vote
                                        </span>
                                    </>
                                ) : null}
                                <span> | </span>

                                {/* PARENT OF COMMENT */}
                                <span className="comment-content-parent">
                                    <Link
                                        href={
                                            comment.isParent
                                                ? `/item?id=${comment.parentItemId}`
                                                : `/comment?id=${comment.parentCommentId}`
                                        }>
                                        parent
                                    </Link>
                                </span>

                                {/* FAVORITE THIS COMMENT? */}
                                {showFavoriteOption ? (
                                    <>
                                        {showFavoriteOption ? (
                                            <>
                                                {comment.favoritedByUser ? (
                                                    <>
                                                        <span> | </span>
                                                        <span
                                                            className="comment-content-favorite"
                                                            onClick={() => requestUnfavoriteComment()}>
                                                            un-favorite
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span> | </span>
                                                        <span
                                                            className="comment-content-favorite"
                                                            onClick={() => requestFavoriteComment()}>
                                                            favorite
                                                        </span>
                                                    </>
                                                )}
                                            </>
                                        ) : null}
                                    </>
                                ) : null}

                                {/* EDIT COMMENT */}
                                {comment.by === currUsername && !comment.editAndDeleteExpired && !comment.dead ? (
                                    <>
                                        <span> | </span>
                                        <span>
                                            <Link href={`/edit-comment?id=${comment.id}`}>edit</Link>
                                        </span>
                                    </>
                                ) : null}

                                {/* DELETE COMMENT */}
                                {comment.by === currUsername && !comment.editAndDeleteExpired && !comment.dead ? (
                                    <>
                                        <span> | </span>
                                        <span>
                                            <Link
                                                href={`/delete-comment?id=${comment.id}&goto=${encodeURIComponent(
                                                    goToString
                                                )}`}>
                                                delete
                                            </Link>
                                        </span>
                                    </>
                                ) : null}
                                <span> | </span>

                                {/* KILL COMMENT */}
                                {isModerator && !comment.dead ? (
                                    <>
                                        <span className="comment-content-kill" onClick={() => requestKillComment()}>
                                            kill
                                        </span>
                                    </>
                                ) : null}

                                {/* UNKILL COMMENT */}
                                {isModerator && comment.dead ? (
                                    <>
                                        <span className="comment-content-kill" onClick={() => requestUnkillComment()}>
                                            un-kill
                                        </span>
                                    </>
                                ) : null}

                                <span> | </span>

                                {/* COMMENT BASED ON POST TITLE */}
                                <span>
                                    on:&nbsp;
                                    <Link href={`/item?id=${comment.parentItemId}`}>
                                        {truncateItemTitle(comment.parentItemTitle)}
                                    </Link>
                                </span>
                            </div>

                            {/* COMMENT CONTENT/TEXT */}
                            <div className="comment-content-text">
                                <span dangerouslySetInnerHTML={{ __html: comment.text }}></span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            {!comment.dead ? (
                <>
                    <div className="comment-content-repy-box">
                        <textarea type="text" value={replyInputValue} onChange={updateReplyInputValue} />
                    </div>
                    <div className="comment-content-reply-btn">
                        <input type="submit" value="reply" onClick={() => requestSubmitReply()} />
                        {loading && <span> loading...</span>}
                    </div>
                    {error.replyTextRequiredError ? (
                        <div className="comment-content-reply-error-msg">
                            <span>Text is required.</span>
                        </div>
                    ) : null}
                    {error.replyTextTooLongError ? (
                        <div className="comment-content-reply-error-msg">
                            <span>Text exceeds limit of 5,000 characters.</span>
                        </div>
                    ) : null}
                    {error.replySubmitError ? (
                        <div className="comment-content-reply-error-msg">
                            <span>An error occurred.</span>
                        </div>
                    ) : null}
                </>
            ) : null}
        </div>
    );
}

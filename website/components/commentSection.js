import { useState } from "react";

import upvoteComment from "../api/comments/upvoteComment.js";
import downvoteComment from "../api/comments/downvoteComment.js";
import unvoteComment from "../api/comments/unvoteComment.js";

import renderCreatedTime from "../utils/renderCreatedTime.js";
import sortCommentChildren from "../utils/sortCommentChildren.js";

function NestedComments({
    parentCommentIndex,
    comment,
    type,
    currUsername,
    showDownvote,
    goToString,
    requestUpvoteComment,
    requestDownvoteComment,
    requestUnvoteComment,
}) {
    return (sortCommentChildren(comment.children) || []).map((comment) => {
        return (
            <Comment
                key={comment.id}
                parentCommentIndex={parentCommentIndex}
                comment={comment}
                type="child"
                currUsername={currUsername}
                showDownvote={showDownvote}
                goToString={goToString}
                requestUpvoteComment={requestUpvoteComment}
                requestDownvoteComment={requestDownvoteComment}
                requestUnvoteComment={requestUnvoteComment}
            />
        );
    }, []);
}

function Comment({
    parentCommentIndex,
    comment,
    type,
    currUsername,
    showDownvote,
    goToString,
    requestUpvoteComment,
    requestDownvoteComment,
    requestUnvoteComment,
}) {
    return (
        <>
            <div
                key={comment.id}
                className={type === "parent" ? "comment-section-comment parent" : "comment-section-comment child"}>
                <div className="comment-section-comment-details">
                    <table>
                        <tbody>
                            <tr>
                                <td valign="top">
                                    {comment.by === currUsername ? (
                                        <div className="comment-section-comment-star">
                                            <span>*</span>
                                        </div>
                                    ) : null}
                                    {comment.by !== currUsername ? (
                                        <>
                                            {comment.votedOnByUser || comment.dead ? (
                                                <>
                                                    <div className="comment-section-comment-upvote hide">
                                                        <span></span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        className="comment-section-comment-upvote"
                                                        onClick={() => requestUpvoteComment(comment.id)}>
                                                        <span></span>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : null}
                                    {comment.by !== currUsername ? (
                                        <>
                                            {comment.votedOnByUser || !showDownvote || comment.dead ? (
                                                <>
                                                    <div className="comment-section-comment-downvote hide">
                                                        <span></span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        className="comment-section-comment-downvote"
                                                        onClick={() => requestDownvoteComment(comment.id)}>
                                                        <span></span>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : null}
                                </td>
                                <td>
                                    <span>
                                        <a href={`/user?id=${comment.by}`}>{comment.by}</a>
                                    </span>
                                    <span>
                                        <a href={`/comment?id=${comment.id}`}> {renderCreatedTime(comment.created)}</a>
                                    </span>
                                    {comment.dead ? <span> [dead]</span> : null}
                                    {comment.votedOnByUser && !comment.unvoteExpired ? (
                                        <>
                                            <span> | </span>
                                            <span
                                                className="comment-section-comment-unvote-btn"
                                                onClick={() => requestUnvoteComment(comment.id)}>
                                                un-vote
                                            </span>
                                        </>
                                    ) : null}
                                    {comment.by === currUsername && !comment.editAndDeleteExpired && !comment.dead ? (
                                        <>
                                            <span> | </span>
                                            <span>
                                                <a href={`/edit-comment?id=${comment.id}`}>edit</a>
                                            </span>
                                        </>
                                    ) : null}
                                    {comment.by === currUsername && !comment.editAndDeleteExpired && !comment.dead ? (
                                        <>
                                            <span> | </span>
                                            <span>
                                                <a
                                                    href={`/delete-comment?id=${comment.id}&goto=${encodeURIComponent(
                                                        goToString
                                                    )}`}>
                                                    delete
                                                </a>
                                            </span>
                                        </>
                                    ) : null}
                                    <div className="comment-section-comment-text">
                                        <span dangerouslySetInnerHTML={{ __html: comment.text }}></span>
                                    </div>
                                    <div className="comment-section-comment-reply">
                                        <span>
                                            <a href={`/reply?id=${comment.id}`}>reply</a>
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {NestedComments}
                </div>
            </div>
        </>
    );
}

export default function CommentSection({
    comments,
    parentItemId,
    isMore,
    isMoreLink,
    userSignedIn,
    currUsername,
    showDownvote,
    goToString,
}) {
    const [loading, setLoading] = useState(false);
    console.log("COMMENT", comments);

    const requestUpvoteComment = (commentId) => {
        if (loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(goToString)}`;
        } else {
            setLoading(true);

            const findAndUpdateComment = (parentComment) => {
                if (parentComment.id === commentId) {
                    parentComment.votedOnByUser = true;
                } else {
                    if (parentComment.children) {
                        for (let i = 0; i < parentComment.children.length; i++) {
                            findAndUpdateComment(parentComment.children[i]);
                        }
                    }
                }
            };

            for (let i = 0; i < comments.length; i++) {
                findAndUpdateComment(comments[i]);
            }

            upvoteComment(commentId, parentItemId, (response) => {
                if (response.authError) {
                    window.location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                }
                setLoading(false);
            });
        }
    };

    const requestDownvoteComment = (commentId) => {
        if (loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(goToString)}`;
        } else {
            setLoading(true);

            const findAndUpdateComment = function (parentComment) {
                if (parentComment.id === commentId) {
                    parentComment.votedOnByUser = true;

                    forceUpdate();
                } else {
                    if (parentComment.children) {
                        for (let i = 0; i < parentComment.children.length; i++) {
                            findAndUpdateComment(parentComment.children[i]);
                        }
                    }
                }
            };

            for (let i = 0; i < comments.length; i++) {
                findAndUpdateComment(comments[i]);
            }

            downvoteComment(commentId, parentItemId, (response) => {
                if (response.authError) {
                    window.location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                }
                setLoading(false);
            });
        }
    };

    const requestUnvoteComment = (commentId) => {
        if (loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(goToString)}`;
        } else {
            setLoading(true);

            const findAndUpdateComment = function (parentComment) {
                if (parentComment.id === commentId) {
                    parentComment.votedOnByUser = false;
                } else {
                    if (parentComment.children) {
                        for (let i = 0; i < parentComment.children.length; i++) {
                            findAndUpdateComment(parentComment.children[i]);
                        }
                    }
                }
            };

            for (let i = 0; i < comments.length; i++) {
                findAndUpdateComment(comments[i]);
            }

            unvoteComment(commentId, function (response) {
                if (response.authError) {
                    window.location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                }
                setLoading(false);
            });
        }
    };

    return (
        <>
            {comments
                ? comments.map((comment, index) => {
                      return (
                          <Comment
                              key={comment.id}
                              parentCommentIndex={index}
                              comment={comment}
                              type="parent"
                              currUsername={currUsername}
                              showDownvote={showDownvote}
                              goToString={goToString}
                              requestUpvoteComment={requestUpvoteComment}
                              requestDownvoteComment={requestDownvoteComment}
                              requestUnvoteComment={requestUnvoteComment}
                          />
                      );
                  })
                : null}
        </>
    );
}

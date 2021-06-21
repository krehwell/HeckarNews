import { useState } from "react";
import Link from "next/link";
import Router from "next/router";

import upvoteComment from "../apix/comments/upvoteComment.js";
import downvoteComment from "../apix/comments/downvoteComment.js";
import unvoteComment from "../apix/comments/unvoteComment.js";

import renderPointsString from "../utils/renderPointsString.js";
import renderCreatedTime from "../utils/renderCreatedTime.js";
import sortCommentChildren from "../utils/sortCommentChildren.js";
import getNumberOfChildrenComments from "../utils/getNumberOfChildrenComments.js";
import generateCommentTextClassName from "../utils/generateCommentTextClassName.js";
import killComment from "../apix/moderation/killComment.js";
import unkillComment from "../apix/moderation/unkillComment.js";

/**
 * Render each comment item recursively.
 */
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
    collapseComment,
    uncollapseComment,
    isModerator,
    requestKillComment,
    requestUnkillComment,
}) {
    /// EACH COMMENT CHILD
    const NestedComments = () => {
        return (sortCommentChildren(comment?.children) || []).map((comment) => {
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
                    collapseComment={collapseComment}
                    uncollapseComment={uncollapseComment}
                    isModerator={isModerator}
                    requestKillComment={requestKillComment}
                    requestUnkillComment={requestUnkillComment}
                />
            );
        }, []);
    };

    // console.log("COMMENT", comment);

    return (
        <>
            <div
                key={comment.id}
                className={type === "parent" ? "comment-section-comment parent" : "comment-section-comment child"}>
                {!comment.isCollapsed ? (
                    <div className="comment-section-comment-details">
                        <table>
                            <tbody>
                                <tr>
                                    <td valign="top">
                                        {/* COMMENT BY USER PUT * START AS VOTE BUTTON */}
                                        {comment.by === currUsername ? (
                                            <div className="comment-section-comment-star">
                                                <span>*</span>
                                            </div>
                                        ) : null}
                                        {/* UPVOTE BUTTON */}
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
                                        {/* DOWNVOTE BUTTON */}
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
                                        {/* COMMENT POINT */}
                                        <span>
                                            {comment.points}&nbsp;
                                            {renderPointsString(comment.points)}
                                        </span>
                                        &nbsp;|&nbsp;
                                        {/* AUTHOR OF COMMENT | BY */}
                                        <span>
                                            <Link href={`/user?id=${comment.by}`}>
                                                <a>{comment.by}</a>
                                            </Link>
                                        </span>
                                        <span>
                                            &nbsp;
                                            <Link href={`/comment?id=${comment.id}`}>
                                                <a>{renderCreatedTime(comment.created)}</a>
                                            </Link>
                                        </span>
                                        {/* IS COMMENT DEAD? */}
                                        {comment.dead ? <span> [dead]</span> : null}
                                        {/* COMMENT VOTED? PUT UNVOTE */}
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
                                        {/* EDIT COMMENT */}
                                        {comment.by === currUsername &&
                                        !comment.editAndDeleteExpired &&
                                        !comment.dead ? (
                                            <>
                                                <span> | </span>
                                                <span>
                                                    <Link href={`/edit-comment?id=${comment.id}`}>
                                                        <a>edit</a>
                                                    </Link>
                                                </span>
                                            </>
                                        ) : null}
                                        {/* DELETE COMMENT */}
                                        {comment.by === currUsername &&
                                        !comment.editAndDeleteExpired &&
                                        !comment.dead ? (
                                            <>
                                                <span> | </span>
                                                <span>
                                                    <Link
                                                        href={`/delete-comment?id=${
                                                            comment.id
                                                        }&goto=${encodeURIComponent(goToString)}`}>
                                                        <a>delete</a>
                                                    </Link>
                                                </span>
                                            </>
                                        ) : null}
                                        {/* KILL COMMENT */}
                                        {isModerator && !comment.dead ? (
                                            <>
                                                <span> | </span>
                                                <span
                                                    className="comment-section-kill"
                                                    onClick={() => requestKillComment(comment.id)}>
                                                    kill
                                                </span>
                                            </>
                                        ) : null}
                                        {/* UNKILL COMMENT */}
                                        {isModerator && comment.dead ? (
                                            <>
                                                <span> | </span>
                                                <span
                                                    className="comment-section-kill"
                                                    onClick={() => requestUnkillComment(comment.id)}>
                                                    un-kill
                                                </span>
                                            </>
                                        ) : null}
                                        {/* COLLAPSE/EXPAND COMMENT */}
                                        <span
                                            className="comment-section-comment-collapse-btn"
                                            onClick={() => collapseComment(comment.id, parentCommentIndex)}>
                                            [‒]
                                        </span>
                                        {/* COMMENT CONTENT */}
                                        <div className={generateCommentTextClassName(comment.points)}>
                                            <span dangerouslySetInnerHTML={{ __html: comment.text }}></span>
                                        </div>
                                        {/* GOT TO REPLY COMMENT */}
                                        <div className="comment-section-comment-reply">
                                            <span>
                                                <Link href={`/reply?id=${comment.id}`}>
                                                    <a>reply</a>
                                                </Link>
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* RENDER CHILD COMMENT */}
                        <NestedComments
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
                            collapseComment={collapseComment}
                            uncollapseComment={uncollapseComment}
                            requestKillComment={requestKillComment}
                            requestUnkillComment={requestUnkillComment}
                        />
                    </div>
                ) : (
                    // IF COMMENT IS COLLPASED, SHOW THIS
                    <div className="comment-section-comment-collapsed">
                        <span>
                            <Link href={`/user?id=${comment.by}`}>
                                <a>{comment.by}</a>
                            </Link>
                            &nbsp;
                        </span>
                        <span>
                            <Link href={`/comment?id=${comment.id}`}>
                                <a>{renderCreatedTime(comment.created)}</a>
                            </Link>
                        </span>
                        <div className="comment-section-comment-collapsed-btn">
                            <span
                                className="comment-section-comment-collapsed-btn-value"
                                onClick={() => uncollapseComment(comment.id, parentCommentIndex)}>
                                [+{comment.numOfHiddenChildren}]
                            </span>
                        </div>
                    </div>
                )}
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
    isModerator,
}) {
    const [loading, setLoading] = useState(false);
    const [rerender, setrerender] = useState(false);

    const requestUpvoteComment = (commentId) => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            const findAndUpdateComment = (parentComment) => {
                if (parentComment.id === commentId) {
                    parentComment.points += 1;
                    parentComment.upvotedByUser = true;
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
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                }
                setLoading(false);
                setrerender(!rerender);
            });
        }
    };

    const requestDownvoteComment = (commentId) => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            const findAndUpdateComment = (parentComment) => {
                if (parentComment.id === commentId) {
                    parentComment.points -= 1;
                    parentComment.downvotedByUser = true;
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

            downvoteComment(commentId, parentItemId, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                }
                setLoading(false);
                setrerender(!rerender);
            });
        }
    };

    const requestUnvoteComment = (commentId) => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            const findAndUpdateComment = (parentComment) => {
                if (parentComment.id === commentId) {
                    if (parentComment.upvotedByUser) {
                        parentComment.upvotedByUser = !parentComment.upvotedByUser;
                        parentComment.points -= 1;
                    } else if (parentComment.downvotedByUser) {
                        parentComment.downvotedByUser = !parentComment.downvotedByUser;
                        parentComment.points += 1;
                    }
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

            unvoteComment(commentId, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                }
                setLoading(false);
                setrerender(!rerender);
            });
        }
    };

    const collapseComment = (commentId, parentCommentIndex) => {
        const findAndUpdateComment = (comment) => {
            if (comment.id === commentId) {
                comment.isCollapsed = true;

                if (comment.children) {
                    comment.numOfHiddenChildren = getNumberOfChildrenComments(comment);
                } else {
                    comment.numOfHiddenChildren = 0;
                }
            } else {
                if (comment.children) {
                    for (let i = 0; i < comment.children.length; i++) {
                        findAndUpdateComment(comment.children[i]);
                    }
                }
            }
        };

        findAndUpdateComment(comments[parentCommentIndex]);
        setrerender(!rerender);
    };

    const uncollapseComment = (commentId, parentCommentIndex) => {
        const findAndUpdateComment = (parentComment) => {
            if (parentComment.id === commentId) {
                parentComment.isCollapsed = false;
            } else {
                if (parentComment.children) {
                    for (let i = 0; i < parentComment.children.length; i++) {
                        findAndUpdateComment(parentComment.children[i]);
                    }
                }
            }
        };

        findAndUpdateComment(comments[parentCommentIndex]);
        setrerender(!rerender);
    };

    const requestKillComment = (commentId) => {
        if (loading) return;

        setLoading(true);

        killComment(commentId, (_response) => {
            setLoading(false);
            Router.push(Router.asPath);
        });
    };

    const requestUnkillComment = (commentId) => {
        if (loading) return;

        setLoading(true);

        unkillComment(commentId, (_response) => {
            setLoading(false);
            Router.push(Router.asPath);
        });
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
                              collapseComment={collapseComment}
                              uncollapseComment={uncollapseComment}
                              isModerator={isModerator}
                              requestKillComment={requestKillComment}
                              requestUnkillComment={requestUnkillComment}
                          />
                      );
                  })
                : null}
            {isMore ? (
                <div className="comment-section-more">
                    <span>
                        <Link href={isMoreLink}>
                            <a>More</a>
                        </Link>
                    </span>
                </div>
            ) : null}
        </>
    );
}

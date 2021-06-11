import { useState } from "react";
import Link from "next/link";
import Router from "next/router";

import upvoteComment from "../api/comments/upvoteComment.js";
import downvoteComment from "../api/comments/downvoteComment.js";
import unvoteComment from "../api/comments/unvoteComment.js";
import unfavoriteComment from "../api/comments/unfavoriteComment.js";
import killComment from "../api/moderation/killComment.js";
import unkillComment from "../api/moderation/unkillComment.js";

import renderPointsString from "../utils/renderPointsString.js";
import renderCreatedTime from "../utils/renderCreatedTime.js";
import truncateItemTitle from "../utils/truncateItemTitle.js";

export default function CommentsList({
    comments: commentsData,
    userSignedIn,
    currUsername,
    goToString,
    showDownvote,
    isMore,
    isMoreLink,
    showUnfavoriteOption,
    isModerator
}) {
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState(commentsData);

    const requestUpvoteComment = (commentId, parentItemId, index) => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            comments[index].votedOnByUser = true;
            comments[index].upvotedByUser = true;
            comments[index].points += 1;
            setComments(comments);

            upvoteComment(commentId, parentItemId, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else {
                    setLoading(false);
                }
            });
        }
    };

    const requestDownvoteComment = (commentId, parentItemId, index) => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            comments[index].votedOnByUser = true;
            comments[index].downvotedByUser = true;
            comments[index].points -= 1;
            setComments(comments);

            downvoteComment(commentId, parentItemId, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else {
                    setLoading(false);
                }
            });
        }
    };

    // console.log(comments);

    const requestUnvoteComment = (commentId, index) => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            comments[index].votedOnByUser = false;

            if (comments[index].upvotedByUser) {
                comments[index].upvotedByUser = false;
                comments[index].points -= 1;
            } else if (comments[index].downvotedByUser) {
                comments[index].downvotedByUser = false;
                comments[index].points += 1;
            }
            // PROCESS HERE
            setComments(comments);

            unvoteComment(commentId, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else {
                    setLoading(false);
                }
            });
        }
    };

    const requestUnfavoriteComment = (commentId) => {
        if (loading) return;

        unfavoriteComment(commentId, (response) => {
            if (response.authError) {
                // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
            } else {
                // location.href = "";
                Router.push(Router.asPath);
            }
        });
    };

    const requestKillComment = (commentId, index) => {
        if (loading) return;

        setLoading(true);

        killComment(commentId, (_response) => {
            setLoading(false);
            comments[index].dead = true;
            setComments(comments);
            Router.push(Router.asPath);
        });
    };

    const requestUnkillComment = (commentId, index) => {
        if (loading) return;

        setLoading(true);

        unkillComment(commentId, (_response) => {
            setLoading(false);
            comments[index].dead = false;
            setComments(comments);
            Router.push(Router.asPath);
        });
    };

    return (
        <>
            {comments
                ? comments.map((comment, index) => {
                      return (
                          <div key={comment.id} className="listed-comment">
                              <table>
                                  <tbody>
                                      <tr>
                                          <td valign="top">
                                              {/* STAR IF THIS COMMENT BELONGS TO USER */}
                                              {currUsername === comment.by ? (
                                                  <div className="listed-comment-star">
                                                      <span>*</span>
                                                  </div>
                                              ) : null}
                                              {currUsername !== comment.by ? (
                                                  <>
                                                      {/* UPVOTE BOTTON */}
                                                      {comment.votedOnByUser || comment.dead ? (
                                                          <>
                                                              <div className="listed-comment-upvote hide">
                                                                  <span></span>
                                                              </div>
                                                          </>
                                                      ) : (
                                                          <>
                                                              <div
                                                                  className="listed-comment-upvote"
                                                                  onClick={() =>
                                                                      requestUpvoteComment(
                                                                          comment.id,
                                                                          comment.parentItemId,
                                                                          index
                                                                      )
                                                                  }>
                                                                  <span></span>
                                                              </div>
                                                          </>
                                                      )}
                                                  </>
                                              ) : null}
                                              {currUsername !== comment.by ? (
                                                  <>
                                                      {/* DOWNVOTE BOTTON */}
                                                      {comment.votedOnByUser || !showDownvote || comment.dead ? (
                                                          <>
                                                              <div className="listed-comment-downvote hide">
                                                                  <span></span>
                                                              </div>
                                                          </>
                                                      ) : (
                                                          <>
                                                              <div
                                                                  className="listed-comment-downvote"
                                                                  onClick={() =>
                                                                      requestDownvoteComment(
                                                                          comment.id,
                                                                          comment.parentItemId,
                                                                          index
                                                                      )
                                                                  }>
                                                                  <span></span>
                                                              </div>
                                                          </>
                                                      )}
                                                  </>
                                              ) : null}
                                          </td>
                                          <td>
                                              <div className="listed-comment-head">
                                                  {/* COMMENT POINTS */}
                                                  <span>
                                                      {comment.points.toLocaleString()}&nbsp;
                                                      {renderPointsString(comment.points)} by&nbsp;
                                                  </span>

                                                  {/* COMMENT BY/AUTHOR */}
                                                  <span>
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

                                                  {/* UNVOTE COMMENT */}
                                                  {comment.dead ? <span> [dead]</span> : null}
                                                  {comment.votedOnByUser && !comment.unvoteExpired ? (
                                                      <>
                                                          <span> | </span>
                                                          <span
                                                              className="listed-comment-unvote"
                                                              onClick={() => requestUnvoteComment(comment.id, index)}>
                                                              un-vote
                                                          </span>
                                                      </>
                                                  ) : null}
                                                  <span> | </span>

                                                  {/* COMMENT PARENT */}
                                                  <span className="listed-comment-parent">
                                                      <Link
                                                          href={
                                                              comment.isParent
                                                                  ? `/item?id=${comment.parentItemId}`
                                                                  : `/comment?id=${comment.parentCommentId}`
                                                          }>
                                                          <a>parent</a>
                                                      </Link>
                                                  </span>

                                                  {/* FAVORITE COMMENT */}
                                                  {showUnfavoriteOption ? (
                                                      <>
                                                          <span> | </span>
                                                          <span
                                                              className="listed-comment-unfavorite"
                                                              onClick={() => requestUnfavoriteComment(comment.id)}>
                                                              un-favorite
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
                                                  <span> | </span>

                                                  {/* KILL COMMENT */}
                                                  {isModerator && !comment.dead ? (
                                                      <>
                                                          <span
                                                              className="listed-comment-kill"
                                                              onClick={() => requestKillComment(comment.id, index)}>
                                                              kill
                                                          </span>
                                                      </>
                                                  ) : null}

                                                  {/* UNKILL COMMENT */}
                                                  {isModerator && comment.dead ? (
                                                      <>
                                                          <span
                                                              className="listed-comment-kill"
                                                              onClick={() => requestUnkillComment(comment.id, index)}>
                                                              un-kill
                                                          </span>
                                                      </>
                                                  ) : null}

                                                  <span> | </span>

                                                  {/* COMMENT FROM ITEM */}
                                                  <span>
                                                      on:&nbsp;
                                                      <Link href={`/item?id=${comment.parentItemId}`}>
                                                          <a>{truncateItemTitle(comment.parentItemTitle)}</a>
                                                      </Link>
                                                  </span>
                                              </div>
                                              <div className="listed-comment-text">
                                                  <span dangerouslySetInnerHTML={{ __html: comment.text }}></span>
                                              </div>
                                          </td>
                                      </tr>
                                  </tbody>
                              </table>
                          </div>
                      );
                  })
                : null}
            {isMore ? (
                <div className="listed-comments-more">
                    {/* ANYMORE COMMENT? */}
                    <Link href={isMoreLink}>
                        <span>
                            <a>More</a>
                        </span>
                    </Link>
                </div>
            ) : null}
        </>
    );
}

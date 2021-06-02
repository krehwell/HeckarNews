import { useState } from "react";

import upvoteComment from "../api/comments/upvoteComment.js";
import downvoteComment from "../api/comments/downvoteComment.js";
import unvoteComment from "../api/comments/unvoteComment.js";
import unfavoriteComment from "../api/comments/unfavoriteComment.js";

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
}) {
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState(commentsData);

    const requestUpvoteComment = (commentId, parentItemId, index) => {
        if (loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(goToString)}`;
        } else {
            setLoading(true);

            comments[index].votedOnByUser = true;
            comments[index].upvotedByUser = true;
            comments[index].points += 1;
            setComments(comments);

            upvoteComment(commentId, parentItemId, (response) => {
                if (response.authError) {
                    window.location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                } else {
                    setLoading(false);
                }
            });
        }
    };

    const requestDownvoteComment = (commentId, parentItemId, index) => {
        if (loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(goToString)}`;
        } else {
            setLoading(true);

            comments[index].votedOnByUser = true;
            comments[index].downvotedByUser = true;
            comments[index].points -= 1;
            setComments(comments);

            downvoteComment(commentId, parentItemId, (response) => {
                if (response.authError) {
                    window.location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                } else {
                    setLoading(false);
                }
            });
        }
    };

    console.log(comments);

    const requestUnvoteComment = (commentId, index) => {
        if (loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(goToString)}`;
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
                    window.location.href = `/login?goto=${encodeURIComponent(goToString)}`;
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
                window.location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            } else {
                window.location.href = "";
            }
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
                                              {currUsername === comment.by ? (
                                                  <div className="listed-comment-star">
                                                      <span>*</span>
                                                  </div>
                                              ) : null}
                                              {currUsername !== comment.by ? (
                                                  <>
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
                                                  <span>
                                                      {comment.points.toLocaleString()}&nbsp;
                                                      {renderPointsString(comment.points)} by&nbsp;
                                                  </span>
                                                  <span>
                                                      <a href={`/user?id=${comment.by}`}>{comment.by} </a>
                                                  </span>
                                                  <span>
                                                      <a href={`/comment?id=${comment.id}`}>
                                                          {renderCreatedTime(comment.created)}
                                                      </a>
                                                  </span>
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
                                                  <span className="listed-comment-parent">
                                                      <a
                                                          href={
                                                              comment.isParent
                                                                  ? `/item?id=${comment.parentItemId}`
                                                                  : `/comment?id=${comment.parentCommentId}`
                                                          }>
                                                          parent
                                                      </a>
                                                  </span>
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
                                                  {comment.by === currUsername &&
                                                  !comment.editAndDeleteExpired &&
                                                  !comment.dead ? (
                                                      <>
                                                          <span> | </span>
                                                          <span>
                                                              <a href={`/edit-comment?id=${comment.id}`}>edit</a>
                                                          </span>
                                                      </>
                                                  ) : null}
                                                  {comment.by === currUsername &&
                                                  !comment.editAndDeleteExpired &&
                                                  !comment.dead ? (
                                                      <>
                                                          <span> | </span>
                                                          <span>
                                                              <a
                                                                  href={`/delete-comment?id=${
                                                                      comment.id
                                                                  }&goto=${encodeURIComponent(goToString)}`}>
                                                                  delete
                                                              </a>
                                                          </span>
                                                      </>
                                                  ) : null}
                                                  <span> | </span>
                                                  <span>
                                                      on:&nbsp;
                                                      <a href={`/item?id=${comment.parentItemId}`}>
                                                          {truncateItemTitle(comment.parentItemTitle)}
                                                      </a>
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
                    <a href={isMoreLink}>
                        <span>More</span>
                    </a>
                </div>
            ) : null}
        </>
    );
}

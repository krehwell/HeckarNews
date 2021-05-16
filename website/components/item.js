import { useState } from "react";

import renderCreatedTime from "../utils/renderCreatedTime.js";

import upvoteItem from "../api/items/upvoteItem.js";
import unvoteItem from "../api/items/unvoteItem.js";
import favoriteItem from "../api/items/favoriteItem.js";
import unfavoriteItem from "../api/items/unfavoriteItem.js";

export default function ItemComponent({
    item,
    currUsername,
    goToString,
    userSignedIn,
}) {
    const [state, setState] = useState({ loading: false });
    const [numOfVote, setNumOfVote] = useState(item.points);
    const [commentInputValue, setCommentInputValue] = useState("");
    const [error, setError] = useState({
        commentTextTooLongError: "",
        commentTextRequiredError: "",
        commentSubmitError: "",
    });

    const requestUpvoteItem = () => {
        if (state.loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(
                goToString
            )}`;
        } else {
            setState({ ...state, loading: true });

            item.votedOnByUser = true;

            upvoteItem(item.id, (response) => {
                if (response.authError) {
                    window.location.href = `/login?goto=${encodeURIComponent(
                        goToString
                    )}`;
                } else {
                    setState({ ...state, loading: false });
                    setNumOfVote(numOfVote + 1);
                }
            });
        }
    };

    const requestUnvoteItem = () => {
        if (state.loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(
                goToString
            )}`;
        } else {
            setState({ ...state, loading: true });

            item.votedOnByUser = false;

            unvoteItem(item.id, (response) => {
                if (response.authError) {
                    window.location.href = `/login?goto=${encodeURIComponent(
                        goToString
                    )}`;
                } else {
                    setState({ ...state, loading: false });
                    setNumOfVote(numOfVote - 1);
                }
            });
        }
    };

    const requestFavoriteItem = () => {
        if (state.loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(
                goToString
            )}`;
        } else {
            setState({ ...state, loading: true });

            favoriteItem(item.id, (response) => {
                if (response.authError) {
                    window.location.href = `/login?goto=${encodeURIComponent(
                        goToString
                    )}`;
                } else if (!response.success) {
                    window.location.href = "";
                } else {
                    window.location.href = `/favorites?id=${currUsername}`;
                }
            });
        }
    };

    const requestUnfavoriteItem = () => {
        if (state.loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(
                goToString
            )}`;
        } else {
            setState({ ...state, loading: true });

            unfavoriteItem(item.id, (response) => {
                if (response.authError) {
                    window.location.href = `/login?goto=${encodeURIComponent(
                        goToString
                    )}`;
                } else if (!response.success) {
                    window.location.href = "";
                } else {
                    window.location.href = `/favorites?id=${currUsername}`;
                }
            });
        }
    };

    const updateCommentInputValue = (event) => {
        setCommentInputValue(event.target.value);
    };

    const requestAddNewComment = () => {
        if (state.loading) return;

        if (userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(
                goToString
            )}`;
        } else if (!commentInputValue) {
            setError({
                ...error,
                commentTextRequiredError: true,
                commentTextTooLongError: false,
                commentSubmitError: false,
            });
        } else if (commentInputValue.length > 5000) {
            setError({
                ...error,
                commentTextRequiredError: false,
                commentTextTooLongError: true,
                commentSubmitError: false,
            });
        } else {
            setState({ ...state, loading: true });

            const commentData = {
                parentItemId: item.id,
                isParent: true,
                parentCommentId: null,
                text: commentInputValue,
            };

            // call to the REST API goes here
        }
    };

    return (
        <div className="item-details">
            <table>
                <tbody>
                    <tr>
                        <td valign="top">
                            {/* VOTE BUTTON */}
                            {item.by === currUsername ? (
                                <div className="item-star">
                                    <span>*</span>
                                </div>
                            ) : null}
                            {item.by !== currUsername ? (
                                <>
                                    {item.votedOnByUser || item.dead ? (
                                        <span className="item-upvote hide"></span>
                                    ) : (
                                        <span
                                            className="item-upvote"
                                            onClick={() =>
                                                requestUpvoteItem()
                                            }></span>
                                    )}
                                </>
                            ) : null}
                        </td>
                        <td>
                            {/* IS ITEM DEAD? */}
                            <span className="item-title">
                                <a
                                    href={
                                        item.url
                                            ? item.url
                                            : `/item?id=${item.id}`
                                    }>
                                    {item.dead ? "[dead] " : null}
                                    {item.title}
                                </a>
                            </span>
                            {item.url ? (
                                <span className="item-domain">
                                    (
                                    <a href={`/from?site=${item.domain}`}>
                                        {item.domain}
                                    </a>
                                    )
                                </span>
                            ) : null}
                        </td>
                    </tr>
                    <tr className="item-details-bottom">
                        <td colSpan="1"></td>
                        <td>
                            {/* ITEM POINTS | NUM OF VOTE */}
                            <span>
                                {numOfVote.toLocaleString()}{" "}
                                {numOfVote === 1 ? "point" : "points"}
                            </span>
                            &nbsp;
                            {/* ITEM MADE BY */}
                            <span>
                                by <a href={`/user?id=${item.by}`}>{item.by}</a>
                                &nbsp;
                            </span>
                            {/* ITEM CREATED DATE */}
                            <span>
                                <a href={`/item?id=${item.id}`}>
                                    {renderCreatedTime(item.created)}
                                </a>
                            </span>
                            {/* UNVOTE */}
                            {item.votedOnByUser &&
                            !item.unvoteExpired &&
                            !item.dead ? (
                                <>
                                    <span> | </span>
                                    <span
                                        className="item-unvote"
                                        onClick={() => requestUnvoteItem()}>
                                        un-vote
                                    </span>
                                </>
                            ) : null}
                            {/* HIDDEN ITEM */}
                            {!item.hiddenByUser ? (
                                <>
                                    <span> | </span>
                                    <span className="item-hide">hide</span>
                                </>
                            ) : (
                                <>
                                    <span> | </span>
                                    <span className="item-hide">un-hide</span>
                                </>
                            )}
                            {/* SEARCH SIMILAR ITEM */}
                            <span> | </span>
                            <span>
                                <a href={`/search?q=${item.title}`}>past</a>
                            </span>
                            <span> | </span>
                            <span>
                                <a
                                    href={`https://www.google.com/search?q=${item.title}`}>
                                    web
                                </a>
                            </span>
                            {/* FAVORITE THIS ITEM? */}
                            {!item.favoritedByUser ? (
                                <>
                                    <span> | </span>
                                    <span
                                        className="item-favorite"
                                        onClick={() => requestFavoriteItem()}>
                                        favorite
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span> | </span>
                                    <span
                                        className="item-favorite"
                                        onClick={() => requestUnfavoriteItem()}>
                                        un-favorite
                                    </span>
                                </>
                            )}
                            {/* AUTHOR? EDIT THIS ITEM */}
                            {item.by === currUsername &&
                            !item.editAndDeleteExpired &&
                            !item.dead ? (
                                <>
                                    <span> | </span>
                                    <span className="item-edit">
                                        <a href={`/edit-item?id=${item.id}`}>
                                            edit
                                        </a>
                                    </span>
                                </>
                            ) : null}
                            {/* AUTHOR? DELETE ITEM */}
                            {item.by === currUsername &&
                            !item.editAndDeleteExpired &&
                            !item.dead ? (
                                <>
                                    <span> | </span>
                                    <span className="item-delete">
                                        <a
                                            href={`/delete-item?id=${
                                                item.id
                                            }&goto=${encodeURIComponent(
                                                goToString
                                            )}`}>
                                            delete
                                        </a>
                                    </span>
                                </>
                            ) : null}
                            {/* COMMENT SECTION */}
                            {!item.dead ? (
                                <>
                                    {item.commentCount > 0 ? (
                                        <>
                                            <span> | </span>
                                            <span className="item-comments">
                                                <a href={`/item?id=${item.id}`}>
                                                    {item.commentCount.toLocaleString()}{" "}
                                                    comment
                                                    {item.commentCount > 1
                                                        ? "s"
                                                        : null}
                                                </a>
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span> | </span>
                                            <span className="item-comments">
                                                <a href={`/item?id=${item.id}`}>
                                                    discuss
                                                </a>
                                            </span>
                                        </>
                                    )}
                                </>
                            ) : null}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* ITEM CONTENT */}
            {!item.url && item.text ? (
                <div className="item-text-content">
                    <span
                        dangerouslySetInnerHTML={{ __html: item.text }}></span>
                </div>
            ) : null}

            {/* COMMENT SECTION */}
            {!item.dead ? (
                <>
                    <div className="item-comment-box">
                        <textarea
                            type="text"
                            value={commentInputValue}
                            onChange={updateCommentInputValue}
                        />
                    </div>
                    <div className="item-add-comment-btn">
                        <input
                            type="submit"
                            value="add comment"
                            onClick={() => requestAddNewComment()}
                        />
                    </div>
                    {error.commentTextTooLongError ? (
                        <div className="item-add-comment-error">
                            <span>Text exceeds limit of 5,000 characters.</span>
                        </div>
                    ) : null}
                    {error.commentTextRequiredError ? (
                        <div className="item-add-comment-error">
                            <span>Text is required.</span>
                        </div>
                    ) : null}
                    {error.commentSubmitError ? (
                        <div className="item-add-comment-error">
                            <span>An error occurred.</span>
                        </div>
                    ) : null}
                </>
            ) : null}
        </div>
    );
}

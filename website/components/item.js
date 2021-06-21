import { useState } from "react";
import Link from "next/link";
import Router from "next/router";

import upvoteItem from "../apix/items/upvoteItem.js";
import unvoteItem from "../apix/items/unvoteItem.js";
import favoriteItem from "../apix/items/favoriteItem.js";
import unfavoriteItem from "../apix/items/unfavoriteItem.js";
import hideItem from "../apix/items/hideItem.js";
import unhideItem from "../apix/items/unhideItem.js";
import addNewComment from "../apix/comments/addNewComment.js";
import killItem from "../apix/moderation/killItem.js";
import unkillItem from "../apix/moderation/unkillItem.js";

import renderCreatedTime from "../utils/renderCreatedTime.js";

export default function ItemComponent({ item, currUsername, goToString, userSignedIn, isModerator }) {
    const [loading, setLoading] = useState(false);
    const [numOfVote, setNumOfVote] = useState(item.points);
    const [commentInputValue, setCommentInputValue] = useState("");
    const [error, setError] = useState({
        commentTextTooLongError: "",
        commentTextRequiredError: "",
        commentSubmitError: "",
    });

    const requestUpvoteItem = () => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            item.votedOnByUser = true;

            upvoteItem(item.id, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else {
                    setLoading(false);
                    setNumOfVote(numOfVote + 1);
                }
            });
        }
    };

    const requestUnvoteItem = () => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            item.votedOnByUser = false;

            unvoteItem(item.id, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else {
                    setLoading(false);
                    setNumOfVote(numOfVote - 1);
                }
            });
        }
    };

    const requestFavoriteItem = () => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            favoriteItem(item.id, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else if (!response.success) {
                    // location.href = "";
                    Router.push(Router.asPath);
                } else {
                    // location.href = `/favorites?id=${currUsername}`;
                    Router.push(`/favorites?id=${currUsername}`);
                }
            });
        }
    };

    const requestUnfavoriteItem = () => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            unfavoriteItem(item.id, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else if (!response.success) {
                    // location.href = "";
                    Router.push(Router.asPath);
                } else {
                    // location.href = `/favorites?id=${currUsername}`;
                    Router.push(`/favorites?id=${currUsername}`);
                }
            });
        }
    };

    const requestHideItem = () => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            item.hiddenByUser = true;

            hideItem(item.id, (response) => {
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else if (!response.success) {
                    // location.href = "";
                    Router.push(Router.asPath);
                } else {
                    setLoading(false);
                }
            });
        }
    };

    const requestUnhideItem = () => {
        if (loading) return;

        setLoading(true);

        item.hiddenByUser = false;

        unhideItem(item.id, (response) => {
            if (response.authError) {
                // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
            } else if (!response.success) {
                // location.href = ""
                Router.push(Router.asPath);
            } else {
                setLoading(false);
            }
        });
    };

    const updateCommentInputValue = (event) => {
        setCommentInputValue(event.target.value);
    };

    const requestAddNewComment = () => {
        if (loading) return;

        if (!userSignedIn) {
            // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else if (!commentInputValue) {
            setError({
                commentTextRequiredError: true,
                commentTextTooLongError: false,
                commentSubmitError: false,
            });
        } else if (commentInputValue.length > 5000) {
            setError({
                commentTextRequiredError: false,
                commentTextTooLongError: true,
                commentSubmitError: false,
            });
        } else {
            setLoading(true);

            const commentData = {
                parentItemId: item.id,
                isParent: true,
                parentCommentId: null,
                text: commentInputValue,
            };

            addNewComment(commentData, (response) => {
                setLoading(false);
                if (response.authError) {
                    // location.href = `/login?goto=${encodeURIComponent(goToString)}`;
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else if (response.textRequiredError) {
                    setError({
                        commentTextRequiredError: true,
                        commentTextTooLongError: false,
                        commentSubmitError: false,
                    });
                } else if (response.textTooLongError) {
                    setError({
                        commentTextRequiredError: false,
                        commentTextTooLongError: true,
                        commentSubmitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setError({
                        commentTextRequiredError: false,
                        commentTextTooLongError: false,
                        commentSubmitError: true,
                    });
                } else {
                    // location.href = "";
                    setCommentInputValue("");
                    Router.push(Router.asPath);
                }
            });
        }
    };

    const requestKillItem = () => {
        if (loading) return;

        setLoading(true);

        killItem(item.id, (_response) => {
            setLoading(false);
            Router.push(Router.asPath);
        });
    };

    const requestUnkillItem = () => {
        if (loading) return;

        setLoading(true);

        unkillItem(item.id, (_response) => {
            setLoading(false);
            Router.push(Router.asPath);
        });
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
                                        <span className="item-upvote" onClick={() => requestUpvoteItem()}></span>
                                    )}
                                </>
                            ) : null}
                        </td>
                        <td>
                            {/* IS ITEM DEAD? */}
                            <span className="item-title">
                                <Link href={item.url ? item.url : `/item?id=${item.id}`}>
                                    <a>
                                        {item.dead ? "[dead] " : null}
                                        {item.title}
                                    </a>
                                </Link>
                            </span>
                            {item.url ? (
                                <span className="item-domain">
                                    (<Link href={`/from?site=${item.domain}`}>{item.domain}</Link>)
                                </span>
                            ) : null}
                        </td>
                    </tr>
                    <tr className="item-details-bottom">
                        <td colSpan="1"></td>
                        <td>
                            {/* ITEM POINTS | NUM OF VOTE */}
                            <span>
                                {numOfVote.toLocaleString()} {numOfVote === 1 ? "point" : "points"}
                            </span>
                            &nbsp;
                            {/* ITEM MADE BY */}
                            <span>
                                by <Link href={`/user?id=${item.by}`}>{item.by}</Link>
                                &nbsp;
                            </span>
                            {/* ITEM CREATED DATE */}
                            <span>
                                <Link href={`/item?id=${item.id}`}>{renderCreatedTime(item.created)}</Link>
                            </span>
                            {/* UNVOTE */}
                            {item.votedOnByUser && !item.unvoteExpired && !item.dead ? (
                                <>
                                    <span> | </span>
                                    <span className="item-unvote" onClick={() => requestUnvoteItem()}>
                                        un-vote
                                    </span>
                                </>
                            ) : null}
                            {/* HIDDEN ITEM | HIDE ITEM */}
                            {!item.hiddenByUser ? (
                                <>
                                    <span> | </span>
                                    <span className="item-hide" onClick={() => requestHideItem()}>
                                        hide
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span> | </span>
                                    <span className="item-hide" onClick={() => requestUnhideItem()}>
                                        un-hide
                                    </span>
                                </>
                            )}
                            {/* SEARCH SIMILAR ITEM */}
                            <span> | </span>
                            <span>
                                <Link href={`/search?q=${item.title}`}>past</Link>
                            </span>
                            <span> | </span>
                            <span>
                                <Link href={`https://www.google.com/search?q=${item.title}`}>web</Link>
                            </span>
                            {/* FAVORITE THIS ITEM? */}
                            {!item.favoritedByUser ? (
                                <>
                                    <span> | </span>
                                    <span className="item-favorite" onClick={() => requestFavoriteItem()}>
                                        favorite
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span> | </span>
                                    <span className="item-favorite" onClick={() => requestUnfavoriteItem()}>
                                        un-favorite
                                    </span>
                                </>
                            )}
                            {/* AUTHOR? EDIT THIS ITEM */}
                            {item.by === currUsername && !item.editAndDeleteExpired && !item.dead ? (
                                <>
                                    <span> | </span>
                                    <span className="item-edit">
                                        <Link href={`/edit-item?id=${item.id}`}>edit</Link>
                                    </span>
                                </>
                            ) : null}
                            {/* AUTHOR? DELETE ITEM */}
                            {item.by === currUsername && !item.editAndDeleteExpired && !item.dead ? (
                                <>
                                    <span> | </span>
                                    <span className="item-delete">
                                        <Link
                                            href={`/delete-item?id=${item.id}&goto=${encodeURIComponent(goToString)}`}>
                                            delete
                                        </Link>
                                    </span>
                                </>
                            ) : null}
                            {/* MOD? KILL ITEM */}
                            {isModerator && !item.dead ? (
                                <>
                                    <span> | </span>
                                    <span className="item-kill" onClick={() => requestKillItem()}>
                                        kill
                                    </span>
                                </>
                            ) : null}
                            {/* MOD? UNKILL ITEM */}
                            {isModerator && item.dead ? (
                                <>
                                    <span> | </span>
                                    <span className="item-kill" onClick={() => requestUnkillItem()}>
                                        un-kill
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
                                                <Link href={`/item?id=${item.id}`}>
                                                    <a>
                                                        {item.commentCount.toLocaleString()} comment
                                                        {item.commentCount > 1 ? "s" : null}
                                                    </a>
                                                </Link>
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span> | </span>
                                            <span className="item-comments">
                                                <Link href={`/item?id=${item.id}`}>discuss</Link>
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
                    <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
                </div>
            ) : null}

            {/* COMMENT SECTION */}
            {!item.dead ? (
                <>
                    <div className="item-comment-box">
                        <textarea type="text" value={commentInputValue} onChange={updateCommentInputValue} />
                    </div>
                    <div className="item-add-comment-btn">
                        <input type="submit" value="add comment" onClick={() => requestAddNewComment()} />
                        &nbsp;
                        {loading && <span> loading...</span>}
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

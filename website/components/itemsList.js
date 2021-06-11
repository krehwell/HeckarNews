import { useState } from "react";
import Link from "next/link";
import Router from "next/router";

import upvoteItem from "../api/items/upvoteItem.js";
import unvoteItem from "../api/items/unvoteItem.js";
import unfavoriteItem from "../api/items/unfavoriteItem.js";
import hideItem from "../api/items/hideItem.js";
import unhideItem from "../api/items/unhideItem.js";
import killItem from "../api/moderation/killItem.js";
import unkillItem from "../api/moderation/unkillItem.js";

import renderCreatedTime from "../utils/renderCreatedTime.js";

export default function ItemsList({
    items: itemsData,
    goToString,
    userSignedIn,
    currUsername,
    showHideOption,
    showRank,
    isMoreLink,
    isMore,
    showPastLink = false,
    showWebLink = false,
    showUnfavoriteOption = false,
    showUnhideOption = false,
    isModerator,
}) {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState(itemsData);

    const requestUpvoteItem = (itemId, itemIndexPosition) => {
        if (loading) return;

        if (!userSignedIn) {
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            items[itemIndexPosition].votedOnByUser = true;
            items[itemIndexPosition].points += 1;
            setItems(items);

            upvoteItem(itemId, (response) => {
                setLoading(false);

                if (response.authError) {
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                }
            });
        }
    };

    const requestUnvoteItem = (itemId, itemIndexPosition) => {
        if (loading) return;

        if (!userSignedIn) {
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            items[itemIndexPosition].votedOnByUser = false;
            items[itemIndexPosition].points -= 1;
            setItems(items);

            unvoteItem(itemId, (response) => {
                setLoading(false);

                if (response.authError) {
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                }
            });
        }
    };

    const requestUnfavoriteItem = (itemId) => {
        if (loading) return;

        if (!userSignedIn) {
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            unfavoriteItem(itemId, (response) => {
                if (response.authError) {
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else {
                    Router.push(Router.asPath);
                }
            });
        }
    };

    const requestHideItem = (itemId, itemIndexPosition) => {
        if (loading) return;

        if (!userSignedIn) {
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            // recalculate the items rank
            for (let i = 0; i < items.length; i++) {
                if (i > itemIndexPosition) {
                    items[i].rank -= 1;
                }
            }

            // remove the hidden item from items
            items.splice(itemIndexPosition, 1);
            setItems(items);

            hideItem(itemId, (response) => {
                setLoading(false);
                if (response.authError) {
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                }
            });
        }
    };

    const requestUnhideItem = (itemId, itemIndexPosition) => {
        if (loading) return;

        if (!userSignedIn) {
            Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
        } else {
            setLoading(true);

            // recalculate the items rank
            for (let i = 0; i < items.length; i++) {
                if (i > itemIndexPosition) {
                    items[i].rank -= 1;
                }
            }

            // remove the hidden item from items
            items.splice(itemIndexPosition, 1);
            setItems(items);

            unhideItem(itemId, (response) => {
                if (response.authError) {
                    Router.push(`/login?goto=${encodeURIComponent(goToString)}`);
                } else {
                    Router.push(Router.asPath);
                }
                setLoading(false);
            });
        }
    };

    const requestKillItem = (itemId, index) => {
        if (loading) return;

        setLoading(true);

        killItem(itemId, (_response) => {
            Router.push(Router.asPath);
            items[index].dead = true;
            setItems(items);
            setLoading(false);
        });
    };

    const requestUnkillItem = (itemId, index) => {
        if (loading) return;

        setLoading(true);

        unkillItem(itemId, (_response) => {
            Router.push(Router.asPath);
            items[index].dead = false;
            setItems(items);
            setLoading(false);
        });
    };

    return (
        <>
            {items
                ? items.map((item, index) => {
                      item.rank = index + 1;
                      return (
                          <div key={item.id} className="listed-item-container">
                              <table>
                                  <tbody>
                                      <tr>
                                          {/* RANK NUM */}
                                          <td className={showRank ? "listed-item-rank" : "listed-item-rank hide"}>
                                              {showRank ? <span>{item.rank}.</span> : null}
                                          </td>

                                          {/* VOTE BTN */}
                                          <td valign="top">
                                              {currUsername === item.by ? (
                                                  <div className="listed-item-star">
                                                      <span>*</span>
                                                  </div>
                                              ) : null}
                                              {currUsername !== item.by ? (
                                                  <>
                                                      {item.votedOnByUser || item.dead ? (
                                                          <span className="listed-item-upvote hide"></span>
                                                      ) : (
                                                          <span
                                                              className="listed-item-upvote"
                                                              onClick={() => requestUpvoteItem(item.id, index)}></span>
                                                      )}
                                                  </>
                                              ) : null}
                                          </td>

                                          {/* ITEM TITLE, URL | CONTENT */}
                                          <td>
                                              <span className="listed-item-title">
                                                  <Link href={item.url ? item.url : `/item?id=${item.id}`}>
                                                      <a>
                                                          {item.dead ? "[dead] " : null}
                                                          {item.title}
                                                      </a>
                                                  </Link>
                                              </span>
                                              {item.url ? (
                                                  <span className="listed-item-domain">
                                                      (<Link href={`/from?site=${item.domain}`}>{item.domain}</Link>)
                                                  </span>
                                              ) : null}
                                          </td>
                                      </tr>

                                      {/* ITEM DETAILS */}
                                      <tr className="listed-item-bottom-section">
                                          <td colSpan="2"></td>
                                          <td>
                                              {/* POINST | NUM OF VOTE */}
                                              <span>
                                                  {item.points.toLocaleString()}&nbsp;
                                                  {item.points === 1 ? "point" : "points"}
                                              </span>

                                              {/* AUTHOR | BY */}
                                              <span>
                                                  &nbsp;by <Link href={`/user?id=${item.by}`}>{item.by}</Link>&nbsp;
                                              </span>

                                              {/* CREATED TIME */}
                                              <span className="listed-item-time">
                                                  <Link href={`/item?id=${item.id}`}>
                                                      <a>{renderCreatedTime(item.created)}</a>
                                                  </Link>
                                              </span>

                                              {/* SHOW LINK */}
                                              {showPastLink ? (
                                                  <>
                                                      <span> | </span>
                                                      <span>
                                                          <Link href={`/search?q=${item.title}`}>past</Link>
                                                      </span>
                                                  </>
                                              ) : null}
                                              {showWebLink ? (
                                                  <>
                                                      <span> | </span>
                                                      <span>
                                                          <Link href={`https://www.google.com/search?q=${item.title}`}>
                                                              web
                                                          </Link>
                                                      </span>
                                                  </>
                                              ) : null}

                                              {/* UNVOTE BTN */}
                                              {item.votedOnByUser && !item.unvoteExpired && !item.dead ? (
                                                  <>
                                                      <span> | </span>
                                                      <span
                                                          className="listed-item-unvote"
                                                          onClick={() => requestUnvoteItem(item.id, index)}>
                                                          un-vote
                                                      </span>
                                                  </>
                                              ) : null}

                                              {/* FAVORITE THIS ITEM */}
                                              {showUnfavoriteOption ? (
                                                  <>
                                                      <span> | </span>
                                                      <span
                                                          className="listed-item-unfavorite"
                                                          onClick={() => requestUnfavoriteItem(item.id)}>
                                                          un-favorite
                                                      </span>
                                                  </>
                                              ) : null}

                                              {/* HIDE OPTION */}
                                              {showHideOption ? (
                                                  <>
                                                      <span> | </span>
                                                      <span
                                                          className="listed-item-hide"
                                                          onClick={() => requestHideItem(item.id, index)}>
                                                          hide
                                                      </span>
                                                  </>
                                              ) : null}

                                              {/* UNHIDE OPTION */}
                                              {showUnhideOption ? (
                                                  <>
                                                      <span> | </span>
                                                      <span
                                                          className="listed-item-unhide"
                                                          onClick={() => requestUnhideItem(item.id, index)}>
                                                          un-hide
                                                      </span>
                                                  </>
                                              ) : null}

                                              {/* AUTHOR? EDIT ITEM */}
                                              {item.by === currUsername && !item.editAndDeleteExpired && !item.dead ? (
                                                  <>
                                                      <span> | </span>
                                                      <span>
                                                          <Link href={`/edit-item?id=${item.id}`}>edit</Link>
                                                      </span>
                                                  </>
                                              ) : null}

                                              {/* MODE? KILL ITEM */}
                                              {isModerator && !item.dead ? (
                                                  <>
                                                      <span> | </span>
                                                      <span
                                                          className="listed-item-kill"
                                                          onClick={() => requestKillItem(item.id, index)}>
                                                          kill
                                                      </span>
                                                  </>
                                              ) : null}

                                              {isModerator && item.dead ? (
                                                  <>
                                                      <span> | </span>
                                                      <span
                                                          className="listed-item-kill"
                                                          onClick={() => requestUnkillItem(item.id, index)}>
                                                          un-kill
                                                      </span>
                                                  </>
                                              ) : null}

                                              {/* AUTHOR? DELETE ITEM */}
                                              {item.by === currUsername && !item.editAndDeleteExpired && !item.dead ? (
                                                  <>
                                                      <span> | </span>
                                                      <span>
                                                          <Link
                                                              href={`/delete-item?id=${
                                                                  item.id
                                                              }&goto=${encodeURIComponent(goToString)}`}>
                                                              delete
                                                          </Link>
                                                      </span>
                                                  </>
                                              ) : null}

                                              {/* COMMENT NUM */}
                                              {!item.dead ? (
                                                  <>
                                                      {item.commentCount > 0 ? (
                                                          <>
                                                              <span> | </span>
                                                              <span className="listed-item-comments">
                                                                  <Link href={`/item?id=${item.id}`}>
                                                                      <a>
                                                                          {item.commentCount.toLocaleString("en")}
                                                                          &nbsp;comment
                                                                          {item.commentCount > 1 ? "s" : null}
                                                                      </a>
                                                                  </Link>
                                                              </span>
                                                          </>
                                                      ) : (
                                                          <>
                                                              <span> | </span>
                                                              <span className="listed-item-comments">
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
                          </div>
                      );
                  })
                : null}
            {/* PAGINATION */}
            {isMore ? (
                <div className={showRank ? "listed-item-more" : "listed-item-more hide-rank"}>
                    <Link href={isMoreLink}>
                        <span>More</span>
                    </Link>
                </div>
            ) : null}
        </>
    );
}

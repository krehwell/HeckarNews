import { useState } from "react";

import upvoteItem from "../api/items/upvoteItem.js";
import unvoteItem from "../api/items/unvoteItem.js";
import unfavoriteItem from "../api/items/unfavoriteItem.js";
import hideItem from "../api/items/hideItem.js";
import unhideItem from "../api/items/unhideItem.js";

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
}) {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState(itemsData);

    const requestUpvoteItem = (itemId, itemIndexPosition) => {
        if (loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(
                goToString
            )}`;
        } else {
            setLoading(true);

            items[itemIndexPosition].votedOnByUser = true;
            items[itemIndexPosition].points += 1;
            setItems(items);

            upvoteItem(itemId, (response) => {
                setLoading(false);

                if (response.authError) {
                    window.location.href = `/login?goto=${encodeURIComponent(
                        goToString
                    )}`;
                }
            });
        }
    };

    const requestUnvoteItem = (itemId, itemIndexPosition) => {
        if (loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(
                goToString
            )}`;
        } else {
            setLoading(true);

            items[itemIndexPosition].votedOnByUser = false;
            items[itemIndexPosition].points -= 1;
            setItems(items);

            unvoteItem(itemId, (response) => {
                setLoading(false);

                if (response.authError) {
                    window.location.href = `/login?goto=${encodeURIComponent(
                        goToString
                    )}`;
                }
            });
        }
    };

    const requestUnfavoriteItem = (itemId) => {
        if (loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(
                goToString
            )}`;
        } else {
            unfavoriteItem(itemId, (response) => {
                if (response.authError) {
                    window.location.href = `/login?goto=${encodeURIComponent(
                        goToString
                    )}`;
                } else {
                    window.location.href = "";
                }
            });
        }
    };

    const requestHideItem = (itemId, itemIndexPosition) => {
        if (loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(
                goToString
            )}`;
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
                    window.location.href = `/login?goto=${encodeURIComponent(
                        goToString
                    )}`;
                }
            });
        }
    };

    const requestUnhideItem = (itemId) => {
        if (loading) return;

        if (!userSignedIn) {
            window.location.href = `/login?goto=${encodeURIComponent(
                goToString
            )}`;
        } else {
            setLoading(true);

            unhideItem(itemId, function (response) {
                if (response.authError) {
                    window.location.href = `/login?goto=${encodeURIComponent(
                        goToString
                    )}`;
                } else {
                    window.location.href = "";
                }
            });
        }
    };

    return (
        <>
            {items
                ? items.map((item, index) => {
                      return (
                          <div key={item.id} className="listed-item-container">
                              <table>
                                  <tbody>
                                      <tr>
                                          {/* RANK NUM */}
                                          <td
                                              className={
                                                  showRank
                                                      ? "listed-item-rank"
                                                      : "listed-item-rank hide"
                                              }>
                                              {showRank ? (
                                                  <span>{item.rank}.</span>
                                              ) : null}
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
                                                      {item.votedOnByUser ||
                                                      item.dead ? (
                                                          <span className="listed-item-upvote hide"></span>
                                                      ) : (
                                                          <span
                                                              className="listed-item-upvote"
                                                              onClick={() =>
                                                                  requestUpvoteItem(
                                                                      item.id,
                                                                      index
                                                                  )
                                                              }></span>
                                                      )}
                                                  </>
                                              ) : null}
                                          </td>

                                          {/* ITEM TITLE, URL | CONTENT */}
                                          <td>
                                              <span className="listed-item-title">
                                                  <a
                                                      href={
                                                          item.url
                                                              ? item.url
                                                              : `/item?id=${item.id}`
                                                      }>
                                                      {item.dead
                                                          ? "[dead] "
                                                          : null}
                                                      {item.title}
                                                  </a>
                                              </span>
                                              {item.url ? (
                                                  <span className="listed-item-domain">
                                                      (
                                                      <a
                                                          href={`/from?site=${item.domain}`}>
                                                          {item.domain}
                                                      </a>
                                                      )
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
                                                  {item.points.toLocaleString()}{" "}
                                                  {item.points === 1
                                                      ? "point"
                                                      : "points"}
                                              </span>

                                              {/* AUTHOR | BY */}
                                              <span>
                                                  {" "}
                                                  by{" "}
                                                  <a
                                                      href={`/user?id=${item.by}`}>
                                                      {item.by}
                                                  </a>{" "}
                                              </span>

                                              {/* CREATED TIME */}
                                              <span className="listed-item-time">
                                                  <a
                                                      href={`/item?id=${item.id}`}>
                                                      {renderCreatedTime(
                                                          item.created
                                                      )}
                                                  </a>{" "}
                                              </span>

                                              {/* SHOW LINK */}
                                              {showPastLink ? (
                                                  <>
                                                      <span> | </span>
                                                      <span>
                                                          <a
                                                              href={`/search?q=${item.title}`}>
                                                              past
                                                          </a>
                                                      </span>
                                                  </>
                                              ) : null}
                                              {showWebLink ? (
                                                  <>
                                                      <span> | </span>
                                                      <span>
                                                          <a
                                                              href={`https://www.google.com/search?q=${item.title}`}>
                                                              web
                                                          </a>
                                                      </span>
                                                  </>
                                              ) : null}

                                              {/* UNVOTE BTN */}
                                              {item.votedOnByUser &&
                                              !item.unvoteExpired &&
                                              !item.dead ? (
                                                  <>
                                                      <span> | </span>
                                                      <span
                                                          className="listed-item-unvote"
                                                          onClick={() =>
                                                              requestUnvoteItem(
                                                                  item.id,
                                                                  index
                                                              )
                                                          }>
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
                                                          onClick={() =>
                                                              requestUnfavoriteItem(
                                                                  item.id
                                                              )
                                                          }>
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
                                                          onClick={() =>
                                                              requestHideItem(
                                                                  item.id,
                                                                  index
                                                              )
                                                          }>
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
                                                          onClick={() =>
                                                              requestUnhideItem(
                                                                  item.id
                                                              )
                                                          }>
                                                          un-hide
                                                      </span>
                                                  </>
                                              ) : null}

                                              {/* AUTHOR? EDIT ITEM */}
                                              {item.by === currUsername &&
                                              !item.editAndDeleteExpired &&
                                              !item.dead ? (
                                                  <>
                                                      <span> | </span>
                                                      <span>
                                                          <a
                                                              href={`/edit-item?id=${item.id}`}>
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
                                                      <span>
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

                                              {/* COMMENT NUM */}
                                              {!item.dead ? (
                                                  <>
                                                      {item.commentCount > 0 ? (
                                                          <>
                                                              <span> | </span>
                                                              <span className="listed-item-comments">
                                                                  <a
                                                                      href={`/item?id=${item.id}`}>
                                                                      {item.commentCount.toLocaleString(
                                                                          "en"
                                                                      )}{" "}
                                                                      comment
                                                                      {item.commentCount >
                                                                      1
                                                                          ? "s"
                                                                          : null}
                                                                  </a>
                                                              </span>
                                                          </>
                                                      ) : (
                                                          <>
                                                              <span> | </span>
                                                              <span className="listed-item-comments">
                                                                  <a
                                                                      href={`/item?id=${item.id}`}>
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
                          </div>
                      );
                  })
                : null}
            {/* PAGINATION */}
            {isMore ? (
                <div
                    className={
                        showRank
                            ? "listed-item-more"
                            : "listed-item-more hide-rank"
                    }>
                    <a href={isMoreLink}>
                        <span>More</span>
                    </a>
                </div>
            ) : null}
        </>
    );
}

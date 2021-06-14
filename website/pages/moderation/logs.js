import Link from "next/link";
import Router from "next/router";

import AlternateHeader from "../../components/alternateHeader.js";
import HeadMetadata from "../../components/headMetadata.js";

import renderCreatedTime from "../../utils/renderCreatedTime.js";
import truncateItemTitle from "../../utils/truncateItemTitle.js";

import getModerationLogsByPage from "../../api/moderation/getModerationLogsByPage.js";

export default function Logs({ logs, category, page, isMore, getDataError, notAllowedError }) {
    const updateFilterOptionValue = (event) => {
        Router.push(`/moderation/logs?category=${event.target.value}`);
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Moderation Logs | HeckarNews" />
            <AlternateHeader displayMessage="Moderation Logs" />
            <div className="moderation-logs-content-container">
                {!getDataError && !notAllowedError ? (
                    <>
                        <div className="moderation-filters">
                            <span className="moderation-filter-label">Filter by category: </span>
                            <select value={category} onChange={updateFilterOptionValue}>
                                <option value="all">all</option>
                                <option value="users">users</option>
                                <option value="items">items</option>
                                <option value="comments">comments</option>
                            </select>
                        </div>
                        {logs.length ? (
                            <div className="moderation-logs-table">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Date</td>
                                            <td>Moderator</td>
                                            <td>Description</td>
                                        </tr>
                                        {logs.map((log, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{renderCreatedTime(log.created)}</td>
                                                    <td>
                                                        <Link href={`/user?id=${log.moderatorUsername}`}>
                                                            <a>{log.moderatorUsername}</a>
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        {log.actionType === "add-user-shadow-ban" ? (
                                                            <span>
                                                                Shadow ban added for user:&nbsp;
                                                                <Link href={`/user?id=${log.username}`}>
                                                                    <a>{log.username}</a>
                                                                </Link>
                                                                .
                                                            </span>
                                                        ) : null}
                                                        {log.actionType === "remove-user-shadow-ban" ? (
                                                            <span>
                                                                Removed shadow ban for user:&nbsp;
                                                                <Link href={`/user?id=${log.username}`}>
                                                                    <a>{log.username}</a>
                                                                </Link>
                                                                .
                                                            </span>
                                                        ) : null}
                                                        {log.actionType === "add-user-ban" ? (
                                                            <span>
                                                                Banned user:&nbsp;
                                                                <Link href={`/user?id=${log.username}`}>
                                                                    <a>{log.username}</a>
                                                                </Link>
                                                                .
                                                            </span>
                                                        ) : null}
                                                        {log.actionType === "remove-user-ban" ? (
                                                            <span>
                                                                Removed ban for user:&nbsp;
                                                                <Link href={`/user?id=${log.username}`}>
                                                                    <a>{log.username}</a>
                                                                </Link>
                                                                .
                                                            </span>
                                                        ) : null}
                                                        {log.actionType === "kill-item" ? (
                                                            <span>
                                                                Killed item&nbsp;
                                                                <Link href={`/item?id=${log.itemId}`}>
                                                                    <a>{truncateItemTitle(log.itemTitle)}</a>
                                                                </Link>
                                                                &nbsp; by{" "}
                                                                <Link href={`/user?id=${log.itemBy}`}>
                                                                    <a>{log.itemBy}</a>
                                                                </Link>
                                                                .
                                                            </span>
                                                        ) : null}
                                                        {log.actionType === "unkill-item" ? (
                                                            <span>
                                                                Unkilled item&nbsp;
                                                                <Link href={`/item?id=${log.itemId}`}>
                                                                    <a>{truncateItemTitle(log.itemTitle)}</a>
                                                                </Link>
                                                                &nbsp; by{" "}
                                                                <Link href={`/user?id=${log.itemBy}`}>
                                                                    <a>{log.itemBy}</a>
                                                                </Link>
                                                                .
                                                            </span>
                                                        ) : null}
                                                        {log.actionType === "kill-comment" ? (
                                                            <span>
                                                                Killed&nbsp;
                                                                <Link href={`/comment?id=${log.commentId}`}>
                                                                    <a>comment</a>
                                                                </Link>
                                                                &nbsp; by{" "}
                                                                <Link href={`/user?id=${log.commentBy}`}>
                                                                    <a>{log.commentBy}</a>
                                                                </Link>
                                                                &nbsp; on&nbsp;
                                                                <Link href={`/item?id=${log.itemId}`}>
                                                                    <a>{truncateItemTitle(log.itemTitle)}</a>
                                                                </Link>
                                                                .
                                                            </span>
                                                        ) : null}
                                                        {log.actionType === "unkill-comment" ? (
                                                            <span>
                                                                Unkilled&nbsp;
                                                                <Link href={`/comment?id=${log.commentId}`}>
                                                                    <a>comment</a>
                                                                </Link>
                                                                &nbsp; by{" "}
                                                                <Link href={`/user?id=${log.commentBy}`}>
                                                                    <a>{log.commentBy}</a>
                                                                </Link>
                                                                &nbsp; on&nbsp;
                                                                <Link href={`/item?id=${log.itemId}`}>
                                                                    <a>{truncateItemTitle(log.itemTitle)}</a>
                                                                </Link>
                                                                .
                                                            </span>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <>
                                <span>None found.</span>
                            </>
                        )}
                        {isMore ? (
                            <div className="moderation-logs-more">
                                <Link href={`/moderation/logs?category=${category}&page=${page + 1}`}>
                                    <a>
                                        <span>More</span>
                                    </a>
                                </Link>
                            </div>
                        ) : null}
                    </>
                ) : (
                    <div className="moderation-logs-error-msg">
                        {getDataError ? <span>An error occurred.</span> : null}
                        {notAllowedError ? <span>You can’t see that.</span> : null}
                    </div>
                )}
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, query }) {
    const category = query.category ? query.category : "all";
    const page = query.page ? parseInt(query.page) : 1;

    const apiResult = await getModerationLogsByPage(category, page, req);

    return {
        props: {
            logs: (apiResult && apiResult.logs) || [],
            category: (apiResult && apiResult.categoryString) || {},
            page: page || 1,
            isMore: (apiResult && apiResult.isMore) || false,
            getDataError: (apiResult && apiResult.getDataError) || false,
            notAllowedError: (apiResult && apiResult.notAllowedError) || false,
        },
    };
}

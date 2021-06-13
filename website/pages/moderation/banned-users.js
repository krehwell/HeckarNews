import AlternateHeader from "../../components/alternateHeader.js";
import HeadMetadata from "../../components/headMetadata.js";

import getBannedUsersByPage from "../../api/moderation/getBannedUsersByPage.js";

export default function BannedUsers({ users, page, isMore, getDataError, notAllowedError }) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Banned Users | HeckarNews" />
            <AlternateHeader displayMessage="Banned Users" />
            <div className="moderation-banned-users-content-container">
                {!getDataError && !notAllowedError ? (
                    <>
                        {users.length ? (
                            <div className="moderation-banned-users-table">
                                <table>
                                    <tbody>
                                        <tr className="moderation-banned-users-table-header">
                                            <td>Username</td>
                                        </tr>
                                        {users.map((user, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>
                                                        <a href={`/user?id=${user.username}`}>{user.username}</a>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {isMore ? (
                                            <div className="moderation-banned-users-more">
                                                <a href={`/moderation/banned-users?page=${page + 1}`}>
                                                    <span>More</span>
                                                </a>
                                            </div>
                                        ) : null}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <>
                                <span>None found.</span>
                            </>
                        )}
                    </>
                ) : (
                    <div className="moderation-banned-users-error-msg">
                        {getDataError ? <span>An error occurred.</span> : null}
                        {notAllowedError ? <span>You can’t see that.</span> : null}
                    </div>
                )}
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, query }) {
    const page = query.page ? parseInt(query.page) : 1;

    const apiResult = await getBannedUsersByPage(page, req);

    return {
        props: {
            users: (apiResult && apiResult.users) || [],
            page: page || 1,
            isMore: (apiResult && apiResult.isMore) || false,
            getDataError: (apiResult && apiResult.getDataError) || false,
            notAllowedError: (apiResult && apiResult.notAllowedError) || false,
        },
    };
}

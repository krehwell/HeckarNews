import Link from "next/link";

import AlternateHeader from "../../components/alternateHeader.js";
import HeadMetadata from "../../components/headMetadata.js";

import getShadowBannedUsersByPage from "../../api/moderation/getShadowBannedUsersByPage.js";

export default function ShadowBannedUsers({ users, page, isMore, getDataError, notAllowedError }) {
    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Shadow Banned Users | HeckarNews" />
            <AlternateHeader displayMessage="Shadow Banned Users" />
            <div className="moderation-shadow-banned-users-content-container">
                {!getDataError && !notAllowedError ? (
                    <>
                        {users.length ? (
                            <div className="moderation-shadow-banned-users-table">
                                <table>
                                    <tbody>
                                        <tr className="moderation-shadow-banned-users-table-header">
                                            <td>Username</td>
                                        </tr>
                                        {users.map((user, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>
                                                        <Link href={`/user?id=${user.username}`}>
                                                            <a>{user.username}</a>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {isMore ? (
                                            <div className="moderation-shadow-banned-users-more">
                                                <a href={`/moderation/shadow-banned-users?page=${page + 1}`}>
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
                    <div className="moderation-shadow-banned-users-error-msg">
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

    const apiResult = await getShadowBannedUsersByPage(page, req);

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

/**
 * WARNING: NEVER PRETTIER THIS CODE!!!!
 */

import logoutUser from "../api/users/logoutUser";

export default function Header({
    userSignedIn,
    username,
    karma,
    goto,
    pageName,
    label
}) {

    const requestLogout = () => {
        logoutUser(() => {
            window.location.reload();
        });
    }

    return (
        <table className="header-wrapper">
            <tbody>
                <tr>
                    <td className="header-logo">
                        <a href="/">
                            <img src="/favicon.ico" />
                        </a>
                    </td>
                    <td className="header-links">
                        <span className="header-links-items">
                            <b className="header-links-name">
                                <a href="/news">HeckarNews</a>
                            </b>
                            <a className={pageName === "newest" ? "white-text" : null} href="/newest">new</a>
                            <span> | </span>
                            {
                                userSignedIn ?
                                    <>
                                        <a className={pageName === "threads" ? "white-text" : null} href={`/threads?id=${username}`}>threads</a>
                                        <span> | </span>
                                    </> : null
                            }
                            <a href="/past">past</a>
                            <span> | </span>
                            <a className={pageName === "newcomments" ? "white-text" : null} href="/newcomments">comments</a>
                            <span> | </span>
                            <a className={pageName === "ask" ? "white-text" : null} href="/ask">ask</a>
                            <span> | </span>
                            <a className={pageName === "show" ? "white-text" : null} href="/show">show</a>
                            <span> | </span>
                            <a className={pageName === "submit" ? "white-text" : null} href="/submit">submit</a>
                            {
                                label ?
                                    <>
                                        <span> | </span>
                                        <span className="white-text">{label}</span>
                                    </> : null
                            }
                        </span>
                    </td>
                    <td className="header-right-nav-links">
                        <span className="header-right-nav-links-items">
                            {
                                userSignedIn ?
                                    <>
                                        <a href={`/user?id=${username}`}>{username}</a>
                                        <span> ({karma.toLocaleString()})</span>
                                        <span> | </span>
                                        <span className="header-logout" onClick={() => requestLogout()}>logout</span>
                                    </> :
                                    <>
                                        <a href={`/login${goto ? "?goto=" + encodeURIComponent(goto) : ""}`}>
                                            <span>login</span>
                                        </a>
                                    </>
                            }
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

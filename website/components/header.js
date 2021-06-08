import Link from "next/link";
import Router from "next/router";

import logoutUser from "../api/users/logoutUser";

export default function Header({ userSignedIn, username, karma, goto, pageName, label }) {
    const requestLogout = () => {
        logoutUser(() => {
            Router.push(Router.asPath);
        });
    };

    return (
        <table className="header-wrapper">
            <tbody>
                <tr>
                    <td className="header-logo">
                        <Link href="/">
                            <a>
                                <img src="/android-chrome-512x512.png" />
                            </a>
                        </Link>
                    </td>
                    <td className="header-links">
                        <span className="header-links-items">
                            <b className="header-links-name">
                                <Link href="/news">HeckarNews</Link>
                            </b>
                            <Link href="/newest">new</Link>
                            <span> | </span>
                            {userSignedIn ? (
                                <>
                                    <Link
                                        className={pageName === "threads" ? "white-text" : null}
                                        href={`/threads?id=${username}`}>
                                        threads
                                    </Link>
                                    <span> | </span>
                                </>
                            ) : null}
                            <Link href="/past">past</Link>
                            <span> | </span>
                            <Link className={pageName === "newcomments" ? "white-text" : null} href="/newcomments">
                                comments
                            </Link>
                            <span> | </span>
                            <Link className={pageName === "ask" ? "white-text" : null} href="/ask">
                                ask
                            </Link>
                            <span> | </span>
                            <Link className={pageName === "show" ? "white-text" : null} href="/show">
                                show
                            </Link>
                            <span> | </span>
                            <Link className={pageName === "submit" ? "white-text" : null} href="/submit">
                                submit
                            </Link>
                            {label ? (
                                <>
                                    <span> | </span>
                                    <span className="white-text">{label}</span>
                                </>
                            ) : null}
                        </span>
                    </td>
                    <td className="header-right-nav-links">
                        <span className="header-right-nav-links-items">
                            {userSignedIn ? (
                                <>
                                    <Link href={`/user?id=${username}`}>{username}</Link>
                                    <span> ({karma.toLocaleString()})</span>
                                    <span> | </span>
                                    <span className="header-logout" onClick={() => requestLogout()}>
                                        logout
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Link href={`/login${goto ? "?goto=" + encodeURIComponent(goto) : ""}`}>login</Link>
                                </>
                            )}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

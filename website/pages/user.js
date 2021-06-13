import { useState, useEffect } from "react";
import moment from "moment";
import Link from "next/link";
import Router from "next/router";

import Header from "../components/header.js";
import Footer from "../components/footer.js";
import HeadMetadata from "../components/headMetadata.js";

import getUserData from "../api/users/getUserData.js";
import updateUserData from "../api/users/updateUserData.js";
import addUserShadowBan from "../api/moderation/addUserShadowBan.js";
import removeUserShadowBan from "../api/moderation/removeUserShadowBan.js";
import addUserBan from "../api/moderation/addUserBan.js";
import removeUserBan from "../api/moderation/removeUserBan.js";

export default function User({
    username,
    userData,
    showPrivateUserData,
    authUserData,
    getDataError,
    notFoundError,
    goToString,
}) {
    const [aboutInputValue, setAboutInputValue] = useState(userData ? userData.about : "");
    const [emailInputValue, setEmailInputValue] = useState(userData ? userData.email : "");
    const [loading, setLoading] = useState(false);
    const [showDeadValue, setShowDeadValue] = useState(userData && userData.showDead ? "yes" : "no");
    const [error, setError] = useState({
        submitError: false,
    });

    const updateAboutInputValue = (event) => {
        setAboutInputValue(event.target.value);
    };

    const setInitialTextareaHeight = () => {
        if (userData.about) {
            const numOfLines = userData.about.split(/\r\n|\r|\n/).length;

            return numOfLines + 3;
        } else {
            return 6;
        }
    };

    const updateEmailInputValue = (event) => {
        setEmailInputValue(event.target.value);
    };

    const updateShowDeadValue = (event) => {
        setShowDeadValue(event.target.value);
    };

    const submitUpdateRequest = () => {
        if (loading) return;

        setLoading(true);

        const inputData = {
            about: aboutInputValue,
            email: emailInputValue,
            showDead: showDeadValue === "yes" ? true : false,
        };

        updateUserData(inputData, (response) => {
            setLoading(false);
            if (response.submitError) {
                setError({ submitError: true });
            } else {
                Router.push(Router.asPath);
            }
        });
    };

    const requestAddShadowBan = () => {
        if (loading) return;

        setLoading(true);

        addUserShadowBan(username, (_response) => {
            setLoading(false);
            Router.push(Router.asPath);
        });
    };

    const requestRemoveShadowBan = () => {
        if (loading) return;

        setLoading(true);

        removeUserShadowBan(username, (_response) => {
            setLoading(false);
            Router.push(Router.asPath);
        });
    };

    const requestAddUserBan = () => {
        if (loading) return;

        setLoading(true);

        addUserBan(username, (_response) => {
            setLoading(false);
            Router.push(Router.asPath);
        });
    };

    const requestRemoveUserBan = () => {
        if (loading) return;

        setLoading(true);

        removeUserBan(username, (_response) => {
            setLoading(false);
            Router.push(Router.asPath);
        });
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title={userData ? `Profile: ${username} | HeckarNews` : "User Profile | HeckarNews"} />
            <Header
                userSignedIn={authUserData && authUserData.userSignedIn}
                username={authUserData && authUserData.username}
                karma={authUserData && authUserData.karma}
                goto={goToString}
            />
            <div className="user-content-container">
                {!getDataError && !notFoundError ? (
                    <>
                        {
                            /***** IF USER IS PRIVATE  *****/
                            showPrivateUserData ? (
                                <div className="user-private-data">
                                    {!userData.email ? (
                                        <div className="user-add-email-address-msg">
                                            <span>
                                                Please put a valid address in the email field, or we won't be able to
                                                send you a new password if you forget yours. Your address is only
                                                visible to you and us. Crawlers and other users can't see it.
                                            </span>
                                        </div>
                                    ) : null}

                                    {/* USERNAME SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label">
                                            <span>user:</span>
                                        </div>
                                        <div className="user-item-content username">
                                            <span>{userData.username}</span>
                                        </div>
                                    </div>

                                    {/* CREATED SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label">
                                            <span>created:</span>
                                        </div>
                                        <div className="user-item-content created">
                                            <span>{moment.unix(userData.created).format("MMM D, YYYY")}</span>
                                        </div>
                                    </div>

                                    {/* KARMA SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label">
                                            <span>karma:</span>
                                        </div>
                                        <div className="user-item-content karma">
                                            <span>{userData.karma.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* ABOUT FIELD */}
                                    <div className="user-item">
                                        <div className="user-item-label about">
                                            <span>about:</span>
                                        </div>
                                        <div className="user-item-content about">
                                            <textarea
                                                cols={60}
                                                rows={setInitialTextareaHeight()}
                                                wrap="virtual"
                                                type="text"
                                                value={aboutInputValue}
                                                onChange={updateAboutInputValue}
                                            />
                                            <span className="user-item-about-help">
                                                <Link href="/formatdoc">help</Link>
                                            </span>
                                        </div>
                                    </div>

                                    {/* EMAIL FIELD */}
                                    <div className="user-item">
                                        <div className="user-item-label">
                                            <span>email:</span>
                                        </div>
                                        <div className="user-item-content email">
                                            <input
                                                type="text"
                                                value={emailInputValue}
                                                onChange={updateEmailInputValue}
                                            />
                                        </div>
                                    </div>

                                    {/* SHOWDEAD SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label">
                                            <span>showdead:</span>
                                        </div>
                                        <div className="user-item-content email">
                                            <select value={showDeadValue} onChange={updateShowDeadValue}>
                                                <option value="no">no</option>
                                                <option value="yes">yes</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* CHANGE PASSWORD SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label">
                                            <span></span>
                                        </div>
                                        <div className="user-item-content">
                                            <span>
                                                <Link href="/changepw">change password</Link>
                                            </span>
                                        </div>
                                    </div>

                                    {/* SUBMISSION SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label">
                                            <span></span>
                                        </div>
                                        <div className="user-item-content">
                                            <span>
                                                <Link href={`/submitted?id=${username}`}>submissions</Link>
                                            </span>
                                        </div>
                                    </div>

                                    {/* COMMENT SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label">
                                            <span></span>
                                        </div>
                                        <div className="user-item-content">
                                            <span>
                                                <Link href={`/threads?id=${username}`}>comments</Link>
                                            </span>
                                        </div>
                                    </div>

                                    {/* HIDDEN SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label">
                                            <span></span>
                                        </div>
                                        <div className="user-item-content">
                                            <span>
                                                <Link href={`/hidden`}>hidden</Link>
                                            </span>
                                        </div>
                                    </div>

                                    {/* UPVOTE COMMENT SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label">
                                            <span></span>
                                        </div>
                                        <div className="user-item-content">
                                            <span>
                                                <Link href={`/upvoted?id=${username}`}>upvoted items</Link>
                                            </span>
                                            <span> / </span>
                                            <span>
                                                <Link href={`/upvoted?id=${username}&comments=t`}>comments</Link>
                                            </span>
                                            <span>
                                                <i>(private)</i>
                                            </span>
                                        </div>
                                    </div>

                                    {/* FAVORITE COMMENT SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label">
                                            <span></span>
                                        </div>
                                        <div className="user-item-content">
                                            <span>
                                                <Link href={`/favorites?id=${username}`}>favorite items</Link>
                                            </span>
                                            <span> / </span>
                                            <span>
                                                <Link href={`/favorites?id=${username}&comments=t`}>comments</Link>
                                            </span>
                                            <span>
                                                <i>(shared)</i>
                                            </span>
                                        </div>
                                    </div>

                                    {/* SUBMIT FORM SECTION */}
                                    <div className="user-submit-btn">
                                        <input type="submit" value="update" onClick={() => submitUpdateRequest()} />
                                        {loading && <span> loading...</span>}
                                    </div>
                                    {error.submitError ? (
                                        <div className="user-submit-error-msg">
                                            <span>An error occurred.</span>
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                /***** IF USER IS PUBLIC  *****/
                                <div className="user-public-data">
                                    {/* USERNAME SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label public">
                                            <span>user:</span>
                                        </div>
                                        <div className="user-item-content username">
                                            <span>{userData.username}</span>
                                        </div>
                                    </div>

                                    {/* CREATED SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label public">
                                            <span>created:</span>
                                        </div>
                                        <div className="user-item-content created">
                                            <span>{moment.unix(userData.created).format("MMM D, YYYY")}</span>
                                        </div>
                                    </div>

                                    {/* KARMA SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label public">
                                            <span>karma:</span>
                                        </div>
                                        <div className="user-item-content karma">
                                            <span>{userData.karma.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* ABOUT SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label about public">
                                            <span>about:</span>
                                        </div>
                                        <div className="user-item-content about public">
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: userData.about,
                                                }}></span>
                                        </div>
                                    </div>

                                    {/* SUBMISSION SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label public">
                                            <span></span>
                                        </div>
                                        <div className="user-item-content">
                                            <span>
                                                <Link href={`/submitted?id=${username}`}>submissions</Link>
                                            </span>
                                        </div>
                                    </div>

                                    {/* COMMENT SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label public">
                                            <span></span>
                                        </div>
                                        <div className="user-item-content">
                                            <span>
                                                <Link href={`/threads?id=${username}`}>comments</Link>
                                            </span>
                                        </div>
                                    </div>

                                    {/* FAVORITE SECTION */}
                                    <div className="user-item">
                                        <div className="user-item-label public">
                                            <span></span>
                                        </div>
                                        <div className="user-item-content">
                                            <span>
                                                <Link href={`/favorites?id=${username}`}>favorites</Link>
                                            </span>
                                        </div>
                                    </div>

                                    {/* SHADOW BANNED USER */}
                                    {authUserData.isModerator ? (
                                        <div className="user-moderator-section">
                                            {!userData.shadowBanned ? (
                                                <div className="user-item moderator-section">
                                                    <div className="user-item-content">
                                                        <span
                                                            className="user-item-ban-btn"
                                                            onClick={() => requestAddShadowBan()}>
                                                            Shadow-Ban
                                                        </span>
                                                        <span>
                                                            &nbsp; (User item and comment submissions get automatically
                                                            killed)
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="user-item">
                                                    <div className="user-item-content">
                                                        <span>Shadow-Banned (</span>
                                                        <span
                                                            className="user-item-ban-btn"
                                                            onClick={() => requestRemoveShadowBan()}>
                                                            Remove
                                                        </span>
                                                        <span>)</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* BANNED USER */}
                                            {!userData.banned ? (
                                                <div className="user-item moderator-section">
                                                    <div className="user-item-content">
                                                        <span
                                                            className="user-item-ban-btn"
                                                            onClick={() => requestAddUserBan()}>
                                                            Ban
                                                        </span>
                                                        <span> (User login and authentication will be revoked)</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="user-item">
                                                    <div className="user-item-content">
                                                        <span>Banned (</span>
                                                        <span
                                                            className="user-item-ban-btn"
                                                            onClick={() => requestRemoveUserBan()}>
                                                            Remove
                                                        </span>
                                                        <span>)</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            )
                        }
                    </>
                ) : (
                    <div className="user-get-data-error-msg">
                        {notFoundError ? <span>User not found.</span> : <span>An error occurred.</span>}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export async function getServerSideProps({ req, query }) {
    const apiResult = await getUserData(query.id, req);
    // console.log(apiResult);

    return {
        props: {
            username: query.id,
            userData: apiResult.user || {},
            showPrivateUserData: (apiResult && apiResult.showPrivateUserData) || false,
            authUserData: apiResult && apiResult.authUser ? apiResult.authUser : {},
            getDataError: apiResult.getDataError || false,
            notFoundError: apiResult.notFoundError || false,
            goToString: `user?id=${query.id}`,
        },
    };
}

import { useState } from "react";
import Router from "next/router";

import HeadMetadata from "../components/headMetadata.js";
import AlternateHeader from "../components/alternateHeader.js";

import authUser from "../api/users/authUser.js";
import changePassword from "../api/users/changePassword.js";

export default function ChangePw({ userContainsEmail, username }) {
    const [currentInputValue, setCurrentInputValue] = useState("");
    const [newInputValue, setNewInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        invalidCurrentPassword: false,
        newPasswordLengthError: false,
        submitError: false,
    });

    const updateCurrentInputValue = (event) => {
        setCurrentInputValue(event.target.value);
    };

    const updateNewInputValue = (event) => {
        setNewInputValue(event.target.value);
    };

    const submitRequest = () => {
        if (loading) return;

        const currentPassword = currentInputValue;
        const newPassword = newInputValue;

        if (!currentPassword) {
            setError({
                invalidCurrentPassword: true,
                newPasswordLengthError: false,
                submitError: false,
            });
        } else if (newPassword.length < 8) {
            setError({
                invalidCurrentPassword: false,
                newPasswordLengthError: true,
                submitError: false,
            });
        } else {
            setLoading(true);

            changePassword(currentPassword, newPassword, (response) => {
                setLoading(false);
                if (response.authError) {
                    // location.href = "/login?goto=changepw";
                    Router.push("/login?goto=changepw");
                } else if (response.newPasswordLengthError) {
                    setError({
                        invalidCurrentPassword: false,
                        newPasswordLengthError: true,
                        submitError: false,
                    });
                } else if (response.invalidCurrentPassword) {
                    setError({
                        invalidCurrentPassword: true,
                        newPasswordLengthError: false,
                        submitError: false,
                    });
                } else if (response.submitError || !response.success) {
                    setError({
                        invalidCurrentPassword: false,
                        newPasswordLengthError: false,
                        submitError: true,
                    });
                } else {
                    // location.href = "/login";
                    Router.push("/login");
                }
            });
        }
    };

    return (
        <div className="layout-wrapper">
            <HeadMetadata title="Change Password | HeckarNews" />
            <AlternateHeader displayMessage={`Change Password for ${username}`} />
            <div className="changepw-content-container">
                {!userContainsEmail && (
                    <div className="changepw-error-msg">
                        <span>
                            First, please put a valid email address in your <a href={`/user?id=${username}`}>profile</a>
                            . Otherwise you could lose your account if you mistype your new password.
                        </span>
                    </div>
                )}

                {/* ERROR INFO AREA */}
                {error.invalidCurrentPassword ? (
                    <div className="changepw-error-msg">
                        <span>Invalid current password.</span>
                    </div>
                ) : null}
                {error.newPasswordLengthError ? (
                    <div className="changepw-error-msg">
                        <span>Passwords should be at least 8 characters.</span>
                    </div>
                ) : null}
                {error.submitError ? (
                    <div className="changepw-error-msg">
                        <span>An error occurred.</span>
                    </div>
                ) : null}

                {/* CURRENT PASSWORD FIELD */}
                <div className="changepw-input-item">
                    <div className="changepw-input-item-label">
                        <span>Current Password:</span>
                    </div>
                    <div className="changepw-input-item-input">
                        <input type="password" value={currentInputValue} onChange={updateCurrentInputValue} />
                    </div>
                </div>

                {/* NEW PASSWORD FIELD */}
                <div className="changepw-input-item">
                    <div className="changepw-input-item-label">
                        <span>New Password:</span>
                    </div>
                    <div className="changepw-input-item-input">
                        <input type="password" value={newInputValue} onChange={updateNewInputValue} />
                    </div>
                </div>

                {/* SUBMIT BTN */}
                <div className="changepw-submit-btn">
                    <input type="submit" value="Change" onClick={() => submitRequest()} />
                    {loading && <span> loading...</span>}
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, res, query }) {
    const authResult = await authUser(req);

    if (!authResult.success) {
        res.writeHead(302, {
            Location: "/login?goto=changepw",
        });

        res.end();
    }

    return {
        props: {
            userContainsEmail: authResult.authUser.containsEmail,
            username: authResult.authUser.username,
        },
    };
}
